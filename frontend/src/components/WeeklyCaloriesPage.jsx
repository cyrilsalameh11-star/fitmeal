import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const DAYS = [
  { key: 'lundi',    label: 'Lundi' },
  { key: 'mardi',    label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi',    label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi',   label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
];

const STORAGE_KEY = 'fitmeal_weekly_calories';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getDefaultState() {
  const days = {};
  DAYS.forEach(d => { days[d.key] = { calories: '', protein: '', carbs: '', fats: '', checked: false }; });
  return { dailyTarget: '', days };
}

export default function WeeklyCaloriesPage() {
  const [state, setState] = useState(() => loadState() || getDefaultState());
  const [showTargetInput, setShowTargetInput] = useState(!state.dailyTarget);

  const dailyTarget = parseInt(state.dailyTarget) || 0;
  const weeklyTarget = dailyTarget * 7;

  // Total consumed so far (only checked days)
  const totalConsumed = DAYS.reduce((sum, d) => {
    const day = state.days[d.key];
    return sum + (day.checked ? (parseInt(day.calories) || 0) : 0);
  }, 0);

  // Running weekly remaining = weekly target - sum of all logged days (checked or not)
  const totalLogged = DAYS.reduce((sum, d) => {
    return sum + (parseInt(state.days[d.key].calories) || 0);
  }, 0);

  const weeklyRemaining = weeklyTarget - totalLogged;

  useEffect(() => { saveState(state); }, [state]);

  function setDailyTarget(val) {
    setState(s => ({ ...s, dailyTarget: val }));
  }

  function setDayCalories(key, val) {
    setState(s => ({
      ...s,
      days: { ...s.days, [key]: { ...s.days[key], calories: val } }
    }));
  }

  function setDayMacro(key, field, val) {
    setState(s => ({
      ...s,
      days: { ...s.days, [key]: { ...s.days[key], [field]: val } }
    }));
  }

  function toggleDay(key) {
    setState(s => ({
      ...s,
      days: { ...s.days, [key]: { ...s.days[key], checked: !s.days[key].checked } }
    }));
  }

  function resetWeek() {
    setState(s => {
      const days = {};
      DAYS.forEach(d => { days[d.key] = { calories: '', protein: '', carbs: '', fats: '', checked: false }; });
      return { ...s, days };
    });
  }

  // Running remaining after each day (for the arrow display)
  function remainingAfterDay(dayIndex) {
    let consumed = 0;
    for (let i = 0; i <= dayIndex; i++) {
      consumed += parseInt(state.days[DAYS[i].key].calories) || 0;
    }
    return weeklyTarget - consumed;
  }

  const checkedCount = DAYS.filter(d => state.days[d.key].checked).length;
  const progressPct = weeklyTarget > 0 ? Math.min(100, (totalLogged / weeklyTarget) * 100) : 0;

  return (
    <motion.div
      key="weekly"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 pb-20 px-4"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl lg:text-5xl font-serif tracking-tight text-stone-900">
          Weekly <span className="italic font-normal text-stone-400">Calories.</span>
        </h2>
        <p className="text-stone-500 font-medium">Track your daily intake against your weekly calorie goal.</p>
      </div>

      {/* Daily Target Card */}
      <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
        <button
          onClick={() => setShowTargetInput(v => !v)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center">
              <Target size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Daily Target</p>
              <p className="text-xl font-bold text-stone-900">
                {dailyTarget > 0 ? `${dailyTarget.toLocaleString()} kcal / day` : 'Set your target'}
              </p>
            </div>
          </div>
          {showTargetInput ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
        </button>

        {showTargetInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-4 pt-4 border-t border-stone-50"
          >
            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2 block">
              Daily calorie target (kcal)
            </label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={state.dailyTarget}
                onChange={e => setDailyTarget(e.target.value)}
                placeholder="e.g. 1300"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3 text-lg font-bold text-stone-800 focus:ring-2 focus:ring-amber-200 outline-none"
              />
              {dailyTarget > 0 && (
                <button
                  onClick={() => setShowTargetInput(false)}
                  className="px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-colors"
                >
                  Set
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Weekly Summary */}
      {dailyTarget > 0 && (
        <div className="bg-stone-900 text-white rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Weekly Objective</p>
              <p className="text-2xl font-black">
                {dailyTarget.toLocaleString()}<span className="text-stone-400 text-base font-bold"> kcal × 7 = </span>
                {weeklyTarget.toLocaleString()} <span className="text-stone-400 text-base font-bold">kcal</span>
              </p>
            </div>
            <button
              onClick={resetWeek}
              className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors"
              title="Reset week"
            >
              <RotateCcw size={16} className="text-stone-400" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
              <span>{totalLogged.toLocaleString()} kcal logged</span>
              <span>{Math.max(0, weeklyRemaining).toLocaleString()} remaining</span>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full ${progressPct >= 100 ? 'bg-red-400' : 'bg-amber-500'}`}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
            <span className="text-white">{checkedCount}</span>
            <span>/ 7 days completed</span>
          </div>
        </div>
      )}

      {/* Day Cards */}
      <div className="space-y-3">
        {DAYS.map((day, idx) => {
          const dayData = state.days[day.key];
          const consumed = parseInt(dayData.calories) || 0;
          const isOver = dailyTarget > 0 && consumed > dailyTarget;
          const remaining = remainingAfterDay(idx);
          const hasCalories = dayData.calories !== '';

          return (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`bg-white border rounded-2xl p-5 transition-all ${
                dayData.checked
                  ? 'border-amber-200 shadow-md ring-1 ring-amber-100'
                  : 'border-stone-100 hover:border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-start mt-1 space-x-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleDay(day.key)}
                  className="flex-shrink-0"
                >
                  {dayData.checked
                    ? <CheckCircle2 size={28} className="text-amber-500" fill="currentColor" />
                    : <Circle size={28} className="text-stone-200" />
                  }
                </button>

                {/* Day label */}
                <div className="w-24 flex-shrink-0">
                  <p className="font-black text-stone-800 text-base">{day.label}</p>
                  {dailyTarget > 0 && (
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      / {dailyTarget.toLocaleString()} kcal
                    </p>
                  )}
                </div>

                {/* Calorie & Macro inputs */}
                <div className="flex-1 space-y-2">
                  <input
                    type="number"
                    value={dayData.calories || ''}
                    onChange={e => setDayCalories(day.key, e.target.value)}
                    placeholder="xxxx kcal"
                    className={`w-full bg-stone-50 border rounded-xl px-4 py-2.5 text-base font-bold outline-none focus:ring-2 transition-all ${
                      isOver
                        ? 'border-red-200 text-red-600 focus:ring-red-100'
                        : 'border-stone-100 text-stone-800 focus:ring-amber-100'
                    }`}
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-stone-300 transition-all">
                      <span className="text-[10px] font-black text-stone-500 mr-1">P</span>
                      <input
                        type="number"
                        value={dayData.protein || ''}
                        onChange={e => setDayMacro(day.key, 'protein', e.target.value)}
                        placeholder="0"
                        className="w-full min-w-0 bg-transparent text-xs font-bold text-stone-800 outline-none placeholder:text-stone-300"
                      />
                    </div>
                    <div className="flex items-center bg-amber-50/50 border border-amber-200 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-amber-300 transition-all">
                      <span className="text-[10px] font-black text-amber-500 mr-1">C</span>
                      <input
                        type="number"
                        value={dayData.carbs || ''}
                        onChange={e => setDayMacro(day.key, 'carbs', e.target.value)}
                        placeholder="0"
                        className="w-full min-w-0 bg-transparent text-xs font-bold text-amber-900 outline-none placeholder:text-amber-300/60"
                      />
                    </div>
                    <div className="flex items-center bg-stone-100/50 border border-stone-200 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-stone-300 transition-all">
                      <span className="text-[10px] font-black text-stone-400 mr-1">F</span>
                      <input
                        type="number"
                        value={dayData.fats || ''}
                        onChange={e => setDayMacro(day.key, 'fats', e.target.value)}
                        placeholder="0"
                        className="w-full min-w-0 bg-transparent text-xs font-bold text-stone-600 outline-none placeholder:text-stone-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Remaining arrow */}
                {dailyTarget > 0 && hasCalories && (
                  <div className="flex-shrink-0 text-right min-w-[80px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Remaining</p>
                    <p className={`text-sm font-black ${remaining < 0 ? 'text-red-500' : 'text-stone-700'}`}>
                      → {remaining >= 0 ? remaining.toLocaleString() : `-${Math.abs(remaining).toLocaleString()}`} kcal
                    </p>
                  </div>
                )}
              </div>

              {/* Over budget warning */}
              {isOver && (
                <p className="mt-2 ml-[136px] text-[11px] font-bold text-red-500 uppercase tracking-widest">
                  +{(consumed - dailyTarget).toLocaleString()} kcal over target
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer tip */}
      {dailyTarget > 0 && totalLogged > 0 && (
        <div className="text-center py-4">
          <p className="text-stone-400 text-sm font-medium">
            {weeklyRemaining > 0
              ? `${weeklyRemaining.toLocaleString()} kcal left for the week — keep going!`
              : `You've reached your weekly target of ${weeklyTarget.toLocaleString()} kcal.`}
          </p>
        </div>
      )}
    </motion.div>
  );
}
