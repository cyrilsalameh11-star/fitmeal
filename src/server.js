/**
 * Express server — entry point
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

const mealsRouter = require('./routes/meals');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Admin Auth (Stateless HMAC — works on Vercel serverless) ─────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fitmeal-admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'cyrilsalameh11@gmail.com';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fitmeal-secret-key-2026';

// In-memory reset codes { email -> { code, expires } }
// (short-lived, fine if reset on cold start)
const resetCodes = new Map();
// In-memory failed attempts per IP
const failedAttempts = new Map();

/** Create a signed token: HMAC-SHA256(secret + password) — stateless, no server state */
function createAdminToken() {
  const payload = `fitmeal-admin:${Date.now()}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET + ADMIN_PASSWORD).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, sig })).toString('base64');
}

/** Verify a token by re-checking signature */
function verifyAdminToken(token) {
  try {
    const { payload, sig } = JSON.parse(Buffer.from(token, 'base64').toString());
    const expected = crypto.createHmac('sha256', SESSION_SECRET + ADMIN_PASSWORD).update(payload).digest('hex');
    return sig === expected;
  } catch { return false; }
}

function requireAdminSession(req, res, next) {
  const token = req.cookies && req.cookies.admin_session;
  if (token && verifyAdminToken(token)) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}


app.use(cors());
app.use(express.json());
app.use(cookieParser());


// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', mealsRouter);

// ── Map Pins ────────────────────────────────────────────────────────────────
app.get('/api/map/pins', async (req, res) => {
  const city = req.query.city;
  if (!supabase) return res.json({ pins: [] });
  
  try {
    let query = supabase.from('map_pins').select('*').order('created_at', { ascending: false });
    if (city) {
      query = query.eq('city', city);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ pins: data || [] });
  } catch (err) {
    console.error('Error fetching map pins:', err.message);
    res.status(500).json({ error: 'Failed to fetch pins' });
  }
});

app.post('/api/map/pins', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Cloud database not connected' });
  
  try {
    const { city, lat, lng, restaurant_name, comment, user_initials, user_color } = req.body;
    
    if (!city || !lat || !lng || !restaurant_name || !user_initials || !user_color) {
      return res.status(400).json({ error: 'Missing required pin data' });
    }

    const { data, error } = await supabase.from('map_pins').insert([{
      city, lat, lng, restaurant_name, comment: comment || '', user_initials, user_color
    }]).select();
    
    if (error) throw error;
    res.json({ success: true, pin: data[0] });
  } catch (err) {
    console.error('Error saving map pin:', err.message);
    res.status(500).json({ error: 'Failed to save pin' });
  }
});

// ── Cloud Persistence (Supabase) ──────────────────────────────────────────
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Cloud Database initialized.');
  // Auto-migrate: add missing columns if they don't exist
  (async () => {
    try {
      await supabase.rpc('run_migration', { sql: 'SELECT 1' }).catch(() => { }); // test rpc availability
      // Use raw REST to add columns
      const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      };
      const axios = require('axios');
      await axios.post(`${supabaseUrl}/rest/v1/rpc/exec_sql`,
        { sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz DEFAULT now(); ALTER TABLE users ADD COLUMN IF NOT EXISTS email text;' },
        { headers }
      ).catch(() => { }); // silently ignore if rpc not available
    } catch (e) { /* ignore */ }
  })();
} else {
  console.warn('⚠️  Cloud DB not connected. Falling back to local storage (stats.json).');
}

const statsPath = path.join(__dirname, 'data', 'stats.json');

// --- Helper for Cross-Storage User Counting ---
async function getUserList() {
  if (supabase) {
    // Try with last_login ordering first, fall back if column missing
    let result = await supabase.from('users').select('name, email, last_login').order('last_login', { ascending: false });
    if (result.error && result.error.message && result.error.message.includes('last_login')) {
      // last_login column doesn't exist yet — fetch without it
      result = await supabase.from('users').select('name, email');
    }
    if (result.error) throw result.error;
    return result.data || [];
  }
  if (fs.existsSync(statsPath)) {
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    if (Array.isArray(stats.users)) return stats.users;
    return (Array.isArray(stats.names) ? stats.names : []).map(n => ({ name: n, email: null, last_login: null }));
  }
  return [];
}

app.get('/api/stats', async (req, res) => {
  try {
    const users = await getUserList();
    res.json({ count: users.length });
  } catch (err) {
    console.error('Error in /api/stats:', err.message);
    res.json({ count: 0 });
  }
});

// GET /api/debug — check Supabase connection (no auth needed, safe info only)
app.get('/api/debug', async (req, res) => {
  const connected = !!supabase;
  let count = 0;
  let error = null;
  if (supabase) {
    try {
      const { data, error: err } = await supabase.from('users').select('name, email, last_login').order('last_login', { ascending: false });
      if (err) error = err.message;
      else count = data.length;
    } catch (e) {
      error = e.message;
    }
  }
  res.json({ supabase_connected: connected, user_count: count, error });
});


app.post('/api/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid name required' });
    }
    const cleanName = name.trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const now = new Date().toISOString();

    if (supabase) {
      // Upsert by email (unique), or by name if no email
      // Try with last_login; fall back without it if column missing
      const tryUpsert = async (withLastLogin) => {
        const record = withLastLogin
          ? { name: cleanName, email: cleanEmail || null, last_login: now }
          : { name: cleanName, email: cleanEmail || null };
        if (cleanEmail) {
          const { error } = await supabase.from('users').upsert([record], { onConflict: 'email' });
          return error;
        } else {
          const { data: existing } = await supabase.from('users').select('name').eq('name', cleanName).maybeSingle();
          if (existing) {
            const update = withLastLogin ? { last_login: now } : {};
            const { error } = await supabase.from('users').update(update).eq('name', cleanName);
            return error;
          } else {
            const { error } = await supabase.from('users').insert([record]);
            return error;
          }
        }
      };

      let err = await tryUpsert(true);
      if (err && err.message && err.message.includes('last_login')) {
        err = await tryUpsert(false); // retry without last_login
      }
      if (err) console.error('Login upsert error:', err.message);
    } else {
      const users = await getUserList();
      const existingIdx = users.findIndex(u =>
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
        (u.name && u.name.toLowerCase() === cleanName.toLowerCase())
      );
      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], name: cleanName, email: cleanEmail || users[existingIdx].email, last_login: now };
      } else {
        users.push({ name: cleanName, email: cleanEmail || null, last_login: now });
      }
      fs.writeFileSync(statsPath, JSON.stringify({ users }, null, 2));
    }

    const updatedUsers = await getUserList();
    res.json({ success: true, count: updatedUsers.length });
  } catch (err) {
    console.error('Error in /api/login:', err.message);
    res.status(500).json({ error: 'Cloud storage error at /api/login.' });
  }
});

// ── Admin Auth Endpoints ──────────────────────────────────────────────────────

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const ip = req.ip;
  const attempts = failedAttempts.get(ip) || 0;

  if (password === ADMIN_PASSWORD) {
    failedAttempts.delete(ip);
    const token = createAdminToken();
    res.cookie('admin_session', token, {
      httpOnly: true, sameSite: 'none', secure: true, maxAge: 8 * 60 * 60 * 1000
    });
    return res.json({ success: true });
  }

  const newAttempts = attempts + 1;
  failedAttempts.set(ip, newAttempts);
  if (newAttempts >= 3) {
    return res.status(401).json({ error: 'Too many attempts', lockout: true });
  }
  return res.status(401).json({ error: 'Wrong password', attempts: newAttempts });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_session', { sameSite: 'none', secure: true });
  res.json({ success: true });
});

// GET /api/admin/check — lightweight session check
app.get('/api/admin/check', (req, res) => {
  const token = req.cookies && req.cookies.admin_session;
  res.json({ authenticated: !!(token && verifyAdminToken(token)) });
});

// POST /api/admin/reset — send reset code to admin email
app.post('/api/admin/reset', async (req, res) => {
  const { email } = req.body;
  if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(400).json({ error: 'Email not recognized as admin email.' });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes.set(email.toLowerCase(), { code, expires: Date.now() + 15 * 60 * 1000 });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER || ADMIN_EMAIL, pass: process.env.SMTP_PASS || '' }
    });
    await transporter.sendMail({
      from: `"FitMeal Admin" <${ADMIN_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: 'FitMeal Admin — Password Reset Code',
      html: `<p>Your reset code is: <strong style="font-size:24px;letter-spacing:4px">${code}</strong></p><p>Valid for 15 minutes.</p>`
    });
    return res.json({ success: true, message: 'Reset code sent to your admin email.' });
  } catch (err) {
    console.error('Email send error:', err.message);
    // Still give code in dev mode if no SMTP configured
    console.log(`[DEV] Reset code for ${email}: ${code}`);
    return res.json({ success: true, message: 'Reset code sent (check server logs if email fails).' });
  }
});

// POST /api/admin/verify-reset — verify code and set new session
app.post('/api/admin/verify-reset', (req, res) => {
  const { email, code } = req.body;
  const stored = resetCodes.get(email && email.toLowerCase());
  if (!stored || stored.code !== code || Date.now() > stored.expires) {
    return res.status(400).json({ error: 'Invalid or expired code.' });
  }
  resetCodes.delete(email.toLowerCase());
  failedAttempts.clear();
  const token = createAdminToken();
  res.cookie('admin_session', token, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 8 * 60 * 60 * 1000 });
  return res.json({ success: true });
});

app.get('/api/admin/users', requireAdminSession, async (req, res) => {
  try {
    const users = await getUserList();
    res.json({ users }); // each user: {name, last_login}
  } catch (err) {
    res.status(500).json({ error: 'Failed to access editor database.' });
  }
});

app.delete('/api/admin/users/reset', requireAdminSession, async (req, res) => {
  try {
    if (supabase) {
      // Clear users
      const { error: userError } = await supabase.from('users').delete().neq('name', 'impossibledummyname_xyz123');
      if (userError) throw userError;
      
      // Clear map pins (New requirement)
      const { error: pinError } = await supabase.from('map_pins').delete().neq('restaurant_name', 'impossibledummyname_xyz123');
      if (pinError) throw pinError;
    }
    
    // Always clear the local stats file to stay synced
    if (fs.existsSync(statsPath)) {
      fs.writeFileSync(statsPath, JSON.stringify({ users: [] }, null, 2));
    }
    
    res.json({ success: true, message: 'Database and Map Pins reset globally.' });
  } catch (err) {
    console.error('Failed to reset database:', err.message);
    res.status(500).json({ error: 'Failed to reset database.' });
  }
});


const axios = require('axios');
const RSSParser = require('rss-parser');
const parser = new RSSParser();

// FMCG News Endpoint (RSS Proxy)
app.get('/api/news', async (req, res) => {
  // Define high-relevance fallbacks / Featured articles first
  const fallbacks = [
    { title: "À Gemmayzé, une patronne mise sur la table avant la fête", link: "https://www.lorientlejour.com/cuisine-liban-a-table/1496265/a-gemmayze-patronne-mise-sur-la-table-avant-la-fete.html", pubDate: new Date("2024-12-15T00:00:00.000Z").toISOString(), contentSnippet: "Dans le quartier bouillonnant de Gemmayzé, l'entrepreneuriat culinaire féminin rayonne avec des concepts de restauration mettant en avant le terroir et l'authenticité.", id: "fb-1" },
    { title: "Malgré la crise, l’industrie agroalimentaire libanaise exporte et innove", link: "https://www.lorientlejour.com/article/1359754/malgre-la-crise-lindustrie-agroalimentaire-libanaise-exporte-et-innove.html", pubDate: new Date("2023-11-20T00:00:00.000Z").toISOString(), contentSnippet: "Face aux défis économiques, les producteurs locaux multiplient les efforts pour maintenir la qualité de leurs produits de supermarché.", id: "fb-2" },
    { title: "Roadster Diner et Crepaway: les franchises libanaises résistent à l'épreuve du temps", link: "https://www.the961.com/lebanese-franchises-surviving-crisis/", pubDate: new Date("2024-02-10T00:00:00.000Z").toISOString(), contentSnippet: "Les géants de la restauration rapide locale, tels que Roadster et Crepaway, adaptent leurs menus pour répondre aux nouveaux comportements d'achat des consommateurs.", id: "fb-3" },
    { title: "Spinneys ouvre deux nouvelles succursales au Mont-Liban", link: "https://www.businessnews.com.lb/cms/Story/StoryDetails/12204/Spinneys-to-open-two-branches", pubDate: new Date("2024-05-12T00:00:00.000Z").toISOString(), contentSnippet: "La chaîne de supermarchés affirme son engagement envers une croissance locale avec la création de centaines de nouveaux emplois.", id: "fb-4" },
    { title: "Le commerce de détail à Beyrouth: un secteur en pleine mutation numérique", link: "https://www.executive-magazine.com/economics-policy/retail-sector-lebanon-digital-transformation", pubDate: new Date("2024-01-22T00:00:00.000Z").toISOString(), contentSnippet: "Les hypermarchés tels que Carrefour misent sur le e-commerce et les programmes de fidélisation.", id: "fb-5" },
    { title: "The history of Lebanese cuisine and its rise worldwide", link: "https://www.the961.com/history-lebanese-cuisine-world/", pubDate: new Date("2024-05-10T00:00:00.000Z").toISOString(), contentSnippet: "A look into how Lebanese cooking evolved over centuries.", id: "fb-6" },
    { title: "Carrefour Lebanon launches local products section", link: "https://www.zawya.com/en/business/retail-and-consumer/carrefour-lebanon-launches-domestic-products-section-p201h1jz", pubDate: new Date("2023-08-20T00:00:00.000Z").toISOString(), contentSnippet: "Offering a platform for local FMCG suppliers.", id: "fb-7" },
    { title: "Lebanon's Supermarkets Adapt to Economic Challenges", link: "https://www.reuters.com/world/middle-east/lebanon-supermarkets-adapt-economic-hardship-2023-11-15/", pubDate: new Date("2023-11-15T00:00:00.000Z").toISOString(), contentSnippet: "How retail chains are keeping shelves stocked.", id: "fb-8" },
    { title: "Spinneys loyalty program sees record engagement", link: "https://www.lebaneseretail.com/spinneys-loyalty-q4-2023", pubDate: new Date("2024-01-10T00:00:00.000Z").toISOString(), contentSnippet: "The points-based system drives massive foot traffic.", id: "fb-9" },
    { title: "Zaatar W Zeit continues regional expansion", link: "https://english.alarabiya.net/business/economy/2023/06/05/Lebanese-street-food-brand-Zaatar-W-Zeit-opens-new-UAE-stores", pubDate: new Date("2023-06-05T00:00:00.000Z").toISOString(), contentSnippet: "The popular eatery aims for massive Gulf expansion.", id: "fb-10" },
    { title: "FMCG Sector in Lebanon: A Year in Review", link: "https://www.executive-magazine.com/fmcg-lebanon-review-2023", pubDate: new Date("2023-12-28T00:00:00.000Z").toISOString(), contentSnippet: "Consumer fast-moving goods show resilience.", id: "fb-11" },
    { title: "Abdallah Chocolates: A sweet success story", link: "https://www.the961.com/lebanese-chocolate-brands-world/", pubDate: new Date("2024-02-14T00:00:00.000Z").toISOString(), contentSnippet: "Local chocolatiers are competing on a global scale.", id: "fb-12" },
    { title: "Lebanese restaurants in Dubai win Michelin stars", link: "https://www.thenationalnews.com/lifestyle/food/2023/05/23/michelin-guide-dubai-2023-lebanese-restaurants/", pubDate: new Date("2023-05-23T00:00:00.000Z").toISOString(), contentSnippet: "The high-end culinary export of Lebanon.", id: "fb-13" },
    { title: "The boom of Delivery Apps in Beirut", link: "https://www.wamda.com/2023/09/beirut-food-delivery-apps-boom", pubDate: new Date("2023-09-12T00:00:00.000Z").toISOString(), contentSnippet: "Toters and GoSawa lead the market.", id: "fb-14" },
    { title: "How Lebanese coffee brands are performing", link: "https://www.lorientlejour.com/article/1350021/le-marche-du-cafe-au-liban.html", pubDate: new Date("2023-10-01T00:00:00.000Z").toISOString(), contentSnippet: "Cafe Najjar and others in the retail space.", id: "fb-15" },
    { title: "Le Charcutier modernizes stores across Lebanon", link: "https://www.retail-intelligence.com/le-charcutier-store-upgrades-lebanon", pubDate: new Date("2023-11-30T00:00:00.000Z").toISOString(), contentSnippet: "Investments in better shopping experiences.", id: "fb-16" },
    { title: "Dietary trends reshaping Lebanese FMCG", link: "https://www.businessnews.com.lb/cms/Story/StoryDetails/12100", pubDate: new Date("2024-03-01T00:00:00.000Z").toISOString(), contentSnippet: "Increased demand for healthy, sugar-free options.", id: "fb-17" },
    { title: "Al Rifai roastery sales surge for holidays", link: "https://www.arabnews.com/node/2429011/corporate-news", pubDate: new Date("2023-12-20T00:00:00.000Z").toISOString(), contentSnippet: "A staple in Lebanese homes sees massive sales.", id: "fb-18" },
    { title: "Local poultry farms supply 80% of fast-food chains", link: "https://www.executive-magazine.com/lebanon-poultry-farms-2024", pubDate: new Date("2024-01-18T00:00:00.000Z").toISOString(), contentSnippet: "Sourcing locally becomes standard practice.", id: "fb-19" },
    { title: "Amorino's success in the premium dessert market", link: "https://www.franchising.com/news/20231010_amorino_gelato_expands_premium_offerings.html", pubDate: new Date("2023-10-10T00:00:00.000Z").toISOString(), contentSnippet: "The flower-shaped gelato brand leads in sales.", id: "fb-20" },
    { title: "The Lebanese organic food movement", link: "https://www.the961.com/lebanon-organic-farming-rise/", pubDate: new Date("2023-08-05T00:00:00.000Z").toISOString(), contentSnippet: "Farmers markets and organic aisles see growth.", id: "fb-21" },
    { title: "Bakeries in Lebanon: Balancing tradition and cost", link: "https://www.aljazeera.com/economy/2023/7/20/lebanons-bread-crisis", pubDate: new Date("2023-07-20T00:00:00.000Z").toISOString(), contentSnippet: "The FMCG bakery segment adapts to flour prices.", id: "fb-22" },
    { title: "Malak Al Taouk expands its 'Light' menu", link: "https://www.lebanesefood.com/malak-al-taouk-light-menu-2024", pubDate: new Date("2024-02-05T00:00:00.000Z").toISOString(), contentSnippet: "Providing lower calorie options for fitness lovers.", id: "fb-23" },
    { title: "Supermarket price indexing in Lebanon", link: "https://www.lorientlejour.com/article/1360012/la-tarification-dans-les-supermarches.html", pubDate: new Date("2024-01-05T00:00:00.000Z").toISOString(), contentSnippet: "How the economy ministry monitors the FMCG sector.", id: "fb-24" },
    { title: "Lebanese wine exports reach new markets", link: "https://www.decanter.com/wine-news/lebanese-wine-exports-grow-2023-500021/", pubDate: new Date("2023-11-12T00:00:00.000Z").toISOString(), contentSnippet: "Ksara and Kefraya continue to dominate.", id: "fb-25" }
  ];

  try {
    const feed = await parser.parseURL('https://www.businessnews.com.lb/rss.aspx');
    
    // Filter articles for FMCG keywords
    const keywords = [
      'supermarket', 'retail', 'restaurant', 'food', 'store', 'fmcg', 
      'lebanon', 'beirut', 'spinneys', 'carrefour', 'charcutier', 
      'roadster', 'crepaway', 'bartartine', 'taouk', 'zwz', 'zaatar', 
      'dip n dip', 'pinkberry', 'abdallah', 'mcdonald'
    ];
    
    let filteredItems = feed.items.filter(item => {
      const content = (item.title + ' ' + (item.contentSnippet || '')).toLowerCase();
      return keywords.some(keyword => content.includes(keyword));
    });

    // Merge, sort and return
    const finalItems = [...filteredItems, ...fallbacks].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    res.json(finalItems);
  } catch (error) {
    console.error('Error fetching RSS, returning fallbacks:', error);
    // Return at least the fallbacks if the live feed fails
    res.json(fallbacks);
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🥗  Fitness Meal Planner running at http://localhost:${PORT}\n`);
});
