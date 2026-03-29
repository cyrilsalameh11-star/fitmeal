import { useState, useEffect, useRef, useCallback } from 'react';
import { Footprints, Play, Square, PencilLine, Check, X, RotateCcw } from 'lucide-react';

const GOAL = 10000;
const STEP_KEY = 'fitmeal_steps_count';
const DATE_KEY = 'fitmeal_steps_date';
const RADIUS = 38;
const CIRC = 2 * Math.PI * RADIUS;

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getStepColor(pct) {
  if (pct >= 1)    return '#10b981'; // emerald — goal reached
  if (pct >= 0.7)  return '#f59e0b'; // amber
  if (pct >= 0.4)  return '#f97316'; // orange
  return '#e5e7eb';                   // grey — early
}

function getTrackColor(pct) {
  if (pct >= 1)   return '#d1fae5';
  if (pct >= 0.7) return '#fef3c7';
  if (pct >= 0.4) return '#ffedd5';
  return '#f5f5f4';
}

export default function StepsWidget() {
  const [steps, setSteps]           = useState(0);
  const [tracking, setTracking]     = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [inputVal, setInputVal]     = useState('');
  const [hasMobile, setHasMobile]   = useState(false);  // device has motion sensor
  const [denied, setDenied]         = useState(false);

  const stepsRef         = useRef(0);
  const lastMagRef       = useRef(null);
  const cooldownRef      = useRef(false);
  const smoothedMagRef   = useRef(null);

  // ── Load / reset daily count ─────────────────────────────────────────────
  useEffect(() => {
    const today = getTodayStr();
    const saved = localStorage.getItem(DATE_KEY);
    if (saved === today) {
      const count = parseInt(localStorage.getItem(STEP_KEY) || '0', 10);
      setSteps(count);
      stepsRef.current = count;
    } else {
      localStorage.setItem(DATE_KEY, today);
      localStorage.setItem(STEP_KEY, '0');
    }
    // Detect if device likely has a motion sensor (mobile/tablet)
    setHasMobile(
      typeof window !== 'undefined' &&
      (typeof DeviceMotionEvent !== 'undefined') &&
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    );
  }, []);

  const persist = useCallback((count) => {
    localStorage.setItem(STEP_KEY, String(count));
    localStorage.setItem(DATE_KEY, getTodayStr());
    setSteps(count);
  }, []);

  // ── Step detection algorithm ──────────────────────────────────────────────
  // Uses a simple peak-detection on smoothed accelerometer magnitude.
  // Threshold of ~1.8 m/s² delta above a rolling baseline catches a walking step.
  const handleMotion = useCallback((e) => {
    const a = e.accelerationIncludingGravity || e.acceleration;
    if (!a || a.x == null) return;

    const mag = Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);

    // Low-pass smooth
    if (smoothedMagRef.current === null) smoothedMagRef.current = mag;
    smoothedMagRef.current = smoothedMagRef.current * 0.8 + mag * 0.2;

    if (lastMagRef.current !== null) {
      const delta = mag - lastMagRef.current;
      // Positive peak crossing
      if (delta > 2.2 && !cooldownRef.current) {
        stepsRef.current += 1;
        persist(stepsRef.current);
        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 280);
      }
    }
    lastMagRef.current = mag;
  }, [persist]);

  // ── Start tracking ────────────────────────────────────────────────────────
  const startTracking = useCallback(async () => {
    // iOS 13+ requires explicit permission request
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const result = await DeviceMotionEvent.requestPermission();
        if (result !== 'granted') { setDenied(true); return; }
      } catch {
        setDenied(true);
        return;
      }
    }
    window.addEventListener('devicemotion', handleMotion, { passive: true });
    setTracking(true);
    setDenied(false);
  }, [handleMotion]);

  const stopTracking = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setTracking(false);
  }, [handleMotion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [handleMotion]);

  // ── Manual set ────────────────────────────────────────────────────────────
  const applyManual = () => {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n) && n >= 0) {
      stepsRef.current = n;
      persist(n);
    }
    setEditMode(false);
    setInputVal('');
  };

  const reset = () => {
    stepsRef.current = 0;
    persist(0);
    lastMagRef.current = null;
    smoothedMagRef.current = null;
  };

  // ── Derived display values ────────────────────────────────────────────────
  const pct    = Math.min(steps / GOAL, 1);
  const offset = CIRC * (1 - pct);
  const color  = getStepColor(pct);
  const track  = getTrackColor(pct);
  const kcal   = Math.round(steps * 0.04);           // ~0.04 kcal/step avg
  const km     = (steps * 0.00078).toFixed(1);       // ~0.78 m/step avg

  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Footprints className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Daily Steps</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditMode(true); setInputVal(String(steps)); }}
            className="p-1.5 rounded-xl text-stone-300 hover:text-stone-700 hover:bg-stone-50 transition-all"
            title="Set step count manually"
          >
            <PencilLine className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={reset}
            className="p-1.5 rounded-xl text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all"
            title="Reset today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ring + centre text */}
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width="92" height="92" viewBox="0 0 92 92">
            {/* Track */}
            <circle
              cx="46" cy="46" r={RADIUS}
              fill="none"
              stroke={track}
              strokeWidth="7"
            />
            {/* Progress */}
            <circle
              cx="46" cy="46" r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              transform="rotate(-90 46 46)"
              style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
            />
            {/* Goal tick at 100% (top) */}
            <circle cx="46" cy="8" r="3" fill={pct >= 1 ? color : '#e5e7eb'} />
          </svg>
          {/* Centre labels */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="font-black leading-none text-stone-900"
              style={{ fontSize: steps >= 10000 ? '13px' : steps >= 1000 ? '14px' : '16px' }}
            >
              {steps.toLocaleString()}
            </span>
            <span className="text-[8px] font-bold text-stone-400 mt-0.5 uppercase tracking-wider">
              / {(GOAL / 1000).toFixed(0)}k
            </span>
          </div>
        </div>

        {/* Stats column */}
        <div className="flex-1 space-y-2.5">
          {/* Progress bar label */}
          <div>
            <div className="flex items-end justify-between mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Progress</span>
              <span className="text-[10px] font-bold" style={{ color }}>{Math.round(pct * 100)}%</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct * 100}%`, background: color }}
              />
            </div>
          </div>
          {/* Mini stats */}
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

      {/* Manual edit input */}
      {editMode && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="99999"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyManual(); if (e.key === 'Escape') setEditMode(false); }}
            autoFocus
            placeholder="Enter steps"
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

      {/* Tracking controls */}
      {hasMobile && (
        <div className="mt-3">
          {!tracking ? (
            <button
              onClick={startTracking}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all duration-200 active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" /> Track with phone
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all duration-200 active:scale-95"
            >
              <span className="w-2 h-2 bg-white rounded-sm inline-block" /> Tracking… tap to stop
            </button>
          )}
          {denied && (
            <p className="text-[9px] text-red-400 font-bold text-center mt-2">
              Motion permission denied. Use the pencil icon to enter manually.
            </p>
          )}
        </div>
      )}

      {/* Desktop / non-mobile hint */}
      {!hasMobile && !editMode && (
        <p className="mt-3 text-[9px] text-stone-300 font-bold uppercase tracking-widest text-center">
          Tap ✏ to sync from Health app
        </p>
      )}

      {/* Goal reached badge */}
      {pct >= 1 && (
        <div
          className="mt-3 text-center text-[9px] font-black uppercase tracking-widest rounded-xl py-1.5"
          style={{ background: '#d1fae5', color: '#065f46' }}
        >
          Goal reached! 🎯
        </div>
      )}
    </div>
  );
}
