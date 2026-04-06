import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Plus, Trash2, Camera, Image, Target, Scale } from 'lucide-react';

const WEIGHT_KEY  = 'fitmeal_weight_log';
const GOAL_KEY    = 'fitmeal_goal_weight';
const PHOTOS_KEY  = 'fitmeal_progress_photos';

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

// ── SVG Line Chart ──────────────────────────────────────────────────────────
function WeightChart({ entries, goalWeight }) {
  const W = 560, H = 210;
  const pad = { t: 18, r: 40, b: 38, l: 52 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-stone-300">
        <Scale size={32} strokeWidth={1.5} />
        <p className="text-sm font-medium">Add your first weigh-in to see the chart</p>
      </div>
    );
  }

  const weights = entries.map(e => e.weight);
  const allVals = goalWeight ? [...weights, goalWeight] : weights;
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const pad2 = Math.max((rawMax - rawMin) * 0.15, 1.5);
  const minW = rawMin - pad2;
  const maxW = rawMax + pad2;
  const range = maxW - minW;

  const toX = i => pad.l + (entries.length > 1 ? (i / (entries.length - 1)) * iW : iW / 2);
  const toY = w => pad.t + iH * (1 - (w - minW) / range);

  const pts = entries.map((e, i) => `${toX(i).toFixed(1)},${toY(e.weight).toFixed(1)}`).join(' ');

  const ticks = 5;
  const yTicks = Array.from({ length: ticks }, (_, i) => minW + (range * i) / (ticks - 1));

  const step = Math.max(1, Math.floor(entries.length / 6));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: 'inherit' }}>
      {/* Y grid + labels */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} y1={toY(v)} x2={W - pad.r} y2={toY(v)} stroke="#e7e5e4" strokeWidth="1" />
          <text x={pad.l - 8} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#a8a29e" fontWeight="700">
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* Goal dashed line */}
      {goalWeight && goalWeight > minW && goalWeight < maxW && (
        <>
          <line
            x1={pad.l} y1={toY(goalWeight)} x2={W - pad.r} y2={toY(goalWeight)}
            stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.85"
          />
          <text x={W - pad.r + 4} y={toY(goalWeight) + 4} fontSize="9" fill="#f59e0b" fontWeight="800">GOAL</text>
        </>
      )}

      {/* Area under line */}
      {entries.length > 1 && (
        <polygon
          points={`${pad.l},${H - pad.b} ${pts} ${toX(entries.length - 1)},${H - pad.b}`}
          fill="#1c1917" fillOpacity="0.04"
        />
      )}

      {/* Line */}
      {entries.length > 1 && (
        <polyline
          points={pts}
          fill="none" stroke="#1c1917" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        />
      )}

      {/* Data points */}
      {entries.map((e, i) => (
        <circle
          key={e.id}
          cx={toX(i)} cy={toY(e.weight)} r="5"
          fill="white" stroke="#1c1917" strokeWidth="2.5"
        />
      ))}

      {/* X axis labels */}
      {entries.map((e, i) => {
        if (i % step !== 0 && i !== entries.length - 1) return null;
        return (
          <text key={e.id} x={toX(i)} y={H - pad.b + 16} textAnchor="middle" fontSize="9" fill="#a8a29e" fontWeight="700">
            {new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </text>
        );
      })}
    </svg>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ProgressPage() {
  const [entries,    setEntries]    = useState(() => loadJSON(WEIGHT_KEY, []));
  const [goalWeight, setGoalWeight] = useState(() => loadJSON(GOAL_KEY, null));
  const [photos,     setPhotos]     = useState(() => loadJSON(PHOTOS_KEY, []));

  const [weightInput, setWeightInput] = useState('');
  const [dateInput,   setDateInput]   = useState(() => new Date().toISOString().slice(0, 10));
  const [noteInput,   setNoteInput]   = useState('');
  const [goalInput,   setGoalInput]   = useState('');
  const [showGoalEdit, setShowGoalEdit] = useState(false);

  const photoInputRef = useRef(null);

  useEffect(() => { localStorage.setItem(WEIGHT_KEY, JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem(GOAL_KEY,   JSON.stringify(goalWeight)); }, [goalWeight]);
  useEffect(() => { localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos)); }, [photos]);

  // Sorted ascending for chart + history
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest   = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const first    = sorted[0];

  const totalChange  = latest && first    ? latest.weight - first.weight    : null;
  const recentChange = latest && previous ? latest.weight - previous.weight : null;

  const trendIcon = recentChange == null   ? null
    : recentChange < -0.05 ? <TrendingDown size={18} className="text-emerald-500" />
    : recentChange >  0.05 ? <TrendingUp   size={18} className="text-red-400" />
    : <Minus size={18} className="text-stone-400" />;

  const addEntry = () => {
    const w = parseFloat(weightInput);
    if (!w || w < 20 || w > 350) return;
    const entry = { id: Date.now().toString(), date: dateInput, weight: w, note: noteInput.trim() };
    setEntries(prev => {
      const without = prev.filter(e => e.date !== dateInput); // replace same-day
      return [...without, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
    setWeightInput('');
    setNoteInput('');
  };

  const deleteEntry = id => setEntries(prev => prev.filter(e => e.id !== id));

  const saveGoal = () => {
    const g = parseFloat(goalInput);
    if (g && g > 20 && g < 350) {
      setGoalWeight(g);
      setShowGoalEdit(false);
      setGoalInput('');
    }
  };

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPhotos(prev => [{
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 10),
        dataUrl: ev.target.result,
      }, ...prev]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deletePhoto = id => setPhotos(prev => prev.filter(p => p.id !== id));

  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10 pb-20"
    >
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center">
          <Scale size={14} className="mr-2" /> Weight Tracker
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
          Track your <br /><span className="italic font-normal text-stone-400">progress.</span>
        </h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">
          Log your weight, set a goal, and capture your transformation over time.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-stone-900 text-white rounded-[2rem] p-6 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Current</p>
          <p className="text-4xl font-black leading-none">{latest ? latest.weight : '—'}</p>
          <p className="text-xs text-stone-500 font-medium">kg</p>
        </div>

        <div
          className="bg-amber-500 text-white rounded-[2rem] p-6 space-y-1 cursor-pointer hover:bg-amber-600 transition-colors"
          onClick={() => { setShowGoalEdit(v => !v); setGoalInput(goalWeight ? String(goalWeight) : ''); }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-200 flex items-center gap-1">
            <Target size={10} /> Goal
          </p>
          <p className="text-4xl font-black leading-none">{goalWeight ?? '—'}</p>
          <p className="text-xs text-amber-200 font-medium">{goalWeight ? 'tap to edit' : 'tap to set'}</p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Change</p>
          <p className={`text-4xl font-black leading-none ${
            totalChange == null ? 'text-stone-900'
            : totalChange < 0  ? 'text-emerald-600'
            : totalChange > 0  ? 'text-red-400'
            : 'text-stone-900'
          }`}>
            {totalChange != null ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}` : '—'}
          </p>
          <p className="text-xs text-stone-400 font-medium">kg since start</p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Last Change</p>
          <div className="flex items-center gap-2">
            <p className="text-4xl font-black leading-none text-stone-900">
              {recentChange != null ? `${recentChange > 0 ? '+' : ''}${recentChange.toFixed(1)}` : '—'}
            </p>
            {trendIcon}
          </div>
          <p className="text-xs text-stone-400 font-medium">kg vs previous</p>
        </div>
      </div>

      {/* Goal edit inline */}
      <AnimatePresence>
        {showGoalEdit && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
              <input
                type="number" step="0.1"
                placeholder="Target weight (kg)"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveGoal()}
                className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-3 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button onClick={saveGoal} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-amber-600 transition-colors">
                Save
              </button>
              <button onClick={() => setShowGoalEdit(false)} className="text-stone-400 hover:text-stone-600 text-sm font-bold uppercase tracking-wider">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl">Weight Over Time</h3>
          {goalWeight && (
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <span className="inline-block w-5 border-t-2 border-dashed border-amber-400" />
              Goal: {goalWeight} kg
            </span>
          )}
        </div>
        <WeightChart entries={sorted} goalWeight={goalWeight} />
      </div>

      {/* Add entry */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-100 shadow-sm">
        <h3 className="font-serif text-xl mb-6">Log Weigh-In</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Date</label>
            <input
              type="date" value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Weight (kg)</label>
            <input
              type="number" step="0.1" placeholder="e.g. 74.5"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addEntry()}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Note (optional)</label>
            <input
              type="text" placeholder="e.g. post workout"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addEntry()}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 font-medium text-stone-800 outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <button
            onClick={addEntry}
            className="bg-stone-900 text-white rounded-xl px-6 py-3 font-bold text-sm uppercase tracking-widest hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Log
          </button>
        </div>
      </div>

      {/* Progress Photos */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl">Progress Photos</h3>
          <button
            onClick={() => photoInputRef.current?.click()}
            className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
          >
            <Camera size={14} /> Add Photo
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>

        {photos.length === 0 ? (
          <button
            onClick={() => photoInputRef.current?.click()}
            className="w-full h-44 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-stone-300 hover:border-amber-300 hover:text-amber-400 transition-all"
          >
            <Image size={32} strokeWidth={1.5} />
            <p className="text-sm font-medium">Tap to upload your first progress photo</p>
          </button>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-stone-100 shadow-sm">
                <img src={photo.dataUrl} alt="Progress" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/60 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <p className="text-white text-[10px] font-bold uppercase tracking-wider">
                    {new Date(photo.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </p>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {/* Add more button */}
            <button
              onClick={() => photoInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-300 hover:border-amber-300 hover:text-amber-400 transition-all"
            >
              <Plus size={20} />
              <p className="text-[10px] font-bold uppercase tracking-wider">Add</p>
            </button>
          </div>
        )}
      </div>

      {/* History log */}
      {sorted.length > 0 && (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-100 shadow-sm">
          <h3 className="font-serif text-xl mb-6">History</h3>
          <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
            {[...sorted].reverse().map((entry) => {
              const idx = sorted.findIndex(e => e.id === entry.id);
              const prev = sorted[idx - 1];
              const diff = prev ? entry.weight - prev.weight : null;
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[52px]">
                      <p className="text-xs font-bold text-stone-500">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[10px] text-stone-300 font-medium">
                        {new Date(entry.date + 'T00:00:00').getFullYear()}
                      </p>
                    </div>
                    <p className="text-xl font-black text-stone-900">
                      {entry.weight} <span className="text-sm font-bold text-stone-400">kg</span>
                    </p>
                    {diff != null && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        diff < 0 ? 'bg-emerald-50 text-emerald-600'
                        : diff > 0 ? 'bg-red-50 text-red-400'
                        : 'bg-stone-50 text-stone-400'
                      }`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                      </span>
                    )}
                    {entry.note && (
                      <p className="text-xs text-stone-400 italic hidden sm:block">{entry.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-stone-200 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
