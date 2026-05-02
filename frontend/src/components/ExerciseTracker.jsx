import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check, X, Pencil, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'fitmeal_exercise_log';
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUICK_TYPES = ['Gym', 'Padel', 'Pilates', 'Running', 'Spinning'];

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Monday of the week containing `d` (treat Sunday as last day, not first)
function startOfWeek(d) {
  const out = new Date(d);
  const day = out.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  out.setDate(out.getDate() + diff);
  out.setHours(0, 0, 0, 0);
  return out;
}

function readLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeLog(log) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)); } catch {}
}

export default function ExerciseTracker() {
  const today = useMemo(() => new Date(), []);
  const todayIso = isoDate(today);
  const weekStart = useMemo(() => startOfWeek(today), [today]);

  const [log, setLog] = useState(readLog);
  const [editingIso, setEditingIso] = useState(null);
  const [draftType, setDraftType] = useState('');

  // Build Mon..Sun for current week
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return { date: d.getDate(), iso: isoDate(d), full: d, abbr: DAY_ABBR[i] };
  }), [weekStart]);

  const doneCount = days.filter(d => log[d.iso]?.exercised).length;
  const pct = Math.round((doneCount / 7) * 100);

  const weekEnd = days[6].full;
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const dateRange = sameMonth
    ? `${SHORT_MONTHS[weekStart.getMonth()]} ${weekStart.getDate()}–${weekEnd.getDate()}`
    : `${SHORT_MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${SHORT_MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}`;

  function openEditor(iso) {
    setEditingIso(iso);
    setDraftType(log[iso]?.type || '');
  }

  function closeEditor() {
    setEditingIso(null);
    setDraftType('');
  }

  function saveEntry(exercised) {
    if (!editingIso) return;
    const next = { ...log };
    if (exercised) {
      next[editingIso] = { exercised: true, type: draftType.trim() };
    } else {
      delete next[editingIso];
    }
    setLog(next);
    writeLog(next);
    closeEditor();
  }

  function removeEntry(iso) {
    const next = { ...log };
    delete next[iso];
    setLog(next);
    writeLog(next);
  }

  const editingEntry = editingIso ? log[editingIso] : null;
  const editingDate = editingIso ? days.find(d => d.iso === editingIso)?.full : null;

  return (
    <div className="relative bg-white border border-orange-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Soft orange backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 pointer-events-none" />

      <div className="relative px-4 sm:px-5 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
              <Flame size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-black uppercase tracking-wider text-gray-900 leading-tight">Weekly Workouts</p>
              <p className="text-[10px] text-gray-500 font-semibold leading-tight mt-0.5">{dateRange}</p>
            </div>
          </div>
          <div className="text-right tabular-nums flex-shrink-0">
            <p className="text-[26px] font-black leading-none bg-gradient-to-br from-orange-600 to-amber-500 bg-clip-text text-transparent">
              {doneCount}<span className="text-gray-300 text-[18px] font-bold">/week</span>
            </p>
            <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 font-bold mt-1">{pct}% complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-orange-100/70 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
          />
        </div>

        {/* 7-day strip */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map(d => {
            const entry = log[d.iso];
            const exercised = !!entry?.exercised;
            const isToday = d.iso === todayIso;
            const isFuture = d.full > today && !isToday;
            const isEditing = editingIso === d.iso;

            return (
              <button
                key={d.iso}
                onClick={() => !isFuture && openEditor(d.iso)}
                disabled={isFuture}
                className={`group relative flex flex-col items-center justify-center aspect-square rounded-xl transition-all duration-200 active:scale-95 ${
                  exercised
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-200 text-white ring-2 ring-orange-200/60'
                    : isFuture
                      ? 'bg-gray-50/70 text-gray-300 cursor-not-allowed'
                      : isEditing
                        ? 'bg-white ring-2 ring-orange-400 shadow-md text-gray-800'
                        : isToday
                          ? 'bg-white ring-2 ring-orange-300 text-gray-800 hover:ring-orange-400 hover:shadow-md'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/40 hover:shadow-sm'
                }`}
                title={entry?.type || (isFuture ? '' : 'Tap to log')}
              >
                <span className={`text-[9px] font-black uppercase tracking-wider ${
                  exercised ? 'text-orange-100' : isFuture ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {d.abbr}
                </span>
                <span className={`text-[18px] font-black leading-none mt-0.5 ${
                  exercised ? 'text-white' : isFuture ? 'text-gray-300' : 'text-gray-800'
                }`}>
                  {d.date}
                </span>
                {exercised && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-white shadow ring-1 ring-orange-100 flex items-center justify-center"
                  >
                    <Check size={11} className="text-orange-500" strokeWidth={3.5} />
                  </motion.div>
                )}
                {isToday && !exercised && (
                  <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Comments preview row */}
        {doneCount > 0 && !editingIso && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {days.filter(d => log[d.iso]?.exercised && log[d.iso]?.type).map(d => (
              <button
                key={d.iso}
                onClick={() => openEditor(d.iso)}
                className="group inline-flex items-center gap-1.5 text-[10.5px] font-bold bg-white border border-orange-200 text-orange-700 pl-2 pr-1 py-1 rounded-full hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                <span className="text-gray-400 font-black uppercase tracking-wider text-[9px]">{d.abbr}</span>
                <span>{log[d.iso].type}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); removeEntry(d.iso); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeEntry(d.iso); } }}
                  className="w-4 h-4 rounded-full bg-orange-50 group-hover:bg-orange-200 text-orange-500 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label={`Remove ${d.abbr} entry`}
                >
                  <X size={10} strokeWidth={3} />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Inline editor */}
        <AnimatePresence>
          {editingIso && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-dashed border-orange-200">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                      {editingDate?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <button
                    onClick={closeEditor}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Quick suggestion chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {QUICK_TYPES.map(t => {
                    const active = draftType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDraftType(t)}
                        className={`text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all ${
                          active
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <Pencil size={13} className="text-orange-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEntry(true);
                      if (e.key === 'Escape') closeEditor();
                    }}
                    placeholder="Or type your own (e.g. Gym - Chest, 5km run)"
                    autoFocus
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => saveEntry(true)}
                    className="flex-1 bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider py-2.5 rounded-xl shadow-md shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} strokeWidth={3.5} />
                    {editingEntry?.exercised ? 'Update workout' : 'Mark as done'}
                  </button>
                  {editingEntry?.exercised && (
                    <button
                      onClick={() => saveEntry(false)}
                      className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 text-xs font-black uppercase tracking-wider px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] flex items-center gap-1.5"
                      title="Remove entry"
                    >
                      <Trash2 size={13} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
