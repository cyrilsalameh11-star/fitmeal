import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

const STORAGE_KEY = 'fitmeal_weekly_calories';
const DAY_KEYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function getTodayKey() {
  return DAY_KEYS[new Date().getDay()];
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function CalorieBar() {
  const [state, setState] = useState(readState);

  useEffect(() => {
    const sync = () => setState(readState());
    window.addEventListener('storage', sync);
    // Also poll every 2s so same-tab logging updates the bar
    const interval = setInterval(sync, 2000);
    return () => { window.removeEventListener('storage', sync); clearInterval(interval); };
  }, []);

  if (!state || !parseInt(state.dailyTarget)) return null;

  const dailyTarget = parseInt(state.dailyTarget);
  const todayKey = getTodayKey();
  const todayConsumed = parseInt(state.days?.[todayKey]?.calories) || 0;
  const pct = Math.min(100, (todayConsumed / dailyTarget) * 100);
  const remaining = dailyTarget - todayConsumed;
  const isOver = todayConsumed > dailyTarget;

  return (
    <div className="bg-stone-950 px-6 py-2.5 flex items-center gap-4">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Flame size={13} className="text-amber-400" />
        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Today</span>
      </div>

      <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 text-[10px] font-black tabular-nums">
        <span className="text-white">{todayConsumed.toLocaleString()}</span>
        <span className="text-stone-600">/</span>
        <span className="text-stone-400">{dailyTarget.toLocaleString()} kcal</span>
        {remaining !== 0 && (
          <span className={`ml-1 ${isOver ? 'text-red-400' : 'text-stone-500'}`}>
            {isOver ? `+${Math.abs(remaining).toLocaleString()} over` : `${remaining.toLocaleString()} left`}
          </span>
        )}
      </div>
    </div>
  );
}

// Exported helper so MealCard can log calories to today
export function logMealToday(mealOrCalories) {
  const state = readState();
  if (!state) return false;
  const key = getTodayKey();

  let addCals = 0, addP = 0, addC = 0, addF = 0;
  if (typeof mealOrCalories === 'number' || typeof mealOrCalories === 'string') {
    addCals = parseInt(mealOrCalories) || 0;
  } else if (mealOrCalories) {
    addCals = parseInt(mealOrCalories.calories) || 0;
    addP = parseInt(mealOrCalories.protein) || 0;
    addC = parseInt(mealOrCalories.carbs) || 0;
    addF = parseInt(mealOrCalories.fat) || 0;
  }

  const currentCals = parseInt(state.days?.[key]?.calories) || 0;
  const currentP = parseInt(state.days?.[key]?.protein) || 0;
  const currentC = parseInt(state.days?.[key]?.carbs) || 0;
  const currentF = parseInt(state.days?.[key]?.fats) || 0;

  state.days[key] = { 
    ...state.days[key], 
    calories: String(currentCals + addCals),
    protein: String(currentP + addP),
    carbs: String(currentC + addC),
    fats: String(currentF + addF)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return true;
}
