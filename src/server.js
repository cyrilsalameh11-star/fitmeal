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
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'cyrilsalameh11@gmail.com';
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

// ── Cloud Persistence (Supabase) ──────────────────────────────────────────
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase Cloud Database initialized.');
} else {
  console.warn('⚠️  Cloud DB not connected. Falling back to local storage (stats.json).');
}

const statsPath = path.join(__dirname, 'data', 'stats.json');

// --- Helper for Cross-Storage User Counting ---
async function getUserList() {
  if (supabase) {
    const { data, error } = await supabase.from('users').select('name, last_login');
    if (error) throw error;
    return data; // returns [{name, last_login}]
  }
  if (fs.existsSync(statsPath)) {
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    // Support both legacy (names[]) and new ({users: [{name, last_login}]}) formats
    if (Array.isArray(stats.users)) return stats.users;
    return (Array.isArray(stats.names) ? stats.names : []).map(n => ({ name: n, last_login: null }));
  }
  return [];
}

app.get('/api/stats', async (req, res) => {
  try {
    const users = await getUserList();
    res.json({ count: users.length });
  } catch (err) {
    res.json({ count: 0 });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Valid name required' });
    }
    const cleanName = name.trim();
    const users = await getUserList();
    const now = new Date().toISOString();
    const existing = users.find(u => u.name && u.name.toLowerCase() === cleanName.toLowerCase());

    if (!existing) {
      if (supabase) {
        await supabase.from('users').insert([{ name: cleanName, last_login: now }]);
      } else {
        const updatedUsers = [...users, { name: cleanName, last_login: now }];
        fs.writeFileSync(statsPath, JSON.stringify({ users: updatedUsers }, null, 2));
      }
    } else {
      // Update last_login for returning user
      if (supabase) {
        await supabase.from('users').update({ last_login: now }).eq('name', existing.name);
      } else {
        const updatedUsers = users.map(u =>
          u.name.toLowerCase() === cleanName.toLowerCase() ? { ...u, last_login: now } : u
        );
        fs.writeFileSync(statsPath, JSON.stringify({ users: updatedUsers }, null, 2));
      }
    }

    res.json({ success: true, count: existing ? users.length : users.length + 1, isNew: !existing });
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

// GET /api/admin/users — PROTECTED
app.get('/api/admin/users', requireAdminSession, async (req, res) => {
  try {
    const users = await getUserList();
    res.json({ users }); // each user: {name, last_login}
  } catch (err) {
    res.status(500).json({ error: 'Failed to access editor database.' });
  }
});


// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🥗  Fitness Meal Planner running at http://localhost:${PORT}\n`);
});
