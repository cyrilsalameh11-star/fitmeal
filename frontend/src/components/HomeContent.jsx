import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Play,
  CheckCircle2,
  Minus,
  Plus,
  Save,
  TrendingUp,
  TrendingDown,
  Minus as Equal,
  History,
  X,
  Home,
  Clock,
  Repeat,
} from 'lucide-react';

const REPS_KEY = 'fitmeal_home_reps';
const STEP_OPTIONS_REPS = [0, 1, 2, 5, 10];
const STEP_OPTIONS_TIME = [0, 5, 10, 15, 30];

function formatValue(n, unit) {
  const rounded = Math.round(n);
  return unit === 'sec' ? `${rounded}s` : String(rounded);
}

function loadAllReps() {
  try {
    const raw = localStorage.getItem(REPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllReps(data) {
  try {
    localStorage.setItem(REPS_KEY, JSON.stringify(data));
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

const HOME_EXERCISES = {
  chest: [
    {
      id: 'h-pushup',
      name: 'Push-Up',
      focus: 'Horizontal Press (Baseline)',
      sets: 4,
      target: '10-20 reps',
      unit: 'reps',
      tips: ['Body in a straight line, glutes squeezed', 'Elbows at ~45°, not flared', 'Chest kisses the floor, full lockout at the top'],
      color: 'from-orange-400 to-rose-400',
      imageFolder: 'Pushups',
    },
    {
      id: 'h-diamond-pushup',
      name: 'Diamond Push-Up',
      focus: 'Triceps & Inner Chest',
      sets: 3,
      target: '8-12 reps',
      unit: 'reps',
      tips: ['Thumbs and index fingers form a diamond', 'Elbows tucked to the ribs', 'Chest touches the hands, drive through the triceps'],
      color: 'from-orange-500 to-red-400',
      imageFolder: 'Push-Ups_-_Close_Triceps_Position',
    },
    {
      id: 'h-plyo-pushup',
      name: 'Plyo Push-Up',
      focus: 'Chest Power (Explosive)',
      sets: 3,
      target: '6-10 reps',
      unit: 'reps',
      tips: ['Descend under control', 'Explode up so the hands leave the floor', 'Land soft, immediately into the next rep'],
      color: 'from-rose-500 to-pink-500',
      imageFolder: 'Plyo_Push-up',
    },
  ],

  back: [
    {
      id: 'h-superman',
      name: 'Superman Hold',
      focus: 'Posterior Chain (Iso)',
      sets: 3,
      target: '20-40 sec',
      unit: 'sec',
      tips: ['Face down, arms straight forward', 'Lift arms, chest and legs together', 'Squeeze the glutes, look at the floor'],
      color: 'from-emerald-400 to-teal-400',
      imageFolder: 'Superman',
    },
  ],

  legs: [
    {
      id: 'h-squat',
      name: 'Bodyweight Squat',
      focus: 'Squat (Both Legs)',
      sets: 4,
      target: '15-25 reps',
      unit: 'reps',
      tips: ['Feet just wider than the shoulders, toes slightly out', 'Chest tall, sit between the heels', 'Drive through the mid-foot, no knee cave'],
      color: 'from-amber-400 to-orange-400',
      imageFolder: 'Bodyweight_Squat',
    },
    {
      id: 'h-jump-squat',
      name: 'Jump Squat',
      focus: 'Squat Power (Explosive)',
      sets: 3,
      target: '10-15 reps',
      unit: 'reps',
      tips: ['Sink into a full squat', 'Explode straight up, arms swing to help', 'Land soft, immediately into the next rep'],
      color: 'from-orange-400 to-amber-500',
      imageFolder: 'Freehand_Jump_Squat',
    },
    {
      id: 'h-walking-lunge',
      name: 'Walking Lunge',
      focus: 'Squat (One Leg)',
      sets: 3,
      target: '10 reps / leg',
      unit: 'reps',
      tips: ['Take a long step, drop the back knee toward the floor', 'Front shin stays vertical', 'Push through the front heel to walk into the next lunge'],
      color: 'from-yellow-400 to-amber-400',
      imageFolder: 'Bodyweight_Walking_Lunge',
    },
    {
      id: 'h-glute-bridge',
      name: 'Glute Bridge',
      focus: 'Hinge (Both Legs)',
      sets: 3,
      target: '15-20 reps',
      unit: 'reps',
      tips: ['On your back, heels close to the glutes', 'Drive through the heels, squeeze the glutes at the top', 'Pause one second, control the descent'],
      color: 'from-orange-300 to-orange-500',
      imageFolder: 'Butt_Lift_Bridge',
    },
    {
      id: 'h-single-glute-bridge',
      name: 'Single-Leg Glute Bridge',
      focus: 'Hinge (One Leg)',
      sets: 3,
      target: '10 reps / leg',
      unit: 'reps',
      tips: ['One foot planted, the other leg extended out', 'Drive through the working heel, keep the hips square', 'One-second squeeze at the top'],
      color: 'from-amber-500 to-yellow-500',
      imageFolder: 'Single_Leg_Glute_Bridge',
    },
  ],

  shoulders: [
    {
      id: 'h-handstand-pushup',
      name: 'Handstand Push-Up',
      focus: 'Vertical Press (Strength)',
      sets: 3,
      target: '5-8 reps',
      unit: 'reps',
      tips: ['Kick up into a handstand against a wall', 'Lower under control, head aims for the floor', 'Advanced move, scale by walking your hands closer to the wall'],
      color: 'from-sky-400 to-cyan-400',
      imageFolder: 'Handstand_Push-Ups',
    },
    {
      id: 'h-arm-circles',
      name: 'Arm Circles',
      focus: 'Deltoid Endurance & Mobility',
      sets: 2,
      target: '30-45 sec',
      unit: 'sec',
      tips: ['Arms out in a T, palms down', 'Small controlled circles, forward then backward', 'Keep the shoulders down, not shrugged'],
      color: 'from-cyan-300 to-teal-400',
      imageFolder: 'Arm_Circles',
    },
  ],

  core: [
    {
      id: 'h-plank',
      name: 'Plank',
      focus: 'Anti-Extension (Hold)',
      sets: 3,
      target: '30-60 sec',
      unit: 'sec',
      tips: ['Elbows under the shoulders, forearms on the floor', 'Body in a straight line, glutes squeezed', 'Breathe steadily, don\'t sag or pike'],
      color: 'from-rose-400 to-pink-400',
      imageFolder: 'Plank',
    },
    {
      id: 'h-dead-bug',
      name: 'Dead Bug',
      focus: 'Anti-Extension (Dynamic)',
      sets: 3,
      target: '10 reps / side',
      unit: 'reps',
      tips: ['On your back, arms straight up, knees bent at 90°', 'Lower opposite arm and leg together, hover just above the floor', 'Lower back stays pressed to the floor throughout'],
      color: 'from-rose-400 to-pink-500',
      imageFolder: 'Dead_Bug',
    },
    {
      id: 'h-side-plank',
      name: 'Side Plank',
      focus: 'Anti-Lateral Flexion',
      sets: 3,
      target: '20-40 sec / side',
      unit: 'sec',
      tips: ['Elbow under the shoulder, feet stacked', 'Hips lifted so the body is one line', 'Squeeze the side you\'re holding on'],
      color: 'from-pink-400 to-rose-500',
      imageFolder: 'Side_Bridge',
    },
    {
      id: 'h-bicycle-crunch',
      name: 'Bicycle Crunch',
      focus: 'Rotation',
      sets: 3,
      target: '20 reps / side',
      unit: 'reps',
      tips: ['On your back, hands lightly behind the ears', 'Elbow meets opposite knee, the other leg extends', 'Slow and controlled, don\'t yank the neck'],
      color: 'from-rose-300 to-pink-400',
      imageFolder: 'Air_Bike',
    },
    {
      id: 'h-mountain-climbers',
      name: 'Mountain Climbers',
      focus: 'Dynamic Full Core',
      sets: 3,
      target: '30-45 sec',
      unit: 'sec',
      tips: ['Strong plank position, hands under the shoulders', 'Drive one knee toward the chest, then switch', 'Keep the hips low, no bouncing bum'],
      color: 'from-pink-300 to-rose-400',
      imageFolder: 'Mountain_Climbers',
    },
  ],
};

const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Legs' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'core', label: 'Core' },
];

function MetricTracker({ exerciseId, accentColor, unit }) {
  const isTime = unit === 'sec';
  const stepOptions = isTime ? STEP_OPTIONS_TIME : STEP_OPTIONS_REPS;
  const defaultStep = isTime ? 5 : 1;
  const defaultValue = isTime ? 30 : 10;
  const unitLabel = isTime ? 'sec' : 'reps';

  const [state, setState] = useState(() => {
    const all = loadAllReps();
    return all[exerciseId] || { current: defaultValue, step: defaultStep, history: [] };
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== REPS_KEY) return;
      const all = loadAllReps();
      setState(all[exerciseId] || { current: defaultValue, step: defaultStep, history: [] });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [exerciseId, defaultStep, defaultValue]);

  const step = state.step ?? defaultStep;

  const persist = (next) => {
    const all = loadAllReps();
    all[exerciseId] = next;
    saveAllReps(all);
    setState(next);
  };

  const adjust = (mult) => {
    if (!step) return;
    const raw = state.current + mult * step;
    const next = { ...state, current: Math.max(0, Math.round(raw)) };
    persist(next);
    setPulse(true);
    setTimeout(() => setPulse(false), 180);
  };

  const setStep = (nextStep) => persist({ ...state, step: nextStep });

  const logToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    const filtered = state.history.filter((h) => h.date !== today);
    const history = [...filtered, { date: today, value: state.current }]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-60);
    persist({ ...state, history });
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1400);
  };

  const last = state.history.length > 0 ? state.history[state.history.length - 1] : null;
  const previous = state.history.length > 1 ? state.history[state.history.length - 2] : null;
  const trend = last && previous ? last.value - previous.value : 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Equal;
  const trendColor = trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-rose-500' : 'text-gray-400';
  const MetricIcon = isTime ? Clock : Repeat;

  return (
    <div className="pt-4 mt-1 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <MetricIcon size={11} className="text-gray-400" />
          <span>{isTime ? 'Hold Time' : 'Working Reps'}</span>
        </div>
        {last ? (
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 active:scale-95 transition px-2 py-1 -mr-2 rounded-lg"
          >
            <span className="tabular-nums">{formatValue(last.value, unit)}</span>
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
          disabled={step === 0}
          className={`h-14 w-14 sm:h-12 sm:w-12 shrink-0 rounded-2xl flex items-center justify-center transition ${
            step === 0
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 active:scale-95'
          }`}
          aria-label={step === 0 ? 'Adjustments locked' : `Decrease ${step} ${unitLabel}`}
        >
          <Minus size={22} strokeWidth={3} />
        </button>
        <motion.div
          animate={pulse ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.18 }}
          className={`flex-1 min-w-0 text-center bg-gradient-to-br ${accentColor} rounded-2xl py-3 shadow-md relative overflow-hidden`}
        >
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl sm:text-xl font-bold text-white tabular-nums drop-shadow-sm">{Math.round(state.current)}</span>
            <span className="text-sm font-bold text-white/85">{unitLabel}</span>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-white/75 mt-0.5">
            {step === 0 ? 'locked · pick a step' : `step ${step} ${unitLabel}`}
          </div>
        </motion.div>
        <button
          onClick={() => adjust(1)}
          disabled={step === 0}
          className={`h-14 w-14 sm:h-12 sm:w-12 shrink-0 rounded-2xl flex items-center justify-center transition ${
            step === 0
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 active:scale-95'
          }`}
          aria-label={step === 0 ? 'Adjustments locked' : `Increase ${step} ${unitLabel}`}
        >
          <Plus size={22} strokeWidth={3} />
        </button>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {stepOptions.map((s) => {
          const active = step === s;
          const zero = s === 0;
          return (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold tabular-nums transition ${
                active
                  ? zero
                    ? 'bg-gray-500 text-white shadow-sm'
                    : 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
              aria-pressed={active}
              title={zero ? 'Lock the value (buttons disabled)' : `Step ${s} ${unitLabel}`}
            >
              {zero ? '0' : `+${s}`}
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
            Log Today's {isTime ? 'Hold' : 'Reps'}
          </>
        )}
      </button>

      <AnimatePresence>
        {historyOpen && (
          <MetricHistoryModal
            history={state.history}
            unit={unit}
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

function MetricHistoryModal({ history, unit, onClose, onClear }) {
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
  const max = useMemo(() => history.reduce((m, h) => Math.max(m, h.value), 0) || 1, [history]);
  const min = useMemo(() => history.reduce((m, h) => Math.min(m, h.value), history[0]?.value ?? 0), [history]);
  const spark = useMemo(() => {
    if (history.length < 2) return null;
    const sortedAsc = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const w = 320;
    const h = 80;
    const pad = 6;
    const range = Math.max(1, max - min);
    const pts = sortedAsc.map((pt, i) => {
      const x = pad + (i / (sortedAsc.length - 1)) * (w - pad * 2);
      const y = h - pad - ((pt.value - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return { w, h, points: pts.join(' ') };
  }, [history, max, min]);

  const isTime = unit === 'sec';
  const title = isTime ? 'Hold-time History' : 'Reps History';

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
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
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
                <linearGradient id={`homeSparkFill-${unit}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                points={`${spark.points} ${spark.w - 6},${spark.h - 6} 6,${spark.h - 6}`}
                fill={`url(#homeSparkFill-${unit})`}
                stroke="none"
              />
              <polyline
                points={spark.points}
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
              <span>Min {formatValue(min, unit)}</span>
              <span>Max {formatValue(max, unit)}</span>
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
                const delta = nextOlder ? h.value - nextOlder.value : 0;
                return (
                  <li key={h.date} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-900 tabular-nums">{formatValue(h.value, unit)}</p>
                      <p className="text-[10px] font-medium text-gray-500">{h.date} · {relativeDay(h.date)}</p>
                    </div>
                    {nextOlder && (
                      <span className={`text-xs font-bold tabular-nums ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                        {delta > 0 ? '+' : ''}{delta}{isTime ? 's' : ''}
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

function HomeExerciseCard({ exercise, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const baseUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.imageFolder}`;
  const isTime = exercise.unit === 'sec';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-44 bg-gradient-to-br ${exercise.color} relative overflow-hidden flex justify-center items-center`}>
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
          <span className="bg-white/25 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 shadow-sm flex items-center gap-1.5">
            <Home size={11} strokeWidth={2.5} />
            No Equipment
          </span>
          <div className="bg-white/25 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-sm">
            <Play size={16} className={`text-white ml-0.5 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          </div>
        </div>
        <h3 className="absolute bottom-4 left-4 right-4 text-xl md:text-2xl font-bold text-white z-10 leading-tight drop-shadow-md">
          {exercise.name}
        </h3>
      </div>

      <div className="p-6 space-y-5 flex-1">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50 gap-3">
          <div className="flex items-center space-x-2 text-gray-500 min-w-0">
            <Target size={16} className="text-orange-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider truncate">{exercise.focus}</span>
          </div>
          <div className="flex space-x-2 shrink-0">
            <div className="flex flex-col items-center bg-gray-50 px-3 py-1.5 rounded-xl">
              <span className="text-sm font-bold text-gray-900">{exercise.sets}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Sets</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 px-3 py-1.5 rounded-xl">
              <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{exercise.target}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{isTime ? 'Hold' : 'Target'}</span>
            </div>
          </div>
        </div>
        <MetricTracker exerciseId={exercise.id} accentColor={exercise.color} unit={exercise.unit} />
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

export default function HomeContent() {
  const [activeGroup, setActiveGroup] = useState('chest');
  const exercises = HOME_EXERCISES[activeGroup] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10 md:space-y-12"
    >
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
          Anywhere. <br />
          <span className="italic font-normal text-gray-400">No gear.</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 font-medium">
          One clean move per pattern, no duplicates, no gear. Track reps and hold-times to see progress.
        </p>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-hide">
        {MUSCLE_GROUPS.map(group => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider border transition-all ${
              activeGroup === group.id
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-[1.03]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-orange-200'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {exercises.map((ex, idx) => (
          <HomeExerciseCard key={ex.id} exercise={ex} index={idx} />
        ))}
      </div>
    </motion.div>
  );
}
