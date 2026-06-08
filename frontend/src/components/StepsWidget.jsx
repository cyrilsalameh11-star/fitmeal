import { useState, useEffect, useCallback } from 'react';
import { Footprints, PencilLine, Check, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import ParticleCanvas from './ParticleCanvas';

const GOAL = 10000;
const RADIUS = 44;
const CIRC = 2 * Math.PI * RADIUS;

function getColor(pct) {
  if (pct >= 1)   return '#10b981';
  if (pct >= 0.7) return '#f59e0b';
  if (pct >= 0.4) return '#f97316';
  return '#f59e0b';
}
function getTrack(pct) {
  if (pct >= 1)   return '#d1fae5';
  if (pct >= 0.7) return '#fef3c7';
  if (pct >= 0.4) return '#ffedd5';
  return '#fef3c7';
}

export default function StepsWidget() {
  const email = localStorage.getItem('fitmeal_email') || '';

  const [steps,       setSteps]       = useState(0);
  const [editMode,    setEditMode]    = useState(false);
  const [inputVal,    setInputVal]    = useState('');
  const [syncing,     setSyncing]     = useState(false);
  const [showSetup,   setShowSetup]   = useState(false);
  const [platform,    setPlatform]    = useState('ios');
  const [animFading,  setAnimFading]  = useState(false);
  const [animDone,    setAnimDone]    = useState(false);

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

  useEffect(() => {
    const t1 = setTimeout(() => setAnimFading(true), 3200);
    const t2 = setTimeout(() => setAnimDone(true), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

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
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm relative overflow-hidden">

      {/* ── Particle animation overlay (on open) ── */}
      {!animDone && (
        <div
          className="absolute inset-0 z-10 rounded-xl flex flex-col items-center justify-center"
          style={{
            background: '#0c1120',
            opacity: animFading ? 0 : 1,
            transition: 'opacity 0.8s ease',
            pointerEvents: animFading ? 'none' : 'auto',
          }}
        >
          <ParticleCanvas
            text={steps > 0 ? steps.toLocaleString() : '10,000'}
            height={140}
            color="#F59E0B"
            sphereDelay={600}
          />
          <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-amber-500 mt-1 mb-0.5">
            Daily Steps
          </p>
          <p className="text-[11px] text-slate-500">
            {steps > 0
              ? `${Math.round((steps / GOAL) * 100)}% of 10k goal`
              : 'Touch to interact'}
          </p>
        </div>
      )}

      {/* ── Top row: title + controls ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-gray-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Daily Steps</span>
          {syncing && <span className="text-[9px] text-amber-400 font-bold animate-pulse ml-1">saving…</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditMode(e => !e); setInputVal(String(steps)); }}
            className="p-1.5 rounded-xl text-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all" title="Enter steps manually">
            <PencilLine className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => saveSteps(0)}
            className="p-1.5 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all" title="Reset">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowSetup(s => !s)}
            className="p-1.5 rounded-xl text-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all" title="How to sync">
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
            <span className="font-bold leading-none text-gray-900"
              style={{ fontSize: steps >= 10000 ? '13px' : steps >= 1000 ? '15px' : '18px' }}>
              {steps.toLocaleString()}
            </span>
            <span className="text-[8px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">/ 10k</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Today's progress</span>
              <span className="text-[11px] font-bold" style={{ color }}>{Math.round(pct * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct * 100}%`, background: color }} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl px-2 py-2 text-center">
              <p className="text-sm font-bold text-gray-800">{(GOAL - steps > 0 ? (GOAL - steps).toLocaleString() : '✓')}</p>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">left</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-2 py-2 text-center">
              <p className="text-sm font-bold text-gray-800">{kcal}</p>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">kcal</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-2 py-2 text-center">
              <p className="text-sm font-bold text-gray-800">{km}</p>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">km</p>
            </div>
          </div>

          {/* Setup hint */}
          {!showSetup && (
            <button onClick={() => setShowSetup(true)}
              className="w-full py-2 text-[9px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-all border border-dashed border-gray-200 rounded-2xl hover:border-gray-400">
              Set up auto-sync →
            </button>
          )}
        </div>
      </div>

      {pct >= 1 && (
        <div className="mt-4 text-center text-[9px] font-bold uppercase tracking-wider rounded-xl py-1.5 bg-emerald-50 text-emerald-700">
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
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-amber-200 transition-all" />
          <button onClick={applyManual} className="p-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setEditMode(false)} className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Setup / explanation panel ── */}
      {showSetup && (
        <div className="mt-5 border-t border-gray-100 pt-5 space-y-4">

          {/* What is this */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">How it works</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              This ring tracks how close you are to <strong>10,000 steps</strong> today, a widely recommended daily activity goal.
              Walking 10k steps burns roughly <strong>400 kcal</strong> and covers about <strong>7–8 km</strong>.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Web apps can't read Health data directly. Use the setup below to auto-sync your steps from your phone. Steps update on this page every 5 minutes, or tap the ✏ icon to enter them manually anytime.
            </p>
          </div>

          {/* Platform toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-100 text-[10px] font-bold uppercase tracking-wider">
            <button onClick={() => setPlatform('ios')}
              className={`flex-1 py-2.5 transition-all ${platform === 'ios' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
              iPhone
            </button>
            <button onClick={() => setPlatform('android')}
              className={`flex-1 py-2.5 transition-all ${platform === 'android' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
              Android
            </button>
          </div>

          {platform === 'ios' && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">iPhone, iOS Shortcuts (free, built-in)</p>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">⚠️ Apple Watch or Fitbit user?</p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  If you have an <strong>Apple Watch</strong>, <strong>Fitbit</strong>, or any other tracker syncing to Apple Health, your steps will be counted <strong>twice</strong> unless you add a Source filter in step 2 below. The fix only takes 5 seconds, just follow the highlighted instruction.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Part 1, Build the shortcut (one time)</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { n: 1, t: 'Open the Shortcuts app → tap + → tap "Add Action".' },
                  {
                    n: 2,
                    t: (
                      <span>
                        Search <strong>"Find Health Samples"</strong> → select it → set Type = Steps. Tap "Start Date" and set it to "is Today".
                        <span className="block mt-1 px-2 py-1.5 bg-amber-50 border-l-2 border-amber-300 rounded text-amber-900">
                          <strong>If you have an Apple Watch (or any second tracker):</strong> tap "Add Filter" → set <strong>Source contains "Watch"</strong> (or pick your watch by name). Skip if iPhone is your only step source.
                        </span>
                      </span>
                    )
                  },
                  { n: 3, t: 'Tap + below → search "Calculate Statistics" → select it → make sure it says Sum of Health Samples.' },
                  {
                    n: 4,
                    t: (
                      <span>
                        Tap + → search <strong>"Get Contents of URL"</strong> → select it → set Method = <strong>GET</strong>.
                        Tap the URL field, type:
                        <code className="bg-white px-1 mx-0.5 rounded text-[9px] font-mono break-all">
                          {`https://jismeh.fit/api/steps/sync?email=${email || 'YOUR_EMAIL'}&steps=`}
                        </code>
                        then tap the variable button above the keyboard and pick <strong>Sum</strong>, it appears as a grey bubble after <code className="text-[9px] font-mono">steps=</code>.
                      </span>
                    )
                  },
                  { n: 5, t: 'Tap the shortcut name at the top → rename to "FitNas Steps" → Done.' },
                  { n: 6, t: 'Tap ▶ to run it. When asked for Health permission → tap Allow. Then check this page, your steps should appear.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-2.5 items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-gray-900 text-white rounded-full text-[8px] font-bold flex items-center justify-center mt-0.5">{s.n}</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">{s.t}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 mt-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Part 2, Auto-sync (pick one)</p>
                <div className="space-y-2">
                  {[
                    { label: 'Best', t: 'Automation tab → + → App → Health → Is Opened → Next → New Blank Automation → Add Action → FitNas Steps → Done. Uncheck "Run After Confirmation". Syncs every time you open Health.' },
                    { label: 'Good', t: 'Automation tab → + → Charger → Is Connected → Next → same as above. Syncs every time you plug in your phone.' },
                    { label: 'Basic', t: 'Automation tab → + → Time of Day → pick 6 PM → Daily → Next → same as above. Syncs once a day.' },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700' : i === 1 ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-500'}`}>{s.label}</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{s.t}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">Troubleshooting</p>
                <p className="text-[11px] text-rose-900 leading-relaxed">
                  <strong>Number looks roughly doubled?</strong> You have multiple Health sources (Apple Watch + iPhone, Fitbit + iPhone, etc.) and the shortcut is summing all of them. Edit your FitNas Steps shortcut → tap the <strong>Find Health Samples</strong> action → tap <strong>Add Filter</strong> → set <strong>Source contains "Watch"</strong> (or pick your single preferred tracker). Re-run the shortcut once to push the corrected value.
                </p>
              </div>
            </div>
          )}

          {platform === 'android' && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Android, MacroDroid (free)</p>

              <div className="bg-amber-50 rounded-2xl p-3">
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  MacroDroid can read your phone's <strong>built-in step counter</strong> and send it to this page automatically, no Samsung Health API needed.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Part 1, Enable step counter</p>
                <p className="text-[11px] text-gray-600 leading-relaxed">Open MacroDroid → tap the <strong>≡ menu</strong> → <strong>Configure MacroDroid</strong> → enable <strong>Step Counter</strong>. This activates the daily step tracking variable.</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { n: 1, t: 'In MacroDroid, tap "Add Macro".' },
                  { n: 2, t: 'Tap Triggers → + → "Date / Time" → "Regular Interval" → Every 1 Hour → OK.' },
                  {
                    n: 3,
                    t: (
                      <span>
                        Tap Actions → + → <strong>Connectivity</strong> → <strong>HTTP Request</strong> → Method: GET.
                        Paste this URL:
                        <code className="bg-white px-1 mt-1 rounded text-[9px] font-mono break-all block">
                          {`https://jismeh.fit/api/steps/sync?email=${email || 'YOUR_EMAIL'}&steps={step_count}`}
                        </code>
                        <span className="text-gray-500">The <strong>{'{step_count}'}</strong> is a MacroDroid built-in variable, type it exactly as shown including the curly braces.</span>
                      </span>
                    )
                  },
                  { n: 4, t: 'Tap OK → name it "FitNas Steps" → tap ✓ to save.' },
                  { n: 5, t: 'Tap the macro → Run to test. Check this page, your steps should appear.' },
                  { n: 6, t: 'Go to phone Settings → Battery → MacroDroid → set to Unrestricted so it keeps running in the background.' },
                ].map(s => (
                  <div key={s.n} className="flex gap-2.5 items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-gray-700 text-white rounded-full text-[8px] font-bold flex items-center justify-center mt-0.5">{s.n}</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">{s.t}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-100 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Quick alternative</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">No automation needed, just tap the <strong>✏ pencil icon</strong> above, check your steps in Samsung Health, and type the number. Takes 5 seconds.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
