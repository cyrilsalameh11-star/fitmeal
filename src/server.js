/**
 * Express server — entry point
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const mealsRouter = require('./routes/meals');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
    const { data, error } = await supabase.from('users').select('name');
    if (error) throw error;
    return data.map(d => d.name);
  }
  if (fs.existsSync(statsPath)) {
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    return Array.isArray(stats.names) ? stats.names : [];
  }
  return [];
}

app.get('/api/stats', async (req, res) => {
  try {
    const names = await getUserList();
    res.json({ count: names.length });
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
    const names = await getUserList();
    const exists = names.some(n => n && n.toLowerCase() === cleanName.toLowerCase());

    if (!exists) {
      if (supabase) {
        await supabase.from('users').insert([{ name: cleanName }]);
      } else {
        const stats = { names: [...names, cleanName] };
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
      }
    }

    res.json({ success: true, count: exists ? names.length : names.length + 1, isNew: !exists });
  } catch (err) {
    console.error('Error in /api/login:', err.message);
    res.status(500).json({ error: 'Cloud storage error at /api/login.' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const names = await getUserList();
    res.json({ users: names });
  } catch (err) {
    res.status(500).json({ error: 'Failed to access editor database.' });
  }
});

// Serve professional admin dashboard
app.get(['/admin', '/admin.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🥗  Fitness Meal Planner running at http://localhost:${PORT}\n`);
});
