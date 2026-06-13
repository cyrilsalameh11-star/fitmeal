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
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));
app.use(cookieParser());


// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// OG image as PNG (WhatsApp requires real PNG, not SVG)
app.get('/og-image.png', async (req, res) => {
  try {
    const sharp = require('sharp');
    const svgPath = path.join(__dirname, 'public', 'og-image.svg');
    const png = await sharp(svgPath).resize(1200, 630).png().toBuffer();
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (e) {
    res.status(500).send('Image generation failed');
  }
});

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

// Resolve a Strava share URL to {activityId, embedSrc}. Handles both
// strava.app.link/... mobile shares and direct strava.com/activities/<id> URLs.
// embedSrc is the proper /embed/<token> URL needed for the iframe to render.
app.get('/api/strava/resolve', async (req, res) => {
  const url = req.query.url;
  if (!url || !/strava\.(com|app)/i.test(String(url))) {
    return res.status(400).json({ error: 'invalid strava url' });
  }
  const axios = require('axios');
  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  // Step 1: Get activityId. Try direct match, then follow redirects.
  let activityId = null;
  let m = String(url).match(/strava\.com\/activities\/(\d+)/i);
  if (m) activityId = m[1];

  if (!activityId) {
    try {
      const resp = await axios.get(String(url), {
        maxRedirects: 10, validateStatus: () => true, timeout: 8000, headers: HEADERS,
      });
      const finalUrl = (resp.request?.res?.responseUrl) || String(url);
      m = finalUrl.match(/strava\.com\/activities\/(\d+)/i);
      if (!m) m = String(resp.data || '').match(/strava\.com\/activities\/(\d+)/i);
      if (m) activityId = m[1];
    } catch (e) {
      return res.status(500).json({ error: 'redirect resolve failed: ' + e.message });
    }
  }
  if (!activityId) return res.status(404).json({ error: 'no activity id found' });

  // Step 2: Scrape the public activity page for OG tags + stats. Strava blocks
  // iframes from external origins, so we render our own card.
  let title = null, image = null, description = null;
  let distance = null, duration = null, pace = null, location = null, runDate = null;
  try {
    const page = await axios.get(`https://www.strava.com/activities/${activityId}`, {
      maxRedirects: 5, timeout: 10000, headers: HEADERS, validateStatus: () => true,
    });
    if (page.status !== 200) {
      console.warn(`Strava resolve: activity ${activityId} returned status ${page.status}`);
    }
    const html = String(page.data || '');
    const decode = (s) => s ? s
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ') : s;
    const grab = (re) => { const m = html.match(re); return m ? m[1].trim() : null; };
    // Bidirectional meta-tag matcher (handles property-then-content OR content-then-property)
    const ogMeta = (prop) => {
      const re1 = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
      const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i');
      return (html.match(re1) || html.match(re2) || [])[1] || null;
    };

    title       = decode(ogMeta('og:title'));
    image       =        ogMeta('og:image');
    description = decode(ogMeta('og:description'));
    if (title) title = title.replace(/\s*\|\s*Strava\s*$/i, ''); // strip " | Strava" suffix
    if (!title && !image) {
      console.warn(`Strava resolve: no OG tags found for ${activityId} (page len=${html.length})`);
    }

    // Try JSON-LD structured data first (most reliable for stats)
    const ldMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const block of ldMatches) {
      try {
        const jsonStr = block.replace(/^[^>]*>/, '').replace(/<\/script>$/, '').trim();
        const obj = JSON.parse(jsonStr);
        const items = Array.isArray(obj) ? obj : [obj];
        for (const item of items) {
          if (!item) continue;
          // Distance can be number (meters) or { value, unitCode }
          if (item.distance && !distance) {
            const meters = typeof item.distance === 'number' ? item.distance
                         : parseFloat(item.distance.value || item.distance);
            if (meters && !isNaN(meters)) distance = (meters / 1000).toFixed(2) + ' km';
          }
          // Duration as ISO 8601 (PT28M30S)
          if (item.duration && !duration) {
            const m = String(item.duration).match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (m) {
              const h = parseInt(m[1] || 0), mn = parseInt(m[2] || 0), s = parseInt(m[3] || 0);
              duration = h ? `${h}:${String(mn).padStart(2,'0')}:${String(s).padStart(2,'0')}`
                           : `${mn}:${String(s).padStart(2,'0')}`;
            }
          }
          if ((item.startTime || item.startDate) && !runDate) {
            runDate = item.startTime || item.startDate;
          }
          if (item.location && !location) {
            const loc = item.location;
            location = typeof loc === 'string' ? loc
                     : [loc.name, loc.addressLocality, loc.addressCountry].filter(Boolean).join(', ');
          }
        }
      } catch { /* skip malformed JSON-LD blocks */ }
    }

    // Compute pace from distance + duration if not set
    if (!pace && distance && duration) {
      const km = parseFloat(distance);
      const parts = duration.split(':').map(Number);
      const totalSec = parts.length === 3 ? parts[0]*3600 + parts[1]*60 + parts[2]
                     : parts[0]*60 + (parts[1] || 0);
      if (km > 0 && totalSec > 0) {
        const paceSec = totalSec / km;
        const pm = Math.floor(paceSec / 60);
        const ps = Math.round(paceSec % 60);
        pace = `${pm}:${String(ps).padStart(2, '0')}/km`;
      }
    }

    // Search across MULTIPLE sources for stats (description, title, page <title>, raw HTML)
    const pageTitle = decode(grab(/<title[^>]*>([^<]+)<\/title>/i)) || '';
    const searchText = [description, title, pageTitle, html].filter(Boolean).join(' \n ');

    // Distance: "X.XX km", "X km", "X.X mi"
    const distM = searchText.match(/(\d+(?:[.,]\d+)?)\s*(km|mi)\b/i);
    if (distM) distance = `${distM[1].replace(',', '.')} ${distM[2].toLowerCase()}`;

    // Duration: try multiple patterns
    let durM = searchText.match(/(?:Time|Duration|Moving Time)[:\s]+(\d{1,2}(?::\d{2}){1,2})/i);
    if (!durM) durM = searchText.match(/(\d{1,2}:\d{2}:\d{2})/); // raw HH:MM:SS
    if (durM) duration = durM[1];

    // Pace: "M:SS /km" or "M:SS/km" (allow space)
    const paceM = searchText.match(/(\d{1,2}:\d{2})\s*\/?\s*(km|mi)\b/i);
    if (paceM) pace = `${paceM[1]}/${paceM[2].toLowerCase()}`;

    // Date: schema.org startDate or <time datetime="...">
    runDate = grab(/<meta\s+itemprop=["']startTime["']\s+content=["']([^"']+)["']/i)
           || grab(/<time[^>]+datetime=["']([^"']+)["']/i)
           || grab(/"startDateLocal"\s*:\s*"([^"]+)"/i);

    // Location: try og:description "in City, Country" or schema.org location-name
    const locM = (description || '').match(/(?:in|@)\s+([A-Z][^,.<>"]{1,40}(?:,\s*[A-Z][^,.<>"]{1,40})?)/);
    if (locM) location = locM[1].trim();
    if (!location) {
      location = grab(/"locationCity"\s*:\s*"([^"]+)"/i)
              || grab(/<meta\s+itemprop=["']location["']\s+content=["']([^"']+)["']/i);
      if (location) {
        const country = grab(/"locationCountry"\s*:\s*"([^"]+)"/i);
        if (country) location = `${location}, ${country}`;
      }
    }
  } catch { /* best-effort */ }

  return res.json({
    activityId, title, image, description,
    distance, duration, pace, location, runDate,
  });
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
        { sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz DEFAULT now(); ALTER TABLE users ADD COLUMN IF NOT EXISTS email text; ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS emoji text; CREATE TABLE IF NOT EXISTS shared_runs (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, created_at timestamptz DEFAULT now(), name text, "user" text, distance text, time text, elevation text, city text, link text); CREATE TABLE IF NOT EXISTS news_cache (id integer PRIMARY KEY, articles jsonb, updated_at timestamptz DEFAULT now()); CREATE TABLE IF NOT EXISTS scan_stats (date DATE PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0);' },
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

// ── Steps API ─────────────────────────────────────────────────────────────────
// GET /api/steps?email=...                    → { steps, date }  (read)
// GET /api/steps/sync?email=...&steps=NNN     → { ok, steps }    (iOS Shortcut — simple GET, no JSON needed)
// GET /api/steps/shortcut?email=...           → .shortcut file   (auto-installs on iPhone via Safari)
// POST /api/steps { email, steps, date? }     → { ok, steps }    (widget manual entry)
// Called by the StepsWidget (polling) and by the iOS Shortcut / Android automation.

// Download a pre-built .shortcut file with the user's email already embedded.
// Open this URL in Safari on iPhone → iOS offers to install it in the Shortcuts app.
app.get('/api/steps/shortcut', (req, res) => {
  const email = (req.query.email || '').toLowerCase().trim();
  if (!email) return res.status(400).send('Email required');

  const uuid1 = 'B3A2C1D0-E4F5-6789-ABCD-EF0123456789'; // fixed UUID for action 1 output
  const baseUrl = `https://jismeh.fit/api/steps/sync?email=${encodeURIComponent(email)}&steps=`;
  // U+FFFC is the Object Replacement Character — Shortcuts uses it as variable placeholder
  const placeholder = '\uFFFC';
  const offset = baseUrl.length; // character position of the variable in the string

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>WFWorkflowActions</key>
  <array>
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.health.quantity.read</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>WFHealthQuantityType</key>
        <dict>
          <key>Value</key>
          <dict>
            <key>Identifier</key>
            <string>HKQuantityTypeIdentifierStepCount</string>
          </dict>
          <key>WFSerializationType</key>
          <string>WFQuantityTypeState</string>
        </dict>
        <key>WFHealthReadDate</key>
        <dict>
          <key>Value</key>
          <dict>
            <key>Identifier</key>
            <string>Today</string>
          </dict>
          <key>WFSerializationType</key>
          <string>WFDateFieldValue</string>
        </dict>
      </dict>
      <key>WFWorkflowActionOutputName</key>
      <string>Health Samples</string>
      <key>WFWorkflowActionOutputUUID</key>
      <string>${uuid1}</string>
    </dict>
    <dict>
      <key>WFWorkflowActionIdentifier</key>
      <string>is.workflow.actions.downloadurl</string>
      <key>WFWorkflowActionParameters</key>
      <dict>
        <key>WFHTTPMethod</key>
        <string>GET</string>
        <key>WFURL</key>
        <dict>
          <key>WFSerializationType</key>
          <string>WFTextTokenString</string>
          <key>Value</key>
          <dict>
            <key>string</key>
            <string>${baseUrl.replace(/&/g, '&amp;')}${placeholder}</string>
            <key>attachmentsByRange</key>
            <dict>
              <key>{${offset}, 1}</key>
              <dict>
                <key>Aggrandizements</key>
                <array/>
                <key>OutputName</key>
                <string>Health Samples</string>
                <key>OutputUUID</key>
                <string>${uuid1}</string>
                <key>Type</key>
                <string>ActionOutput</string>
              </dict>
            </dict>
          </dict>
        </dict>
      </dict>
    </dict>
  </array>
  <key>WFWorkflowClientVersion</key>
  <string>1100.1</string>
  <key>WFWorkflowMinimumClientVersion</key>
  <integer>900</integer>
  <key>WFWorkflowMinimumClientVersionString</key>
  <string>900</string>
  <key>WFWorkflowHasShortcutInputVariables</key>
  <false/>
  <key>WFWorkflowTypes</key>
  <array/>
  <key>WFWorkflowImportQuestions</key>
  <array/>
  <key>WFWorkflowInputContentItemClasses</key>
  <array/>
  <key>WFWorkflowIcon</key>
  <dict>
    <key>WFWorkflowIconStartColor</key>
    <integer>4282601983</integer>
    <key>WFWorkflowIconGlyphNumber</key>
    <integer>59440</integer>
  </dict>
</dict>
</plist>`;

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="FitNas Steps.shortcut"');
  res.send(plist);
});

app.get('/api/steps', async (req, res) => {
  const { email } = req.query;
  const today = new Date().toISOString().slice(0, 10);
  if (!email || !supabase) return res.json({ steps: 0, date: today });
  try {
    const { data } = await supabase
      .from('steps_log')
      .select('steps')
      .eq('email', email.toLowerCase().trim())
      .eq('date', today)
      .single();
    res.json({ steps: data?.steps || 0, date: today });
  } catch { res.json({ steps: 0, date: today }); }
});

// Simple GET sync — used by iOS Shortcut (no JSON body needed)
// URL: https://jismeh.fit/api/steps/sync?email=YOU@EMAIL.COM&steps=8432
app.get('/api/steps/sync', async (req, res) => {
  const { email, steps } = req.query;
  const today = new Date().toISOString().slice(0, 10);
  if (!email || steps == null) return res.status(400).json({ error: 'Missing email or steps' });
  const count = Math.max(0, Math.round(Number(steps)));
  if (!supabase) return res.json({ ok: true, steps: count });
  try {
    await supabase.from('steps_log').upsert(
      { email: email.toLowerCase().trim(), date: today, steps: count, updated_at: new Date().toISOString() },
      { onConflict: 'email,date' }
    );
    res.json({ ok: true, steps: count, date: today });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/steps', async (req, res) => {
  const { email, steps, date } = req.body;
  const day = date || new Date().toISOString().slice(0, 10);
  if (!email || steps == null) return res.status(400).json({ error: 'Missing email or steps' });
  const count = Math.max(0, Math.round(Number(steps)));
  if (!supabase) return res.json({ ok: true, steps: count });
  try {
    await supabase.from('steps_log').upsert(
      { email: email.toLowerCase().trim(), date: day, steps: count, updated_at: new Date().toISOString() },
      { onConflict: 'email,date' }
    );
    res.json({ ok: true, steps: count });
  } catch (e) { res.status(500).json({ error: e.message }); }
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

// POST /api/admin/init-scan-table — one-time table creation via Management API
// Called by admin page on load; silently succeeds or fails
app.post('/api/admin/init-scan-table', requireAdminSession, async (req, res) => {
  if (!supabase) return res.json({ ok: false, reason: 'no supabase' });
  try {
    // Try a lightweight insert of a dummy row to see if table exists
    const { error } = await supabase
      .from('scan_stats')
      .select('date')
      .limit(1);

    if (!error) return res.json({ ok: true, reason: 'table exists' });

    // Table missing — try Management API (needs SUPABASE_SERVICE_KEY or PAT)
    const pat = process.env.SUPABASE_PAT || process.env.SUPABASE_SERVICE_KEY;
    if (!pat) return res.json({ ok: false, reason: 'no PAT — create table manually in Supabase SQL editor: CREATE TABLE scan_stats (date DATE PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0);' });

    const projectRef = (process.env.SUPABASE_URL || '').match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!projectRef) return res.json({ ok: false, reason: 'cannot parse project ref' });

    const axios = require('axios');
    await axios.post(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      { query: 'CREATE TABLE IF NOT EXISTS scan_stats (date DATE PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0);' },
      { headers: { Authorization: `Bearer ${pat}`, 'Content-Type': 'application/json' } }
    );
    res.json({ ok: true, reason: 'table created' });
  } catch (err) {
    res.json({ ok: false, reason: err.message });
  }
});

// GET /api/admin/scan-stats — daily scan counts (last 30 days)
app.get('/api/admin/scan-stats', requireAdminSession, async (req, res) => {
  if (!supabase) return res.json({ stats: [], tableReady: false });
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('scan_stats')
      .select('date, count')
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: true });

    // Table doesn't exist yet — return empty, not an error
    if (error) {
      const isTableMissing = error.message?.includes('does not exist') || error.code === '42P01' || error.code === 'PGRST204';
      if (isTableMissing) return res.json({ stats: [], tableReady: false });
      throw error;
    }
    res.json({ stats: data || [], tableReady: true });
  } catch (err) {
    console.error('scan-stats error:', err.message);
    res.json({ stats: [], tableReady: false }); // never crash the admin page
  }
});


const RSSParser = require('rss-parser');
const parser = new RSSParser();

// Pinned L'Orient Le Jour articles — merged with dynamic feed and sorted by date
// Manually curated global FMCG articles — always surfaced at the top
const PINNED_GLOBAL_ARTICLES = [
  {
    title: "Samedi à Beyrouth : Ma Ninou mise sur l'intime malgré l'incertitude - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1508365/samedi-a-beyrouth-ma-ninou-mise-sur-lintime-malgre-lincertitude.html',
    pubDate: 'Sat, 30 May 2026 08:00:00 GMT',
    contentSnippet: "Ma Ninou, nouvelle adresse beyrouthine, mise sur une expérience intime et chaleureuse malgré le contexte incertain pour offrir une cuisine soignée à ses convives...",
    id: 'pinned-maninou-1508365',
    photoUrl: '/news/ma-ninou.webp',
  },
  {
    title: "Week-end à Beyrouth : Maison El Dada mise sur la gastronomie pour faire revivre une bâtisse historique - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1506951/weekend-a-beyrouth-maison-el-dada-mise-sur-la-gastronomie-pour-faire-revivre-une-batisse-historique.html',
    pubDate: 'Sat, 23 May 2026 08:00:00 GMT',
    contentSnippet: "Maison El Dada redonne vie à une bâtisse historique de Beyrouth en y installant une nouvelle adresse gastronomique qui mêle patrimoine et cuisine raffinée...",
    id: 'pinned-maisondada-1506951',
    photoUrl: '/news/maisondada.jpg',
  },
  {
    title: "À Beyrouth, Stashh parie sur la qualité pour réinventer l'expérience café - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1506188/a-beyrouth-stashh-parie-sur-la-qualite-pour-reinventer-lexperience-cafe.html',
    pubDate: 'Sun, 10 May 2026 08:00:00 GMT',
    contentSnippet: "Stashh, nouvelle adresse beyrouthine, mise tout sur la qualité du grain et l'expérience client pour réinventer la culture café au Liban...",
    id: 'pinned-stashh-1506188',
    photoUrl: '/news/stashh.webp',
  },
  {
    title: "Tawlet s'invite au Domaine des Tourelles à Chtaura - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1478821/tawlet-sinvite-au-domaine-des-tourelles-a-chtaura.html',
    pubDate: 'Sun, 3 May 2026 08:00:00 GMT',
    contentSnippet: "Tawlet, l'institution beyrouthine de la cuisine libanaise authentique, s'invite le temps d'une expérience au Domaine des Tourelles à Chtaura, dans la Békaa...",
    id: 'pinned-tawlet-tourelles-1478821',
    photoUrl: '/news/tawlet-tourelles.jfif',
  },
  {
    title: "The new Spinneys in Antelias has its own Sephora section",
    link: 'https://www.beirut.com/en/773632/the-new-spinneys-in-antelias-has-its-own-sephora-section/',
    pubDate: 'Sat, 25 Apr 2026 09:00:00 GMT',
    contentSnippet: "Spinneys' newly-opened Antelias branch makes a bold retail statement, integrating a dedicated Sephora beauty section inside the supermarket — a first-of-its-kind concept in Lebanon.",
    id: 'pinned-global-spinneys-antelias-sephora',
    photoUrl: '/news/spinneys-antelias.jpg',
  },
  {
    title: "Americana acquires Malak Al Tawouk in a major Lebanese QSR push",
    link: 'https://www.agbi.com/articles/americana-diversifies-into-lebanese-cuisine-as-profits-rise/',
    pubDate: 'Mon, 09 Feb 2026 10:00:00 GMT',
    contentSnippet: "Americana Restaurants has secured a 75-year licence for Malak Al Tawouk and acquired its UAE and Saudi franchisees, marking a major push into Lebanese QSR.",
    id: 'pinned-global-americana-malak-al-tawouk',
    photoUrl: '/news/americana-malak.jpg',
  },
  {
    title: "Create Wellness raises $20 million, setting sights beyond creatine gummies",
    link: 'https://athletechnews.com/create-wellness-raises-20-million-funding-setting-sights-beyond-creatine-gummies/',
    pubDate: 'Tue, 08 Apr 2026 10:00:00 GMT',
    contentSnippet: "Create Wellness has raised $20 million in funding and is expanding beyond its viral creatine gummies into a broader functional wellness portfolio.",
    id: 'pinned-global-create-wellness-20m',
    photoUrl: '/news/create-wellness.jpg',
  },
  {
    title: "Monoprix arrives to NokNok!",
    link: 'https://www.facebook.com/share/r/1B6kN893MZ/',
    pubDate: 'Sun, 29 Mar 2026 10:00:00 GMT',
    contentSnippet: "A closer look at the latest food and wellness trends shaping the Lebanese consumer market — from emerging local brands to shifting habits in Beirut and beyond.",
    id: 'pinned-global-fb-1B6kN893MZ',
    photoUrl: '/news/monoprix-noknok.jpg',
  },
  {
    title: "Danone's $1bn Huel deal: why the multinational is betting big on meal replacements",
    link: 'https://www.dairyreporter.com/Article/2026/03/23/danones-1bn-huel-deal-why-the-multinational-is-betting-big-on-meal-replacements/',
    pubDate: 'Sun, 23 Mar 2026 08:00:00 GMT',
    contentSnippet: "Danone has agreed to acquire Huel in a deal valued at around $1bn, marking a major strategic bet on the fast-growing meal replacement and functional nutrition category.",
    id: 'pinned-global-danone-huel',
    photoUrl: '/news/danone-huel.jpg',
  },
  {
    title: "Good Girl Snacks built a cult brand with zero paid ads — here's how",
    link: 'https://www.shopify.com/blog/good-girl-snacks-zero-dollar-customer-acquisition',
    pubDate: 'Mon, 17 Mar 2026 08:00:00 GMT',
    contentSnippet: "Good Girl Snacks grew from a home kitchen experiment to a viral snack brand by leaning entirely on community, content, and word of mouth — spending nothing on paid customer acquisition.",
    id: 'pinned-global-goodgirlsnacks',
    photoUrl: '/news/goodgirlssnack.jpg',
  },
];

const PINNED_LORIENT_ARTICLES = [
  {
    title: "Kiki's : manger sain sans renoncer au plaisir - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1492564/kikis-manger-sain-sans-renoncer-au-plaisir.html',
    pubDate: 'Sun, 25 Jan 2026 08:00:00 GMT',
    contentSnippet: "Kiki's, une nouvelle adresse à Beyrouth qui mise sur une cuisine saine et savoureuse...",
    id: 'pinned-lorient-1492564',
    photoUrl: '/news/kikis.jpg',
  },
  {
    title: "À Badaro, Bistrot Lobo mise sur le bistrot français version beyrouthine - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1491754/a-badaro-bistrot-lobo-mise-sur-le-bistrot-francais-version-beyrouthine.html',
    pubDate: 'Sun, 18 Jan 2026 08:00:00 GMT',
    contentSnippet: "Bistrot Lobo s'installe à Badaro et réinvente le bistrot français avec une touche beyrouthine...",
    id: 'pinned-lorient-1491754',
    photoUrl: '/news/bistrotlobo.jpg',
  },
  {
    title: "Dimanche : Kasr Fakhreddine, institution de la cuisine libanaise, s'installe à Beyrouth - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1490887/dimanche-kasr-fakhreddine-institution-de-la-cuisine-libanaise-sinstalle-a-beyrouth-la-maison-de-broummana-descend-en-ville.html',
    pubDate: 'Sun, 11 Jan 2026 08:00:00 GMT',
    contentSnippet: "Kasr Fakhreddine, institution de la cuisine libanaise traditionnelle, descend en ville et s'installe à Beyrouth...",
    id: 'pinned-lorient-1490887',
    photoUrl: '/news/kasr-fakhreddine.jpg',
  },
  {
    title: "Izzyy ouvre son premier magasin de la cuisine familiale au réseau national - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1488252/izzyy-ouvre-son-premier-magasin-de-la-cuisine-familiale-au-reseau-national.html',
    pubDate: 'Thu, 11 Dec 2025 08:00:00 GMT',
    contentSnippet: "Izzyy inaugure son premier point de vente, proposant une cuisine familiale libanaise accessible à travers le réseau national...",
    id: 'pinned-lorient-1488252',
    photoUrl: '/news/izzy.jpg',
  },
  {
    title: "Céline, la nouvelle adresse sucrée de Saifi Village - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1483245/celine-la-nouvelle-adresse-sucree-de-saifi-village.html',
    pubDate: 'Thu, 30 Oct 2025 08:00:00 GMT',
    contentSnippet: "Céline s'installe à Saifi Village et propose une adresse gourmande dédiée aux douceurs et pâtisseries...",
    id: 'pinned-lorient-1483245',
    photoUrl: '/news/celine-artisans.jpg',
  },
  {
    title: "Les Chats du Quartier, un nouveau refuge à Saifi - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1481586/les-chats-du-quartier-un-nouveau-refuge-a-saifi.html',
    pubDate: 'Wed, 15 Oct 2025 08:00:00 GMT',
    contentSnippet: "Les Chats du Quartier ouvre ses portes à Saifi, un nouveau café-refuge au cœur de Beyrouth...",
    id: 'pinned-lorient-1481586',
    photoUrl: '/news/leschatsduquartier.webp',
  },
  {
    title: "Superchief, un nouveau souffle pour Monnot - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1479686/superchief-un-nouveau-souffle-pour-monnot.html',
    pubDate: 'Sun, 28 Sep 2025 08:00:00 GMT',
    contentSnippet: "Superchief s'installe à Monnot et apporte un nouveau souffle à ce quartier emblématique de Beyrouth...",
    id: 'pinned-lorient-1479686',
    photoUrl: '/news/superchief2.webp',
  },
  {
    title: "Ouverture de Mamaz Kitchen dans le nouvel hôtel Lost à Achrafieh - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1455681/ouverture-de-mamaz-kitchen-dans-le-nouvel-hotel-lost-a-achrafieh.html',
    pubDate: 'Sat, 22 Feb 2025 08:00:00 GMT',
    contentSnippet: "Mamaz Kitchen ouvre ses portes dans le nouvel hôtel Lost à Achrafieh, proposant une cuisine créative au cœur de Beyrouth...",
    id: 'pinned-lorient-1455681',
    photoUrl: '/news/mamazkitchen.webp',
  },
  {
    title: "Beihouse, un concept unique en plein cœur de Gemmayze - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1454695/beihouse-un-concept-unique-en-plein-coeur-de-gemmayze.html',
    pubDate: 'Thu, 13 Feb 2025 08:00:00 GMT',
    contentSnippet: "Beihouse s'impose comme un concept unique et inédit au cœur du quartier de Gemmayze, Beyrouth...",
    id: 'pinned-lorient-1454695',
    photoUrl: '/news/beihouse.webp',
  },
  {
    title: "Couqley, un bistrot français entre tradition et ambition - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1453796/couqley-un-bistrot-francais-entre-tradition-et-ambition.html',
    pubDate: 'Wed, 05 Feb 2025 08:00:00 GMT',
    contentSnippet: "Couqley réinvente le bistrot français à Beyrouth, entre tradition culinaire et ambition gastronomique...",
    id: 'pinned-lorient-1453796',
    photoUrl: '/news/couqley.jpg',
  },
  {
    title: "The Chase Trattoria, une nouvelle ère pour une adresse emblématique de la place Sassine - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1452561/the-chase-trattoria-une-nouvelle-ere-pour-une-adresse-emblematique-de-la-place-sassine.html',
    pubDate: 'Sat, 25 Jan 2025 08:00:00 GMT',
    contentSnippet: "The Chase Trattoria marque une nouvelle ère pour cette adresse emblématique de la place Sassine à Beyrouth...",
    id: 'pinned-lorient-1452561',
    photoUrl: '/news/thechase.webp',
  },
];

const NEWS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const NEWS_FILTER_VERSION = 57; // bump this whenever filters change to invalidate old cache

const NEWS_BANNED_WORDS = [
  'printemps', 'galeries lafayette', 'grands magasins',
  'war', 'israel', 'strike', 'missile', 'hezbollah', 'parliament', 'injured', 'killed',
  'conflict', 'evacuate', 'mourn', 'iran', 'airstrike', 'military', 'army', 'casualty',
  'bomb', 'drone', 'attack', 'protest', 'gaza', 'palestine', 'assassination',
  'armée', 'armees', 'armee', 'sergent', 'soldat', 'soldats', 'troupes', 'troupe',
  'combattant', 'combattants', 'guerre', 'guerres', 'bataillon', 'brigade', 'général',
  'général', 'officier', 'militaire', 'militaires', 'défense', 'defense nationale',
  'tennessee', 'nashville', 'pennsylvania', 'lancaster', 'lebtown', 'lancasteronline',
  'tennessean', 'wsmv', 'news channel 5', 'lebanon, pa', 'lebanon, tn', 'lebanon, oh',
  'lebanon, mo', 'lebanon, in', 'lebanon, ky',
  'lebanon county', 'lebanon township', 'city of lebanon', 'north lebanon', 'south lebanon',
  'west lebanon', 'east lebanon', 'lebanon borough', 'lebanon valley',
  'food bank', 'food pantry', 'food drive', 'food insecurity', 'food aid', 'food relief',
  'food assistance', 'food voucher', 'food basket', 'food distribution', 'food parcel',
  'world food', 'world food programme', 'world food program', 'wfp', 'hunger', 'famine',
  'malnutrition', 'malnourish', 'humanitarian', 'food crisis', 'food security', 'food emergency',
  'unicef', 'undp', 'unhcr', 'unrwa', 'unfao', 'fao ', 'wfp ',
  'refugee', 'displaced', 'displacement', 'shelter', 'vulnerable population',
  'livelihood', 'beneficiar', 'emergency relief', 'relief effort', 'aid worker',
  'aid organization', 'aid agency', 'aid distribution',
  'donations', 'charity', 'nonprofit', 'non-profit', ' ngo ', ' ngos ',
  'bank', 'banking', 'central bank', 'banque', 'loan', 'credit', 'mortgage', 'interest rate',
  'stock market', 'nasdaq', 'forex', 'currency', 'imf', 'world bank',
  'wkrn', 'lebanese-daily-news', 'lebanon daily news', 'discover the burgh', 'lakeexpo',
  'towne post', 'valley news', 'mt. lebanon', 'mount lebanon', 'townpost',
  'newspapers.com', 'lebanon plaza', 'lebanon pa', 'lebanon tn',
  'retail theft', 'police arrest', 'water project', 'ministry of foreign', 'workshop',
  'resilience of lebanon', 'bass pro', 'hobie', 'watercraft',
  'security', 'weak', 'assistance', 'insecurity', 'supporting', 'inspection',
  'bar association', 'soldier', 'chef de l\'arm', 'homologue', 'pigeons', 'sanctuary',
  'arrested', 'nude', 'war with', 'dire straits',
  'salt lake', 'saltlake', 'utah', 'salt lake magazine',
  'recette', 'ingrédients', 'ingredients', 'préparation', 'preparation', 'cuisine is aussi',
  'ayala', 'philstar', 'philippine', 'philippines',
  'spinneys egypt', 'spinneys uae', 'spinneys dubai', 'spinneys emirates', 'spinneys saudi',
  'spinneys oman', 'spinneys bahrain', 'spinneys kuwait', 'spinneys qatar', 'spinneys riyadh',
  'spinneys luxury', 'new cairo', 'spinneys opens in', 'spinneys expands',
  'by chef', 'with chef', 'crafts lebanese', 'insider\'s guide', 'guide to eating',
  'belarus', 'belarusian', 'russia', 'russian', 'moscow', 'kremlin',
  'tass.com', 'rt.com', 'sputnik', 'interfax', 'ria novosti',
  'беларус', 'россия', 'российск', 'министерство иностранных дел', 'республики беларусь',
  'street food tour', 'food tour', 'best cuisine?', 'world\'s best cuisine',
  'marseille', 'australia', 'australian',
  'chef de la diplomatie', 'chef de la diplom', 'chef de la diplomati',
  'street food eyes', 'niche in lebanese', 'fast casual',
  'sits at a cafe', 'man sits at',
  'valence', 'cèdre à', 'cedre a',
  'quand la mémoire passe', 'quand la memoire passe',
  'venu pour un an',
  'americana diversifies into lebanese cuisine',
  "pouloche s'installe à sassine", 'pouloche sinstalle a sassine',
  "allo beirut", "allô beirut", "allô beirut s'installe", "allô beirut opens",
  'hamas', 'téhéran', 'ankara', 'fuite des chefs',
  'les chefs et le goût', 'les chefs et le gout', 'chefs et le goût', 'chefs et le gout',
  'israël', 'israel', 'cessez-le-feu', 'ceasefire', "chefs de l'opposition", 'de l\'opposition',
  'goût retrouvé', 'gout retrouve', 'dimanche à la campagne', 'dimanche a la campagne',
];

const NEWS_BANNED_DOMAINS = ['qsrmedia'];

function isArticleBanned(article) {
  const text = ((article.title || '') + ' ' + (article.contentSnippet || '')).toLowerCase();
  const link = (article.link || '').toLowerCase();
  if (/lebanon,?\s*(pa|tn|oh|mo|in|ky|va|or|il|ct|nj|ny|tx|ga|nc|sc|ms|ar|wi|mn|ia|ks|ne|sd|nd|mt|id|ut|az|nm|co|wy)/i.test(text)) return true;
  if (/\b(lebanon county|lebanon township|city of lebanon)\b/i.test(text)) return true;
  if (NEWS_BANNED_DOMAINS.some(d => link.includes(d))) return true;
  return NEWS_BANNED_WORDS.some(bw => text.includes(bw));
}

async function fetchLebanonFMCGNews() {
  const feeds = [
    // English — Beirut-specific (avoids US Lebanon County from non-LB servers)
    'https://news.google.com/rss/search?q=(Beirut+OR+Achrafieh+OR+Gemmayze+OR+Spinneys+OR+"Malak+Al+Tawouk"+OR+the961+OR+Naccache+OR+Dbayeh+OR+Badaro+OR+Saifi)+(food+OR+restaurant+OR+bar+OR+supermarket+OR+cafe+OR+grocery+OR+retail+OR+cuisine+OR+FMCG+OR+dining)&hl=en&gl=LB&ceid=LB:en',
    // French — Beyrouth-specific (avoids ambiguous Liban results)
    'https://news.google.com/rss/search?q=(Beyrouth+OR+Achrafieh+OR+Gemmayz+OR+Badaro+OR+libanais+OR+libanaise)+(restaurant+OR+bar+OR+cuisine+OR+table+OR+gastronomie+OR+bistrot+OR+chef+OR+brasserie+OR+adresse+OR+ouverture+OR+alimentation+OR+supermarch%C3%A9+OR+%C3%A9picerie)&hl=fr&gl=FR&ceid=FR:fr',
    // Specific Lebanese FMCG brands (unambiguous regardless of server location)
    'https://news.google.com/rss/search?q=("Malak+Al+Tawouk"+OR+"Americana+Lebanon"+OR+"Spinneys+Lebanon"+OR+"Grey+McKenzie"+OR+"Fattal+Lebanon"+OR+"Bou+Khalil"+OR+"the961"+OR+"Em+Sherif"+OR+"Cheese+On+Top"+OR+"Zaatar+w+Zeit"+OR+"Roadster+Diner"+OR+"Al+Abdallah"+OR+"Swiss+Butter")&hl=en&gl=LB&ceid=LB:en',
    // L'Orient Le Jour — by authors Nagi Morkos & Nada Alameddine (ouvertures section)
    'https://news.google.com/rss/search?q=site:lorientlejour.com+(%22Nagi+Morkos%22+OR+%22Nada+Alameddine%22)&hl=fr&gl=FR&ceid=FR:fr',
    // L'Orient Le Jour — cuisine section: openings & new addresses
    'https://news.google.com/rss/search?q=site:lorientlejour.com/cuisine-liban-a-table+(%22nouvelle+adresse%22+OR+%22ouvre+ses+portes%22+OR+%22inaugure%22+OR+%22s%27installe%22+OR+%22nouveau+restaurant%22+OR+%22ouverture%22+OR+bistrot+OR+brasserie)&hl=fr&gl=FR&ceid=FR:fr',
    // L'Orient Le Jour — cuisine section: bars, cafés, food concepts
    'https://news.google.com/rss/search?q=site:lorientlejour.com/cuisine-liban-a-table+(bar+OR+caf%C3%A9+OR+lounge+OR+rooftop+OR+concept+OR+adresse+OR+enseigne+OR+terrasse)+(Beyrouth+OR+Beirut+OR+Achrafieh+OR+Gemmayz+OR+Badaro+OR+Sassine+OR+Monnot+OR+Hamra)&hl=fr&gl=FR&ceid=FR:fr',
    // L'Orient Today — food & beverage section
    'https://news.google.com/rss/search?q=site:today.lorientlejour.com+(restaurant+OR+bar+OR+cafe+OR+opening+OR+dining+OR+food+OR+new+location)+(Beirut+OR+Lebanon)&hl=en&gl=LB&ceid=LB:en',
  ];

  const bannedWords = NEWS_BANNED_WORDS;
  const goodWords = [
    'the961', '961', 'food', 'restaurant', 'supermarket', 'market', 'fmcg', 'spinneys',
    'carrefour', 'menu', 'chef', 'cuisine', 'dining', 'diet', 'grocery', 'retail', 'brand',
    'nourriture', 'supermarché', 'business', 'startup', 'delivery', 'coffee', 'cafe',
    'grey mckenzie', 'americana', 'malak al tawouk', 'fattal', 'bou khalil',
    'table', 'gastronomie', 'bistrot', 'bistro', 'brasserie', 'terrasse', 'adresse',
    'ouverture', 'patronne', 'patron', 'traiteur', 'épicerie', 'alimentation', 'boisson',
    'em sherif', 'cheese on top', 'zaatar w zeit', 'roadster', 'al abdallah', 'swiss butter',
    'restauration', 'marché', 'distributeur', 'grande surface', 'enseigne', 'monoprix',
    'mall', 'chips', 'snack', 'bar ', 'brunch', 'dîner', 'déjeuner', 'saveur', 'goût',
    'taqueria', 'nocturne', 'crepaway', 'eatery', 'trattoria', 'pizzeria', 'boulangerie',
    'pâtisserie', 'glacier', 'cantine', 'taverne', 'auberge', 'lounge', 'rooftop',
    'nagi morkos', 'nada alameddine', 'sassine', 'starco', 'sodeco', 'monnot', 'hamra',
    'mar mikhael', 'verdun', 'jounieh', 's\'installe', 'ouvre', 'inaugure',
  ];

  const results = await Promise.allSettled(feeds.map(url => parser.parseURL(url)));
  let allItems = [];
  for (const result of results) {
    if (result.status === 'fulfilled') allItems.push(...result.value.items);
    else console.error('Failed fetching feed:', result.reason?.message);
  }

  let formattedItems = allItems.filter(item => {
    const title = (item.title || '').toLowerCase();
    const snippet = (item.contentSnippet || item.content || '').toLowerCase();
    const text = title + ' ' + snippet;

    // Reject social media posts and non-articles
    if (title.length < 20) return false;
    if (/^(ig|instagram|twitter|tweet|facebook|tiktok)\s*[-–|]/i.test(item.title || '')) return false;

    // Reject recipe articles: "[dish] de [Firstname Lastname]" pattern from L'Orient cuisine section
    if (/^(le |la |les |l'|un |une )?[\w\s,'àâéèêëîïôùûüç]+ de [A-Z][a-zàâéèêëîïôùûüç]+ [A-Z][a-zàâéèêëîïôùûüç]/.test(item.title || '')) return false;

    // Reject bare author profile pages (e.g. "Nagi MORKOS - L'Orient-Le Jour")
    if (/^[A-ZÀ-Ü][a-zà-ü]+ [A-ZÀÉÈÊËÎÏÔÙÛÜ]+\s*[-–]\s*L'Orient/i.test(item.title || '')) return false;

    // L'Orient Le Jour articles must be by Nagi Morkos or Nada Alameddine
    const isLOrientLink = (item.link || '').includes('lorientlejour.com') || (item.link || '').includes('lorienttoday.com');
    if (isLOrientLink && !text.includes('nagi morkos') && !text.includes('nada alameddine')) return false;

    // Reject US "Lebanon" towns via pattern matching
    if (/lebanon,?\s*(pa|tn|oh|mo|in|ky|va|or|il|ct|nj|ny|tx|ga|nc|sc|ms|ar|wi|mn|ia|ks|ne|sd|nd|mt|id|ut|az|nm|co|wy)/i.test(text)) return false;
    if (/\b(lebanon county|lebanon township|city of lebanon)\b/i.test(text)) return false;

    const hasBanned = bannedWords.some(bw => text.includes(bw));
    if (hasBanned) return false;

    const hasGood = goodWords.some(gw => text.includes(gw));
    const mentionsLebanon = (
      text.includes('lebanon') || text.includes('liban') ||
      text.includes('beirut') || text.includes('beyrouth') ||
      text.includes('gemmayze') || text.includes('gemmayz') || text.includes('achrafieh') ||
      text.includes('saifi') || text.includes('naccache') ||
      text.includes('dbayeh') || text.includes('badaro') ||
      text.includes('spinneys') || text.includes('grey mckenzie') ||
      text.includes('the961') || text.includes('americana') ||
      text.includes('fattal') || text.includes('bou khalil') ||
      text.includes('em sherif') || text.includes('cheese on top') ||
      text.includes('zaatar w zeit') || text.includes('roadster') ||
      text.includes('al abdallah') || text.includes('swiss butter') ||
      text.includes('malak al tawouk') || text.includes('l\'orient') ||
      text.includes('commerce du levant') || text.includes('ici beyrouth') ||
      text.includes('libanais') || text.includes('libanaise') ||
      text.includes('nagi morkos') || text.includes('nada alameddine') ||
      text.includes('sassine') || text.includes('starco') || text.includes('sodeco') ||
      text.includes('monnot') || text.includes('monot') || text.includes('hamra') ||
      text.includes('mar mikhael') || text.includes('verdun') || text.includes('jounieh')
    );

    // Spinneys articles must be from Lebanon, Syria or Iraq only
    if (text.includes('spinneys')) {
      const spinneysGeo = text.includes('lebanon') || text.includes('liban') ||
        text.includes('beirut') || text.includes('beyrouth') ||
        text.includes('syria') || text.includes('syrie') || text.includes('syrian') ||
        text.includes('iraq') || text.includes('irak') || text.includes('iraqi') || text.includes('baghdad');
      if (!spinneysGeo) return false;
    }

    return hasGood && mentionsLebanon;
  }).map((item, index) => ({
    title: item.title,
    link: item.link,
    // Use the real pubDate from the article — never fake it
    pubDate: item.pubDate || null,
    contentSnippet: (item.contentSnippet || item.content || '').replace(/<[^>]*>?/g, '').substring(0, 200) + '...',
    id: item.guid || `news-${index}`,
  }));

  // L'Orient articles: keep up to 12 months; others: 6 months
  const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
  const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  formattedItems = formattedItems.filter(a => {
    if (!a.pubDate) return true;
    const ts = new Date(a.pubDate).getTime();
    const isLOrientArticle = (a.title || '').toLowerCase().includes("l'orient");
    return ts >= (isLOrientArticle ? twelveMonthsAgo : sixMonthsAgo);
  });

  // Sort newest first (articles with no date go to the end)
  formattedItems.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0;
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return new Date(b.pubDate) - new Date(a.pubDate);
  });

  // Deduplicate by title, source domain, AND subject similarity
  const STOP_WORDS = new Set(['the','a','an','and','or','of','in','on','at','to','for','is','are','was','were','be','been','has','have','had','with','that','this','from','by','as','it','its','not','but','about','into','than','their','they','which','who','will','would','could','should','also','new','after','before','up','out','more','over','one','two','three','all','so','he','she','we','our','your','his','her','can','do','did']);

  function keyWords(title) {
    // Strip trailing " - Source Name" before computing keywords
    const clean = title.replace(/\s+-\s+[^-]+$/, '');
    return clean.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP_WORDS.has(w));
  }

  function isTooSimilar(titleA, seenKeywordSets) {
    const kw = keyWords(titleA);
    if (kw.length === 0) return false;
    for (const seen of seenKeywordSets) {
      const overlap = kw.filter(w => seen.has(w)).length;
      const ratioNew = overlap / kw.length;
      const ratioSeen = overlap / seen.size;
      // Reject if ratio-based OR if 3+ specific keywords match (catches long titles)
      if (Math.max(ratioNew, ratioSeen) >= 0.4 || overlap >= 3) return true;
    }
    return false;
  }

  const BRAND_DEDUP_KEYS = ['americana','spinneys','carrefour','malak al tawouk','fattal','bou khalil',
    'em sherif','cheese on top','zaatar w zeit','roadster','al abdallah','swiss butter','monoprix',
    'crepaway','burger king','mcdonald','kfc','pizza hut','starbucks','dunkin'];
  const BRAND_MAX = 2; // max articles per brand per fetch

  const deduplicated = [];
  const seenTitles = new Set();
  const seenKeywordSets = [];
  const brandCounts = {};
  let lorientCount = 0;
  const LORIENT_MAX = 20;

  for (const it of formattedItems) {
    const normTitle = it.title.toLowerCase();

    if (seenTitles.has(normTitle)) continue;

    // L'Orient Le Jour / L'Orient Today: allow up to LORIENT_MAX, skip similarity check for them
    const isLOrient = normTitle.includes("l'orient") || (it.link || '').includes('lorient');
    if (isLOrient) {
      if (lorientCount >= LORIENT_MAX) continue;
      if (isTooSimilar(it.title, seenKeywordSets)) continue;
    } else {
      if (isTooSimilar(it.title, seenKeywordSets)) continue;
    }

    // Max 1 article for Spinneys, BRAND_MAX for other brands
    const brandHit = BRAND_DEDUP_KEYS.find(b => normTitle.includes(b));
    if (brandHit) {
      const maxForBrand = brandHit === 'spinneys' ? 1 : BRAND_MAX;
      brandCounts[brandHit] = (brandCounts[brandHit] || 0) + 1;
      if (brandCounts[brandHit] > maxForBrand) continue;
    }

    if (isLOrient) lorientCount++;
    seenTitles.add(normTitle);
    seenKeywordSets.push(new Set(keyWords(it.title)));
    deduplicated.push(it);
  }

  // Merge pinned L'Orient articles, skip any already present by link or similar title
  const existingLinks = new Set(deduplicated.map(a => a.link));
  const existingTitles = new Set(deduplicated.map(a => a.title.toLowerCase()));
  const pinnedToAdd = PINNED_LORIENT_ARTICLES.filter(
    a => !existingLinks.has(a.link) && !existingTitles.has(a.title.toLowerCase())
  );
  const globalToAdd = PINNED_GLOBAL_ARTICLES.filter(
    a => !existingLinks.has(a.link) && !existingTitles.has(a.title.toLowerCase())
  );

  // Merge all and sort by date descending (pinned articles have real dates now)
  const merged = [...globalToAdd, ...pinnedToAdd, ...deduplicated];
  merged.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0;
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return new Date(b.pubDate) - new Date(a.pubDate);
  });
  const finalArticles = merged.slice(0, 50);

  // Enrich with Google Maps place photos
  const GMAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (GMAPS_KEY) {
    const axios = require('axios');

    // Manual overrides for known restaurants where auto-extraction fails
    const PLACE_OVERRIDES = {
      // Lebanese restaurants — precise queries
      'al beiruti':       'Al Beiruti restaurant Gemmayzeh Beirut Lebanon',
      'colonel beer':     null,
      'liza':             'Liza restaurant Achrafieh Beirut Lebanon',
      'pouloche':         'Pouloche restaurant Sassine Place Achrafieh Beirut',
      'bistrot lobo':     'Bistrot Lobo Badaro Beirut Lebanon',
      'superchief':       'Superchief Monnot Beirut Lebanon',
      'couqley':          'Couqley French bistro Gemmayzeh Beirut',
      'beihouse':         'Beihouse Gemmayzeh Beirut Lebanon',
      'mamaz kitchen':    'Mamaz Kitchen Lost Hotel Achrafieh Beirut',
      'the chase':        'The Chase Trattoria Sassine Beirut Lebanon',
      'izzyy':            'Izzyy restaurant Beirut Lebanon',
      "kiki's":           "Kiki's healthy restaurant Beirut Lebanon",
      'kasr fakhreddine': 'Kasr Fakhreddine Lebanese restaurant Beirut',
      'les chats du quartier': 'Les Chats du Quartier cafe Saifi Beirut Lebanon',
      "céline":           'Céline pâtisserie Saifi Village Beirut Lebanon',
      'celine':           'Céline pâtisserie Saifi Village Beirut Lebanon',
      'dimanche':         'Kasr Fakhreddine Dimanche restaurant Beirut Lebanon',
      'lobo':             'Bistrot Lobo Badaro Beirut Lebanon',
      // Global brands — use Lebanese location for relevance
      'malak al tawouk':  'Malak Al Tawouk restaurant Beirut Lebanon',
      'malak al taouk':   'Malak Al Tawouk restaurant Beirut Lebanon',
      'americana':        'Americana Restaurants Beirut Lebanon',
      'monoprix':         'Monoprix Beirut Lebanon',
      'spinneys':         'Spinneys supermarket Beirut Lebanon',
      // Global FMCG with no physical Beirut location — skip photo
      'danone':           null,
      'huel':             null,
      'create wellness':  null,
      'good girl snacks': null,
    };

    function extractPlaceSearchTerm(title) {
      const lower = title.toLowerCase();
      // Check manual overrides first (null = skip photo)
      for (const [key, val] of Object.entries(PLACE_OVERRIDES)) {
        if (lower.includes(key)) return val; // val may be null → caller skips fetch
      }
      // Strip source suffix: "- L'Orient-Le Jour", "- The961", etc.
      let clean = title.replace(/\s*[-–]\s*(L'Orient[\w\s-]*|The\s*961|961|Daily Star|Annahar|Commerce du Levant|L'OLJ|Arabia)\s*$/i, '').trim();
      // French: extract name before common opening verbs
      const frMatch = clean.match(/^(?:[ÀA]\s+[\w-]+,\s+)?([\w\s''ÀÂÉÈÊËÎÏÔÙÛÜÇàâéèêëîïôùûüç-]+?)(?:\s+(?:s'installe|ouvre|propose|inaugure|mise sur|arrive|débarque|rejoint|prend ses|accueille|signe))/i);
      if (frMatch) return frMatch[1].trim() + ' Beirut Lebanon';
      // English: extract name after "from" or "at" (catches "order from X", "fire at X")
      const fromMatch = clean.match(/\bfrom\s+([A-Z][\w\s''-]{2,30}?)(?:\s+(?:exclusively|in\b|on\b|at\b|,|\.|$))/);
      if (fromMatch) return fromMatch[1].trim() + ' Beirut Lebanon';
      const atMatch = clean.match(/\bat\s+(?:the\s+)?([A-Z][\w\s''-]{2,30}?)(?:\s+(?:restaurant|bar|brewery|in\b|,|\.))/i);
      if (atMatch) return atMatch[1].trim() + ' Beirut Lebanon';
      // English: extract name before common opening verbs
      const enMatch = clean.match(/^([\w\s''-]+?)(?:\s+(?:opens|launches|expands|arrives|unveils|introduces|now open|gets a))/i);
      if (enMatch) return enMatch[1].trim() + ' Beirut Lebanon';
      // Fallback: first 3 words + Beirut
      return clean.split(/\s+/).slice(0, 3).join(' ') + ' Beirut Lebanon';
    }

    async function fetchPlacePhoto(searchTerm) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerm)}&key=${GMAPS_KEY}`;
        const { data } = await axios.get(url, { timeout: 6000 });
        if (data.results && data.results[0] && data.results[0].photos && data.results[0].photos[0]) {
          const ref = data.results[0].photos[0].photo_reference;
          return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=120&photoreference=${encodeURIComponent(ref)}&key=${GMAPS_KEY}`;
        }
      } catch (e) { /* silently skip */ }
      return null;
    }

    const photoResults = await Promise.allSettled(
      finalArticles.map(a => {
        const term = extractPlaceSearchTerm(a.title);
        return term === null ? Promise.resolve(null) : fetchPlacePhoto(term);
      })
    );
    finalArticles.forEach((a, i) => {
      if (photoResults[i].status === 'fulfilled' && photoResults[i].value) {
        a.photoUrl = photoResults[i].value;
      }
    });
  }

  return finalArticles;
}

// ── FMCG News (pinned articles only — RSS feed disabled) ─────────────────────
app.get('/api/news', async (req, res) => {
  const pinned = [
    ...PINNED_GLOBAL_ARTICLES,
    ...PINNED_LORIENT_ARTICLES,
  ].filter(a => !isArticleBanned(a));
  return res.json(pinned);
});

// ── Text-based Meal Describer (Gemini) ───────────────────────────────────────
app.post('/api/describe-food', async (req, res) => {
  const { description, mode = 'identify', answers } = req.body;
  if (!description?.trim()) return res.status(400).json({ error: 'No description provided' });

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI API key not configured' });

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const identifyPrompt = `You are a nutrition expert specialising in Lebanese, Middle Eastern, French and international cuisine.

The user says they ate: "${description.trim()}"

Ask 2 to 4 smart clarifying questions to give a MUCH more accurate calorie estimate. Focus on the biggest unknowns: portion size, cooking method (grilled vs fried adds 100-300 kcal), sauces/oils, type of protein, extras like bread/rice/fries.

Respond ONLY with this JSON (no markdown):
{
  "dish": "Inferred dish name",
  "items": ["ingredient 1", "ingredient 2"],
  "questions": [
    {"q": "Question?", "options": ["Option A", "Option B", "Option C"]},
    {"q": "Question?", "options": ["Option A", "Option B", "Option C"]}
  ]
}

ALWAYS start with portion/quantity. Use metric units only (grams, cm — never cups, oz, inches). Keep to 2-3 questions maximum if the meal is already clear. Be smart about what matters most for calorie accuracy for Lebanese/Middle Eastern food.`;

    const answersText = answers && Object.keys(answers).length > 0
      ? Object.entries(answers).map(([q, a]) => `• ${q} → ${a}`).join('\n')
      : '';

    const estimatePrompt = `You are a nutrition expert specialising in Lebanese, Middle Eastern, French and international cuisine.

The user described their meal as: "${description.trim()}"

They answered the following questions:
${answersText}

Give a precise nutritional estimate using their description and answers. Use metric units only.

Respond ONLY with this JSON (no markdown):
{
  "dish": "Name of the dish",
  "confidence": "high|medium|low",
  "servingSize": "e.g. 1 medium plate (~380g)",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "items": ["ingredient 1", "ingredient 2"],
  "tip": "One short practical nutrition tip about this meal"
}`;

    const prompt = mode === 'estimate' ? estimatePrompt : identifyPrompt;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const geminiJson = await geminiRes.json();
    if (!geminiRes.ok) {
      const msg = geminiJson?.error?.message || `Gemini API error ${geminiRes.status}`;
      const isQuota = msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || geminiRes.status === 429;
      return res.status(500).json({ error: isQuota ? 'API quota exceeded — please try again in a moment.' : msg });
    }

    const text = (geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    if (!text) throw new Error('Empty response from Gemini');
    let clean = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in AI response');
    const data = JSON.parse(jsonMatch[0]);

    if (mode === 'estimate') {
      data.calories = Math.round(Number(data.calories) || 0);
      data.protein  = Math.round(Number(data.protein)  || 0);
      data.carbs    = Math.round(Number(data.carbs)    || 0);
      data.fat      = Math.round(Number(data.fat)      || 0);
      if (supabase) {
        (async () => {
          try {
            const today = new Date().toISOString().slice(0, 10);
            const { data: row } = await supabase.from('scan_stats').select('count').eq('date', today).single();
            const newCount = (row?.count || 0) + 1;
            await supabase.from('scan_stats').upsert({ date: today, count: newCount }, { onConflict: 'date' });
          } catch (e) { /* fire-and-forget, never block response */ }
        })();
      }
    }
    res.json(data);
  } catch (err) {
    console.error('Food description error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Food Photo Analyzer (Gemini Vision) ──────────────────────────────────────
app.post('/api/analyze-food', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', mode = 'identify', answers } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI API key not configured' });

  try {
    // Deep mode uses the heavier Pro model for higher accuracy (~15-25s).
    // identify/estimate keep Flash for the legacy two-step flow.
    const modelName = mode === 'deep_analyze' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // mode=identify: recognise dish + ask questions (no calorie estimate yet)
    // mode=estimate: user answered questions, now give full nutritional breakdown
    const identifyPrompt = `You are a nutrition expert with DEEP expertise in Lebanese and Levantine home cooking, plus French and international cuisine. You can read Levantine-Arabic transliterations (where 2='ء/ق', 3='ع', 7='ح', 5/kh='خ').

Look at this food photo and:
1. Identify the dish PRECISELY. If it is a Lebanese/Levantine dish, return the Lebanese name (transliterated) followed by the English equivalent in parentheses, e.g. "Wara2 3enab (stuffed grape leaves)", "Riz 3a djej (Lebanese rice with chicken)".
2. List the visible/likely ingredients.
3. Ask 3 to 5 smart clarifying questions that will allow a MUCH more accurate calorie estimate.

Think like a nutritionist: the biggest sources of error are portion size, cooking method (grilled vs fried adds 100-300 kcal), the amount of olive oil / samneh / butter used, sauces (toum, tahini, yogurt), type of meat/protein, and extras like bread, rice or pine nuts. Ask about all relevant ones for what you see.

## LEBANESE / LEVANTINE DISH GLOSSARY (use these exact spellings)

### Mezze, salads, dips
- Hummus (chickpea purée with tahini)
- Moutabal / Baba ghanouj (smoky grilled-eggplant dip)
- Mhammara (red pepper + walnut dip)
- Labneh (strained yogurt, often with olive oil + mint)
- Tabbouleh (parsley + bulgur + tomato + mint salad)
- Fattoush (chopped salad with toasted/fried bread)
- Shanklish (fermented cheese balls in herbs)
- Kibbeh nayyeh (raw bulgur + minced meat tartare)

### Stuffed dishes (mehshi / mahshi)
- Wara2 3enab / Warak enab (rolled grape leaves with rice + meat)
- Mehshi kousa (stuffed zucchini)
- Mehshi batenjan (stuffed baby eggplant)
- Sheikh el mehshi (eggplant stuffed with minced meat in tomato sauce)
- Mahshi mlefoof (stuffed cabbage rolls)

### Stews and rice plates
- Riz 3a djej / Riz a djej / Hashweh (yellow rice with shredded chicken, pine nuts, almonds, often raisins)
- Mloukhieh (green jute-leaf stew with chicken or beef, served over vermicelli rice)
- Yakhnet bazella / yakhnet kousa / yakhnet loubieh (pea / zucchini / green-bean stews)
- Bemieh bi zeit or bi lahme (okra in olive oil or with meat)
- Loubieh bzeit (green beans in olive oil)
- Mujaddara (lentils + rice + caramelised onions)
- Mdardara (lentils + bulgur)
- Maqlooba (Palestinian "upside-down" rice with eggplant + meat)
- Sayadieh (caramelised-onion rice with fish)
- Kafta bil sanieh (kafta tray baked with potatoes + tomato)
- Kibbeh bil sanieh (baked kibbeh tray)
- Kibbeh labanieh (kibbeh balls in yogurt sauce)

### Grills and meats
- Shish tawook (marinated chicken skewers)
- Lahem mishwi (grilled beef cubes)
- Kafta mishwiyeh (grilled minced-meat skewers)
- Arayes (pita stuffed with kafta, then grilled)
- Shawarma (djej / lahmeh — chicken or beef)

### Bakery / street food
- Manakish za3tar (thyme-oil flatbread)
- Manakish jebneh (cheese flatbread)
- Manakish lahme b3ajin (minced-meat flatbread)
- Sfeeha (open-faced meat pies)
- Fatayer sabanekh (triangular spinach pies)
- Falafel (fried chickpea-fava balls)
- Foul mdammas (stewed fava beans with cumin and lemon)
- Balila (warm chickpea bowl with cumin)
- Knefeh bi jebn (sweet semolina pastry with akkawi cheese, syrup)
- Atayef (mini pancakes filled with cream or walnut)
- Maamoul (date / pistachio / walnut cookies)

### Visual cues that help identification
- Wara2 3enab: dark-green tightly rolled cylinders, lemon wedge, small plate
- Riz 3a djej: yellow-tinted rice mound, shredded chicken, pine nuts on top
- Mloukhieh: dark-green soupy stew, white rice, lemon, optional chopped onion
- Kibbeh: torpedo/football-shaped fried croquettes, golden-brown
- Manakish: flat round bread with green za3tar paste OR melted white cheese
- Shawarma: pita wrap with shaved meat, tomato, pickle, garlic sauce
- Tabbouleh: bright-green dominated, very fine parsley, small red specks (tomato)
- Hummus: smooth pale-beige dip, swirl in centre, olive oil pool, dusting of paprika

## OUTPUT (JSON only, no markdown)
{
  "dish": "Lebanese name (English equivalent)",
  "items": ["ingredient 1", "ingredient 2"],
  "questions": [
    {"q": "Question?", "options": ["Option A", "Option B", "Option C"]},
    {"q": "Question?", "options": ["Option A", "Option B", "Option C"]},
    {"q": "Question?", "options": ["Option A", "Option B", "Option C"]}
  ]
}

ALWAYS ask about portion/quantity first. Then ask about the highest-calorie unknowns.

## EXAMPLE QUESTIONS PER LEBANESE DISH

Wara2 3enab:
- "How many rolls roughly?" → ["6 small rolls (~120g)", "12 rolls (~240g)", "18+ rolls (~360g+)"]
- "Stuffing type?" → ["Bi zeit (rice + olive oil only)", "With minced meat (lahmeh)", "Mixed plate"]
- "Cooked with extra olive oil?" → ["Light", "Generous (Lebanese style)", "Not sure"]

Riz 3a djej / hashweh:
- "Plate size?" → ["Small (~250g)", "Regular (~400g)", "Large (~550g+)"]
- "Chicken portion?" → ["Just a few pieces", "Half a thigh + breast", "Full thigh / quarter chicken"]
- "Pine nuts and almonds on top?" → ["None", "A sprinkle", "Generous"]
- "Was samneh or butter used?" → ["Samneh / butter", "Olive oil only", "Not sure"]

Mloukhieh:
- "How big was the bowl?" → ["Small (~250g total)", "Regular (~400g)", "Large (~550g+)"]
- "How much rice underneath?" → ["1/2 cup (~80g)", "1 cup (~160g)", "1.5+ cups (~240g+)"]
- "Meat in it?" → ["Chicken", "Beef cubes", "No meat"]

Manakish:
- "How many manakish?" → ["1 (~120g)", "2 (~240g)", "3+ (~360g+)"]
- "Topping?" → ["Za3tar only", "Cheese (jebneh)", "Meat (lahme b3ajin)", "Mixed"]
- "Did you eat with extras (labneh, ayran, etc.)?" → ["Plain", "Labneh on the side", "With ayran / coke"]

Pizza:
- "How many slices did you eat?" → ["1 slice (~130g)", "2 slices (~260g)", "3+ slices (~390g+)"]
- "Pizza size?" → ["Small (20cm)", "Medium (28cm)", "Large (33cm+)"]
- "Crust type?" → ["Thin", "Regular", "Thick / stuffed"]
- "Main topping?" → ["Cheese only", "Pepperoni / meat", "Mixed toppings"]

Grilled meat plate:
- "Roughly how much meat?" → ["~100g (small)", "~180g (normal)", "~280g+ (large)"]
- "Type of meat?" → ["Chicken (tawook)", "Kafta", "Lahem mishwi (beef)", "Mixed"]
- "Cooking method?" → ["Grilled (mishwi)", "Fried", "Baked"]
- "Sides included?" → ["Rice + salad", "Fries + salad", "Bread only", "No sides"]
- "Sauce?" → ["No sauce", "Toum (garlic)", "Tahini", "Both"]

Sandwich / wrap:
- "How big?" → ["Small (~150g)", "Regular (~250g)", "Large (~350g+)"]
- "Protein?" → ["Chicken (tawook / shawarma)", "Beef / shawarma", "Falafel", "Cheese / kashkaval"]
- "Bread?" → ["Markouk (thin)", "Regular pita", "Saj / thick bread"]
- "Sauces inside?" → ["None", "Toum", "Tahini", "Both + extras"]

Use metric units only (grams, ml, cm — never cups, oz, inches). Be specific to what you actually see in the photo.
If not food: return dish: "Not food detected", items: [], questions: [].`;

    const answersText = answers && Object.keys(answers).length > 0
      ? Object.entries(answers).map(([q, a]) => `• ${q} → ${a}`).join('\n')
      : '';

    const estimatePrompt = `You are a nutrition expert with DEEP expertise in Lebanese and Levantine home cooking, plus French and international cuisine.

The user photographed this meal. They answered the following questions:
${answersText}

Using the photo AND their answers, give a precise nutritional estimate. Use metric units only (grams, ml).

Reference values for typical Lebanese dishes (per 100g unless stated):
- Wara2 3enab bi zeit: ~180 kcal/100g; with meat: ~210 kcal/100g (one rolled leaf ≈ 20g)
- Riz 3a djej (with chicken + nuts): ~220 kcal/100g
- Mloukhieh stew alone: ~70 kcal/100g; rice underneath: ~150 kcal/100g
- Kibbeh fried (one ball ~50g): ~250 kcal/100g
- Manakish za3tar (one ~120g): ~430 kcal; cheese: ~480; meat: ~520
- Shawarma sandwich (regular ~250g): chicken ~520 kcal, beef ~620 kcal
- Falafel sandwich (~250g): ~480 kcal
- Tabbouleh (~150g serving): ~150 kcal
- Fattoush (~200g): ~200 kcal (more if extra fried bread + dressing)
- Hummus (~100g): ~170 kcal; with olive oil pool: +50
- Mujaddara (~250g): ~330 kcal
- Knefeh (~150g slice with syrup): ~480 kcal
- Tawook plate with rice + toum (~400g total): ~700 kcal

For dishes with samneh/butter or generous olive oil, add 80-150 kcal vs standard.
For "Lebanese restaurant portion" (large plate, garnishes), assume the upper end.

Respond ONLY with this JSON (no markdown):
{
  "dish": "Lebanese name (English equivalent)",
  "confidence": "high|medium|low",
  "servingSize": "e.g. 12 wara2 3enab (~240g) or 1 medium plate riz a djej (~400g)",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "items": ["ingredient 1", "ingredient 2"],
  "tip": "One short practical nutrition tip about this meal"
}`;

    // Deep single-shot prompt: no clarifying questions, full CoT reasoning,
    // returns the final macro estimate directly. Used by the camera/gallery flow.
    const deepPrompt = `You are a nutrition expert with DEEP expertise in Lebanese, Levantine, French, and international cuisines. You can read Levantine-Arabic transliterations (where 2='ء/ق', 3='ع', 7='ح', 5/kh='خ').

Take your time (~20-30 seconds) to deeply analyze this food photo. You will NOT ask any clarifying questions — instead, you must reason carefully through the steps below internally, make confident assumptions, and produce the final answer in one shot.

## TWO HARD RULES — READ BEFORE ANYTHING ELSE

**RULE 1 — SYMMETRY / CONTEXT:** When you see multiple similar items on the same plate (e.g., two sandwich halves of the same bread, two identical-looking burgers, two same-shape rolls), ASSUME they are the same dish unless there is direct visual evidence to the contrary (clearly different bread type, different color, different shape, or a visibly empty interior). NEVER invent a "plain roll" or "empty bread" just because one item's filling isn't visible from the angle. Two half-baguettes of the same color and crust on the same plate are TWO of the same sandwich, even if only one shows its filling.

**RULE 2 — UNDER-ESTIMATE WHEN UNCERTAIN:** Lean toward the LOWER realistic end of every estimate. Mass-market food-tracking apps consistently overestimate by 10-30% because they assume restaurant portions and generous fats. Counter this. If you are torn between 80g and 100g of bread, pick 80g. If you are torn between 10ml and 15ml of oil, pick 10ml. Better to under-estimate by 50 kcal than over by 200. Final kcal should feel TIGHT, not generous.

## INTERNAL REASONING (do this silently — do NOT include it in the JSON output)

STEP 1 — IDENTIFY THE DISH
Look at colors, textures, presentation, plating, garnishes, sides, container shape. If Lebanese/Levantine, give the Lebanese name (transliterated) + English equivalent in parentheses. Example: "Wara2 3enab bi zeit (vegetarian stuffed grape leaves)".

STEP 2 — INVENTORY VISIBLE COMPONENTS WITH ESTIMATED MASS
List every visible element with mass in grams (ml for liquids). Use reference cues: a fork is ~20cm, a standard dinner plate is 25-28cm Ø, a small mezze plate 15-18cm, a pita ~120g, an egg ~50g. Examples:
- 8 stuffed grape leaves @ ~22g each = ~175g
- Lemon wedge ~10g
- Pool of olive oil ~10ml = 9g

STEP 3 — INFER COOKING METHOD AND HIDDEN FATS/SAUCES
Was it grilled / fried / baked / raw / stewed? What invisible fats are likely present — olive oil, samneh, butter, deep-fry oil, toum, tahini, mayo, cream, dressings, sugar in glaze? These commonly add 100-400 kcal that aren't obvious from the photo. Assume the dish was prepared in a typical Lebanese / restaurant style.

STEP 4 — COMPUTE PER-COMPONENT KCAL/MACROS, THEN SUM
Use the reference tables below. Multiply mass × kcal/macros per gram for each item, sum, round to the nearest integer.

STEP 5 — SANITY CHECK
Does the total match the plate size? Small mezze plate <300 kcal, regular main 400-700, generous restaurant plate 700-1200, indulgent/oversized 1200-1800. If your number is off, recheck portion estimates.

## OUTPUT — REPLY WITH ONLY THIS JSON (no markdown, no explanation, no commentary)
{
  "dish": "Lebanese name (English equivalent)",
  "confidence": "high|medium|low",
  "servingSize": "concrete metric description, e.g. 12 wara2 3enab (~240g) with lemon wedge",
  "calories": <integer kcal>,
  "protein": <integer grams>,
  "carbs": <integer grams>,
  "fat": <integer grams>,
  "items": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
  "tip": "one short practical nutrition tip"
}

## LEBANESE / LEVANTINE DISH GLOSSARY (use these exact spellings)

### Mezze, salads, dips
- Hummus, Moutabal / Baba ghanouj, Mhammara, Labneh, Tabbouleh, Fattoush, Shanklish, Kibbeh nayyeh

### Stuffed dishes
- Wara2 3enab / Warak enab, Mehshi kousa, Mehshi batenjan, Sheikh el mehshi, Mahshi mlefoof

### Stews and rice plates
- Riz 3a djej / Hashweh, Mloukhieh, Yakhnet bazella/kousa/loubieh, Bemieh bi zeit/lahme, Loubieh bzeit, Mujaddara, Mdardara, Maqlooba, Sayadieh, Kafta bil sanieh, Kibbeh bil sanieh, Kibbeh labanieh

### Grills and meats
- Shish tawook, Lahem mishwi, Kafta mishwiyeh, Arayes, Shawarma (djej / lahmeh)

### Bakery / street food
- Manakish za3tar/jebneh/lahme b3ajin, Sfeeha, Fatayer sabanekh, Falafel, Foul mdammas, Balila, Knefeh bi jebn, Atayef, Maamoul

### Visual cues
- Wara2 3enab: dark-green tight cylinders, lemon wedge
- Riz 3a djej: yellow-tinted rice mound, shredded chicken, pine nuts on top
- Mloukhieh: dark-green soupy stew over white rice, lemon
- Kibbeh: torpedo-shaped fried croquettes, golden-brown
- Manakish: round flatbread with za3tar paste or melted cheese
- Shawarma: pita wrap with shaved meat, tomato, pickle, garlic sauce
- Tabbouleh: bright-green dominated, very fine parsley, red tomato specks
- Hummus: smooth pale-beige dip, swirl in centre, olive oil pool, paprika

## COMMON ITEM SIZES (use these — do NOT inflate)
- A typical sandwich half-baguette / ciabatta roll: 60-80g of bread (not 150g+)
- A standard pita: 60-90g
- A sandwich filling layer (tuna + mayo, ham, chicken salad): 50-80g per sandwich, NOT 150g
- A tbsp of mayonnaise / olive oil in a sandwich: ~10g, ~70-90 kcal — not a thick "pool"
- A slice of cheese in a sandwich: 15-25g
- A normal restaurant portion of rice: 150-200g (not 300g)
- A grilled chicken breast filet portion: 120-180g (not 250g)
- French fries small/medium/large: 80g / 120g / 180g
- A burger patty (single): 90-120g
- A piece of pizza (slice 1/8 of a 30cm pie): 100-130g

## REFERENCE KCAL / MACRO TABLES

Lebanese specifics (per 100g):
- Wara2 3enab bi zeit: 180 kcal / 3p / 25c / 8f       (1 roll ≈ 20g)
- Wara2 3enab with meat: 210 kcal / 9p / 22c / 10f
- Riz 3a djej (yellow rice + chicken + nuts): 220 kcal / 12p / 28c / 7f
- Mloukhieh stew alone: 70 kcal / 6p / 6c / 3f
- Rice underneath mloukhieh: 150 kcal / 3p / 30c / 1f
- Kibbeh fried (1 ball ~50g): 250 kcal / 12p / 18c / 14f
- Manakish za3tar (1 ~120g): 430 kcal total / 9p / 50c / 22f
- Manakish jebneh (1 ~120g): 480 kcal / 13p / 50c / 25f
- Manakish lahme b3ajin (1 ~120g): 520 kcal / 16p / 52c / 27f
- Shawarma chicken sandwich (~250g): 520 kcal / 28p / 50c / 22f
- Shawarma beef sandwich (~250g): 620 kcal / 28p / 50c / 32f
- Falafel sandwich (~250g): 480 kcal / 16p / 60c / 20f
- Tabbouleh (per 100g): 110 kcal / 3p / 12c / 6f
- Fattoush (per 100g): 100 kcal / 2p / 11c / 6f
- Hummus: 170 kcal / 8p / 14c / 10f (+50 kcal w/ olive oil pool)
- Mujaddara: 130 kcal / 4p / 20c / 4f
- Knefeh w/ syrup: 320 kcal / 6p / 47c / 12f
- Tawook plate w/ rice + toum (~400g total): 700 kcal / 45p / 55c / 30f

International (per 100g):
- Plain cooked rice: 130 / 2.5 / 28 / 0.3
- Ciabatta / baguette / sandwich bread: 260 / 9 / 50 / 2  (1 half-baguette ~70g ≈ 180 kcal)
- Pita / lavash / flatbread: 260 / 9 / 53 / 1            (1 pita ~70g ≈ 180 kcal)
- Toasted white bread / sliced bread: 280 / 9 / 52 / 3
- Croissant: 380 / 8 / 42 / 21
- Grilled chicken breast: 160 / 30 / 0 / 4
- Chicken thigh w/ skin: 220 / 25 / 0 / 13
- Tuna in oil (drained): 200 / 27 / 0 / 9
- Tuna in water: 110 / 25 / 0 / 1
- Tuna + mayo filling (typical sandwich mix): 180 / 18 / 1 / 12
- Ground beef cooked (15% fat): 240 / 26 / 0 / 15
- French fries: 310 / 4 / 40 / 15
- Cheese (mozzarella/cheddar avg): 300 / 22 / 2 / 22
- Olive oil: 884 / 0 / 0 / 100 (1 tbsp = 14g ≈ 120 kcal)
- Mayonnaise: 680 / 1 / 1 / 75 (1 tbsp = 12g ≈ 80 kcal)
- Tomato / cucumber / lettuce / cherry tomato: 18 / 1 / 4 / 0
- Avocado: 160 / 2 / 9 / 15
- Cooked pasta: 160 / 6 / 31 / 1
- Pizza margherita: 250 / 11 / 30 / 9
- Burger (beef patty + bun + cheese, ~180g): 290 / 17 / 27 / 13

## TYPICAL FULL-DISH REFERENCES (anti-overestimation anchors)
- 1 tuna sandwich on half-baguette/ciabatta (~150g total: 70g bread + 70g tuna-mayo + 10g tomato): ~250 kcal / 19p / 30c / 8f
- 1 chicken-mayo sandwich on baguette half (~160g): ~280 kcal / 22p / 32c / 8f
- 1 ham + cheese baguette (~180g): ~430 kcal / 22p / 40c / 19f
- 1 burger (single patty + bun + cheese, ~180g): ~520 kcal / 25p / 36c / 28f
- 1 medium plate pasta bolognese (~300g): ~480 kcal / 22p / 60c / 14f
- 1 bowl Caesar salad with chicken (~300g): ~430 kcal / 32p / 12c / 28f

If your computed total deviates significantly from a similar typical-dish anchor above, RE-CHECK your portion estimates downward.

For dishes prepared with samneh/butter or visibly generous olive oil add 80-150 kcal. For obvious "restaurant indulgence portion" (huge plate, visible thick sauce pools, double protein), assume the upper end — but ONLY when visually evident, not by default.

Use metric units only (grams, ml — never cups, oz, inches).

If the photo is NOT food: return {"dish":"Not food detected","confidence":"low","servingSize":"n/a","calories":0,"protein":0,"carbs":0,"fat":0,"items":[],"tip":""}.`;

    const prompt = mode === 'deep_analyze' ? deepPrompt
                 : mode === 'estimate'     ? estimatePrompt
                 : identifyPrompt;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }],
    };
    if (mode === 'deep_analyze') {
      // Allow generous reasoning budget on Pro for thorough analysis.
      requestBody.generationConfig = {
        temperature: 0.2,
        maxOutputTokens: 4096,
        thinkingConfig: { thinkingBudget: -1 },
      };
    }

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const geminiJson = await geminiRes.json();
    if (!geminiRes.ok) {
      const msg = geminiJson?.error?.message || `Gemini API error ${geminiRes.status}`;
      console.error('Gemini API error:', msg);
      const isQuota = msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || geminiRes.status === 429;
      return res.status(500).json({
        error: isQuota ? 'API quota exceeded — please try again in a moment.' : msg
      });
    }

    const text = (geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    if (!text) throw new Error('Empty response from Gemini');

    let clean = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in AI response');
    const data = JSON.parse(jsonMatch[0]);
    if (mode === 'estimate' || mode === 'deep_analyze') {
      data.calories = Math.round(Number(data.calories) || 0);
      data.protein  = Math.round(Number(data.protein)  || 0);
      data.carbs    = Math.round(Number(data.carbs)    || 0);
      data.fat      = Math.round(Number(data.fat)      || 0);
      // Track scan in Supabase (fire-and-forget)
      if (supabase) {
        (async () => {
          try {
            const today = new Date().toISOString().slice(0, 10);
            const { data: row } = await supabase.from('scan_stats').select('count').eq('date', today).single();
            const newCount = (row?.count || 0) + 1;
            await supabase.from('scan_stats').upsert({ date: today, count: newCount }, { onConflict: 'date' });
          } catch (e) { /* fire-and-forget */ }
        })();
      }
    }
    res.json(data);
  } catch (err) {
    console.error('Food analysis error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Food Label OCR: extract nutrition facts from a label photo ────────────────
app.post('/api/analyze-food-label', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI API key not configured' });

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are reading a packaged-food NUTRITION FACTS label.

Extract these values DIRECTLY from the label (do not estimate). Use metric units only (grams).

If a value is missing or unreadable, return 0 for that field. If servings per container isn't stated, return 1.

Respond ONLY with this JSON (no markdown, no commentary):
{
  "dish": "Product name if visible on the label, else 'Food Label'",
  "servingLabel": "e.g. 1 Tbsp (21g), 30g, 1 cup (240ml)",
  "servingsPerContainer": 0,
  "perServing": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  }
}

Important rules:
- Use the SERVING SIZE shown on the label (not per-100g if a serving size is given)
- "calories" = the big number labelled "Calories" on the label
- "protein" = total protein grams per serving
- "carbs" = TOTAL carbohydrates grams per serving (not net carbs)
- "fat" = total fat grams per serving
- Round all values to whole grams
- If the label is unclear or this is NOT a nutrition facts label, return dish: "Not a label", and zeros.`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }]
      })
    });

    const geminiJson = await geminiRes.json();
    if (!geminiRes.ok) {
      const msg = geminiJson?.error?.message || `Gemini API error ${geminiRes.status}`;
      const isQuota = msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || geminiRes.status === 429;
      return res.status(500).json({
        error: isQuota ? 'API quota exceeded — please try again in a moment.' : msg
      });
    }

    const text = (geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    if (!text) throw new Error('Empty response from AI');

    const clean = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();
    const m = clean.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('No JSON in AI response');
    const raw = JSON.parse(m[0]);

    if (raw.dish === 'Not a label') {
      return res.status(422).json({ error: "Couldn't read a nutrition label. Try a clearer, closer photo." });
    }

    const ps = raw.perServing || {};
    const cal  = Math.max(0, Math.round(Number(ps.calories) || 0));
    const prot = Math.max(0, Math.round(Number(ps.protein)  || 0));
    const carb = Math.max(0, Math.round(Number(ps.carbs)    || 0));
    const fat  = Math.max(0, Math.round(Number(ps.fat)      || 0));
    const servings = Math.max(1, Math.round(Number(raw.servingsPerContainer) || 1));

    if (cal === 0) {
      return res.status(422).json({ error: "Couldn't read calorie info from this label. Try a clearer, closer photo." });
    }

    const perServing = {
      calories: cal, protein: prot, carbs: carb, fat,
      label: raw.servingLabel || 'per serving',
    };
    const perPackage = servings > 1 ? {
      calories: cal * servings,
      protein:  prot * servings,
      carbs:    carb * servings,
      fat:      fat * servings,
      label:    `whole package (×${servings})`,
    } : null;

    res.json({
      dish:        raw.dish || 'Food Label',
      calories:    perServing.calories,
      protein:     perServing.protein,
      carbs:       perServing.carbs,
      fat:         perServing.fat,
      servingSize: perServing.label,
      confidence:  'high',
      items:       [],
      tip:         null,
      perServing,
      perPackage,
    });
  } catch (err) {
    console.error('Food label OCR error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to read label' });
  }
});

// ── Cron: refresh news cache every Sunday (triggered by Vercel Cron) ──────────

app.get('/api/cron/refresh-news', async (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const newArticles = await fetchLebanonFMCGNews();

    // Read existing cached articles
    let existingArticles = [];
    if (supabase) {
      try {
        const { data } = await supabase
          .from('news_cache')
          .select('articles')
          .eq('id', 1)
          .maybeSingle();
        if (data && Array.isArray(data.articles)) existingArticles = data.articles;
      } catch (e) {
        console.error('Cron: could not read existing cache:', e.message);
      }
    }

    // Merge: new articles first, then existing ones not already present
    const seenLinks = new Set(newArticles.map(a => a.link));
    const seenTitles = new Set(newArticles.map(a => a.title.toLowerCase()));
    const uniqueExisting = existingArticles.filter(
      a => !seenLinks.has(a.link) && !seenTitles.has(a.title.toLowerCase())
    );

    // Sort merged list by date descending, cap at 25
    const merged = [...newArticles, ...uniqueExisting]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 25);

    if (supabase && merged.length > 0) {
      await supabase.from('news_cache').upsert([{
        id: 1,
        articles: merged,
        filter_version: NEWS_FILTER_VERSION,
        updated_at: new Date().toISOString(),
      }]);
    }
    res.json({ success: true, new: newArticles.length, total: merged.length, updated_at: new Date().toISOString() });
  } catch (e) {
    console.error('Cron refresh-news failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Instagram thumbnail proxy — extracts og:image from public post HTML
app.get('/api/ig-thumb', async (req, res) => {
  const { shortcode, type = 'reel' } = req.query;
  if (!shortcode || !/^[A-Za-z0-9_-]+$/.test(shortcode)) {
    return res.status(400).json({ error: 'invalid shortcode' });
  }
  // Try correct type first, then fallbacks
  const urlsToTry = [
    `https://www.instagram.com/${type}/${shortcode}/`,
    `https://www.instagram.com/p/${shortcode}/`,
    `https://www.instagram.com/reel/${shortcode}/`,
  ];
  const UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
  for (const igUrl of urlsToTry) {
    try {
      const r = await fetch(igUrl, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(7000),
        redirect: 'follow',
      });
      const html = await r.text();
      const match = html.match(/<meta property="og:image"\s+content="([^"]+)"/i)
                 || html.match(/<meta content="([^"]+)"\s+property="og:image"/i)
                 || html.match(/"display_url":"([^"]+)"/);
      if (match) {
        const url = match[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
        return res.json({ url });
      }
    } catch { /* try next */ }
  }
  return res.status(404).json({ error: 'no thumbnail found' });
});

// ── YouTube channel videos (latest 5 per handle, RSS-feed based) ─────────────
// In-memory cache: handle → { channelId, channelName, videos, fetchedAt }
const youtubeCache = new Map();
const YT_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const YT_BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cookie': 'CONSENT=YES+cb',
};

async function ytResolveChannelId(handle) {
  const h = String(handle).replace(/^@/, '');
  const url = `https://www.youtube.com/@${encodeURIComponent(h)}`;
  const res = await fetch(url, { headers: YT_BROWSER_HEADERS, redirect: 'follow' });
  if (!res.ok) throw new Error(`channel page HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/"channelId":"(UC[\w-]+)"/)
        || html.match(/<meta[^>]+itemprop="identifier"[^>]+content="(UC[\w-]+)"/)
        || html.match(/\/channel\/(UC[\w-]+)/);
  if (!m) throw new Error(`could not extract channelId for @${h}`);
  return m[1];
}

// Fetch a single video's duration in seconds by scraping the watch page
// (YouTube RSS doesn't include duration). Returns null if it can't be determined.
async function ytFetchVideoDuration(videoId) {
  try {
    const url = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const res = await fetch(url, { headers: YT_BROWSER_HEADERS, redirect: 'follow' });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/"lengthSeconds":"(\d+)"/);
    return m ? parseInt(m[1], 10) : null;
  } catch { return null; }
}

async function ytFetchVideos(channelId, limit = 5, minDurationSec = 180) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
  const res = await fetch(url, { headers: { 'User-Agent': YT_BROWSER_HEADERS['User-Agent'] } });
  if (!res.ok) throw new Error(`RSS HTTP ${res.status}`);
  const xml = await res.text();
  // Channel name lives in the outer <author><name>...</name></author>
  const nameMatch = xml.match(/<author>\s*<name>([^<]+)<\/name>/);
  const channelName = nameMatch ? nameMatch[1].trim() : '';
  const rawEntries = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let em;
  while ((em = entryRe.exec(xml))) {
    const block = em[1];
    const videoId = (block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
    const title   = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    const published = (block.match(/<published>([^<]+)<\/published>/) || [])[1];
    const thumb   = (block.match(/<media:thumbnail[^>]+url="([^"]+)"/) || [])[1];
    if (videoId && title) {
      rawEntries.push({
        videoId,
        title: title.trim(),
        published: published || null,
        thumbnail: thumb || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      });
    }
  }
  // RSS returns up to ~15 entries. Resolve durations in parallel, then filter
  // out Shorts (anything shorter than minDurationSec). If duration can't be
  // determined (YouTube throttle / page change), keep the entry to fail open.
  const candidates = rawEntries.slice(0, 15);
  const durations = await Promise.all(candidates.map(v => ytFetchVideoDuration(v.videoId)));
  const enriched = candidates.map((v, i) => ({ ...v, durationSec: durations[i] }));
  const filtered = enriched.filter(v => v.durationSec === null || v.durationSec >= minDurationSec);
  return { channelName, videos: filtered.slice(0, limit) };
}

app.get('/api/youtube', async (req, res) => {
  const handles = String(req.query.handles || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!handles.length) return res.status(400).json({ error: 'Missing handles' });
  const now = Date.now();
  const channels = await Promise.all(handles.map(async handle => {
    const cached = youtubeCache.get(handle);
    if (cached && (now - cached.fetchedAt) < YT_CACHE_TTL_MS) {
      return { handle, ...cached, cached: true };
    }
    try {
      const channelId = cached?.channelId || await ytResolveChannelId(handle);
      const { channelName, videos } = await ytFetchVideos(channelId, 5);
      const entry = { channelId, channelName, videos, fetchedAt: now };
      youtubeCache.set(handle, entry);
      return { handle, ...entry };
    } catch (err) {
      console.error(`[/api/youtube] ${handle}:`, err.message);
      if (cached) return { handle, ...cached, stale: true, error: err.message };
      return { handle, channelId: null, channelName: handle, videos: [], error: err.message };
    }
  }));
  // Cache hint for Vercel edge layer (helps cold-start cost too)
  res.set('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  res.json({ channels });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🥗  Fitness Meal Planner running at http://localhost:${PORT}\n`);
});
