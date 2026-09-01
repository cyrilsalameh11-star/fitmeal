import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Trash2, Utensils } from 'lucide-react';

const STORAGE_KEY = 'fitmeal_weekly_calories';
const DAY_KEYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const SHORT_DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Local-time YYYY-MM-DD (no UTC drift)
function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function todayIso() { return isoDate(new Date()); }

// Module-level state: resets to today on every page load
let _selectedDate = new Date();

export function getSelectedDate() { return _selectedDate; }
export function setSelectedDate(date) {
  _selectedDate = date;
  window.dispatchEvent(new Event('fitmeal-day-change'));
}
function getSelectedDayKey() {
  return DAY_KEYS[_selectedDate.getDay()];
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Nudge listeners inside the same tab (storage event only fires cross-tab).
  window.dispatchEvent(new Event('fitmeal-day-change'));
}

export default function CalorieBar() {
  const [state, setState]       = useState(readState);
  const [selectedDate, setSelDate] = useState(getSelectedDate);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const sync = () => { setState(readState()); setSelDate(getSelectedDate()); };
    window.addEventListener('storage', sync);
    window.addEventListener('fitmeal-day-change', sync);
    const interval = setInterval(sync, 2000);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('fitmeal-day-change', sync);
      clearInterval(interval);
    };
  }, []);

  // Body scroll lock + Esc close for the items modal.
  useEffect(() => {
    if (!showItems) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowItems(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [showItems]);

  const hasTarget = state && parseInt(state.dailyTarget);
  const dayKey = DAY_KEYS[selectedDate.getDay()];
  const day = state?.days?.[dayKey] || {};
  const consumed = parseInt(day.calories) || 0;
  const protein  = parseInt(day.protein)  || 0;
  const carbs    = parseInt(day.carbs)    || 0;
  const fats     = parseInt(day.fats)     || 0;
  const items    = Array.isArray(day.items) ? day.items : [];
  const dailyTarget = hasTarget ? parseInt(state.dailyTarget) : 0;
  const pct = dailyTarget > 0 ? Math.min(100, (consumed / dailyTarget) * 100) : 0;
  const remaining = dailyTarget - consumed;
  const isOver = consumed > dailyTarget && dailyTarget > 0;

  const isToday = isoDate(selectedDate) === todayIso();
  const label = isToday
    ? "Today's calories"
    : `${SHORT_DAYS[selectedDate.getDay()]} ${selectedDate.getDate()} ${SHORT_MONTHS[selectedDate.getMonth()]}`;

  const handleRemove = (itemId) => {
    removeMealItem(itemId, dayKey);
    // Local state refresh via the writeState -> event fires -> sync runs.
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowItems(true)}
        className={`w-full text-left relative ${isToday ? 'bg-gray-950' : 'bg-amber-950/40'} border-b border-gray-800 px-3 sm:px-5 py-2.5 hover:bg-gray-900 active:bg-gray-900 transition-colors cursor-pointer`}
        title="Tap to see items logged"
      >
        {/* Top row */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Flame size={13} className="text-amber-400" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-300 whitespace-nowrap">
              {label}
            </span>
            {items.length > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 tabular-nums">
                {items.length}
              </span>
            )}
          </div>

          {hasTarget ? (
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : (
            <div className="flex-1 h-2 bg-gray-800 rounded-full" />
          )}

          {hasTarget ? (
            <div className="flex items-center gap-1.5 flex-shrink-0 tabular-nums">
              <span className="text-white text-xs sm:text-sm font-bold">{consumed.toLocaleString()}</span>
              <span className="text-gray-600 text-[10px]">/</span>
              <span className="text-gray-400 text-[10px] sm:text-xs font-semibold">{dailyTarget.toLocaleString()}</span>
              {remaining !== 0 && (
                <span className={`hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-md ${isOver ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
                  {isOver ? `+${Math.abs(remaining).toLocaleString()} over` : `${remaining.toLocaleString()} left`}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] font-semibold text-amber-400/80 flex-shrink-0 whitespace-nowrap">
              ↗ Set weekly target
            </span>
          )}
        </div>

        {/* Macros row */}
        {hasTarget && (
          <div className="flex items-center justify-end gap-2.5 mt-1 text-[10px] font-bold tabular-nums">
            <span className="text-emerald-400">P <span className="text-emerald-300">{protein}g</span></span>
            <span className="text-gray-700">·</span>
            <span className="text-amber-400">C <span className="text-amber-300">{carbs}g</span></span>
            <span className="text-gray-700">·</span>
            <span className="text-purple-400">F <span className="text-purple-300">{fats}g</span></span>
          </div>
        )}
      </button>

      {/* ── Items slider modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showItems && (
          <motion.div
            key="items-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setShowItems(false)}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Logged {isToday ? 'today' : `on ${label.replace("Today's calories", '')}`}
                  </p>
                  <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                    {items.length > 0
                      ? `${items.length} item${items.length === 1 ? '' : 's'} · ${consumed.toLocaleString()} kcal`
                      : 'Nothing logged yet'}
                  </p>
                </div>
                <button
                  onClick={() => setShowItems(false)}
                  aria-label="Close"
                  className="p-2 -mr-1 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body: horizontal slider of item cards */}
              {items.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Utensils size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">
                    Log a meal from the Scanner, Explore or Meal Plan pages, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto overflow-y-hidden [scrollbar-width:thin]">
                  <div className="flex gap-3 p-5 min-w-min">
                    {items.slice().reverse().map((item) => (
                      <ItemCard key={item.id} item={item} onRemove={() => handleRemove(item.id)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Footer totals */}
              {items.length > 0 && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold tabular-nums">
                  <span className="text-gray-500 uppercase tracking-wider">Day totals</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900">{consumed.toLocaleString()} kcal</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-emerald-600">P {protein}g</span>
                    <span className="text-amber-600">C {carbs}g</span>
                    <span className="text-purple-600">F {fats}g</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single item card in the slider — image OR emoji fallback, dish + macros + delete
// ─────────────────────────────────────────────────────────────────────────────
function ItemCard({ item, onRemove }) {
  const dish = item.dish || item.name || 'Meal';
  const kcal = Math.round(item.calories || 0);
  const p = Math.round(item.protein || 0);
  const c = Math.round(item.carbs || 0);
  const f = Math.round(item.fat || item.fats || 0);
  const hasImage = !!item.image;

  return (
    <div className="group relative flex-shrink-0 w-48 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image / fallback banner */}
      <div className="relative w-full h-32 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <img src={item.image} alt={dish} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl select-none">{item.emoji || '🍽️'}</span>
        )}
        <button
          onClick={onRemove}
          aria-label={`Remove ${dish}`}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-gray-500 flex items-center justify-center shadow transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.25rem]">
          {dish}
        </p>
        {item.servingSize && (
          <p className="text-[10px] text-gray-500 truncate">{item.servingSize}</p>
        )}
        <div className="flex items-baseline justify-between pt-1 border-t border-gray-100">
          <span className="text-base font-bold text-gray-900 tabular-nums">{kcal}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">kcal</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold tabular-nums">
          <span className="text-emerald-600">P {p}g</span>
          <span className="text-amber-600">C {c}g</span>
          <span className="text-purple-600">F {f}g</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API — log / remove meals against the currently-selected day
// ─────────────────────────────────────────────────────────────────────────────

// Logs a meal (or bare kcal number) to the currently-selected day. Adds to the
// day's macro totals AND appends to the per-day items list so the slider can
// show it with a delete button.
export function logMealToday(mealOrCalories) {
  const state = readState();
  if (!state) return false;
  const key = getSelectedDayKey();

  let addCals = 0, addP = 0, addC = 0, addF = 0;
  let itemMeta = null;
  if (typeof mealOrCalories === 'number' || typeof mealOrCalories === 'string') {
    addCals = parseInt(mealOrCalories) || 0;
    itemMeta = { dish: 'Manual entry' };
  } else if (mealOrCalories) {
    addCals = parseInt(mealOrCalories.calories) || 0;
    addP = parseInt(mealOrCalories.protein) || 0;
    addC = parseInt(mealOrCalories.carbs) || 0;
    addF = parseInt(mealOrCalories.fat) || 0;
    itemMeta = mealOrCalories;
  }

  const currentDay = state.days?.[key] || {};
  const currentCals = parseInt(currentDay.calories) || 0;
  const currentP = parseInt(currentDay.protein) || 0;
  const currentC = parseInt(currentDay.carbs) || 0;
  const currentF = parseInt(currentDay.fats) || 0;
  const currentItems = Array.isArray(currentDay.items) ? currentDay.items : [];

  const newItem = {
    id: `itm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    dish: itemMeta?.dish || itemMeta?.name || 'Meal',
    calories: addCals,
    protein: addP,
    carbs: addC,
    fat: addF,
    servingSize: itemMeta?.servingSize || null,
    image: itemMeta?.image || itemMeta?.photoUrl || null,
    emoji: itemMeta?.emoji || null,
    source: itemMeta?.source || itemMeta?.brand || null,
  };

  state.days = state.days || {};
  state.days[key] = {
    ...currentDay,
    calories: String(currentCals + addCals),
    protein:  String(currentP + addP),
    carbs:    String(currentC + addC),
    fats:     String(currentF + addF),
    items:    [...currentItems, newItem],
  };
  writeState(state);
  return true;
}

// Remove a specific item from a day and subtract its macros from the totals.
// Exported so any component can drop a logged item, but the modal in this
// file is the primary caller.
export function removeMealItem(itemId, dayKey = getSelectedDayKey()) {
  const state = readState();
  if (!state?.days?.[dayKey]) return false;
  const day = state.days[dayKey];
  const items = Array.isArray(day.items) ? day.items : [];
  const target = items.find(i => i.id === itemId);
  if (!target) return false;

  const currentCals = parseInt(day.calories) || 0;
  const currentP = parseInt(day.protein) || 0;
  const currentC = parseInt(day.carbs) || 0;
  const currentF = parseInt(day.fats) || 0;

  state.days[dayKey] = {
    ...day,
    calories: String(Math.max(0, currentCals - (target.calories || 0))),
    protein:  String(Math.max(0, currentP - (target.protein || 0))),
    carbs:    String(Math.max(0, currentC - (target.carbs || 0))),
    fats:     String(Math.max(0, currentF - (target.fat || 0))),
    items:    items.filter(i => i.id !== itemId),
  };
  writeState(state);
  return true;
}
