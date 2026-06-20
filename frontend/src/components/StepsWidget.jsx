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
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Android, Automate by LlamaLab (free forever, fully automatic)</p>

              <div className="bg-amber-50 rounded-2xl p-3">
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  Every time you open Samsung Health / Google Fit, your step count syncs here automatically. <strong>One-time setup, ~7 minutes. Every step below is a single tap.</strong> Read each step, do exactly that, then read the next one.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  <strong>Before you start:</strong> have your email <code className="text-[10px] font-mono bg-white px-1 rounded">{email || 'YOUR_EMAIL'}</code> handy. If <code className="text-[10px] font-mono">YOUR_EMAIL</code> shows here instead of a real email, scroll to the top of this page and log in / set your email first.
                </p>
              </div>

              {/* PART 1 */}
              <div className="bg-gray-900 text-white rounded-2xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Part 1 of 6, Install Automate</p>
                <p className="text-[10px] text-gray-300">Time: 1 minute. You install one free app.</p>
              </div>
              <div className="space-y-2">
                {[
                  '1. Unlock your phone. Find the Play Store app (the triangle with red, yellow, green, blue colours). Tap it.',
                  '2. At the top of the Play Store screen you see a search bar. Tap inside that bar.',
                  '3. With the keyboard now open, type the word: Automate',
                  '4. Tap the magnifying-glass / search key on your keyboard.',
                  <span key="s5">5. A list of results appears. Look for the result whose <strong>icon is orange</strong> with white connected shapes (looks like a flow diagram). Under the name it says <strong>"LlamaLab"</strong>. Tap that result. <strong>Do not tap any other Automate-named app.</strong></span>,
                  '6. You are now on the app page. Tap the green "Install" button.',
                  '7. Wait until the button changes to "Open". Tap "Open".',
                  '8. If the app asks for permissions (Physical Activity, Notifications, etc.), tap "Allow" on every prompt.',
                  '9. If a welcome screen or tutorial appears, tap through it until you see a mostly-empty screen.',
                ].map((t, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg text-[11px] text-gray-700 leading-relaxed">{t}</div>
                ))}
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg px-3 py-2">
                <p className="text-[10px] text-blue-900"><strong>You should now see:</strong> a screen titled "My flows" (or just empty space with no flows yet). There is a round <strong>orange + button</strong> at the bottom right of the screen. If you don't see this, close the app fully and reopen it.</p>
              </div>

              {/* PART 2 */}
              <div className="bg-gray-900 text-white rounded-2xl p-3 mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Part 2 of 6, Create an empty flow</p>
                <p className="text-[10px] text-gray-300">Time: 30 seconds. You name a new flow.</p>
              </div>
              <div className="space-y-2">
                {[
                  '10. Tap the round orange + button at the bottom right of the "My flows" screen.',
                  <span key="s11">11. A small box pops up asking for a flow name. Tap the text field. Type exactly: <strong>FitNas Steps</strong></span>,
                  '12. Tap "Create" (or "OK", whichever button shows).',
                ].map((t, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg text-[11px] text-gray-700 leading-relaxed">{t}</div>
                ))}
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg px-3 py-2">
                <p className="text-[10px] text-blue-900"><strong>You should now see:</strong> a canvas (mostly empty grey/dark area) with one small block near the top labelled <strong>"Flow beginning"</strong>. This is the flow editor. At the bottom there is a + button. <strong>Do not panic if it looks like a circuit diagram, you only need to add 3 small blocks below "Flow beginning".</strong></p>
              </div>

              {/* PART 3 */}
              <div className="bg-gray-900 text-white rounded-2xl p-3 mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Part 3 of 6, Add the "App in foreground" trigger</p>
                <p className="text-[10px] text-gray-300">Time: 2 minutes. This is what fires the flow when you open your health app.</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  <strong>Read this first.</strong> The block you want is called <strong>"App in foreground"</strong>. It WAITS until you bring a specific app to the screen, then continues the flow. There is ALSO a block called <strong>"App start"</strong>, that one LAUNCHES an app (the opposite of what we need), <strong>do not pick it.</strong>
                </p>
              </div>

              <div className="space-y-2">
                {[
                  '13. Tap the + button at the bottom of the flow editor. A big list of categories appears (Apps, Bluetooth, Cloud, Datetime, Files, etc.).',
                  '14. Scroll until you see "Apps". Tap "Apps".',
                  <span key="s15">15. A list of blocks appears. Look for <strong>"App in foreground"</strong> (NOT "App start"). Tap <strong>"App in foreground"</strong>.</span>,
                  '16. A new block called "App in foreground" is now on the canvas. Tap that block once. A settings panel slides up.',
                  <span key="s17">17. In the settings you see a field labelled <strong>"Package"</strong> (or "Application"). Tap it. A picker dialog opens.</span>,
                  <span key="s18">18. <strong>The picker shows package names, NOT friendly names.</strong> Samsung Health is <code className="text-[10px] font-mono bg-white px-1 rounded">com.sec.android.app.shealth</code>. Google Fit is <code className="text-[10px] font-mono bg-white px-1 rounded">com.google.android.apps.fitness</code>. Mi Fitness is <code className="text-[10px] font-mono bg-white px-1 rounded">com.mi.health</code>. Fitbit is <code className="text-[10px] font-mono bg-white px-1 rounded">com.fitbit.FitbitMobile</code>.
                    <span className="block mt-1.5 px-2 py-1.5 bg-amber-50 border-l-2 border-amber-400 rounded text-amber-900 text-[10px]">
                      Most pickers in Automate have a <strong>search field</strong> at the top, or a <strong>magnifying-glass icon</strong>. Tap the search and type the start of the package name (e.g. <code className="font-mono">shealth</code> or <code className="font-mono">fitness</code> or <code className="font-mono">fitbit</code>) to filter. If there is no search, the list is alphabetical, scroll down to <strong>"com.s..."</strong> for Samsung or <strong>"com.g..."</strong> for Google.
                    </span>
                  </span>,
                  <span key="s19">19. Tap the matching package name in the list. <strong>Pick exactly one</strong>. Then tap "OK" or "Select".</span>,
                  '20. Tap the back arrow ← at the top left, or "Save" at the top right, to close the block settings.',
                ].map((t, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg text-[11px] text-gray-700 leading-relaxed">{t}</div>
                ))}
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg px-3 py-2">
                <p className="text-[10px] text-blue-900"><strong>You should now see:</strong> the "App in foreground" block on the canvas, with the package name of your health app shown under it. <strong>One block down, two to go.</strong></p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-r-lg px-3 py-2">
                <p className="text-[10px] text-rose-900"><strong>If your health app is NOT in the list at all:</strong> Automate may not have the permission to see all installed apps. Phone Settings → Apps → Automate → Permissions → make sure everything is allowed. Force-stop Automate and reopen. If still missing, skip this whole Part 3 entirely, delete the "App in foreground" block, and instead use a time-based trigger: tap + → <strong>"Date / Time"</strong> → <strong>"Periodic"</strong> → set every 30 minutes. The rest of the flow stays the same. You will still get auto-sync, just every half hour instead of every app open.</p>
              </div>

              {/* PART 4 */}
              <div className="bg-gray-900 text-white rounded-2xl p-3 mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Part 4 of 6, Add the "Step counter" block</p>
                <p className="text-[10px] text-gray-300">Time: 1 minute. This reads today's step count from your phone.</p>
              </div>
              <div className="space-y-2">
                {[
                  '21. Tap the + button at the bottom of the canvas again.',
                  '22. In the categories list, scroll and tap "Sensors".',
                  '23. In the sensors list, scroll and tap "Step counter".',
                  '24. A new "Step counter" block appears on the canvas. Tap it once to open its settings.',
                  <span key="s25">25. You see a field called <strong>"Period"</strong> or <strong>"Reset interval"</strong>. Tap it. A list of options appears (Cumulative, 1 hour, 1 day, Today only, etc.). Tap the option that says <strong>"Today only"</strong>. If you don't see "Today only", pick <strong>"1 day"</strong>. <strong>Do NOT pick "Cumulative" or anything starting with "Since boot"</strong>, that gives the wrong number.</span>,
                  <span key="s26">26. Look for a field labelled <strong>"Output steps"</strong> or just <strong>"Output"</strong>. Tap it. A small text field appears. Type exactly this lowercase word: <code className="text-[10px] font-mono bg-white px-1 rounded">steps</code> — no quotes, no spaces, no capital letters.</span>,
                  '27. Tap back ← or Save to close the settings.',
                ].map((t, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg text-[11px] text-gray-700 leading-relaxed">{t}</div>
                ))}
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg px-3 py-2">
                <p className="text-[10px] text-blue-900"><strong>You should now see:</strong> a "Step counter" block next to the "App in foreground" block. Two blocks done. Last block coming up.</p>
              </div>

              {/* PART 5 */}
              <div className="bg-gray-900 text-white rounded-2xl p-3 mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Part 5 of 6, Add the "HTTP request" block</p>
                <p className="text-[10px] text-gray-300">Time: 2 minutes. This sends your steps to jismeh.fit.</p>
              </div>
              <div className="space-y-2">
                {[
                  '28. Tap the + button at the bottom of the canvas.',
                  '29. In categories, scroll and tap "Internet" (sometimes called "HTTP" or "Network").',
                  '30. In the list, scroll and tap "HTTP request".',
                  '31. A new HTTP request block appears. Tap it to open settings.',
                  <span key="s32">32. Find the field labelled <strong>"Method"</strong>. Tap it. A list pops up (GET, POST, PUT, etc.). Tap <strong>GET</strong>.</span>,
                  <span key="s33">33. Find the field labelled <strong>"URL"</strong>. Tap it. A long text box opens. Tap and hold inside the text box to get a "Paste" button if you copy the URL below. Otherwise type exactly:
                    <code className="bg-white px-1 py-1 mt-1 rounded text-[10px] font-mono break-all block border border-amber-200">
                      {`https://jismeh.fit/api/steps/sync?email=${email || 'YOUR_EMAIL'}&steps=$\{steps}`}
                    </code>
                    <span className="block mt-1 px-2 py-1.5 bg-amber-50 border-l-2 border-amber-400 rounded text-amber-900 text-[10px]">
                      <strong>Read this carefully:</strong> at the end of the URL there is a dollar sign <code className="font-mono">$</code> followed by an open curly brace <code className="font-mono">{'{'}</code>, the word <code className="font-mono">steps</code>, and a close curly brace <code className="font-mono">{'}'}</code>. <strong>You must type those characters exactly.</strong> Automate replaces <code className="font-mono">{'${steps}'}</code> with the real number from the previous block. If you skip the <code className="font-mono">$</code> or the braces, the server gets the literal text and nothing saves.
                    </span>
                  </span>,
                  '34. Tap back ← or Save to close the settings.',
                ].map((t, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg text-[11px] text-gray-700 leading-relaxed">{t}</div>
                ))}
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg px-3 py-2">
                <p className="text-[10px] text-blue-900"><strong>You should now see:</strong> three blocks on the canvas, "App in foreground", "Step counter", "HTTP request". <strong>They are not yet connected by arrows.</strong> Next step fixes that.</p>
              </div>

              {/* PART 6 */}
              <div className="bg-gray-900 text-white rounded-2xl p-3 mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Part 6 of 6, Connect the blocks and start the flow</p>
                <p className="text-[10px] text-gray-300">Time: 2 minutes. You draw arrows between blocks, save, and turn it on.</p>
              </div>
              <div className="space-y-2">
                {[
                  <span key="s35">35. <strong>Wiring the blocks (this is the only visual step).</strong> Look at the "Flow beginning" block at the top, and the three blocks you just added. Each block has small circular dots on its edges. The dot on the <strong>bottom</strong> is the output. The dot on the <strong>top</strong> is the input.</span>,
                  <span key="s36">36. Press and hold on the <strong>bottom dot of "Flow beginning"</strong>, then drag your finger to the <strong>top dot of "App in foreground"</strong>, and release. A line appears connecting them.</span>,
                  <span key="s37">37. Press and hold on the <strong>bottom dot of "App in foreground"</strong>, drag to the <strong>top dot of "Step counter"</strong>, release. Another line.</span>,
                  <span key="s38">38. Press and hold on the <strong>bottom dot of "Step counter"</strong>, drag to the <strong>top dot of "HTTP request"</strong>, release. Final line.</span>,
                  <span key="s39">39. Check: arrows should now connect <strong>Flow beginning → App in foreground → Step counter → HTTP request</strong>, in that order. If you got the order wrong, tap the wrong line and a delete button appears.</span>,
                  '40. Tap the back arrow ← at the very top left of the screen to leave the editor. A dialog asks "Save changes?". Tap "Yes" or "Save".',
                  <span key="s41">41. You are back on the "My flows" list. Your "FitNas Steps" flow is there but <strong>NOT running yet</strong>. To the left of the flow name there is a small triangle ▶ play button (or a power icon). Tap it.</span>,
                  '42. A status label appears, "Running" or a green dot. The flow is now armed.',
                  '43. Last step: phone Settings → Apps → find Automate → Battery → set to "Unrestricted" (or "Don\'t optimize"). This keeps Automate running in the background when your screen is off. Without this Android will kill it after a few hours.',
                ].map((t, i) => (
                  <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg text-[11px] text-gray-700 leading-relaxed">{t}</div>
                ))}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Test it</p>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  Open the health app you picked in step 19 (e.g. Samsung Health). Wait 5 seconds. Pull this page down to refresh, or close the browser tab and reopen <strong>jismeh.fit</strong>. Your real step count should be in the ring above. Done forever.
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">If something is wrong</p>
                <ul className="text-[11px] text-rose-900 leading-relaxed space-y-1.5 list-disc pl-4">
                  <li><strong>Ring still shows 0 after opening the health app.</strong> Open Automate → tap "FitNas Steps" → tap the small clock/log icon. The log shows every time the flow fired. If it never fired, your launcher doesn't broadcast foreground events reliably. Fix: delete the "App in foreground" block, replace with <strong>"Date / Time" → "Periodic"</strong>, set Period: every 30 minutes. Re-wire and re-start.</li>
                  <li><strong>Ring shows a huge number (like 1,200,000).</strong> Step 25 was wrong. Open the flow editor → tap the Step counter block → change Period to <strong>"Today only"</strong> or <strong>"1 day"</strong>.</li>
                  <li><strong>Ring shows the literal text <code className="text-[10px] font-mono">{'${steps}'}</code> or a server error.</strong> The URL in step 33 is missing the dollar sign or curly braces. Edit the HTTP request block, fix the URL to end exactly with <code className="text-[10px] font-mono">&amp;steps={'${steps}'}</code>.</li>
                  <li><strong>Health app not in the package picker (step 18).</strong> Phone Settings → Apps → Automate → Permissions → allow everything. Force-stop Automate, reopen. Still missing: use the periodic time trigger fallback described in the rose-coloured box at the end of Part 3.</li>
                  <li><strong>"Step counter" missing from the Sensors list (step 23).</strong> Physical Activity permission missing. Phone Settings → Apps → Automate → Permissions → enable Physical Activity. Force-stop Automate, reopen.</li>
                  <li><strong>Worked for a day then stopped.</strong> Battery saver killed Automate. Redo step 43. Also check Settings → Battery → Adaptive Battery and either disable it or whitelist Automate.</li>
                  <li><strong>Lost or confused.</strong> Use the pencil icon ✏ on this page as a fallback. Reading the number off your health app and typing it takes 5 seconds, no automation required.</li>
                </ul>
              </div>

              <div className="bg-gray-100 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">No-app alternative</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">Don't want to install Automate at all? Just tap the <strong>✏ pencil icon</strong> above on this page, check your steps in Samsung Health or Google Fit, type the number. Takes 5 seconds, zero setup.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
