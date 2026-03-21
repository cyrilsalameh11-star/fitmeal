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
    
    // Parse out the emoji from user_color if it was packed to bypass schema limitations
    const parsedPins = (data || []).map(p => {
      if (p.user_color && p.user_color.includes('|')) {
        const parts = p.user_color.split('|');
        return { ...p, user_color: parts[0], emoji: parts[1] };
      }
      return p;
    });
    
    res.json({ pins: parsedPins });
  } catch (err) {
    console.error('Error fetching map pins:', err.message);
    res.status(500).json({ error: 'Failed to fetch pins' });
  }
});

app.post('/api/map/pins', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Cloud database not connected' });
  
  try {
    const { city, lat, lng, restaurant_name, comment, user_initials, user_color, emoji } = req.body;
    
    if (!city || !lat || !lng || !restaurant_name || !user_initials || !user_color) {
      return res.status(400).json({ error: 'Missing required pin data' });
    }

    // Pack emoji into user_color to avoid needing a SQL ALTER migration just for this feature
    const packedColor = emoji ? `${user_color}|${emoji}` : user_color;

    const { data, error } = await supabase.from('map_pins').insert([{
      city, lat, lng, restaurant_name, comment: comment || '', user_initials, user_color: packedColor
    }]).select();
    
    if (error) throw error;
    
    const newPin = data[0];
    if (newPin.user_color && newPin.user_color.includes('|')) {
        const parts = newPin.user_color.split('|');
        newPin.user_color = parts[0];
        newPin.emoji = parts[1];
    }
    
    res.json({ success: true, pin: newPin });
  } catch (err) {
    console.error('Error saving map pin:', err.message);
    res.status(500).json({ error: 'Failed to save pin' });
  }
});

app.delete('/api/map/pins/:id', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Cloud database not connected' });
  try {
    const { id } = req.params;
    const { error } = await supabase.from('map_pins').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting map pin:', err.message);
    res.status(500).json({ error: 'Failed to delete pin' });
  }
});

// ── Shared Running Runs ──────────────────────────────────────────────────────
app.get('/api/running/runs', async (req, res) => {
  if (!supabase) return res.json({ runs: [] });
  try {
    const { data, error } = await supabase.from('shared_runs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ runs: data || [] });
  } catch (err) {
    console.error('Error fetching runs:', err.message);
    res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

app.post('/api/running/runs', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Cloud database not connected' });
  try {
    const { name, user, distance, time, elevation, city, link } = req.body;
    const { data, error } = await supabase.from('shared_runs').insert([{
      name, user, distance, time, elevation, city, link
    }]).select();
    if (error) throw error;
    res.json({ success: true, run: data[0] });
  } catch (err) {
    console.error('Error saving run:', err.message);
    res.status(500).json({ error: 'Failed to save run' });
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
        { sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz DEFAULT now(); ALTER TABLE users ADD COLUMN IF NOT EXISTS email text; ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS emoji text; CREATE TABLE IF NOT EXISTS shared_runs (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, created_at timestamptz DEFAULT now(), name text, "user" text, distance text, time text, elevation text, city text, link text); CREATE TABLE IF NOT EXISTS news_cache (id integer PRIMARY KEY, articles jsonb, updated_at timestamptz DEFAULT now());' },
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


const RSSParser = require('rss-parser');
const parser = new RSSParser();

const NEWS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function fetchLebanonFMCGNews() {
  const feeds = [
    // English — Lebanon-localised Google News
    'https://news.google.com/rss/search?q=(Lebanon+OR+Beirut)+(FMCG+OR+food+OR+restaurant+OR+supermarket+OR+retail+OR+Spinneys+OR+Carrefour+OR+Americana+OR+"Malak+al+Tawouk"+OR+grocery+OR+chain+OR+brand+OR+Fattal+OR+"Bou+Khalil")&hl=en&gl=LB&ceid=LB:en',
    // French — Liban focused
    'https://news.google.com/rss/search?q=(Liban+OR+Beyrouth)+(alimentation+OR+restaurant+OR+supermarch%C3%A9+OR+%C3%A9picerie+OR+Carrefour+OR+Spinneys+OR+distribution+OR+marque+OR+commerce+OR+grande+surface)&hl=fr&gl=FR&ceid=FR:fr',
    // Specific Lebanese FMCG brands
    'https://news.google.com/rss/search?q=("Spinneys+Lebanon"+OR+"Malak+Al+Tawouk"+OR+"Americana+Lebanon"+OR+"Grey+McKenzie"+OR+"Fattal+Lebanon"+OR+"Bou+Khalil"+OR+"the961")&hl=en&gl=LB&ceid=LB:en',
  ];

  const bannedWords = [
    'war', 'israel', 'strike', 'missile', 'hezbollah', 'parliament', 'injured', 'killed',
    'conflict', 'evacuate', 'mourn', 'iran', 'airstrike', 'military', 'army', 'casualty',
    'bomb', 'drone', 'attack', 'protest', 'gaza', 'palestine', 'assassination',
    'tennessee', 'nashville', 'pennsylvania', 'lancaster', 'lebtown', 'lancasteronline',
    'tennessean', 'wsmv', 'news channel 5', 'lebanon, pa', 'lebanon, tn', 'lebanon, oh',
    'lebanon, mo', 'lebanon, in', 'lebanon, ky',
    // US county / township
    'lebanon county', 'lebanon township', 'city of lebanon', 'north lebanon', 'south lebanon',
    'west lebanon', 'east lebanon', 'lebanon borough', 'lebanon valley',
    // Humanitarian / food bank / aid
    'food bank', 'food pantry', 'food drive', 'food insecurity', 'food aid', 'food relief',
    'world food', 'world food programme', 'wfp', 'hunger', 'famine', 'malnutrition',
    'humanitarian', 'food crisis', 'food security', 'unicef', 'undp', 'refugee',
    'donations', 'charity', 'nonprofit', 'ngo', 'aid organization',
  ];
  const goodWords = [
    'the961', '961', 'food', 'restaurant', 'supermarket', 'market', 'fmcg', 'spinneys',
    'carrefour', 'menu', 'chef', 'cuisine', 'dining', 'diet', 'grocery', 'retail', 'brand',
    'nourriture', 'supermarché', 'business', 'startup', 'delivery', 'coffee', 'cafe',
    'grey mckenzie', 'americana', 'malak al tawouk', 'fattal', 'bou khalil',
  ];

  let allItems = [];
  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      allItems.push(...feed.items);
    } catch (e) {
      console.error('Failed fetching feed:', e.message);
    }
  }

  let formattedItems = allItems.filter(item => {
    const title = (item.title || '').toLowerCase();
    const snippet = (item.contentSnippet || item.content || '').toLowerCase();
    const text = title + ' ' + snippet;

    // Reject US "Lebanon" towns via pattern matching
    if (/lebanon,?\s*(pa|tn|oh|mo|in|ky)/i.test(text)) return false;
    if (/\b(lebanon county|lebanon township|city of lebanon)\b/i.test(text)) return false;

    const hasBanned = bannedWords.some(bw => text.includes(bw));
    if (hasBanned) return false;

    const hasGood = goodWords.some(gw => text.includes(gw));
    const mentionsLebanon = (
      text.includes('lebanon') || text.includes('liban') ||
      text.includes('beirut') || text.includes('beyrouth') ||
      text.includes('spinneys') || text.includes('grey mckenzie') ||
      text.includes('the961') || text.includes('americana') ||
      text.includes('fattal') || text.includes('bou khalil')
    );

    return hasGood && mentionsLebanon;
  }).map((item, index) => ({
    title: item.title,
    link: item.link,
    // Use the real pubDate from the article — never fake it
    pubDate: item.pubDate || null,
    contentSnippet: (item.contentSnippet || item.content || '').replace(/<[^>]*>?/g, '').substring(0, 200) + '...',
    id: item.guid || `news-${index}`,
  }));

  // Sort newest first (articles with no date go to the end)
  formattedItems.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0;
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return new Date(b.pubDate) - new Date(a.pubDate);
  });

  // Deduplicate by title + source domain
  const deduplicated = [];
  const seenTitles = new Set();
  const seenSources = new Set();

  for (const it of formattedItems) {
    const normTitle = it.title.toLowerCase();
    let hostname = 'unknown';
    try {
      if (it.link && !it.link.includes('news.google.com')) {
        hostname = new URL(it.link).hostname.replace('www.', '');
      } else {
        const parts = it.title.split(' - ');
        if (parts.length > 1) hostname = parts[parts.length - 1].trim().toLowerCase();
      }
    } catch (e) {}

    if (!seenTitles.has(normTitle) && !seenSources.has(hostname)) {
      seenTitles.add(normTitle);
      seenSources.add(hostname);
      deduplicated.push(it);
    }
  }

  return deduplicated.slice(0, 25);
}

// ── FMCG News (served from Supabase cache, refreshed every Sunday) ────────────
app.get('/api/news', async (req, res) => {
  // 1. Try Supabase cache
  if (supabase) {
    try {
      const { data } = await supabase
        .from('news_cache')
        .select('articles, updated_at')
        .eq('id', 1)
        .maybeSingle();

      if (data && Array.isArray(data.articles)) {
        const ageMs = Date.now() - new Date(data.updated_at).getTime();
        if (ageMs < NEWS_CACHE_TTL_MS) {
          return res.json(data.articles);
        }
      }
    } catch (e) {
      console.error('News cache read failed, fetching live:', e.message);
    }
  }

  // 2. Fetch live RSS
  try {
    const articles = await fetchLebanonFMCGNews();

    // Store in Supabase cache for next time
    if (supabase && articles.length > 0) {
      try {
        await supabase.from('news_cache').upsert([{
          id: 1,
          articles,
          updated_at: new Date().toISOString(),
        }]);
      } catch (e) {
        console.error('News cache write failed:', e.message);
      }
    }

    if (articles.length >= 5) return res.json(articles);

    // 3. Fallback to strict_news.json if RSS returned too little
    const fallbackStr = fs.readFileSync(path.join(__dirname, '..', 'strict_news.json'), 'utf8');
    return res.json(JSON.parse(fallbackStr).slice(0, 25));
  } catch (error) {
    console.error('Error fetching RSS:', error);
    try {
      const fallbackStr = fs.readFileSync(path.join(__dirname, '..', 'strict_news.json'), 'utf8');
      res.json(JSON.parse(fallbackStr).slice(0, 25));
    } catch (e) {
      res.json([]);
    }
  }
});

// ── Cron: refresh news cache every Sunday (triggered by Vercel Cron) ──────────
app.get('/api/cron/refresh-news', async (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const articles = await fetchLebanonFMCGNews();
    if (supabase && articles.length > 0) {
      await supabase.from('news_cache').upsert([{
        id: 1,
        articles,
        updated_at: new Date().toISOString(),
      }]);
    }
    res.json({ success: true, count: articles.length, updated_at: new Date().toISOString() });
  } catch (e) {
    console.error('Cron refresh-news failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🥗  Fitness Meal Planner running at http://localhost:${PORT}\n`);
});
