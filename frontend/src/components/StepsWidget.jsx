import { useState, useEffect, useRef, useCallback } from 'react';
import { Footprints, PencilLine, Check, X, RotateCcw, Smartphone, Info, ChevronDown, ChevronUp } from 'lucide-react';

const GOAL = 10000;
const RADIUS = 38;
const CIRC = 2 * Math.PI * RADIUS;

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getColor(pct) {
  if (pct >= 1)   return '#10b981';
  if (pct >= 0.7) return '#f59e0b';
  if (pct >= 0.4) return '#f97316';
  return '#d1d5db';
}

function getTrack(pct) {
  if (pct >= 1)   return '#d1fae5';
  if (pct >= 0.7) return '#fef3c7';
  if (pct >= 0.4) return '#ffedd5';
  return '#f5f5f4';
}

export default function StepsWidget() {
  const email = localStorage.getItem('fitmeal_email') || '';

  const [steps,      setSteps]      = useState(0);
  const [editMode,   setEditMode]   = useState(false);
  const [inputVal,   setInputVal]   = useState('');
  const [syncing,    setSyncing]    = useState(false);
  const [showSetup,  setShowSetup]  = useState(false);
  const [platform,   setPlatform]   = useState('ios'); // 'ios' | 'android'

  // ── Load from API ─────────────────────────────────────────────────────────
  const fetchSteps = useCallback(async () => {
    if (!email) return;
    try {
      const r = await fetch(`/api/steps?email=${encodeURIComponent(email)}`);
      const d = await r.json();
      if (typeof d.steps === 'number') setSteps(d.steps);
    } catch { /* silent */ }
  }, [email]);

  useEffect(() => {
    fetchSteps();
    const iv = setInterval(fetchSteps, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(iv);
  }, [fetchSteps]);

  // ── Save to API ───────────────────────────────────────────────────────────
  const saveSteps = useCallback(async (count) => {
    setSteps(count);
    if (!email) return;
    setSyncing(true);
    try {
      await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, steps: count }),
      });
    } catch { /* silent */ }
    setSyncing(false);
  }, [email]);

  // ── Manual entry ──────────────────────────────────────────────────────────
  const applyManual = () => {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 0) saveSteps(n);
    setEditMode(false);
    setInputVal('');
  };

  const resetSteps = () => saveSteps(0);

  // ── Derived ───────────────────────────────────────────────────────────────
  const pct    = Math.min(steps / GOAL, 1);
  const offset = CIRC * (1 - pct);
  const color  = getColor(pct);
  const track  = getTrack(pct);
  const kcal   = Math.round(steps * 0.04);
  const km     = (steps * 0.00078).toFixed(1);

  // iOS Shortcut source — one-action shortcut that GETs today steps from Health
  // and POSTs to jismeh.fit. User needs their own email in the shortcut.
  const shortcutSteps = [
    { n: 1, text: 'Open the Shortcuts app → tap "+" to create a new shortcut' },
    { n: 2, text: 'Add action: "Find Health Samples Where" — set Type = Steps, Date = Today' },
    { n: 3, text: 'Add action: "Calculate Statistics" — Minimum over Step Count → set to Sum' },
    { n: 4, text: 'Add action: "Get Contents of URL" — set URL to:', code: 'https://jismeh.fit/api/steps', method: 'POST', body: `{"email":"${email || 'YOUR@EMAIL.COM'}","steps": [Calculated Result]}` },
    { n: 5, text: 'Save & name it "Sync Steps to FitNas"' },
    { n: 6, text: 'Optional: create an Automation → "Time of Day" → every hour → run this shortcut' },
  ];

  const androidSteps = [
    { n: 1, text: 'Install MacroDroid (free) from the Play Store' },
    { n: 2, text: 'Create a new Macro — Trigger: "Time → Every 1 hour"' },
    { n: 3, text: 'Add Action: "HTTP Request" — method POST, URL:', code: 'https://jismeh.fit/api/steps' },
    { n: 4, text: 'Set body (JSON): ', body: `{"email":"${email || 'YOUR@EMAIL.COM'}","steps": STEPS_COUNT}` },
    { n: 5, text: 'For step count, use MacroDroid variable connected to Google Fit step counter' },
    { n: 6, text: 'Alternatively: open FitNas, tap ✏ and enter today\'s steps from the Google Fit / Health Connect app' },
  ];

  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-5 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Footprints className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Daily Steps</span>
          {syncing && <span className="text-[9px] text-amber-400 font-bold animate-pulse">saving…</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSetup(s => !s)}
            className="p-1.5 rounded-xl text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-all"
            title="Sync setup"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setEditMode(true); setInputVal(String(steps)); }}
            className="p-1.5 rounded-xl text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-all"
            title="Enter step count manually"
          >
            <PencilLine className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetSteps}
            className="p-1.5 rounded-xl text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all"
            title="Reset today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ring + stats */}
      <div className="flex items-center gap-5">
        {/* Circular ring */}
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={RADIUS} fill="none" stroke={track} strokeWidth="7" />
            <circle
              cx="48" cy="48" r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              transform="rotate(-90 48 48)"
              style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1), stroke 0.4s ease' }}
            />
            {/* Goal dot at top when complete */}
            {pct >= 1 && <circle cx="48" cy="10" r="4" fill={color} />}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span
              className="font-black leading-none text-stone-900"
              style={{ fontSize: steps >= 10000 ? '12px' : steps >= 1000 ? '14px' : '16px' }}
            >
              {steps.toLocaleString()}
            </span>
            <span className="text-[8px] font-bold text-stone-400 mt-0.5 uppercase tracking-wider">/ 10k</span>
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 space-y-2.5 min-w-0">
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Progress</span>
              <span className="text-[10px] font-bold" style={{ color }}>{Math.round(pct * 100)}%</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct * 100}%`, background: color }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-stone-50 rounded-xl px-2.5 py-2 text-center">
              <p className="text-xs font-black text-stone-800">{kcal}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400">kcal</p>
            </div>
            <div className="bg-stone-50 rounded-xl px-2.5 py-2 text-center">
              <p className="text-xs font-black text-stone-800">{km}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400">km</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal badge */}
      {pct >= 1 && (
        <div className="mt-3 text-center text-[9px] font-black uppercase tracking-widest rounded-xl py-1.5 bg-emerald-50 text-emerald-700">
          Goal reached! 🎯
        </div>
      )}

      {/* Manual edit */}
      {editMode && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number" min="0" max="99999"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyManual(); if (e.key === 'Escape') setEditMode(false); }}
            autoFocus
            placeholder="Steps today"
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-200 transition-all"
          />
          <button onClick={applyManual} className="p-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setEditMode(false)} className="p-2 bg-stone-100 text-stone-500 rounded-xl hover:bg-stone-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Setup panel */}
      {showSetup && (
        <div className="mt-4 border-t border-stone-100 pt-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <p className="text-[10px] text-stone-400 font-bold leading-snug">
              Web apps can't read Health data directly. Set up a 1-time automation below to sync your steps automatically every hour.
            </p>
          </div>

          {/* Platform toggle */}
          <div className="flex rounded-xl overflow-hidden border border-stone-100 text-[10px] font-black uppercase tracking-widest">
            <button
              onClick={() => setPlatform('ios')}
              className={`flex-1 py-2 transition-all ${platform === 'ios' ? 'bg-stone-900 text-white' : 'text-stone-400 hover:bg-stone-50'}`}
            >
              iPhone (iOS)
            </button>
            <button
              onClick={() => setPlatform('android')}
              className={`flex-1 py-2 transition-all ${platform === 'android' ? 'bg-stone-900 text-white' : 'text-stone-400 hover:bg-stone-50'}`}
            >
              Android
            </button>
          </div>

          {platform === 'ios' && (
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Apple Shortcuts Setup</p>
              {shortcutSteps.map(s => (
                <div key={s.n} className="flex gap-2.5 items-start">
                  <span className="flex-shrink-0 w-4 h-4 bg-stone-900 text-white rounded-full text-[8px] font-black flex items-center justify-center mt-0.5">{s.n}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-stone-600 leading-relaxed">{s.text}</p>
                    {s.code && (
                      <code className="text-[9px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg block mt-1 break-all font-mono">{s.code}</code>
                    )}
                    {s.body && (
                      <code className="text-[9px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg block mt-1 break-all font-mono">{s.body}</code>
                    )}
                  </div>
                </div>
              ))}
              <div className="mt-2 bg-stone-50 rounded-xl p-3">
                <p className="text-[9px] text-stone-500 font-bold">Once set up, the shortcut will push your real Apple Health steps to FitNas every hour automatically. The ring above will update within 5 minutes.</p>
              </div>
            </div>
          )}

          {platform === 'android' && (
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Android (MacroDroid) Setup</p>
              {androidSteps.map(s => (
                <div key={s.n} className="flex gap-2.5 items-start">
                  <span className="flex-shrink-0 w-4 h-4 bg-stone-900 text-white rounded-full text-[8px] font-black flex items-center justify-center mt-0.5">{s.n}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-stone-600 leading-relaxed">{s.text}</p>
                    {s.code && (
                      <code className="text-[9px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg block mt-1 break-all font-mono">{s.code}</code>
                    )}
                    {s.body && (
                      <code className="text-[9px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg block mt-1 break-all font-mono">{s.body}</code>
                    )}
                  </div>
                </div>
              ))}
              <div className="mt-2 bg-stone-50 rounded-xl p-3">
                <p className="text-[9px] text-stone-500 font-bold">For the quickest setup: just tap ✏ above to type in your step count from Google Health or Fit whenever you check the app.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {!editMode && !showSetup && (
        <p className="mt-3 text-[9px] text-stone-300 font-bold uppercase tracking-widest text-center">
          tap <Smartphone className="w-2.5 h-2.5 inline" /> to sync · <PencilLine className="w-2.5 h-2.5 inline" /> to enter
        </p>
      )}
    </div>
  );
}
