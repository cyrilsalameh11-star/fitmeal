import { motion } from 'framer-motion';
import { Zap, MapPin, Clock, CreditCard, ExternalLink, Music, Flame, Users } from 'lucide-react';

const STUDIOS = [
  {
    name: 'Dynamo Cycling',
    locations: ['Opéra — 8 Rue de la Michodière, 75002', 'Boétie — 7 Rue La Boétie, 75008'],
    vibe: 'Dark room, club atmosphere, power metrics on screen',
    intensity: 'High',
    sessionLength: '45 min',
    priceRange: '28–35 €/session',
    packageNote: 'Packs of 5 or 10 sessions available at a discount',
    bookingUrl: 'https://dynamo-cycling.com/reservation/',
    color: '#f59e0b',
    colorLight: '#fef3c7',
    highlights: ['Live power output per rider', 'DJ-curated music sets', 'Certified coaches', 'Shoe rental included'],
  },
  {
    name: 'SpaceCycle',
    locations: ['10th — 14 Rue du Faubourg Saint-Martin, 75010'],
    vibe: 'Candlelit studio, immersive sound, rhythm-based coaching',
    intensity: 'High',
    sessionLength: '45 min',
    priceRange: '30–38 €/session',
    packageNote: 'Monthly unlimited memberships available',
    bookingUrl: 'https://www.space-cycle.com/reserve/',
    color: '#6366f1',
    colorLight: '#eef2ff',
    highlights: ['Choreography-led rides', 'Upper body arm tracks', 'Premium sound system', 'Towel & water provided'],
  },
];

const HOW_TO_BOOK = [
  { step: '01', title: 'Create an account', desc: 'Register on the studio website — takes 2 minutes with email or Apple/Google sign-in.' },
  { step: '02', title: 'Pick a session', desc: 'Browse the class schedule, choose your coach and time slot. Spots fill fast on weekday mornings and evenings.' },
  { step: '03', title: 'Select your bike', desc: 'Most studios show a studio map — front rows are more immersive, back rows suit first-timers.' },
  { step: '04', title: 'Pay & confirm', desc: 'Pay per session (single drop-in) or buy a pack of 5–10 for a better rate. Confirmation by email.' },
];

const TIPS = [
  { icon: <Clock size={16} />, text: 'Arrive 10 min early — first-timers get a bike setup walkthrough.' },
  { icon: <Music size={16} />, text: 'Bring headphones? You won\'t need them — the studio sound system is the whole experience.' },
  { icon: <Flame size={16} />, text: 'Expect to burn 400–600 kcal per 45-min session.' },
  { icon: <Users size={16} />, text: 'Classes are capped at 30–40 riders. Weekend slots book out 48h in advance.' },
];

export default function SpinningContent() {
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
          <Zap size={14} /> Indoor Cycling
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
          Paris Spinning<br /><span className="italic font-normal text-stone-400">Studios.</span>
        </h1>
        <p className="text-base md:text-lg text-stone-500 font-medium leading-relaxed">
          High-intensity, music-driven rides in dark studios. The best way to build cardio and burn calories without thinking about it.
        </p>
      </div>

      {/* Studios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {STUDIOS.map((studio, idx) => (
          <motion.div
            key={studio.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-stone-100 rounded-[2rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300"
          >
            {/* Studio header */}
            <div className="px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${studio.colorLight}, #ffffff)` }}>
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: studio.color }}
                >
                  <Zap size={22} className="text-white" />
                </div>
                <a
                  href={studio.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ backgroundColor: studio.color }}
                >
                  Book Now <ExternalLink size={11} />
                </a>
              </div>
              <h2 className="text-2xl font-serif mb-1">{studio.name}</h2>
              <p className="text-sm text-stone-500 font-medium italic">{studio.vibe}</p>
            </div>

            {/* Locations */}
            <div className="px-8 py-5 border-t border-stone-50 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-3">Locations</p>
              {studio.locations.map((loc, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <MapPin size={13} className="text-stone-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-stone-600 font-medium">{loc}</p>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-stone-50 border-t border-stone-50">
              <div className="px-6 py-5 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Intensity</p>
                <p className="text-sm font-black text-stone-800">{studio.intensity}</p>
              </div>
              <div className="px-6 py-5 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Duration</p>
                <p className="text-sm font-black text-stone-800">{studio.sessionLength}</p>
              </div>
              <div className="px-6 py-5 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Price</p>
                <p className="text-sm font-black text-stone-800">{studio.priceRange}</p>
              </div>
            </div>

            {/* Highlights */}
            <div className="px-8 py-6 border-t border-stone-50">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-4">What's included</p>
              <div className="grid grid-cols-2 gap-2">
                {studio.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: studio.color }} />
                    <span className="text-xs text-stone-600 font-medium">{h}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-stone-400 italic">{studio.packageNote}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How to Book */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8 flex items-center gap-2">
          <CreditCard size={12} /> How to book
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_TO_BOOK.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-white border border-stone-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            >
              <p className="text-3xl font-black text-stone-100 mb-3">{item.step}</p>
              <h4 className="text-sm font-black text-stone-800 mb-2 uppercase tracking-wide">{item.title}</h4>
              <p className="text-xs text-stone-500 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-stone-950 rounded-[2.5rem] p-8 md:p-12 space-y-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-2">
          <Zap size={11} className="text-amber-500" /> First-timer tips
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-800 flex items-center justify-center text-amber-400 flex-shrink-0">
                {tip.icon}
              </div>
              <p className="text-sm text-stone-400 font-medium leading-relaxed pt-1">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
