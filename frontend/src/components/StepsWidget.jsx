import { useState, useEffect, useCallback } from 'react';
import { Footprints, PencilLine, Check, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const GOAL = 10000;
const RADIUS = 44;
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

  const [steps,       setSteps]       = useState(0);
  const [editMode,    setEditMode]    = useState(false);
  const [inputVal,    setInputVal]    = useState('');
  const [syncing,     setSyncing]     = useState(false);
  const [showSetup,   setShowSetup]   = useState(false);
  const [platform,    setPlatform]    = useState('ios');

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

  const pct    = Math.min(steps / GOAL, 1);
  const offset = CIRC * (1 - pct);
  const color  = getColor(pct);
  const track  = getTrack(pct);
  const kcal   = Math.round(steps * 0.04);
  const km     = (steps * 0.00078).toFixed(1);
  const syncUrl = email
    ? `https://jismeh.fit/api/steps/sync?email=${encodeURIComponent(email)}&steps=%pedometer_steps_today%`
    : 'https://jismeh.fit/api/steps/sync?email=YOUR_EMAIL&steps=%pedometer_steps_today%';

  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">

      {/* ── Top row: title + controls ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-stone-400" />
          <span className="text-[11px] font-black uppercase tracking-widest text-stone-500">Daily Steps</span>
          {syncing && <span className="text-[9px] text-amber-400 font-bold animate-pulse ml-1">saving…</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditMode(e => !e); setInputVal(String(steps)); }}
            className="p-1.5 rounded-xl text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-all" title="Enter steps manually">
            <PencilLine className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => saveSteps(0)}
            className="p-1.5 rounded-xl text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all" title="Reset">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowSetup(s => !s)}
            className="p-1.5 rounded-xl text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-all" title="How to sync">
            {showSetup ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Main content: ring + stats ── */}
      <div className="flex items-center gap-6">

        {/* Ring */}
        <div className="relative flex-shrink-0">
          <svg width="108" height="108" viewBox="0 0 108 108">
            <circle cx="54" cy="54" r={RADIUS} fill="none" stroke={track} strokeWidth="8" />
            <circle cx="54" cy="54" r={RADIUS} fill="none" stroke={color} strokeWidth="8"
              strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
              transform="rotate(-90 54 54)"
              style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1), stroke 0.4s ease' }} />
            {pct >= 1 && <circle cx="54" cy="10" r="4" fill={color} />}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="font-black leading-none text-stone-900"
              style={{ fontSize: steps >= 10000 ? '13px' : steps >= 1000 ? '15px' : '18px' }}>
              {steps.toLocaleString()}
            </span>
            <span className="text-[8px] font-bold text-stone-400 mt-0.5 uppercase tracking-wider">/ 10k</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Today's progress</span>
              <span className="text-[11px] font-bold" style={{ color }}>{Math.round(pct * 100)}%</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct * 100}%`, background: color }} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-stone-50 rounded-xl px-2 py-2 text-center">
              <p className="text-sm font-black text-stone-800">{(GOAL - steps > 0 ? (GOAL - steps).toLocaleString() : '✓')}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400">left</p>
            </div>
            <div className="bg-stone-50 rounded-xl px-2 py-2 text-center">
              <p className="text-sm font-black text-stone-800">{kcal}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400">kcal</p>
            </div>
            <div className="bg-stone-50 rounded-xl px-2 py-2 text-center">
              <p className="text-sm font-black text-stone-800">{km}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400">km</p>
            </div>
          </div>

          {/* Setup hint */}
          {!showSetup && (
            <button onClick={() => setShowSetup(true)}
              className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-700 transition-all border border-dashed border-stone-200 rounded-2xl hover:border-stone-400">
              Set up auto-sync →
            </button>
          )}
        </div>
      </div>

      {pct >= 1 && (
        <div className="mt-4 text-center text-[9px] font-black uppercase tracking-widest rounded-xl py-1.5 bg-emerald-50 text-emerald-700">
          Goal reached! 🎯
        </div>
      )}

      {/* ── Manual edit ── */}
      {editMode && (
        <div className="mt-4 flex items-center gap-2">
          <input type="number" min="0" max="99999" value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyManual(); if (e.key === 'Escape') setEditMode(false); }}
            autoFocus placeholder="Enter your step count"
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-200 transition-all" />
          <button onClick={applyManual} className="p-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setEditMode(false)} className="p-2 bg-stone-100 text-stone-500 rounded-xl hover:bg-stone-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Setup / explanation panel ── */}
      {showSetup && (
        <div className="mt-5 border-t border-stone-100 pt-5 space-y-4">

          {/* What is this */}
          <div className="bg-stone-50 rounded-2xl p-4 space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">How it works</p>
            <p className="text-xs text-stone-600 leading-relaxed">
              This ring tracks how close you are to <strong>10,000 steps</strong> today — a widely recommended daily activity goal.
              Walking 10k steps burns roughly <strong>400 kcal</strong> and covers about <strong>7–8 km</strong>.
            </p>
            <p className="text-xs text-stone-500 leading-relaxed">
              Web apps can't read Health data directly. Use the setup below to auto-sync your steps from your phone. Steps update on this page every 5 minutes, or tap the ✏ icon to enter them manually anytime.
            </p>
          </div>

          {/* Platform toggle */}
          <div className="flex rounded-xl overflow-hidden border border-stone-100 text-[10px] font-black uppercase tracking-widest">
            <button onClick={() => setPlatform('ios')}
              className={`flex-1 py-2.5 transition-all ${platform === 'ios' ? 'bg-stone-900 text-white' : 'text-stone-400 hover:bg-stone-50'}`}>
              iPhone
            </button>
            <button onClick={() => setPlatform('android')}
              className={`flex-1 py-2.5 transition-all ${platform === 'android' ? 'bg-stone-900 text-white' : 'text-stone-400 hover:bg-stone-50'}`}>
              Android
            </button>
          </div>

          {platform === 'ios' && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">iPhone — iOS Shortcuts (free, built-in)</p>
              <div className="space-y-2.5">
                {[
                  { n: 1, t: 'Open the Shortcuts app (built into iPhone — search it in Spotlight if needed).' },
                  { n: 2, t: 'Tap + (top right) to create a new shortcut. Tap "Add Action".' },
                  { n: 3, t: 'Search for "Find Health Samples". Select it. Set Type = Steps, Date = Today.' },
                  { n: 4, t: 'Add a second action: search "Calculate Statistics". Set it to Sum, Input = Health Samples.' },
                  {
                    n: 5,
                    t: (
                      <span>
                        Add a third action: search <strong>"Get Contents of URL"</strong>. Set Method = GET. Set the URL to:{' '}
                        <code className="bg-white px-1 rounded text-[9px] font-mono break-all">
                          {`https://jismeh.fit/api/steps/sync?email=${email || 'YOUR_EMAIL'}&steps=`}
                        </code>
                        {' '}then tap the URL field and insert the <strong>Calculated Result</strong> variable from step 4 at the end.
                      </span>
                    )
                  },
                  { n: 6, t: 'Tap the shortcut name at the top, rename it "FitNas Steps", then tap Done.' },
                  { n: 7, t: 'Run it once to test. You\'ll see a permission prompt for Health access — tap Allow.' },
                  { n: 8, t: 'To auto-sync: tap the Automation tab → + → Time of Day → set Repeat to Every Hour → Run Immediately → choose "FitNas Steps" → Done.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-2.5 items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-stone-900 text-white rounded-full text-[8px] font-black flex items-center justify-center mt-0.5">{s.n}</span>
                    <p className="text-[11px] text-stone-600 leading-relaxed">{s.t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {platform === 'android' && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Android — MacroDroid (free, auto hourly)</p>

              <div className="bg-amber-50 rounded-2xl p-3">
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  MacroDroid reads your phone's <strong>built-in step sensor</strong> directly — no Samsung Health API needed. It automatically syncs your steps every hour in the background.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { n: 1, t: 'Install MacroDroid from the Play Store (free). Open it and tap "Add Macro".' },
                  { n: 2, t: 'Tap Triggers → tap + → choose "Date / Time" → "Regular Interval" → set to Every 1 Hour → OK.' },
                  {
                    n: 3,
                    t: (
                      <span>
                        Tap Actions → tap + → choose <strong>"Connectivity"</strong> → <strong>"HTTP Request"</strong>.
                        Set Method = GET. Paste this URL exactly:
                        <br />
                        <code className="bg-white px-1 mt-1 rounded text-[9px] font-mono break-all block">
                          {syncUrl}
                        </code>
                        <br />
                        The <strong>%pedometer_steps_today%</strong> part is a MacroDroid built-in variable that automatically reads today's step count from your phone's hardware sensor.
                      </span>
                    )
                  },
                  { n: 4, t: 'Tap OK → name the macro "FitNas Steps" → tap the checkmark to save.' },
                  { n: 5, t: 'Tap the macro → "Run" to test it. Your steps should appear on this page within a few seconds.' },
                  { n: 6, t: 'Make sure MacroDroid has permission to run in the background (Battery → Unrestricted) so it keeps syncing when the screen is off.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-2.5 items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-stone-700 text-white rounded-full text-[8px] font-black flex items-center justify-center mt-0.5">{s.n}</span>
                    <p className="text-[11px] text-stone-600 leading-relaxed">{s.t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
