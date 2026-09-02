import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Play, CheckCircle2, Minus, Plus, Save, TrendingUp, TrendingDown, Minus as Equal, History, X } from 'lucide-react';

const WEIGHTS_KEY = 'fitmeal_gym_weights';
const DEFAULT_WEIGHT = 20;
const DEFAULT_STEP = 2;
const STEP_OPTIONS = [0.5, 1, 2, 5];

function formatWeight(n) {
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}
function formatStep(n) {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function loadAllWeights() {
  try {
    const raw = localStorage.getItem(WEIGHTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllWeights(data) {
  try {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(data));
  } catch {}
}

function relativeDay(iso) {
  if (!iso) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  const diff = Math.round((today - then) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.round(diff / 7)}w ago`;
  return `${Math.round(diff / 30)}mo ago`;
}

const GYM_EXERCISES = {
  chest: [
    {
      id: 'machine-press',
      name: 'Machine Chest Press',
      machine: 'Seated Press Machine',
      focus: 'Mid & Upper Chest',
      sets: 4,
      reps: '10-12',
      tips: ['Keep back flat against pad', 'Squeeze at full extension', 'Control the negative'],
      color: 'from-blue-600 to-indigo-500',
      imageFolder: 'Leverage_Chest_Press'
    },
    {
      id: 'cable-crossover',
      name: 'Cable Crossover',
      machine: 'Dual Cable Pulley',
      focus: 'Lower & Inner Chest',
      sets: 3,
      reps: '12-15',
      tips: ['Slight forward lean', 'Bring hands together at waist height', 'Focus on the stretch'],
      color: 'from-indigo-500 to-purple-500',
      imageFolder: 'Cable_Crossover'
    },
    {
      id: 'pec-deck',
      name: 'Pec Deck Machine',
      machine: 'Fly Machine',
      focus: 'Inner Chest / Cleavage',
      sets: 4,
      reps: '12-15',
      tips: ['Keep slight bend in elbows', 'Don\'t let weight stack drop', 'Focus on mind-muscle connection'],
      color: 'from-purple-500 to-fuchsia-500',
      imageFolder: 'Butterfly'
    },
    {
      id: 'incline-smith',
      name: 'Smith Machine Incline Press',
      machine: 'Smith Machine',
      focus: 'Upper Chest',
      sets: 4,
      reps: '8-10',
      tips: ['Bench at 30-45 degrees', 'Bar paths to upper chest', 'Drive through palms'],
      color: 'from-fuchsia-500 to-pink-500',
      imageFolder: 'Smith_Machine_Incline_Bench_Press'
    },
    {
      id: 'db-flat-press',
      name: 'Flat Dumbbell Press',
      machine: 'Flat Bench + Dumbbells',
      focus: 'Mid Chest',
      sets: 4,
      reps: '8-12',
      tips: ['Palms facing forward at the press', 'Elbows at ~45°, not fully flared', 'Squeeze the dumbbells together at the top'],
      color: 'from-pink-500 to-rose-500',
      imageFolder: 'Dumbbell_Bench_Press'
    },
    {
      id: 'db-incline-press',
      name: 'Incline Dumbbell Press',
      machine: 'Incline Bench + Dumbbells',
      focus: 'Upper Chest',
      sets: 3,
      reps: '10-12',
      tips: ['Bench at 30°, not steeper', 'Keep the dumbbells stacked over your elbows', 'Full range, no bouncing off the chest'],
      color: 'from-rose-500 to-red-500',
      imageFolder: 'Incline_Dumbbell_Press'
    },
    {
      id: 'db-fly',
      name: 'Dumbbell Fly',
      machine: 'Flat Bench + Dumbbells',
      focus: 'Chest Stretch',
      sets: 3,
      reps: '12-15',
      tips: ['Slight fixed bend in the elbows', 'Wide arc, deep stretch across the pecs', 'Squeeze at the top without clanking'],
      color: 'from-red-500 to-orange-500',
      imageFolder: 'Dumbbell_Flyes'
    }
  ],
  back: [
    {
      id: 'lat-pulldown',
      name: 'Lat Pulldown',
      machine: 'Cable Pulldown Station',
      focus: 'Lats (Width)',
      sets: 4,
      reps: '10-12',
      tips: ['Pull to upper chest', 'Arch middle back slightly', 'Don\'t use momentum'],
      color: 'from-emerald-600 to-teal-500',
      imageFolder: 'Close-Grip_Front_Lat_Pulldown'
    },
    {
      id: 'seated-row',
      name: 'Seated Cable Row',
      machine: 'Low Cable Row',
      focus: 'Mid Back (Thickness)',
      sets: 4,
      reps: '10-12',
      tips: ['Keep torso stationary', 'Squeeze shoulder blades together', 'Full stretch on return'],
      color: 'from-teal-500 to-cyan-500',
      imageFolder: 'Seated_Cable_Rows'
    },
    {
      id: 'assisted-pullup',
      name: 'Assisted Pull-up',
      machine: 'Gravitron Machine',
      focus: 'Upper Back & Lats',
      sets: 3,
      reps: '8-10',
      tips: ['Wide overhand grip', 'Slow eccentric phase', 'Full range of motion'],
      color: 'from-cyan-500 to-sky-500',
      imageFolder: 'Band_Assisted_Pull-Up'
    },
    {
      id: 'straight-arm',
      name: 'Straight-Arm Pulldown',
      machine: 'High Cable Pulley',
      focus: 'Lats Integration',
      sets: 3,
      reps: '12-15',
      tips: ['Keep arms straight but not locked', 'Hinge slightly at hips', 'Pull bar to thighs'],
      color: 'from-sky-500 to-blue-500',
      imageFolder: 'Straight-Arm_Pulldown'
    },
    {
      id: 'db-one-arm-row',
      name: 'One-Arm Dumbbell Row',
      machine: 'Flat Bench + Dumbbell',
      focus: 'Lats & Mid Back',
      sets: 4,
      reps: '10-12',
      tips: ['One knee and hand on the bench, flat back', 'Pull to the hip, elbow tight along the ribs', 'Full stretch at the bottom, no shrug'],
      color: 'from-blue-500 to-indigo-500',
      imageFolder: 'One-Arm_Dumbbell_Row'
    },
    {
      id: 'db-pullover',
      name: 'Dumbbell Pullover',
      machine: 'Flat Bench + Dumbbell',
      focus: 'Lats & Serratus',
      sets: 3,
      reps: '12-15',
      tips: ['Lie across the bench, hips low', 'Cup one dumbbell with both hands', 'Deep stretch back, pull with the lats not the arms'],
      color: 'from-indigo-500 to-purple-500',
      imageFolder: 'Dumbbell_Pullover'
    }
  ],
  legs: [
    {
      id: 'leg-press',
      name: 'Leg Press',
      machine: '45-Degree Leg Press',
      focus: 'Quads & Glutes',
      sets: 4,
      reps: '10-12',
      tips: ['Feet shoulder-width apart', 'Don\'t lock knees at top', 'Go deep but keep lower back flat'],
      color: 'from-orange-600 to-amber-500',
      imageFolder: 'Leg_Press'
    },
    {
      id: 'leg-extension',
      name: 'Leg Extension',
      machine: 'Extension Machine',
      focus: 'Quadriceps Isolation',
      sets: 4,
      reps: '12-15',
      tips: ['Adjust pad to ankle height', 'Hold contraction for 1s', 'Control the descent'],
      color: 'from-amber-500 to-yellow-500',
      imageFolder: 'Leg_Extensions'
    },
    {
      id: 'leg-curl',
      name: 'Seated Leg Curl',
      machine: 'Curl Machine',
      focus: 'Hamstrings',
      sets: 4,
      reps: '12-15',
      tips: ['Pad rests on back of ankle', 'Squeeze handles to stay planted', 'Full contraction'],
      color: 'from-yellow-400 to-lime-500',
      imageFolder: 'Seated_Leg_Curl'
    },
    {
      id: 'calf-raise',
      name: 'Standing Calf Raise',
      machine: 'Calf Raise Machine',
      focus: 'Calves (Gastrocnemius)',
      sets: 4,
      reps: '15-20',
      tips: ['Pause at the very top', 'Deep stretch at the bottom', 'Keep knees slightly bent'],
      color: 'from-lime-500 to-green-500',
      imageFolder: 'Standing_Calf_Raises'
    },
    {
      id: 'goblet-squat',
      name: 'Dumbbell Goblet Squat',
      machine: 'Single Heavy Dumbbell',
      focus: 'Quads & Glutes',
      sets: 4,
      reps: '10-12',
      tips: ['Hold the dumbbell against the chest, elbows tucked', 'Feet just wider than the shoulders', 'Sit between the heels, torso tall'],
      color: 'from-green-600 to-emerald-500',
      imageFolder: 'Goblet_Squat'
    },
    {
      id: 'db-rdl',
      name: 'Dumbbell Romanian Deadlift',
      machine: 'Pair of Dumbbells',
      focus: 'Hamstrings & Glutes',
      sets: 4,
      reps: '10-12',
      tips: ['Hinge at the hips with soft knees', 'Dumbbells slide down the thighs', 'Stretch to mid-shin, squeeze glutes on the way up'],
      color: 'from-emerald-500 to-teal-500',
      imageFolder: 'Romanian_Deadlift_With_Dumbbells'
    },
    {
      id: 'db-lunge',
      name: 'Dumbbell Walking Lunges',
      machine: 'Pair of Dumbbells',
      focus: 'Quads, Glutes, Balance',
      sets: 3,
      reps: '10-12 per leg',
      tips: ['Take a long step, sink straight down', 'Front knee stacked over the ankle', 'Drive through the heel, chest tall'],
      color: 'from-teal-500 to-cyan-500',
      imageFolder: 'Dumbbell_Lunges'
    }
  ],
  shoulders: [
    {
      id: 'shoulder-press',
      name: 'Machine Shoulder Press',
      machine: 'Overhead Press Machine',
      focus: 'Anterior Deltoids',
      sets: 4,
      reps: '10-12',
      tips: ['Grip slightly wider than shoulders', 'Don\'t lock out elbows', 'Controlled negative'],
      color: 'from-red-600 to-rose-500',
      imageFolder: 'Cable_Shoulder_Press'
    },
    {
      id: 'lateral-raise',
      name: 'Cable Lateral Raise',
      machine: 'Low Cable Pulley',
      focus: 'Lateral Deltoids (Width)',
      sets: 4,
      reps: '12-15',
      tips: ['Cable behind your back', 'Lead with the elbows', 'Raise to shoulder height'],
      color: 'from-rose-500 to-pink-500',
      imageFolder: 'Cable_Seated_Lateral_Raise'
    },
    {
      id: 'reverse-pec-deck',
      name: 'Reverse Pec Deck',
      machine: 'Fly Machine (Reversed)',
      focus: 'Rear Deltoids',
      sets: 3,
      reps: '15-20',
      tips: ['Keep chest pressed to pad', 'Slight bend in elbows', 'Don\'t squeeze shoulder blades together'],
      color: 'from-pink-500 to-fuchsia-500',
      imageFolder: 'Reverse_Machine_Flyes'
    },
    {
      id: 'face-pull',
      name: 'Cable Face Pull',
      machine: 'High Cable with Rope',
      focus: 'Rear Delts & Rotator Cuff',
      sets: 3,
      reps: '15-20',
      tips: ['Pull rope towards eyes', 'Keep elbows high', 'Squeeze upper back'],
      color: 'from-fuchsia-500 to-purple-500',
      imageFolder: 'Face_Pull'
    },
    {
      id: 'seated-db-press',
      name: 'Seated Dumbbell Press',
      machine: 'Upright Bench + Dumbbells',
      focus: 'Front & Side Delts',
      sets: 4,
      reps: '8-12',
      tips: ['Bench upright, back fully supported', 'Dumbbells at ear-level, press straight up', 'Don\'t lock out or clang overhead'],
      color: 'from-orange-500 to-amber-500',
      imageFolder: 'Seated_Dumbbell_Press'
    },
    {
      id: 'db-lateral',
      name: 'Dumbbell Lateral Raise',
      machine: 'Pair of Dumbbells',
      focus: 'Side Delts (Width)',
      sets: 4,
      reps: '12-15',
      tips: ['Slight forward tilt of the dumbbell', 'Lead with the elbow, pinky slightly up', 'Stop at shoulder height, control the descent'],
      color: 'from-amber-500 to-yellow-500',
      imageFolder: 'Side_Lateral_Raise'
    },
    {
      id: 'db-rear-fly',
      name: 'Bent-Over Rear Delt Fly',
      machine: 'Incline Bench + Dumbbells',
      focus: 'Rear Delts',
      sets: 3,
      reps: '12-15',
      tips: ['Chest supported on an incline bench, face down', 'Slight bend in the elbows, sweep out and up', 'Squeeze the shoulder blades without shrugging'],
      color: 'from-yellow-500 to-lime-500',
      imageFolder: 'Bent_Over_Dumbbell_Rear_Delt_Row_With_Head_On_Bench'
    }
  ],
  arms: [
    {
      id: 'tricep-pushdown',
      name: 'Tricep Rope Pushdown',
      machine: 'High Cable Pulley',
      focus: 'Triceps (Lateral/Long Head)',
      sets: 4,
      reps: '12-15',
      tips: ['Keep elbows tucked to sides', 'Spread rope at the bottom', 'Full lockout'],
      color: 'from-gray-800 to-gray-600',
      imageFolder: 'Triceps_Pushdown_-_Rope_Attachment'
    },
    {
      id: 'cable-curl',
      name: 'EZ-Bar Cable Curl',
      machine: 'Low Cable Pulley',
      focus: 'Biceps Brachii',
      sets: 4,
      reps: '10-12',
      tips: ['Keep elbows strictly at sides', 'Squeeze at the top', 'Control weight down'],
      color: 'from-gray-600 to-gray-500',
      imageFolder: 'High_Cable_Curls'
    },
    {
      id: 'overhead-extension',
      name: 'Overhead Rope Extension',
      machine: 'Cable Station',
      focus: 'Triceps (Long Head)',
      sets: 3,
      reps: '12-15',
      tips: ['Lean forward slightly', 'Keep elbows pointed forward', 'Full stretch behind head'],
      color: 'from-gray-500 to-zinc-500',
      imageFolder: 'Triceps_Overhead_Extension_with_Rope'
    },
    {
      id: 'preacher-curl',
      name: 'Machine Preacher Curl',
      machine: 'Preacher Curl Machine',
      focus: 'Biceps (Short Head)',
      sets: 3,
      reps: '10-12',
      tips: ['Armpits snug against pad', 'Don\'t let tension off at bottom', 'Squeeze hard at top'],
      color: 'from-zinc-500 to-neutral-400',
      imageFolder: 'Machine_Preacher_Curls'
    },
    {
      id: 'db-curl',
      name: 'Dumbbell Bicep Curl',
      machine: 'Pair of Dumbbells',
      focus: 'Biceps',
      sets: 4,
      reps: '10-12',
      tips: ['Elbows pinned to the sides', 'Supinate the wrist as you curl up', 'Full lower phase, no swinging'],
      color: 'from-violet-500 to-purple-500',
      imageFolder: 'Dumbbell_Bicep_Curl'
    },
    {
      id: 'db-hammer',
      name: 'Dumbbell Hammer Curl',
      machine: 'Pair of Dumbbells',
      focus: 'Brachialis & Forearms',
      sets: 3,
      reps: '10-12',
      tips: ['Neutral grip, thumbs up throughout', 'Elbows fixed, shoulders quiet', 'Squeeze at the top for one second'],
      color: 'from-purple-500 to-fuchsia-500',
      imageFolder: 'Hammer_Curls'
    },
    {
      id: 'skull-crusher',
      name: 'Skull Crusher',
      machine: 'Flat Bench + Dumbbells',
      focus: 'Triceps (Long Head)',
      sets: 3,
      reps: '10-12',
      tips: ['Elbows locked overhead, upper arms vertical', 'Lower the dumbbells beside the ears', 'Extend from the elbow only'],
      color: 'from-fuchsia-500 to-pink-500',
      imageFolder: 'Lying_Dumbbell_Tricep_Extension'
    }
  ]
};

const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Legs' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
];

function WeightTracker({ exerciseId, accentColor }) {
  const [state, setState] = useState(() => {
    const all = loadAllWeights();
    return all[exerciseId] || { current: DEFAULT_WEIGHT, step: DEFAULT_STEP, history: [] };
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== WEIGHTS_KEY) return;
      const all = loadAllWeights();
      setState(all[exerciseId] || { current: DEFAULT_WEIGHT, step: DEFAULT_STEP, history: [] });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [exerciseId]);

  const step = state.step ?? DEFAULT_STEP;

  const persist = (next) => {
    const all = loadAllWeights();
    all[exerciseId] = next;
    saveAllWeights(all);
    setState(next);
  };

  const adjust = (mult) => {
    const raw = state.current + mult * step;
    const next = { ...state, current: Math.max(0, Math.round(raw * 10) / 10) };
    persist(next);
    setPulse(true);
    setTimeout(() => setPulse(false), 180);
  };

  const setStep = (nextStep) => persist({ ...state, step: nextStep });

  const logToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    const filtered = state.history.filter((h) => h.date !== today);
    const history = [...filtered, { date: today, weight: state.current }]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-60);
    persist({ ...state, history });
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1400);
  };

  const last = state.history.length > 0 ? state.history[state.history.length - 1] : null;
  const previous = state.history.length > 1 ? state.history[state.history.length - 2] : null;
  const trend = last && previous ? last.weight - previous.weight : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Equal;
  const trendColor = trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-rose-500' : 'text-gray-400';

  return (
    <div className="pt-4 mt-1 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Working Weight</p>
        {last ? (
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 active:scale-95 transition px-2 py-1 -mr-2 rounded-lg"
          >
            <span className="tabular-nums">{formatWeight(last.weight)} kg</span>
            <TrendIcon size={11} className={trendColor} strokeWidth={2.5} />
            <span className="text-gray-400 hidden xs:inline">· {relativeDay(last.date)}</span>
            <History size={12} className="text-gray-400" />
          </button>
        ) : (
          <span className="text-[10px] font-medium text-gray-300 italic">not logged yet</span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => adjust(-1)}
          className="h-14 w-14 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-gray-800 active:scale-95 transition"
          aria-label={`Decrease ${step} kg`}
        >
          <Minus size={22} strokeWidth={3} />
        </button>
        <motion.div
          animate={pulse ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.18 }}
          className={`flex-1 min-w-0 text-center bg-gradient-to-br ${accentColor} rounded-2xl py-3 shadow-md relative overflow-hidden`}
        >
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl sm:text-xl font-bold text-white tabular-nums drop-shadow-sm">{formatWeight(state.current)}</span>
            <span className="text-sm font-bold text-white/85">kg</span>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-white/75 mt-0.5">step {formatStep(step)} kg</div>
        </motion.div>
        <button
          onClick={() => adjust(1)}
          className="h-14 w-14 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-gray-800 active:scale-95 transition"
          aria-label={`Increase ${step} kg`}
        >
          <Plus size={22} strokeWidth={3} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        {STEP_OPTIONS.map((s) => {
          const active = step === s;
          return (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold tabular-nums transition ${
                active
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
              aria-pressed={active}
            >
              +{formatStep(s)}
            </button>
          );
        })}
      </div>

      <button
        onClick={logToday}
        className={`w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition flex items-center justify-center gap-2 ${
          justLogged
            ? 'bg-emerald-500 text-white shadow-md'
            : 'bg-gray-900 hover:bg-black text-white'
        }`}
      >
        {justLogged ? (
          <>
            <CheckCircle2 size={14} strokeWidth={2.5} />
            Saved
          </>
        ) : (
          <>
            <Save size={13} />
            Log Today's Weight
          </>
        )}
      </button>

      <AnimatePresence>
        {historyOpen && (
          <WeightHistoryModal
            exerciseId={exerciseId}
            history={state.history}
            onClose={() => setHistoryOpen(false)}
            onClear={() => {
              persist({ ...state, history: [] });
              setHistoryOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WeightHistoryModal({ history, onClose, onClear }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const sorted = useMemo(() => [...history].sort((a, b) => b.date.localeCompare(a.date)), [history]);
  const max = useMemo(() => history.reduce((m, h) => Math.max(m, h.weight), 0) || 1, [history]);
  const min = useMemo(() => history.reduce((m, h) => Math.min(m, h.weight), history[0]?.weight ?? 0), [history]);
  const spark = useMemo(() => {
    if (history.length < 2) return null;
    const sortedAsc = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const w = 320;
    const h = 80;
    const pad = 6;
    const range = Math.max(1, max - min);
    const pts = sortedAsc.map((pt, i) => {
      const x = pad + (i / (sortedAsc.length - 1)) * (w - pad * 2);
      const y = h - pad - ((pt.weight - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return { w, h, points: pts.join(' ') };
  }, [history, max, min]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Weight History</h3>
            <p className="text-xs text-gray-500 font-medium">{history.length} logged session{history.length === 1 ? '' : 's'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <X size={16} className="text-gray-700" />
          </button>
        </div>

        {spark && (
          <div className="px-5 pt-4">
            <svg viewBox={`0 0 ${spark.w} ${spark.h}`} className="w-full h-20">
              <defs>
                <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                points={`${spark.points} ${spark.w - 6},${spark.h - 6} 6,${spark.h - 6}`}
                fill="url(#sparkFill)"
                stroke="none"
              />
              <polyline
                points={spark.points}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
              <span>Min {formatWeight(min)} kg</span>
              <span>Max {formatWeight(max)} kg</span>
            </div>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto p-3">
          {sorted.length === 0 ? (
            <p className="text-center text-sm text-gray-400 italic py-8">No history yet. Tap Log to record a session.</p>
          ) : (
            <ul className="space-y-1.5">
              {sorted.map((h, i) => {
                const nextOlder = sorted[i + 1];
                const delta = nextOlder ? h.weight - nextOlder.weight : 0;
                return (
                  <li key={h.date} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-900 tabular-nums">{formatWeight(h.weight)} kg</p>
                      <p className="text-[10px] font-medium text-gray-500">{h.date} · {relativeDay(h.date)}</p>
                    </div>
                    {nextOlder && (
                      <span className={`text-xs font-bold tabular-nums ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                        {delta > 0 ? '+' : ''}{formatWeight(delta)} kg
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={onClear}
              className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition"
            >
              Clear history
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function ExerciseCard({ exercise, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const baseUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.imageFolder}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-48 bg-gradient-to-br ${exercise.color} relative overflow-hidden flex justify-center items-center`}>
        {exercise.imageFolder && (
          <img
            src={`${baseUrl}/${isHovered ? '1' : '0'}.jpg`}
            alt={exercise.name}
            className="h-full object-cover mix-blend-multiply opacity-90 transition-opacity duration-300"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            onLoad={(e) => { e.currentTarget.style.visibility = 'visible'; }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-900/60 to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 w-auto">
          <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-sm">
            {exercise.machine}
          </span>
          <div className="bg-white/20 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-sm">
            <Play size={16} className={`text-white ml-0.5 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          </div>
        </div>
        <h3 className="absolute bottom-4 left-4 right-4 text-xl md:text-2xl font-bold text-white z-10 leading-tight drop-shadow-md">
          {exercise.name}
        </h3>
      </div>

      <div className="p-6 space-y-5 flex-1">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
          <div className="flex items-center space-x-2 text-gray-500">
            <Target size={16} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">{exercise.focus}</span>
          </div>
          <div className="flex space-x-2">
            <div className="flex flex-col items-center bg-gray-50 px-3 py-1.5 rounded-xl">
              <span className="text-sm font-bold text-gray-900">{exercise.sets}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Sets</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 px-3 py-1.5 rounded-xl">
              <span className="text-sm font-bold text-gray-900">{exercise.reps}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Reps</span>
            </div>
          </div>
        </div>
        <WeightTracker exerciseId={exercise.id} accentColor={exercise.color} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Form Check</p>
          <ul className="space-y-2">
            {exercise.tips.map((tip, i) => (
              <li key={i} className="flex items-start space-x-2 text-sm text-gray-600 font-medium">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function GymContent() {
  const [activeGroup, setActiveGroup] = useState('chest');
  const exercises = GYM_EXERCISES[activeGroup] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10 md:space-y-12"
    >
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Machine &amp; Cable <br /><span className="italic font-normal text-gray-400">Workouts.</span></h1>
        <p className="text-base md:text-lg text-gray-500 font-medium">Safe, effective, and highly isolated exercises designed for machines and cables.</p>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-hide">
        {MUSCLE_GROUPS.map(group => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider border transition-all ${
              activeGroup === group.id
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-[1.03]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-amber-200'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {exercises.map((ex, idx) => (
          <ExerciseCard key={ex.id} exercise={ex} index={idx} />
        ))}
      </div>
    </motion.div>
  );
}
