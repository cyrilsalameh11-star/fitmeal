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
  // Load our high-quality clean fallback data first
  const fs = require('fs');
  const path = require('path');
  let fallbackItems = [];
  try {
    const fallbacksPath = path.join(__dirname, '..', 'strict_news.json');
    const fallbacksStr = fs.readFileSync(fallbacksPath, 'utf8');
    fallbackItems = JSON.parse(fallbacksStr).slice(0, 25).map((x, i) => ({...x, id: `fb-${i}`}));
  } catch(e) {
    console.error("Could not load strict_news fallback", e);
  }
  
  try {
    const feeds = [
      'https://news.google.com/rss/search?q=("Spinneys"+Iraq)+OR+("Grey+McKenzie"+Lebanon)+OR+("Grey+McKenzie+Group")&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=Lebanon+(restaurant+OR+supermarket+OR+food+OR+FMCG+OR+Spinneys+OR+Carrefour+OR+"Grey+McKenzie"+OR+"the961")&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=Liban+(restaurant+OR+supermarch%C3%A9+OR+alimentation+OR+Spinneys+OR+Carrefour+OR+"Grey+McKenzie"+OR+"the961")&hl=fr&gl=FR&ceid=FR:fr'
    ];
    
    let allItems = [];
    for(const url of feeds) {
      try {
        const feed = await parser.parseURL(url);
        allItems.push(...feed.items);
      } catch(e) {
        console.error("Failed fetching a feed", e.message);
      }
    }
    
    const bannedWords = ['world news in brief', 'in brief', 'war', 'israel', 'strike', 'missile', 'hezbollah', 'politics', 'government', 'parliament', 'injured', 'killed', 'conflict', 'evacuate', 'mourn', 'gulf', 'iran', 'crisis', 'airstrike', 'military', 'army', 'death', 'casualty', 'bomb', 'drone', 'attack', 'protest', 'gaza', 'palestine', 'assassination', 'politician', 'county', 'pennsylvania', 'ohio', 'indiana', 'tennessee', 'oregon', 'new hampshire', 'kentucky', 'usa', 'pa', 'mo', 'va', 'nh'];
    const goodWords = ['the961', '961', 'food', 'restaurant', 'supermarket', 'market', 'fmcg', 'spinneys', 'carrefour', 'menu', 'chef', 'cuisine', 'dining', 'diet', 'grocery', 'retail', 'brand', 'eat', 'nourriture', 'supermarché', 'economie', 'business', 'startup', 'delivery', 'coffee', 'cafe', 'grey mckenzie', 'iraq'];

    let formattedItems = allItems.filter(item => {
      const text = (item.title + ' ' + (item.contentSnippet || item.content || '')).toLowerCase();
      // Use regex word boundaries so 'usa' doesnt match 'thousand', 'pa' doesnt match 'party'
      const hasBanned = bannedWords.some(bw => new RegExp(`\\b${bw}\\b`, 'i').test(text));
      if(hasBanned) return false;
      const hasGood = goodWords.some(gw => text.includes(gw));
      const mentionsLebanon = text.includes('lebanon') || text.includes('liban') || text.includes('beirut') || text.includes('beyrouth') || text.includes('spinneys') || text.includes('grey mckenzie') || text.includes('the961');
      return hasGood && mentionsLebanon;
    }).map((item, index) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate || new Date().toISOString(),
      contentSnippet: (item.contentSnippet || item.content || '').replace(/<[^>]*>?/g, '').substring(0, 150) + "...",
      id: item.guid || `news-${index}`
    }));
    
    // Sort and remove duplicates by title AND enforce distinct domains/sources
    // Note: Google News RSS links often start with news.google.com/rss/articles...
    // The source name is typically in the source tag, but rss-parser might not map it perfectly if it's deeply nested.
    // However, google news titles often end with "- Source Name". e.g. "Some Title - The961"
    const deduplicated = [];
    const seenTitles = new Set();
    const seenSources = new Set();

    // Sort by date first so we get the newest articles from each source
    formattedItems.sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate));

    for(let it of formattedItems) {
        const normTitle = it.title.toLowerCase();
        
        // Google news appends ' - SourceName' to the end of the title.
        // Let's try to extract it to use as a source identifier.
        const titleParts = it.title.split(' - ');
        let sourceName = 'unknown';
        if (titleParts.length > 1) {
            sourceName = titleParts[titleParts.length - 1].trim().toLowerCase();
        }

        // Also check actual URL hostname if it's a direct link
        let hostname = sourceName;
        try {
            if (it.link && !it.link.includes('news.google.com')) {
                hostname = new URL(it.link).hostname.replace('www.', '');
            }
        } catch(e) {}

        const sourceId = hostname !== 'unknown' ? hostname : sourceName;

        if(!seenTitles.has(normTitle) && !seenSources.has(sourceId)) {
            seenTitles.add(normTitle);
            seenSources.add(sourceId);
            deduplicated.push(it);
        }
    }
    
    // Fallback if the dynamic search somehow fails to yield enough fresh data
    const finalItems = deduplicated.length >= 8 ? deduplicated.slice(0, 24) : fallbackItems.slice(0, 24);
    
    // Always prepend the user's requested L'Orient Le Jour article
    const pinnedArticle = {
      title: "À Gemmayzé, une patronne mise sur la table avant la fête",
      link: "https://www.lorientlejour.com/cuisine-liban-a-table/1496265/a-gemmayze-patronne-mise-sur-la-table-avant-la-fete.html",
      pubDate: new Date().toISOString(), // Fresh date so it sorts well if needed, but we prepend it directly
      contentSnippet: "Dans le quartier bouillonnant de Gemmayzé, l'entrepreneuriat culinaire féminin rayonne avec des concepts de restauration mettant en avant le terroir et l'authenticité.",
      id: "fb-gemmayze-pinned"
    };
    
    res.json([pinnedArticle, ...finalItems]);
  } catch (error) {
    console.error('Error fetching RSS:', error);
    res.json(fallbackItems);
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🥗  Fitness Meal Planner running at http://localhost:${PORT}\n`);
});
