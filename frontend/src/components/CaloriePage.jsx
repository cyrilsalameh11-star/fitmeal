import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingDown, Target, Zap, BookmarkCheck, Bookmark } from 'lucide-react';

const STORAGE_KEY = 'fitmeal_tdee_profile';

const ACTIVITY_LEVELS = [
  { id: 'sedentary',   label: 'Sedentary',  desc: 'Desk job, no exercise',   multiplier: 1.2   },
  { id: 'light',       label: 'Light',      desc: '1–3 days/week',           multiplier: 1.375 },
  { id: 'moderate',    label: 'Moderate',   desc: '3–5 days/week',           multiplier: 1.55  },
  { id: 'active',      label: 'Active',     desc: '6–7 days/week',           multiplier: 1.725 },
  { id: 'very_active', label: 'Athlete',    desc: 'Twice daily training',    multiplier: 1.9   },
];

function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa', text: 'text-blue-500' };
  if (bmi < 25)   return { label: 'Healthy',     color: '#f59e0b', text: 'text-amber-500' };
  if (bmi < 30)   return { label: 'Overweight',  color: '#f97316', text: 'text-orange-500' };
  return             { label: 'Obese',        color: '#ef4444', text: 'text-red-500' };
}

function PersonSVG({ gender, bmi }) {
  const { label, color, text } = getBmiCategory(bmi);
  const isFemale = gender === 'female';

  // torso width scales slightly with BMI
  const torsoSpread = Math.min(Math.max((bmi - 18) * 0.8, 0), 8);
  const mShoulderX = 28 - torsoSpread;
  const fShoulderX = 32 - torsoSpread * 0.5;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox="0 0 120 230"
        className="w-44 h-auto"
        style={{ filter: `drop-shadow(0 24px 32px ${color}55)` }}
      >
        <defs>
          <radialGradient id="hg" cx="35%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
          <radialGradient id="tg" cx="28%" cy="22%" r="72%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
          <radialGradient id="lg" cx="25%" cy="18%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
          {/* inner highlight on torso */}
          <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shadow ellipse at feet */}
        <ellipse cx="60" cy="220" rx="28" ry="6" fill={color} opacity="0.18" />

        {/* Head */}
        <ellipse cx="60" cy="20" rx="17" ry="18" fill="url(#hg)" />

        {/* Neck */}
        <rect x="54" y="35" width="12" height="11" rx="5" fill="url(#lg)" />

        {/* Torso */}
        {isFemale ? (
          // hourglass: wide hips, narrower shoulders, pinched waist
          <path
            d={`M${fShoulderX} 46
               Q${fShoulderX - 4} 68 ${36 - torsoSpread} 82
               Q${44 - torsoSpread * 0.5} 96 60 98
               Q${76 + torsoSpread * 0.5} 96 ${84 + torsoSpread} 82
               Q${128 - fShoulderX + 4} 68 ${120 - fShoulderX} 46
               Q92 51 60 51 Q28 51 ${fShoulderX} 46Z`}
            fill="url(#tg)"
          />
        ) : (
          // rectangular: wider shoulders, modest taper
          <path
            d={`M${mShoulderX} 46
               Q${mShoulderX - 2} 68 ${32 - torsoSpread} 82
               Q${42 - torsoSpread * 0.5} 98 60 99
               Q${78 + torsoSpread * 0.5} 98 ${88 + torsoSpread} 82
               Q${122 - mShoulderX + 2} 68 ${120 - mShoulderX} 46
               Q90 50 60 50 Q30 50 ${mShoulderX} 46Z`}
            fill="url(#tg)"
          />
        )}

        {/* Shine overlay on torso */}
        {isFemale ? (
          <path
            d={`M${fShoulderX} 46 Q${fShoulderX - 4} 68 ${36 - torsoSpread} 82 Q${44 - torsoSpread * 0.5} 96 60 98 Q28 51 ${fShoulderX} 46Z`}
            fill="url(#shine)"
          />
        ) : (
          <path
            d={`M${mShoulderX} 46 Q${mShoulderX - 2} 68 ${32 - torsoSpread} 82 Q${42 - torsoSpread * 0.5} 98 60 99 Q30 50 ${mShoulderX} 46Z`}
            fill="url(#shine)"
          />
        )}

        {/* Left arm */}
        <path
          d={`M${isFemale ? fShoulderX + 2 : mShoulderX + 1} 50
             Q${isFemale ? fShoulderX - 14 : mShoulderX - 16} 78
               ${isFemale ? fShoulderX - 10 : mShoulderX - 12} 108
             Q${isFemale ? fShoulderX - 6 : mShoulderX - 8} 112
               ${isFemale ? fShoulderX - 2 : mShoulderX - 4} 108
             Q${isFemale ? fShoulderX - 2 : mShoulderX - 2} 80
               ${isFemale ? fShoulderX + 8 : mShoulderX + 6} 56Z`}
          fill="url(#lg)"
        />

        {/* Right arm */}
        <path
          d={`M${isFemale ? 120 - fShoulderX - 2 : 120 - mShoulderX - 1} 50
             Q${isFemale ? 120 - fShoulderX + 14 : 120 - mShoulderX + 16} 78
               ${isFemale ? 120 - fShoulderX + 10 : 120 - mShoulderX + 12} 108
             Q${isFemale ? 120 - fShoulderX + 6 : 120 - mShoulderX + 8} 112
               ${isFemale ? 120 - fShoulderX + 2 : 120 - mShoulderX + 4} 108
             Q${isFemale ? 120 - fShoulderX + 2 : 120 - mShoulderX + 2} 80
               ${isFemale ? 120 - fShoulderX - 8 : 120 - mShoulderX - 6} 56Z`}
          fill="url(#lg)"
        />

        {/* Left leg */}
        <path
          d={`M${44 - torsoSpread * 0.3} 97
             Q${38 - torsoSpread * 0.3} 145 ${40 - torsoSpread * 0.2} 188
             Q44 194 50 188
             Q52 148 ${56 - torsoSpread * 0.2} 100Z`}
          fill="url(#lg)"
        />

        {/* Right leg */}
        <path
          d={`M${76 + torsoSpread * 0.3} 97
             Q${82 + torsoSpread * 0.3} 145 ${80 + torsoSpread * 0.2} 188
             Q76 194 70 188
             Q68 148 ${64 + torsoSpread * 0.2} 100Z`}
          fill="url(#lg)"
        />

        {/* Feet */}
        <ellipse cx="45" cy="191" rx="11" ry="5.5" fill={color} opacity="0.85" />
        <ellipse cx="75" cy="191" rx="11" ry="5.5" fill={color} opacity="0.85" />
      </svg>

      <div className={`text-sm font-black uppercase tracking-widest ${text}`}>{label}</div>
      <div className="text-xs text-stone-400 font-bold">BMI {bmi}</div>
    </div>
  );
}

function BmiBar({ bmi }) {
  const MIN = 15, MAX = 40;
  const clamped = Math.min(Math.max(bmi, MIN), MAX);
  const pct = ((clamped - MIN) / (MAX - MIN)) * 100;

  const segments = [
    { from: 15,   to: 18.5, color: '#2dd4bf' }, // teal   – underweight
    { from: 18.5, to: 25,   color: '#86efac' }, // green  – healthy
    { from: 25,   to: 30,   color: '#fcd34d' }, // yellow – overweight
    { from: 30,   to: 40,   color: '#f87171' }, // red    – obese
  ];
  const ticks = [15, 18.5, 25, 30, 40];

  const { label, text } = getBmiCategory(bmi);

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">BMI</p>
        <span className={`text-[10px] font-black uppercase tracking-widest ${text}`}>{label}</span>
      </div>

      {/* Big value */}
      <p className="text-5xl font-black text-stone-900 leading-none">{bmi}</p>

      {/* Colour bar */}
      <div className="relative">
        <div className="relative h-5 rounded-full overflow-hidden flex">
          {segments.map((seg, i) => {
            const w = ((seg.to - seg.from) / (MAX - MIN)) * 100;
            return <div key={i} style={{ width: `${w}%`, background: seg.color }} />;
          })}
          {/* Indicator pill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-md border-2 border-white"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Tick marks */}
        <div className="relative mt-1.5 h-4">
          {ticks.map(tick => (
            <span
              key={tick}
              className="absolute text-[9px] font-bold text-stone-400 -translate-x-1/2"
              style={{ left: `${((tick - MIN) / (MAX - MIN)) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CaloriePage() {
  const [gender,    setGender]    = useState('male');
  const [weight,    setWeight]    = useState(70);
  const [height,    setHeight]    = useState(170);
  const [age,       setAge]       = useState(25);
  const [activity,  setActivity]  = useState('moderate');
  const [deficitKg, setDeficitKg] = useState(0.5);
  const [savedProfile, setSavedProfile] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  // Load saved profile on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setGender(p.gender);
        setWeight(p.weight);
        setHeight(p.height);
        setAge(p.age);
        setActivity(p.activity);
        setDeficitKg(p.deficitKg);
        setSavedProfile(p);
      }
    } catch { }
  }, []);

  const currentProfile = { gender, weight, height, age, activity, deficitKg };
  const isDirty = savedProfile && JSON.stringify(currentProfile) !== JSON.stringify(savedProfile);
  const hasUnsaved = !savedProfile || isDirty;

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProfile));
    setSavedProfile(currentProfile);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const results = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 1;
    const a = parseFloat(age)    || 25;

    // Mifflin-St Jeor BMR
    const bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    const actLevel    = ACTIVITY_LEVELS.find(l => l.id === activity);
    const maintenance = Math.round(bmr * actLevel.multiplier);
    const dailyDeficit   = Math.round((deficitKg * 7700) / 7);
    const targetCalories = Math.max(1200, maintenance - dailyDeficit);
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);

    return { bmr: Math.round(bmr), maintenance, dailyDeficit, targetCalories, bmi };
  }, [gender, weight, height, age, activity, deficitKg]);

  return (
    <motion.div
      key="calories"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10 md:space-y-12 pb-20"
    >
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center">
          <Flame size={14} className="mr-2" /> Calorie Calculator
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
          Know your <br /><span className="italic font-normal text-stone-400">maintenance.</span>
        </h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">
          Calculate your daily calorie needs, set a deficit, and see exactly how fast you'll reach your goal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* ── Left: Inputs ── */}
        <div className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm space-y-7">

          {/* Gender */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {[['male', '♂ Man'], ['female', '♀ Woman']].map(([g, label]) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    gender === g
                      ? 'bg-stone-900 text-white shadow-lg'
                      : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Weight</label>
              <span className="text-sm font-black text-stone-900">{weight} kg</span>
            </div>
            <input
              type="range" min="40" max="180" value={weight}
              onChange={e => setWeight(+e.target.value)}
              className="w-full h-1.5 rounded-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-300 font-bold uppercase tracking-wider">
              <span>40 kg</span><span>180 kg</span>
            </div>
          </div>

          {/* Height */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Height</label>
              <span className="text-sm font-black text-stone-900">{height} cm</span>
            </div>
            <input
              type="range" min="140" max="220" value={height}
              onChange={e => setHeight(+e.target.value)}
              className="w-full h-1.5 rounded-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-300 font-bold uppercase tracking-wider">
              <span>140 cm</span><span>220 cm</span>
            </div>
          </div>

          {/* Age */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Age</label>
              <span className="text-sm font-black text-stone-900">{age} yrs</span>
            </div>
            <input
              type="range" min="15" max="80" value={age}
              onChange={e => setAge(+e.target.value)}
              className="w-full h-1.5 rounded-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-300 font-bold uppercase tracking-wider">
              <span>15</span><span>80</span>
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Activity Level</label>
            <div className="space-y-1.5">
              {ACTIVITY_LEVELS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setActivity(l.id)}
                  className={`w-full flex justify-between items-center px-4 py-2.5 rounded-xl text-xs transition-all ${
                    activity === l.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="font-black uppercase tracking-wider">{l.label}</span>
                  <span className={`text-[10px] font-medium ${activity === l.id ? 'text-stone-400' : 'text-stone-400'}`}>{l.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Center: 3D Person + deficit slider ── */}
        <div className="flex flex-col items-center justify-start gap-8">
          <div className="w-full bg-stone-900 rounded-[2.5rem] p-10 flex flex-col items-center shadow-2xl border border-stone-800">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
            >
              <PersonSVG gender={gender} bmi={parseFloat(results.bmi)} />
            </motion.div>
          </div>

          {/* Weekly goal slider */}
          <div className="w-full bg-white rounded-[1.5rem] p-6 border border-stone-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Weekly Loss Goal</label>
              <span className="text-sm font-black text-amber-600">−{deficitKg} kg/week</span>
            </div>
            <input
              type="range" min="0.1" max="1.0" step="0.1" value={deficitKg}
              onChange={e => setDeficitKg(+e.target.value)}
              className="w-full h-1.5 rounded-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-300 font-bold uppercase tracking-wider">
              <span>Gentle</span><span>Aggressive</span>
            </div>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="space-y-4">

          {/* Maintenance — hero card */}
          <div className="bg-stone-900 text-white rounded-[2rem] p-8 shadow-xl space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
              <Flame size={11} className="text-amber-500" /> Maintenance Calories
            </p>
            <p className="text-6xl font-black tracking-tight leading-none">{results.maintenance.toLocaleString()}</p>
            <p className="text-xs text-stone-400 font-medium pt-1">kcal/day — stay at current weight</p>
          </div>

          {/* Target calories */}
          <div className="bg-amber-500 text-white rounded-[2rem] p-8 shadow-xl space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-200 flex items-center gap-1.5">
              <Target size={11} /> Your Target
            </p>
            <p className="text-6xl font-black tracking-tight leading-none">{results.targetCalories.toLocaleString()}</p>
            <p className="text-xs text-amber-200 font-medium pt-1">kcal/day to lose {deficitKg} kg/week</p>
          </div>

          {/* Daily deficit */}
          <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Daily Deficit</p>
              <p className="text-3xl font-black text-stone-900">
                {results.dailyDeficit} <span className="text-base font-bold text-stone-400">kcal</span>
              </p>
            </div>
            <div className="bg-stone-50 p-3 rounded-2xl">
              <TrendingDown size={22} className="text-stone-400" />
            </div>
          </div>

          {/* BMR */}
          <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Basal Metabolic Rate</p>
              <p className="text-3xl font-black text-stone-900">
                {results.bmr.toLocaleString()} <span className="text-base font-bold text-stone-400">kcal</span>
              </p>
            </div>
            <div className="bg-stone-50 p-3 rounded-2xl">
              <Zap size={22} className="text-stone-400" />
            </div>
          </div>

          {/* BMI bar */}
          <BmiBar bmi={parseFloat(results.bmi)} />

          {/* Save button */}
          <button
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
              justSaved
                ? 'bg-emerald-500 text-white'
                : hasUnsaved
                ? 'bg-stone-900 text-white hover:bg-stone-700'
                : 'bg-stone-50 text-stone-400 border border-stone-100'
            }`}
          >
            {justSaved ? (
              <><BookmarkCheck size={15} /> Saved</>
            ) : hasUnsaved ? (
              <><Bookmark size={15} /> {savedProfile ? 'Update Target' : 'Save Target'}</>
            ) : (
              <><BookmarkCheck size={15} /> Target Saved</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
