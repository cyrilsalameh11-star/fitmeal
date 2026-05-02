import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check, X, Pencil } from 'lucide-react';

const STORAGE_KEY = 'fitmeal_exercise_log';
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

  const editingEntry = editingIso ? log[editingIso] : null;
  const editingDate = editingIso ? days.find(d => d.iso === editingIso)?.full : null;

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 border border-orange-200 rounded-2xl px-4 py-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
            <Flame size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Weekly Exercise</p>
            <p className="text-[10px] text-gray-500 font-medium">Tap a day to log your workout</p>
          </div>
        </div>
        <div className="text-right tabular-nums">
          <p className="text-2xl font-black leading-none bg-gradient-to-br from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {doneCount}<span className="text-gray-400 text-base font-bold">/7</span>
          </p>
          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mt-0.5">days</p>
        </div>
      </div>

      {/* 7-day strip */}
      <div className="grid grid-cols-7 gap-1.5">
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
              className={`relative flex flex-col items-center py-2 rounded-xl transition-all active:scale-95 ${
                exercised
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-md text-white'
                  : isFuture
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : isEditing
                      ? 'bg-white border-2 border-orange-400 text-gray-800'
                      : isToday
                        ? 'bg-white border-2 border-orange-300 text-gray-800 hover:border-orange-400'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/50'
              }`}
            >
              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                exercised ? 'text-orange-100' : isFuture ? 'text-gray-300' : 'text-gray-400'
              }`}>
                {d.abbr}
              </span>
              <span className={`text-[16px] font-bold leading-tight mt-0.5 ${
                exercised ? 'text-white' : isFuture ? 'text-gray-300' : 'text-gray-800'
              }`}>
                {d.date}
              </span>
              {exercised && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <Check size={10} className="text-orange-500" strokeWidth={3} />
                </div>
              )}
              {isToday && !exercised && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Comments preview row */}
      {doneCount > 0 && !editingIso && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {days.filter(d => log[d.iso]?.exercised && log[d.iso]?.type).map(d => (
            <span
              key={d.iso}
              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-orange-200 text-orange-700 px-2 py-1 rounded-full"
            >
              <span className="text-gray-400">{d.abbr}</span>
              {log[d.iso].type}
            </span>
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
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                  {editingDate?.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
                <button
                  onClick={closeEditor}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Pencil size={14} className="text-orange-500 flex-shrink-0" />
                <input
                  type="text"
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEntry(true);
                    if (e.key === 'Escape') closeEditor();
                  }}
                  placeholder="What did you do? (e.g. Gym - Chest, Padel, 5km run)"
                  autoFocus
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={() => saveEntry(true)}
                  className="flex-1 bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider py-2 rounded-lg shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Check size={14} strokeWidth={3} />
                  {editingEntry?.exercised ? 'Update' : 'Mark exercised'}
                </button>
                {editingEntry?.exercised && (
                  <button
                    onClick={() => saveEntry(false)}
                    className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-all active:scale-[0.98]"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
