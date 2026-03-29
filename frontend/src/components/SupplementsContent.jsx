import { motion } from 'framer-motion';
import { Zap, ExternalLink, ShieldCheck, Clock, Flame } from 'lucide-react';

const SUPPLEMENTS = [
  {
    id: 'whey',
    name: 'Whey Protein',
    tagline: 'Build & recover faster',
    description: 'Fast-absorbing protein derived from milk. Ideal post-workout to kickstart muscle repair and hit your daily protein targets.',
    color: '#f59e0b',
    colorLight: '#fef3c7',
    macros: { calories: 120, protein: 25, carbs: 3, fat: 2 },
    perServing: '30g scoop',
    timing: 'Within 30 min post-workout',
    dailyDose: '1–2 scoops / day',
    benefits: [
      'Rapid amino acid delivery to muscles',
      'Supports lean muscle growth',
      'Convenient way to hit protein goals',
      'Reduces muscle soreness',
    ],
    tip: 'Mix with water for faster absorption, or with milk for a richer shake. Add a banana for carbs post-training.',
    bulkUrl: 'https://www.bulk.com/fr/proteine/proteine-whey',
  },
  {
    id: 'creatine',
    name: 'Creatine Monohydrate',
    tagline: 'More strength. More reps.',
    description: 'The most researched supplement in sports science. Increases ATP production in muscles — more explosive power, more reps, faster gains.',
    color: '#6366f1',
    colorLight: '#eef2ff',
    macros: null,
    perServing: '5g / day',
    timing: 'Anytime — consistency matters more than timing',
    dailyDose: '5g / day (no loading needed)',
    benefits: [
      'Proven to increase strength & power output',
      'More reps at the same weight',
      'Supports lean muscle volume',
      'Safe for long-term use',
    ],
    tip: 'No need to cycle on/off. Take 5g daily with water — timing doesn\'t matter much. Results appear after 2–4 weeks.',
    bulkUrl: 'https://www.bulk.com/fr/nutrition-sportive/creatine',
  },
];

const STACK_TIPS = [
  { icon: <Flame size={15} />, title: 'Post-workout stack', desc: 'Whey + creatine together right after training. Protein feeds recovery, creatine replenishes ATP stores.' },
  { icon: <ShieldCheck size={15} />, title: 'Consistency > timing', desc: 'Creatine builds up in muscles over weeks. Miss a day? No problem. Just keep the daily habit.' },
  { icon: <Clock size={15} />, title: 'Hydration matters', desc: 'Creatine pulls water into muscle cells. Drink an extra 500ml/day to stay hydrated and avoid cramping.' },
  { icon: <Zap size={15} />, title: 'Real food first', desc: 'Supplements fill gaps — they don\'t replace meals. Hit your protein from food first, use whey to top up.' },
];

function MacroBar({ label, value, max, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">{label}</p>
        <p className="text-xs font-black text-stone-700">{value}g</p>
      </div>
      <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function SupplementsContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-14 pb-20"
    >
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Zap size={14} /> Sports Nutrition
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 leading-tight font-black text-stone-900">
          The essentials.
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl mb-4 leading-tight font-black text-amber-500">
          Whey &amp; Creatine.
        </h2>
        <p className="text-sm md:text-base text-stone-500 font-medium leading-relaxed">
          Two supplements with decades of research behind them. Everything else is noise.
        </p>
      </div>

      {/* Supplement cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {SUPPLEMENTS.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-stone-100 rounded-[2rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300"
          >
            {/* Card header */}
            <div className="px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${s.colorLight}, #ffffff)` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: s.color }}>
                  <Zap size={22} className="text-white" />
                </div>
                <a
                  href={s.bulkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ backgroundColor: s.color }}
                >
                  Shop on Bulk <ExternalLink size={11} />
                </a>
              </div>
              <h2 className="text-2xl font-serif mb-1">{s.name}</h2>
              <p className="text-sm text-stone-500 font-medium italic">{s.tagline}</p>
            </div>

            {/* Description */}
            <div className="px-8 py-5 border-t border-stone-50">
              <p className="text-sm text-stone-600 font-medium leading-relaxed">{s.description}</p>
            </div>

            {/* Dosing row */}
            <div className="grid grid-cols-3 divide-x divide-stone-50 border-t border-stone-50">
              <div className="px-5 py-4 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Serving</p>
                <p className="text-xs font-black text-stone-800">{s.perServing}</p>
              </div>
              <div className="px-5 py-4 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Daily dose</p>
                <p className="text-xs font-black text-stone-800">{s.dailyDose}</p>
              </div>
              <div className="px-5 py-4 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Timing</p>
                <p className="text-xs font-black text-stone-800 leading-tight">{s.timing.split(' ')[0]}</p>
              </div>
            </div>

            {/* Macros (whey only) */}
            {s.macros && (
              <div className="px-8 py-6 border-t border-stone-50 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-4">Per 30g scoop</p>
                <MacroBar label="Protein" value={s.macros.protein} max={30} color={s.color} />
                <MacroBar label="Carbs"   value={s.macros.carbs}   max={30} color="#d97706" />
                <MacroBar label="Fat"     value={s.macros.fat}     max={30} color="#a8a29e" />
                <p className="text-xs text-stone-400 font-medium pt-1">{s.macros.calories} kcal / scoop</p>
              </div>
            )}

            {/* Benefits */}
            <div className="px-8 py-6 border-t border-stone-50">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-4">Why it works</p>
              <div className="space-y-2">
                {s.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-stone-600 font-medium">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="px-8 py-5 border-t border-stone-50 bg-stone-50/50">
              <div className="flex gap-3">
                <Zap size={13} className="flex-shrink-0 mt-0.5" style={{ color: s.color }} />
                <p className="text-xs text-stone-500 font-medium leading-relaxed">{s.tip}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stacking tips */}
      <div className="bg-stone-950 rounded-[2.5rem] p-8 md:p-12 space-y-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-2 mb-2">
            <Zap size={11} className="text-amber-500" /> How to use them together
          </p>
          <h3 className="text-2xl font-serif text-white">The minimal effective stack.</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STACK_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-800 flex items-center justify-center text-amber-400 flex-shrink-0">
                {tip.icon}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-stone-300 mb-1">{tip.title}</p>
                <p className="text-sm text-stone-400 font-medium leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk CTA */}
        <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-black text-sm">Get both on Bulk.com</p>
            <p className="text-stone-500 text-xs font-medium mt-0.5">Good quality, transparent ingredients, ships to France.</p>
          </div>
          <a
            href="https://www.bulk.com/fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-400 transition-colors flex-shrink-0"
          >
            Browse Bulk.com <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
