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
    title: "Create Wellness raises $20 million, setting sights beyond creatine gummies",
    link: 'https://athletechnews.com/create-wellness-raises-20-million-funding-setting-sights-beyond-creatine-gummies/',
    pubDate: 'Tue, 08 Apr 2026 10:00:00 GMT',
    contentSnippet: "Create Wellness has raised $20 million in funding and is expanding beyond its viral creatine gummies into a broader functional wellness portfolio.",
    id: 'pinned-global-create-wellness-20m',
  },
  {
    title: "Monoprix arrives to NokNok!",
    link: 'https://www.facebook.com/share/r/1B6kN893MZ/',
    pubDate: 'Sun, 29 Mar 2026 10:00:00 GMT',
    contentSnippet: "A closer look at the latest food and wellness trends shaping the Lebanese consumer market — from emerging local brands to shifting habits in Beirut and beyond.",
    id: 'pinned-global-fb-1B6kN893MZ',
  },
  {
    title: "Danone's $1bn Huel deal: why the multinational is betting big on meal replacements",
    link: 'https://www.dairyreporter.com/Article/2026/03/23/danones-1bn-huel-deal-why-the-multinational-is-betting-big-on-meal-replacements/',
    pubDate: 'Sun, 23 Mar 2026 08:00:00 GMT',
    contentSnippet: "Danone has agreed to acquire Huel in a deal valued at around $1bn, marking a major strategic bet on the fast-growing meal replacement and functional nutrition category.",
    id: 'pinned-global-danone-huel',
  },
  {
    title: "Good Girl Snacks built a cult brand with zero paid ads — here's how",
    link: 'https://www.shopify.com/blog/good-girl-snacks-zero-dollar-customer-acquisition',
    pubDate: 'Mon, 17 Mar 2026 08:00:00 GMT',
    contentSnippet: "Good Girl Snacks grew from a home kitchen experiment to a viral snack brand by leaning entirely on community, content, and word of mouth — spending nothing on paid customer acquisition.",
    id: 'pinned-global-goodgirlsnacks',
  },
];

const PINNED_LORIENT_ARTICLES = [
  {
    title: "Pouloche s'installe à Sassine - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1494806/pouloche-sinstalle-a-sassine.html',
    pubDate: 'Sat, 14 Feb 2026 08:00:00 GMT',
    contentSnippet: "Pouloche ouvre une nouvelle adresse à Sassine, Beyrouth. Découvrez ce nouveau concept de restauration libanaise...",
    id: 'pinned-lorient-1494806',
  },
  {
    title: "Kiki's : manger sain sans renoncer au plaisir - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1492564/kikis-manger-sain-sans-renoncer-au-plaisir.html',
    pubDate: 'Sun, 25 Jan 2026 08:00:00 GMT',
    contentSnippet: "Kiki's, une nouvelle adresse à Beyrouth qui mise sur une cuisine saine et savoureuse...",
    id: 'pinned-lorient-1492564',
  },
  {
    title: "À Badaro, Bistrot Lobo mise sur le bistrot français version beyrouthine - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1491754/a-badaro-bistrot-lobo-mise-sur-le-bistrot-francais-version-beyrouthine.html',
    pubDate: 'Sun, 18 Jan 2026 08:00:00 GMT',
    contentSnippet: "Bistrot Lobo s'installe à Badaro et réinvente le bistrot français avec une touche beyrouthine...",
    id: 'pinned-lorient-1491754',
  },
  {
    title: "Dimanche : Kasr Fakhreddine, institution de la cuisine libanaise, s'installe à Beyrouth - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1490887/dimanche-kasr-fakhreddine-institution-de-la-cuisine-libanaise-sinstalle-a-beyrouth-la-maison-de-broummana-descend-en-ville.html',
    pubDate: 'Sun, 11 Jan 2026 08:00:00 GMT',
    contentSnippet: "Kasr Fakhreddine, institution de la cuisine libanaise traditionnelle, descend en ville et s'installe à Beyrouth...",
    id: 'pinned-lorient-1490887',
  },
  {
    title: "Izzyy ouvre son premier magasin de la cuisine familiale au réseau national - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1488252/izzyy-ouvre-son-premier-magasin-de-la-cuisine-familiale-au-reseau-national.html',
    pubDate: 'Thu, 11 Dec 2025 08:00:00 GMT',
    contentSnippet: "Izzyy inaugure son premier point de vente, proposant une cuisine familiale libanaise accessible à travers le réseau national...",
    id: 'pinned-lorient-1488252',
  },
  {
    title: "Céline, la nouvelle adresse sucrée de Saifi Village - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1483245/celine-la-nouvelle-adresse-sucree-de-saifi-village.html',
    pubDate: 'Thu, 30 Oct 2025 08:00:00 GMT',
    contentSnippet: "Céline s'installe à Saifi Village et propose une adresse gourmande dédiée aux douceurs et pâtisseries...",
    id: 'pinned-lorient-1483245',
  },
  {
    title: "Les Chats du Quartier, un nouveau refuge à Saifi - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1481586/les-chats-du-quartier-un-nouveau-refuge-a-saifi.html',
    pubDate: 'Wed, 15 Oct 2025 08:00:00 GMT',
    contentSnippet: "Les Chats du Quartier ouvre ses portes à Saifi, un nouveau café-refuge au cœur de Beyrouth...",
    id: 'pinned-lorient-1481586',
  },
  {
    title: "Superchief, un nouveau souffle pour Monnot - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1479686/superchief-un-nouveau-souffle-pour-monnot.html',
    pubDate: 'Sun, 28 Sep 2025 08:00:00 GMT',
    contentSnippet: "Superchief s'installe à Monnot et apporte un nouveau souffle à ce quartier emblématique de Beyrouth...",
    id: 'pinned-lorient-1479686',
  },
  {
    title: "Ouverture de Mamaz Kitchen dans le nouvel hôtel Lost à Achrafieh - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1455681/ouverture-de-mamaz-kitchen-dans-le-nouvel-hotel-lost-a-achrafieh.html',
    pubDate: 'Sat, 22 Feb 2025 08:00:00 GMT',
    contentSnippet: "Mamaz Kitchen ouvre ses portes dans le nouvel hôtel Lost à Achrafieh, proposant une cuisine créative au cœur de Beyrouth...",
    id: 'pinned-lorient-1455681',
  },
  {
    title: "Beihouse, un concept unique en plein cœur de Gemmayze - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1454695/beihouse-un-concept-unique-en-plein-coeur-de-gemmayze.html',
    pubDate: 'Thu, 13 Feb 2025 08:00:00 GMT',
    contentSnippet: "Beihouse s'impose comme un concept unique et inédit au cœur du quartier de Gemmayze, Beyrouth...",
    id: 'pinned-lorient-1454695',
  },
  {
    title: "Couqley, un bistrot français entre tradition et ambition - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1453796/couqley-un-bistrot-francais-entre-tradition-et-ambition.html',
    pubDate: 'Wed, 05 Feb 2025 08:00:00 GMT',
    contentSnippet: "Couqley réinvente le bistrot français à Beyrouth, entre tradition culinaire et ambition gastronomique...",
    id: 'pinned-lorient-1453796',
  },
  {
    title: "The Chase Trattoria, une nouvelle ère pour une adresse emblématique de la place Sassine - L'Orient-Le Jour",
    link: 'https://www.lorientlejour.com/cuisine-liban-a-table/1452561/the-chase-trattoria-une-nouvelle-ere-pour-une-adresse-emblematique-de-la-place-sassine.html',
    pubDate: 'Sat, 25 Jan 2025 08:00:00 GMT',
    contentSnippet: "The Chase Trattoria marque une nouvelle ère pour cette adresse emblématique de la place Sassine à Beyrouth...",
    id: 'pinned-lorient-1452561',
  },
];

const NEWS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const NEWS_FILTER_VERSION = 42; // bump this whenever filters change to invalidate old cache

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
      'al beiruti':    'Al Beiruti restaurant Beirut Lebanon',
      'colonel beer':  'Colonel Beer brewery Batroun Lebanon',
      'liza':          'Liza restaurant Beirut Lebanon',
      'pouloche':      'Pouloche restaurant Sassine Beirut',
      'bistrot lobo':  'Bistrot Lobo Badaro Beirut',
      'superchief':    'Superchief bar Monnot Beirut',
      'couqley':       'Couqley bistrot Beirut',
      'beihouse':      'Beihouse Gemmayze Beirut',
      'mamaz kitchen': 'Mamaz Kitchen Achrafieh Beirut',
      'the chase':     'The Chase Sassine Beirut',
      'izzyy':         'Izzyy restaurant Beirut',
      "kiki's":        "Kiki's restaurant Beirut",
      'kasr fakhreddine': 'Kasr Fakhreddine restaurant Beirut',
    };

    function extractPlaceSearchTerm(title) {
      const lower = title.toLowerCase();
      // Check manual overrides first
      for (const [key, val] of Object.entries(PLACE_OVERRIDES)) {
        if (lower.includes(key)) return val;
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
      finalArticles.map(a => fetchPlacePhoto(extractPlaceSearchTerm(a.title)))
    );
    finalArticles.forEach((a, i) => {
      if (photoResults[i].status === 'fulfilled' && photoResults[i].value) {
        a.photoUrl = photoResults[i].value;
      }
    });
  }

  return finalArticles;
}

// ── FMCG News (served from Supabase cache, refreshed every Sunday) ────────────
app.get('/api/news', async (req, res) => {
  // 1. Try Supabase cache
  if (supabase) {
    try {
      const { data } = await supabase
        .from('news_cache')
        .select('articles, updated_at, filter_version')
        .eq('id', 1)
        .maybeSingle();

      if (data && Array.isArray(data.articles) && data.articles.length > 0 && data.filter_version === NEWS_FILTER_VERSION) {
        const clean = data.articles.filter(a => !isArticleBanned(a));
        if (clean.length > 0) return res.json(clean);
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
          filter_version: NEWS_FILTER_VERSION,
          updated_at: new Date().toISOString(),
        }]);
      } catch (e) {
        console.error('News cache write failed:', e.message);
      }
    }

    return res.json(articles);
  } catch (error) {
    console.error('Error fetching RSS:', error);
    res.json([]);
  }
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
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // mode=identify: recognise dish + ask questions (no calorie estimate yet)
    // mode=estimate: user answered questions, now give full nutritional breakdown
    const identifyPrompt = `You are a nutrition expert specialising in Lebanese, Middle Eastern, French and international cuisine.

Look at this food photo and:
1. Identify the dish precisely
2. Ask 3 to 5 smart clarifying questions that will allow you to give a MUCH more accurate calorie estimate.

Think like a nutritionist: the biggest sources of error are portion size, cooking method (grilled vs fried adds 100-300 kcal), sauces/oils, type of meat/protein, and extras like bread or rice. Ask about all relevant ones for what you see.

Respond ONLY with this JSON (no markdown):
{
  "dish": "Name of the dish",
  "items": ["ingredient 1", "ingredient 2"],
  "questions": [
    {"q": "Question?", "options": ["Option A", "Option B", "Option C"]},
    {"q": "Question?", "options": ["Option A", "Option B", "Option C"]},
    {"q": "Question?", "options": ["Option A", "Option B", "Option C"]}
  ]
}

ALWAYS ask about portion/quantity first. Then ask about the highest-calorie unknowns.

Examples for pizza:
- "How many slices did you eat?" → ["1 slice (~130g)", "2 slices (~260g)", "3+ slices (~390g+)"]
- "What size was the pizza?" → ["Small (20cm)", "Medium (28cm)", "Large (33cm+)"]
- "What type of crust?" → ["Thin crust", "Regular", "Thick / stuffed crust"]
- "Main topping?" → ["Cheese only", "Pepperoni / meat", "Mixed toppings"]
- "Any dipping sauce?" → ["None", "Ranch / white sauce", "Extra tomato sauce"]

Examples for grilled meat plate:
- "How much meat roughly?" → ["~100g (small)", "~180g (normal)", "~280g+ (large)"]
- "Type of meat?" → ["Chicken", "Beef / kofta", "Lamb", "Mixed"]
- "Was it grilled or fried?" → ["Grilled", "Fried", "Baked/roasted"]
- "What sides were included?" → ["Rice + salad", "Fries + salad", "Bread only", "No sides"]
- "Any sauce added?" → ["No sauce", "Garlic / toum", "Tahini", "Both"]

Examples for a sandwich/wrap:
- "How big was it?" → ["Small (~150g)", "Regular (~250g)", "Large (~350g+)"]
- "What protein?" → ["Chicken", "Beef / shawarma", "Falafel", "Mixed"]
- "What bread?" → ["Thin wrap / markouk", "Regular pita", "Thick bread / baguette"]
- "Sauces inside?" → ["None", "Garlic sauce / toum", "Tahini", "Both + extras"]

Use metric units only (grams, cm — never cups, oz, inches). Be specific to what you actually see.
If not food: return dish: "Not food detected", items: [], questions: [].`;

    const answersText = answers && Object.keys(answers).length > 0
      ? Object.entries(answers).map(([q, a]) => `• ${q} → ${a}`).join('\n')
      : '';

    const estimatePrompt = `You are a nutrition expert specialising in Lebanese, Middle Eastern, French and international cuisine.

The user photographed this meal. They answered the following questions:
${answersText}

Using the photo AND their answers, give a precise nutritional estimate. Use metric units only (grams, ml).

Respond ONLY with this JSON (no markdown):
{
  "dish": "Name of the dish",
  "confidence": "high|medium|low",
  "servingSize": "e.g. 2 slices pizza (~280g) or 1 medium plate (~380g)",
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
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }]
      })
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
    if (mode === 'estimate') {
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

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🥗  Fitness Meal Planner running at http://localhost:${PORT}\n`);
});
