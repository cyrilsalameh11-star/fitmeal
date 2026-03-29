import { useState, useEffect, useCallback } from 'react';
import { Footprints, PencilLine, Check, X, RotateCcw, Download } from 'lucide-react';

const GOAL = 10000;
const RADIUS = 38;
const CIRC = 2 * Math.PI * RADIUS;

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

  const [steps,    setSteps]    = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [syncing,  setSyncing]  = useState(false);

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
    const iv = setInterval(fetchSteps, 5 * 60 * 1000);
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

  const applyManual = () => {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 0) saveSteps(n);
    setEditMode(false);
    setInputVal('');
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const pct    = Math.min(steps / GOAL, 1);
  const offset = CIRC * (1 - pct);
  const color  = getColor(pct);
  const track  = getTrack(pct);
  const kcal   = Math.round(steps * 0.04);
  const km     = (steps * 0.00078).toFixed(1);

  const shortcutUrl = email
    ? `/api/steps/shortcut?email=${encodeURIComponent(email)}`
    : null;

  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Footprints className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Daily Steps</span>
          {syncing && <span className="text-[9px] text-amber-400 font-bold animate-pulse">saving…</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditMode(true); setInputVal(String(steps)); }}
            className="p-1.5 rounded-xl text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-all"
            title="Enter steps manually"
          >
            <PencilLine className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => saveSteps(0)}
            className="p-1.5 rounded-xl text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all"
            title="Reset today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ring + stats */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={RADIUS} fill="none" stroke={track} strokeWidth="7" />
            <circle
              cx="48" cy="48" r={RADIUS}
              fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={offset}
              transform="rotate(-90 48 48)"
              style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1), stroke 0.4s ease' }}
            />
            {pct >= 1 && <circle cx="48" cy="10" r="4" fill={color} />}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="font-black leading-none text-stone-900"
              style={{ fontSize: steps >= 10000 ? '12px' : steps >= 1000 ? '14px' : '16px' }}>
              {steps.toLocaleString()}
            </span>
            <span className="text-[8px] font-bold text-stone-400 mt-0.5 uppercase tracking-wider">/ 10k</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5 min-w-0">
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Progress</span>
              <span className="text-[10px] font-bold" style={{ color }}>{Math.round(pct * 100)}%</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct * 100}%`, background: color }} />
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

      {/* iPhone Shortcut install button */}
      {!editMode && shortcutUrl && (
        <div className="mt-3 space-y-2">
          <a
            href={shortcutUrl}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all duration-200 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Install iPhone Shortcut
          </a>
          <p className="text-[8px] text-stone-300 font-bold text-center leading-relaxed">
            Open on iPhone in Safari · auto-syncs your Health app steps hourly
          </p>
        </div>
      )}
    </div>
  );
}
