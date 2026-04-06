import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown, TrendingUp, Minus, Plus, Trash2,
  Camera, Target, Scale, ChevronLeft, ChevronRight,
  X, Sparkles, Loader2
} from 'lucide-react';

const WEIGHT_KEY = 'fitmeal_weight_log';
const GOAL_KEY   = 'fitmeal_goal_weight';
const PHOTOS_KEY = 'fitmeal_progress_photos';

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

// ── Compress image via canvas before storing ──────────────────────────────
async function compressImage(file, maxPx = 1080, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ev => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        try {
          const ratio = Math.min(1, maxPx / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width  = Math.round(img.width  * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (e) { reject(e); }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── SVG Weight Chart ──────────────────────────────────────────────────────
function WeightChart({ entries, goalWeight }) {
  const W = 560, H = 200;
  const pad = { t: 18, r: 44, b: 38, l: 52 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-44 gap-3 text-stone-300">
        <Scale size={32} strokeWidth={1.5} />
        <p className="text-sm font-medium">Add your first weigh-in to see the chart</p>
      </div>
    );
  }

  const weights = entries.map(e => e.weight);
  const allVals = goalWeight ? [...weights, goalWeight] : weights;
  const margin  = Math.max((Math.max(...allVals) - Math.min(...allVals)) * 0.18, 1.5);
  const minW = Math.min(...allVals) - margin;
  const maxW = Math.max(...allVals) + margin;
  const range = maxW - minW;

  const toX = i => pad.l + (entries.length > 1 ? (i / (entries.length - 1)) * iW : iW / 2);
  const toY = w => pad.t + iH * (1 - (w - minW) / range);
  const pts  = entries.map((e, i) => `${toX(i).toFixed(1)},${toY(e.weight).toFixed(1)}`).join(' ');

  const yTicks = Array.from({ length: 5 }, (_, i) => minW + (range * i) / 4);
  const step   = Math.max(1, Math.floor(entries.length / 6));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: 'inherit' }}>
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} y1={toY(v)} x2={W - pad.r} y2={toY(v)} stroke="#e7e5e4" strokeWidth="1" />
          <text x={pad.l - 8} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#a8a29e" fontWeight="700">
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      {goalWeight && goalWeight > minW && goalWeight < maxW && (
        <>
          <line x1={pad.l} y1={toY(goalWeight)} x2={W - pad.r} y2={toY(goalWeight)}
            stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.85" />
          <text x={W - pad.r + 4} y={toY(goalWeight) + 4} fontSize="9" fill="#f59e0b" fontWeight="800">GOAL</text>
        </>
      )}

      {entries.length > 1 && (
        <polygon
          points={`${pad.l},${H - pad.b} ${pts} ${toX(entries.length - 1)},${H - pad.b}`}
          fill="#1c1917" fillOpacity="0.04"
        />
      )}
      {entries.length > 1 && (
        <polyline points={pts} fill="none" stroke="#1c1917" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
      )}
      {entries.map((e, i) => (
        <circle key={e.id} cx={toX(i)} cy={toY(e.weight)} r="5"
          fill="white" stroke="#1c1917" strokeWidth="2.5" />
      ))}
      {entries.map((e, i) => {
        if (i % step !== 0 && i !== entries.length - 1) return null;
        return (
          <text key={e.id} x={toX(i)} y={H - pad.b + 16} textAnchor="middle"
            fontSize="9" fill="#a8a29e" fontWeight="700">
            {new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </text>
        );
      })}
    </svg>
  );
}

// ── Photo Lightbox ────────────────────────────────────────────────────────
function Lightbox({ photos, startIndex, onClose, onDelete }) {
  const [idx, setIdx] = useState(startIndex);
  const photo = photos[idx];

  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);

  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-stone-950/95 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6" onClick={e => e.stopPropagation()}>
        <p className="text-white text-sm font-bold">
          {new Date(photo.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
          <span className="text-stone-500 ml-3">{idx + 1} / {photos.length}</span>
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { onDelete(photo.id); if (photos.length === 1) onClose(); else setIdx(i => Math.min(i, photos.length - 2)); }}
            className="flex items-center gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1">
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Photo */}
      <div className="flex items-center gap-4 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <button onClick={prev} disabled={photos.length < 2}
          className="flex-shrink-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-20">
          <ChevronLeft size={20} />
        </button>
        <motion.img
          key={photo.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          src={photo.dataUrl}
          alt="Progress"
          className="flex-1 max-h-[70vh] object-contain rounded-2xl shadow-2xl"
        />
        <button onClick={next} disabled={photos.length < 2}
          className="flex-shrink-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-20">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-5" onClick={e => e.stopPropagation()}>
          {photos.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/30'}`} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function ProgressPage() {
  const [entries,    setEntries]    = useState(() => loadJSON(WEIGHT_KEY, []));
  const [goalWeight, setGoalWeight] = useState(() => loadJSON(GOAL_KEY, null));
  const [photos,     setPhotos]     = useState(() => loadJSON(PHOTOS_KEY, []));

  const [weightInput,   setWeightInput]   = useState('');
  const [dateInput,     setDateInput]     = useState(() => new Date().toISOString().slice(0, 10));
  const [noteInput,     setNoteInput]     = useState('');
  const [goalInput,     setGoalInput]     = useState('');
  const [showGoalEdit,  setShowGoalEdit]  = useState(false);
  const [lightboxIdx,   setLightboxIdx]   = useState(null);
  const [isUploading,   setIsUploading]   = useState(false);
  const [aiAnalysis,    setAiAnalysis]    = useState(null);
  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const [aiError,       setAiError]       = useState(null);
  const [storageError,  setStorageError]  = useState(false);

  const photoInputRef = useRef(null);

  useEffect(() => { localStorage.setItem(WEIGHT_KEY, JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem(GOAL_KEY,   JSON.stringify(goalWeight)); }, [goalWeight]);
  useEffect(() => {
    try {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [photos]);

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest      = sorted[sorted.length - 1];
  const previous    = sorted[sorted.length - 2];
  const first       = sorted[0];
  const totalChange = latest && first    ? latest.weight - first.weight    : null;
  const recentChange= latest && previous ? latest.weight - previous.weight : null;

  const addEntry = () => {
    const w = parseFloat(weightInput);
    if (!w || w < 20 || w > 350) return;
    const entry = { id: Date.now().toString(), date: dateInput, weight: w, note: noteInput.trim() };
    setEntries(prev => [...prev.filter(e => e.date !== dateInput), entry].sort((a, b) => a.date.localeCompare(b.date)));
    setWeightInput('');
    setNoteInput('');
  };

  const deleteEntry = id => setEntries(prev => prev.filter(e => e.id !== id));

  const saveGoal = () => {
    const g = parseFloat(goalInput);
    if (g && g > 20 && g < 350) { setGoalWeight(g); setShowGoalEdit(false); setGoalInput(''); }
  };

  const handlePhoto = useCallback(async e => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await compressImage(file);
      setPhotos(prev => [{
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 10),
        dataUrl,
      }, ...prev]);
    } catch (err) {
      console.error('Photo compression failed:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  }, []);

  const deletePhoto = useCallback(id => setPhotos(prev => prev.filter(p => p.id !== id)), []);

  const analyzeWithAI = async () => {
    if (photos.length < 2) return;
    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);
    // oldest first, newest second
    const chronological = [...photos].sort((a, b) => a.date.localeCompare(b.date));
    try {
      const resp = await fetch('/api/progress/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1: chronological[0].dataUrl, image2: chronological[chronological.length - 1].dataUrl })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Analysis failed');
      setAiAnalysis(data.analysis);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const trendIcon = recentChange == null ? null
    : recentChange < -0.05 ? <TrendingDown size={18} className="text-emerald-500" />
    : recentChange >  0.05 ? <TrendingUp   size={18} className="text-red-400" />
    : <Minus size={18} className="text-stone-400" />;

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
          Log your weight, set a goal, and let AI analyze your body transformation.
        </p>
      </div>

      {/* Stats */}
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
            totalChange == null ? 'text-stone-900' : totalChange < 0 ? 'text-emerald-600' : totalChange > 0 ? 'text-red-400' : 'text-stone-900'
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

      {/* Goal edit */}
      <AnimatePresence>
        {showGoalEdit && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
              <input type="number" step="0.1" placeholder="Target weight (kg)"
                value={goalInput} onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveGoal()}
                className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-3 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button onClick={saveGoal} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-amber-600 transition-colors">Save</button>
              <button onClick={() => setShowGoalEdit(false)} className="text-stone-400 hover:text-stone-600 text-sm font-bold">Cancel</button>
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

      {/* Log Weigh-In */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-100 shadow-sm">
        <h3 className="font-serif text-xl mb-6">Log Weigh-In</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Date</label>
            <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-200" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Weight (kg)</label>
            <input type="number" step="0.1" placeholder="e.g. 74.5" value={weightInput}
              onChange={e => setWeightInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEntry()}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 font-bold text-stone-800 outline-none focus:ring-2 focus:ring-amber-200" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Note (optional)</label>
            <input type="text" placeholder="e.g. post workout" value={noteInput}
              onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEntry()}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 font-medium text-stone-800 outline-none focus:ring-2 focus:ring-amber-200" />
          </div>
          <button onClick={addEntry}
            className="bg-stone-900 text-white rounded-xl px-6 py-3 font-bold text-sm uppercase tracking-widest hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> Log
          </button>
        </div>
      </div>

      {/* Progress Photos */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl">Progress Photos</h3>
            {storageError && <p className="text-xs text-red-400 mt-1">Storage full — older photos may not save. Delete some to free space.</p>}
          </div>
          <button onClick={() => photoInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50">
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            {isUploading ? 'Processing…' : 'Add Photo'}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {photos.length === 0 ? (
          <button onClick={() => photoInputRef.current?.click()}
            className="w-full h-44 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-stone-300 hover:border-amber-300 hover:text-amber-400 transition-all">
            <Camera size={32} strokeWidth={1.5} />
            <p className="text-sm font-medium">Tap to upload your first progress photo</p>
          </button>
        ) : (
          <>
            {/* Horizontal scroll strip */}
            <div className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
              {photos.map((photo, i) => (
                <div key={photo.id} className="flex-shrink-0 w-40 space-y-2">
                  {/* Date label */}
                  <p className="text-[10px] font-black uppercase tracking-wider text-stone-500 text-center">
                    {new Date(photo.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </p>
                  {/* Photo card */}
                  <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    <img
                      src={photo.dataUrl} alt="Progress"
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => setLightboxIdx(i)}
                    />
                    {/* Delete button — always visible */}
                    <button
                      onClick={e => { e.stopPropagation(); deletePhoto(photo.id); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-stone-900/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                    >
                      <X size={12} />
                    </button>
                    {/* Expand hint */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-900/60 to-transparent p-2 pointer-events-none">
                      <p className="text-[9px] text-white/70 font-bold text-center uppercase tracking-wider">tap to expand</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add more */}
              <div className="flex-shrink-0 w-40 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-transparent select-none">·</p>
                <button onClick={() => photoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-300 hover:border-amber-300 hover:text-amber-400 transition-all"
                  style={{ aspectRatio: '3/4' }}>
                  <Plus size={22} />
                  <p className="text-[10px] font-bold uppercase tracking-wider">Add</p>
                </button>
              </div>
            </div>

            {/* AI Analyze button */}
            {photos.length >= 2 && (
              <div className="mt-6 space-y-4">
                <button
                  onClick={analyzeWithAI}
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-700 text-white font-bold text-sm uppercase tracking-widest hover:from-stone-800 hover:to-stone-600 transition-all shadow-lg disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <><Loader2 size={16} className="animate-spin" /> Analyzing your transformation…</>
                  ) : (
                    <><Sparkles size={16} className="text-amber-400" /> Analyze Progress with AI</>
                  )}
                </button>
                <p className="text-center text-[10px] text-stone-400 font-medium">
                  Compares your oldest and most recent photo using Gemini Vision
                </p>

                {/* Analysis result */}
                <AnimatePresence>
                  {aiAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-stone-500">AI Analysis</p>
                      </div>
                      <p className="text-stone-700 leading-relaxed font-medium">{aiAnalysis}</p>
                      <button onClick={() => setAiAnalysis(null)} className="text-xs text-stone-400 hover:text-stone-600 font-bold">Dismiss</button>
                    </motion.div>
                  )}
                  {aiError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium flex items-center justify-between">
                      {aiError}
                      <button onClick={() => setAiError(null)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* History */}
      {sorted.length > 0 && (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-100 shadow-sm">
          <h3 className="font-serif text-xl mb-6">History</h3>
          <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
            {[...sorted].reverse().map(entry => {
              const idx = sorted.findIndex(e => e.id === entry.id);
              const prev = sorted[idx - 1];
              const diff = prev ? entry.weight - prev.weight : null;
              return (
                <div key={entry.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[52px]">
                      <p className="text-xs font-bold text-stone-500">
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[10px] text-stone-300 font-medium">{new Date(entry.date + 'T00:00:00').getFullYear()}</p>
                    </div>
                    <p className="text-xl font-black text-stone-900">{entry.weight} <span className="text-sm font-bold text-stone-400">kg</span></p>
                    {diff != null && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${diff < 0 ? 'bg-emerald-50 text-emerald-600' : diff > 0 ? 'bg-red-50 text-red-400' : 'bg-stone-50 text-stone-400'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                      </span>
                    )}
                    {entry.note && <p className="text-xs text-stone-400 italic hidden sm:block">{entry.note}</p>}
                  </div>
                  <button onClick={() => deleteEntry(entry.id)}
                    className="text-stone-200 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            photos={photos}
            startIndex={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onDelete={id => { deletePhoto(id); if (photos.length <= 1) setLightboxIdx(null); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
