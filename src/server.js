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
  const fallbacks = [
  {
    "title": "À Gemmayzé, une patronne mise sur la table avant la fête",
    "link": "https://www.lorientlejour.com/cuisine-liban-a-table/1496265/a-gemmayze-patronne-mise-sur-la-table-avant-la-fete.html",
    "pubDate": "2026-03-11T18:46:38.284Z",
    "contentSnippet": "Dans le quartier bouillonnant de Gemmayzé, l'entrepreneuriat culinaire féminin rayonne.",
    "id": "fb-0"
  },
  {
    "title": "Malgré la crise, l’industrie agroalimentaire libanaise exporte et innove",
    "link": "https://www.lorientlejour.com/article/1359754/malgre-la-crise-lindustrie-agroalimentaire-libanaise-exporte-et-innove.html",
    "pubDate": "2023-11-20T00:00:00.000Z",
    "contentSnippet": "Face aux défis économiques, les producteurs locaux multiplient les efforts.",
    "id": "fb-1"
  },
  {
    "title": "Banks in Gulf Evacuate Their Offices",
    "link": "https://www.nytimes.com/2026/03/11/world/middleeast/citi-standard-chartered-evacuation.html",
    "pubDate": "2026-03-11T18:28:45.000Z",
    "contentSnippet": "After an overnight attack on a bank, Iranian officials signaled a new willingness to target economic centers and banks with ties to the United States....",
    "id": "fb-2"
  },
  {
    "title": "Lebanese residents are left in shock and fear as Israeli strikes reach the center of Beirut.",
    "link": "https://www.nytimes.com/live/2026/03/11/world/iran-war-news-trump-oil-israel/lebanese-residents-left-in-shock-and-fear-as-israeli-strikes-reach-center-of-beirut",
    "pubDate": "2026-03-11T18:10:38.000Z",
    "contentSnippet": "Lebanese residents share their fears.",
    "id": "fb-3"
  },
  {
    "title": "Iran Soccer Players Seeking Asylum Are Part of a History of Athlete Defections",
    "link": "https://www.nytimes.com/2026/03/11/sports/iran-women-soccer-defect.html",
    "pubDate": "2026-03-11T17:49:53.000Z",
    "contentSnippet": "Members of the Iranian soccer team who chose to remain in Australia this week are far from the first to travel to a competition and stay there....",
    "id": "fb-4"
  },
  {
    "title": "Iran holds a public mourning ceremony for commanders killed by strikes.",
    "link": "https://www.nytimes.com/live/2026/03/11/world/iran-war-news-trump-oil-israel/iran-holds-public-mourning-ceremony-for-commanders",
    "pubDate": "2026-03-11T17:14:02.000Z",
    "contentSnippet": "Thousands of people mourned in a state-sanctioned ceremony, as people in Tehran described deepening anxiety and fear as the war continued....",
    "id": "fb-5"
  },
  {
    "title": "Iran’s Retaliatory Strikes Appear to Be Slowing",
    "link": "https://www.nytimes.com/2026/03/11/world/middleeast/iran-weapons-missiles-israel-gulf.html",
    "pubDate": "2026-03-11T16:10:53.000Z",
    "contentSnippet": "U.S. officials say the country’s weapons have been diminished, slowing its attacks on Gulf nations and Israel. Iran may also be holding some weapons i...",
    "id": "fb-6"
  },
  {
    "title": "Israel sends an extra infantry brigade to Lebanon’s border.",
    "link": "https://www.nytimes.com/live/2026/03/11/world/iran-war-news-trump-oil-israel/israel-sends-an-extra-infantry-battalion-to-lebanons-border",
    "pubDate": "2026-03-11T18:35:01.000Z",
    "contentSnippet": "Israel has reinforced its military along the Lebanese border.",
    "id": "fb-7"
  },
  {
    "title": "Iran Has Fired Widely Banned Cluster Munitions at Israel",
    "link": "https://www.nytimes.com/2026/03/11/world/middleeast/iran-israel-cluster-munitions.html",
    "pubDate": "2026-03-11T18:35:39.000Z",
    "contentSnippet": "Accounts from Israeli officials and footage verified by The New York Times show that Iran has targeted Israel with the weapons. Experts say this has e...",
    "id": "fb-8"
  },
  {
    "title": "See where U.S. installations have been damaged in the war with Iran.",
    "link": "https://www.nytimes.com/live/2026/world/us-israel-iran-attack-maps/see-where-us-installations-have-been-damaged-in-the-war-with-iran",
    "pubDate": "2026-03-11T14:49:49.000Z",
    "contentSnippet": "Maps show where U.S. targets were struck in the recent conflict.",
    "id": "fb-9"
  },
  {
    "title": "U.S. at Fault in Strike on School in Iran, Preliminary Inquiry Says",
    "link": "https://www.nytimes.com/2026/03/11/us/politics/iran-school-missile-strike.html",
    "pubDate": "2026-03-11T17:26:44.000Z",
    "contentSnippet": "Outdated targeting data may have resulted in a mistaken missile strike, according to the ongoing military investigation, which undercuts President Tru...",
    "id": "fb-10"
  },
  {
    "title": "Trump’s Actions in Iran and Venezuela Show Limits of U.S. Sanctions",
    "link": "https://www.nytimes.com/2026/03/11/us/politics/trump-sanctions-iran-venezuela.html",
    "pubDate": "2026-03-11T14:20:04.000Z",
    "contentSnippet": "America’s vast economic powers are able to wear down an adversary’s economy but are insufficient to topple leaders on their own....",
    "id": "fb-11"
  },
  {
    "title": "At Least 3 Ships Are Struck Around Strait of Hormuz, and Iran Claims One",
    "link": "https://www.nytimes.com/2026/03/11/world/middleeast/ships-attack-strait-hormuz-iran.html",
    "pubDate": "2026-03-11T17:03:49.000Z",
    "contentSnippet": "Three vessels were hit in and around the Persian Gulf on Wednesday, according to a British maritime agency. Iran claimed responsibility for one....",
    "id": "fb-12"
  },
  {
    "title": "World Leaders Will Release 400 Million Barrels of Oil to Stabilize Prices",
    "link": "https://www.nytimes.com/2026/03/11/business/energy-environment/iran-oil-reserves-release.html",
    "pubDate": "2026-03-11T18:39:54.000Z",
    "contentSnippet": "The members of the International Energy Agency will release 400 million barrels of oil, the largest such coordinated action on record....",
    "id": "fb-13"
  },
  {
    "title": "UK Bans Al Quds Protest March That Critics Say Supports Iranian Regime",
    "link": "https://www.nytimes.com/2026/03/11/world/middleeast/uk-iran-al-quds-march-ban.html",
    "pubDate": "2026-03-11T10:59:25.000Z",
    "contentSnippet": "Britain’s government invoked rarely-used powers to ban a pro-Palestinian protest march scheduled for Sunday....",
    "id": "fb-14"
  },
  {
    "title": "Democrats Demand Accountability from Hegseth on Iranian School Strike",
    "link": "https://www.nytimes.com/2026/03/11/world/middleeast/democrats-hegseth-minab-school-strike.html",
    "pubDate": "2026-03-11T13:20:21.000Z",
    "contentSnippet": "A majority of Senate Democrats called on Secretary of Defense Pete Hegseth to disclose whether the U.S. carried out the deadly attack....",
    "id": "fb-15"
  },
  {
    "title": "World Heritage Sites Hit in Airstrikes on Iran",
    "link": "https://www.nytimes.com/2026/03/11/world/middleeast/iran-heritage-sites-damaged.html",
    "pubDate": "2026-03-11T18:32:36.000Z",
    "contentSnippet": "Revered cultural icons that have withstood the upheavals of history are being hit hard in the war being waged by Israel and the United States....",
    "id": "fb-16"
  },
  {
    "title": "Tehran’s Smothering Smoke Has Roots in ‘Mazut,’ an Unusually Dirty Fuel",
    "link": "https://www.nytimes.com/2026/03/11/climate/tehran-air-pollution-mazut-oil.html",
    "pubDate": "2026-03-11T15:41:06.000Z",
    "contentSnippet": "The low-grade oil has been used to fuel power plants amid Iran’s international isolation. Tanks of mazut may now be burning near the city....",
    "id": "fb-17"
  },
  {
    "title": "Here’s the latest from the Middle East.",
    "link": "https://www.nytimes.com/live/2026/03/11/world/iran-war-news-trump-oil-israel/heres-the-latest",
    "pubDate": "2026-03-11T18:34:21.000Z",
    "contentSnippet": "Live updates from reporters on the ground.",
    "id": "fb-18"
  },
  {
    "title": "This is what happened on March 10.",
    "link": "https://www.nytimes.com/live/2026/world/us-israel-iran-attack-maps/this-is-what-happened-on-march-10",
    "pubDate": "2026-03-11T04:25:07.000Z",
    "contentSnippet": "Briefing of recent events.",
    "id": "fb-19"
  },
  {
    "title": "Iran’s New Supreme Leader Was Wounded Early in the War",
    "link": "https://www.nytimes.com/2026/03/11/world/middleeast/khamenei-iran-leader-injured.html",
    "pubDate": "2026-03-11T06:19:01.000Z",
    "contentSnippet": "Officials say Mojtaba Khamenei’s legs were hurt, but the circumstances as well as the extent of his injuries were unclear. He has remained out of view...",
    "id": "fb-20"
  },
  {
    "title": "How Trump and His Advisers Miscalculated Iran’s Response",
    "link": "https://www.nytimes.com/2026/03/10/us/politics/how-trump-miscalculated-iran-response.html",
    "pubDate": "2026-03-11T03:15:17.000Z",
    "contentSnippet": "In the lead-up to the U.S.-Israeli attack, President Trump downplayed the risks to the energy markets as a short-term concern that should not overshad...",
    "id": "fb-21"
  },
  {
    "title": "Missiles, Drones and Airstrikes Pound Middle East",
    "link": "https://www.nytimes.com/2026/03/10/world/middleeast/iran-war-israel-middle-east-strikes.html",
    "pubDate": "2026-03-11T01:13:35.000Z",
    "contentSnippet": "The effects of the war are being felt through the Persian Gulf....",
    "id": "fb-22"
  },
  {
    "title": "Here’s What Happened in the War in the Middle East on Tuesday",
    "link": "https://www.nytimes.com/2026/03/10/world/middleeast/iran-war-us-israel-lebanon-recap.html",
    "pubDate": "2026-03-11T00:00:07.000Z",
    "contentSnippet": "Trump administration officials cast the president as the sole arbiter on the U.S. war effort. International aid groups were warning of a growing human...",
    "id": "fb-23"
  },
  {
    "title": "U.S. Forces Attack Iranian Mine-Laying Ships Near the Strait of Hormuz",
    "link": "https://www.nytimes.com/2026/03/10/world/middleeast/iran-mines-strait-of-hormuz.html",
    "pubDate": "2026-03-11T01:33:06.000Z",
    "contentSnippet": "A video posted by the U.S. Central Command showed munitions striking nine vessels, most of which were moored at the time. Whether any mines have been ...",
    "id": "fb-24"
  }
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
