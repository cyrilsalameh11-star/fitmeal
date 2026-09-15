import { useState, useEffect } from 'react';
import { getSelectedDate, setSelectedDate } from './CalorieBar';

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function WeekStrip() {
  const today = new Date();
  const [selectedIso, setSelectedIso] = useState(() => isoDate(getSelectedDate()));

  useEffect(() => {
    const sync = () => setSelectedIso(isoDate(getSelectedDate()));
    window.addEventListener('fitmeal-day-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('fitmeal-day-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Monday to Sunday of the current week. Storage is keyed by weekday name,
  // so each key must map to exactly one date in the strip.
  const mondayOffset = (today.getDay() + 6) % 7;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - mondayOffset + i);
    return { date: d.getDate(), dayIdx: d.getDay(), iso: isoDate(d), full: d };
  });

  const todayIsoStr = isoDate(today);

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-3">
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const isSelected = d.iso === selectedIso;
          const isToday = d.iso === todayIsoStr;
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(d.full)}
              className={`flex flex-col items-center py-2 rounded-xl transition-all active:scale-95 ${
                isSelected
                  ? 'bg-gray-900 shadow-md'
                  : isToday
                    ? 'border border-gray-300 hover:bg-gray-50'
                    : 'hover:bg-gray-50'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                isSelected ? 'text-amber-300' : 'text-gray-400'
              }`}>
                {DAY_ABBR[d.dayIdx]}
              </span>
              <span className={`text-[18px] font-bold leading-tight mt-0.5 ${
                isSelected ? 'text-white' : 'text-gray-800'
              }`}>
                {d.date}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
