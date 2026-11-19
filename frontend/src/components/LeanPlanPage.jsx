import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Flame, CalendarDays, Utensils, Pizza, Drumstick, Coffee, Moon,
  Footprints, Dumbbell, TrendingDown, Brain, Scale, ExternalLink, CheckCircle2,
  XCircle, ChefHat, Sandwich, Info,
} from 'lucide-react';

const SOURCE_URL = 'https://www.youtube.com/watch?v=oc2E7TfpJ18';

// Approximate values (±10%). Brands and countries vary; scan the real packet.
const FOOD = {
  coffee:   { name: '3-in-1 coffee sachet',                  kcal: 70,  p: 1,  c: 12, f: 2 },
  biscuit:  { name: 'Chocolate digestive',                   kcal: 85,  p: 1,  c: 11, f: 4 },
  skyr:     { name: 'Skyr 0% (150 g pot)',                   kcal: 95,  p: 16, c: 6,  f: 0 },
  whey:     { name: 'Whey protein, 1 scoop',                 kcal: 120, p: 24, c: 3,  f: 2 },
  banana:   { name: 'Banana',                                kcal: 105, p: 1,  c: 27, f: 0 },
  crispy:   { name: 'Air-fryer crispy chicken (180 g breast)', kcal: 355, p: 47, c: 21, f: 8 },
  rice:     { name: 'Rice, cooked (150 g)',                  kcal: 195, p: 4,  c: 42, f: 0 },
  salad:    { name: 'Side salad + 1 tsp olive oil',          kcal: 60,  p: 1,  c: 4,  f: 5 },
  dcheese:  { name: "McDonald's Double Cheese",              kcal: 450, p: 26, c: 33, f: 23 },
  fries:    { name: "McDonald's small fries",                kcal: 230, p: 3,  c: 29, f: 11 },
  tartare:  { name: 'Sauce tartare, 1 portion',              kcal: 80,  p: 0,  c: 2,  f: 8 },
  tender:   { name: 'KFC Tender (crispy strip)',             kcal: 125, p: 12, c: 7,  f: 6 },
  pizza:    { name: 'Pepperoni pizza, 1 slice (1/8 medium)', kcal: 230, p: 10, c: 25, f: 10 },
  chips:    { name: 'Chips, small bag (~27 g)',              kcal: 145, p: 2,  c: 14, f: 9 },
  magnum:   { name: 'Mini Magnum',                           kcal: 160, p: 2,  c: 15, f: 10 },
  zero:     { name: 'Coke Zero',                             kcal: 0,   p: 0,  c: 0,  f: 0 },
};

const TARGETS = {
  training: { kcal: 1950, p: 140, c: 210, f: 60 },
  rest:     { kcal: 1600, p: 140, c: 135, f: 55 },
};

// [time, label, [[foodKey, qty], ...]]
const DAYS = {
  wed: {
    tab: 'Wednesday', type: 'training', title: 'Gym 7:00 + McDo lunch',
    meals: [
      ['6:20', 'Pre-workout', [['coffee', 1], ['biscuit', 2]]],
      ['7:00', 'Gym: Full body (45 min)', []],
      ['8:15', 'Post-workout', [['skyr', 1], ['whey', 1], ['banana', 1]]],
      ['12:30', 'Lunch: the McDo order', [['dcheese', 1], ['fries', 1], ['tartare', 1], ['zero', 1]]],
      ['20:00', 'Dinner', [['crispy', 1], ['rice', 1]]],
      ['22:00', 'Evening', [['skyr', 1]]],
    ],
  },
  sat: {
    tab: 'Saturday', type: 'training', title: 'Gym 9:00 + pizza night',
    meals: [
      ['8:20', 'Pre-workout', [['coffee', 1], ['biscuit', 2]]],
      ['9:00', 'Gym: Lower body + abs (45 min)', []],
      ['10:30', 'Post-workout', [['skyr', 1], ['whey', 1], ['banana', 1]]],
      ['13:30', 'Lunch', [['crispy', 1], ['salad', 1]]],
      ['17:00', 'Snack', [['skyr', 1]]],
      ['20:30', 'Pizza night: half a medium', [['pizza', 4], ['zero', 1]]],
    ],
  },
  sun: {
    tab: 'Sunday', type: 'training', title: 'Gym 10:00 + Sunday night treat',
    meals: [
      ['9:15', 'Pre-workout', [['coffee', 1], ['biscuit', 2]]],
      ['10:00', 'Gym: Upper body (45 min)', []],
      ['11:30', 'Post-workout', [['skyr', 1], ['whey', 1], ['banana', 1]]],
      ['14:00', 'Lunch', [['crispy', 1], ['rice', 1]]],
      ['16:30', 'Snack', [['skyr', 1]]],
      ['19:30', 'Dinner: KFC', [['tender', 3], ['zero', 1]]],
      ['21:30', 'Sunday night treat', [['chips', 1], ['magnum', 1]]],
    ],
  },
  rest: {
    tab: 'Rest day', type: 'rest', title: 'Mon · Tue · Thu · Fri',
    meals: [
      ['9:00', 'Coffee break', [['coffee', 1], ['biscuit', 1]]],
      ['13:00', 'Lunch: KFC', [['tender', 4], ['zero', 1]]],
      ['16:30', 'Snack', [['skyr', 1], ['whey', 1]]],
      ['20:00', 'Dinner', [['crispy', 1], ['rice', 1], ['salad', 1]]],
      ['22:00', 'Evening', [['biscuit', 1]]],
    ],
  },
};

const WEEK = [
  { d: 'Mon', type: 'rest' },
  { d: 'Tue', type: 'rest' },
  { d: 'Wed', type: 'training', gym: '7:00', what: 'Full body', extra: 'McDo lunch' },
  { d: 'Thu', type: 'rest' },
  { d: 'Fri', type: 'rest' },
  { d: 'Sat', type: 'training', gym: '9:00', what: 'Lower + abs', extra: 'Pizza night' },
  { d: 'Sun', type: 'training', gym: '10:00', what: 'Upper', extra: 'Sunday treat' },
];

const FAVOURITES = [
  {
    icon: Sandwich, name: "McDonald's", when: 'Lunch on a gym day (Wednesday)',
    order: 'Double Cheese + small fries + 1 sauce tartare + Coke Zero',
    numbers: '≈ 760 kcal · 29 g protein',
    skip: 'Medium/large fries, a 2nd sauce, McFlurry, regular soda: +200 to 400 kcal you won\'t even notice eating.',
  },
  {
    icon: Pizza, name: 'Pepperoni pizza', when: 'Saturday night, after training',
    order: 'Half a medium (4 slices), thin crust if they have it, Coke Zero',
    numbers: '≈ 920 kcal · 40 g protein',
    skip: 'The whole pizza, garlic bread on the side. Pepperoni beats 4 fromages: similar calories, a bit more protein.',
  },
  {
    icon: Drumstick, name: 'KFC / Wingstop', when: 'Any day, lunch or dinner',
    order: 'KFC: 3-4 Tenders. Wingstop: 6 classic wings + 1 dip',
    numbers: 'KFC 4 Tenders ≈ 500 kcal · 48 g protein',
    skip: 'Buckets, large fries, 2+ dips. Tenders give the most protein per calorie of any fried chicken.',
  },
  {
    icon: ChefHat, name: 'Crispy chicken at home', when: 'Your default dinner',
    order: '180 g chicken breast, egg white, 25 g crushed cornflakes, oil spray, air fryer 12 min at 200°C',
    numbers: '≈ 355 kcal · 47 g protein',
    skip: 'Deep frying. Same crunch, about a third of the fat of takeaway fried chicken.',
  },
  {
    icon: Coffee, name: '3-in-1 coffee + chocolate digestives', when: 'Every day',
    order: '1 sachet + 2 biscuits. On gym days this IS your pre-workout',
    numbers: '≈ 240 kcal · fast sugar + caffeine',
    skip: 'Eating from the open pack. Take 2 out, put the pack away.',
  },
];

const PROGRAM = [
  {
    day: 'Wednesday 7:00', name: 'Full body', exercises: [
      ['Dumbbell Goblet Squat', '3 × 8-12'],
      ['Incline Dumbbell Press', '3 × 8-12'],
      ['Lat Pulldown', '3 × 8-12'],
      ['Seated Leg Curl', '2 × 10-15'],
      ['Cable Lateral Raise', '2 × 12-15'],
      ['Cable Crunch', '2 × 10-15'],
    ],
  },
  {
    day: 'Saturday 9:00', name: 'Lower body + abs', exercises: [
      ['Leg Press', '3 × 8-12'],
      ['Seated Leg Curl', '3 × 10-12'],
      ['Leg Extension', '2 × 12-15'],
      ['Standing Calf Raise', '3 × 12-15'],
      ['Cable Crunch', '3 × 10-15'],
    ],
  },
  {
    day: 'Sunday 10:00', name: 'Upper body', exercises: [
      ['Machine Chest Press', '3 × 8-12'],
      ['Seated Cable Row', '3 × 8-12'],
      ['Machine Shoulder Press', '2 × 8-12'],
      ['Cable Lateral Raise', '2 × 12-15'],
      ['Tricep Rope Pushdown', '2 × 10-15'],
      ['Dumbbell Bicep Curl', '2 × 10-15'],
    ],
  },
];

const MINDSET = [
  ['Structure beats willpower', 'Willpower runs out by Sunday night. A plan that already includes the pizza doesn\'t.'],
  ['Nothing is banned', 'Every food you love has a slot. Banning it is how cravings win.'],
  ['The weekend is where your favourites live', 'Not where you "fall off". That\'s exactly what went wrong for Matt before.'],
  ['You\'re not a robot', 'Chicken and rice 7 days a week works for about 10 days.'],
  ['Get stronger, not more tired', 'Few hard sets, more weight over time. Volume doesn\'t build muscle in a deficit, recovery does.'],
  ['One bad meal is one bad meal', 'Never "start again Monday". The next meal is normal.'],
];

function totals(meals) {
  return meals.reduce((t, [, , items]) => {
    for (const [key, qty] of items) {
      const food = FOOD[key];
      t.kcal += food.kcal * qty;
      t.p += food.p * qty;
      t.c += food.c * qty;
      t.f += food.f * qty;
    }
    return t;
  }, { kcal: 0, p: 0, c: 0, f: 0 });
}

function SectionTitle({ step, icon: Icon, title, sub }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-10 h-10 rounded-2xl bg-gray-900 text-amber-400 flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Step {step}</p>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{title}</h2>
        {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.35 }}
      className={`bg-white border border-gray-100 rounded-2xl p-5 sm:p-7 shadow-sm ${className}`}
    >
      {children}
    </motion.section>
  );
}

function MacroRow({ t, target }) {
  const cells = [
    ['kcal', t.kcal, target?.kcal, 'text-gray-900'],
    ['Protein', `${t.p} g`, target && `${target.p} g`, 'text-emerald-600'],
    ['Carbs', `${t.c} g`, target && `${target.c} g`, 'text-amber-600'],
    ['Fat', `${t.f} g`, target && `${target.f} g`, 'text-purple-600'],
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {cells.map(([label, val, tgt, color]) => (
        <div key={label} className="bg-gray-50 rounded-xl px-2 py-2.5 text-center">
          <p className={`text-base sm:text-lg font-bold tabular-nums ${color}`}>{typeof val === 'number' ? val.toLocaleString() : val}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
          {tgt && <p className="text-[10px] text-gray-400 tabular-nums mt-0.5">target {typeof tgt === 'number' ? tgt.toLocaleString() : tgt}</p>}
        </div>
      ))}
    </div>
  );
}

export default function LeanPlanPage() {
  const [dayTab, setDayTab] = useState('wed');
  const day = DAYS[dayTab];
  const dayTotals = totals(day.meals);

  return (
    <motion.div
      key="plan"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      {/* Hero */}
      <div className="bg-gray-950 text-white rounded-2xl p-6 sm:p-9 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-3">Your lean plan · ~100 days</p>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
          Lean, without giving up <span className="italic font-normal text-gray-400">the food you love.</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mt-4 max-w-2xl leading-relaxed">
          The exact method Carter Stockman used to get his client Matt lean in 90 days, rebuilt around you:
          177 cm, 69 kg, 3 gym days, 10k steps, and McDo, pizza, KFC and Sunday-night ice cream still on the menu.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
          {[
            ['Now', '69 kg'],
            ['Goal', '62-64 kg · 12%'],
            ['Pace', '~0.5 kg / week'],
            ['Timeline', '~14 weeks'],
          ].map(([k, v]) => (
            <div key={k} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{k}</p>
              <p className="text-sm sm:text-base font-bold mt-0.5">{v}</p>
            </div>
          ))}
        </div>
        <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-5 text-[11px] font-semibold text-gray-400 hover:text-white transition-colors">
          Original video: "How My Client Got LEAN in 90 Days" <ExternalLink size={11} />
        </a>
      </div>

      {/* 1. Numbers */}
      <Card>
        <SectionTitle step={1} icon={Flame} title="Your numbers"
          sub="Matt: maintenance 3,000, minus 500. A moderate deficit, never a crash diet." />
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
          <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>Your 2,000 is almost certainly your sedentary maintenance.</strong> At 177 cm and 69 kg that's what the
            calculator gives with no activity. You walk 10k steps and lift 3 times a week, so you really burn around
            <strong> 2,300-2,500</strong>. Doing "2,000 minus 500" would put you ~900 under: the crash diet the video warns
            against. So the plan applies Matt's −500 to what you actually burn, and Step 8 corrects it within 2 weeks if it's off.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['Gym days', 'Wed · Sat · Sun', TARGETS.training],
            ['Rest days', 'Mon · Tue · Thu · Fri', TARGETS.rest],
          ].map(([label, days, t]) => (
            <div key={label} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-3">
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-[11px] text-gray-400 font-semibold">{days}</p>
              </div>
              <MacroRow t={t} />
            </div>
          ))}
        </div>
        <ul className="mt-5 space-y-2 text-sm text-gray-600">
          <li><strong className="text-gray-900">Protein 140 g every day</strong> (2 g/kg, Matt's 0.9 g per pound): keeps your muscle while the fat comes off.</li>
          <li><strong className="text-gray-900">More carbs on gym days</strong>: they fuel the session, like Matt's pre-workout carbs.</li>
          <li><strong className="text-gray-900">Fat never below ~55 g</strong>: enough for your hormones.</li>
          <li>Weekly average ≈ <strong className="text-gray-900">1,750 kcal/day</strong>.</li>
        </ul>
      </Card>

      {/* 2. Week */}
      <Card>
        <SectionTitle step={2} icon={CalendarDays} title="Your week" sub="Your 3 gym slots carry the higher calories, and your favourite meals." />
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEK.map((w) => {
            const gym = w.type === 'training';
            return (
              <div key={w.d} className={`rounded-xl p-2 sm:p-3 text-center ${gym ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${gym ? 'text-amber-400' : 'text-gray-400'}`}>{w.d}</p>
                {gym ? (
                  <>
                    <Dumbbell size={14} className="mx-auto my-1.5 text-amber-400" />
                    <p className="text-[10px] sm:text-xs font-bold leading-tight">{w.gym}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 leading-tight mt-0.5 hidden sm:block">{w.what}</p>
                    <p className="text-[9px] sm:text-[10px] text-amber-300 leading-tight mt-1 hidden sm:block">{w.extra}</p>
                  </>
                ) : (
                  <>
                    <Footprints size={14} className="mx-auto my-1.5 text-gray-400" />
                    <p className="text-[10px] sm:text-xs font-semibold leading-tight">Rest</p>
                  </>
                )}
                <p className={`text-[9px] sm:text-[10px] tabular-nums mt-1 ${gym ? 'text-gray-400' : 'text-gray-400'}`}>
                  {(gym ? TARGETS.training : TARGETS.rest).kcal.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Sample days */}
      <Card>
        <SectionTitle step={3} icon={Utensils} title="A day of eating"
          sub="Matt's plan had a set daily structure with options at every meal. Here's yours, with totals that actually add up." />
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-4">
          {Object.entries(DAYS).map(([key, d]) => (
            <button key={key} onClick={() => setDayTab(key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                dayTab === key ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {d.tab}
            </button>
          ))}
        </div>
        <p className="text-sm font-bold text-gray-900 mb-3">{day.title}</p>
        <ol className="space-y-2 mb-4">
          {day.meals.map(([time, label, items]) => {
            const t = totals([[time, label, items]]);
            const isGym = items.length === 0;
            return (
              <li key={time + label} className={`flex gap-3 rounded-xl p-3 ${isGym ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                <span className={`w-11 flex-shrink-0 text-xs font-bold tabular-nums ${isGym ? 'text-amber-400' : 'text-gray-400'}`}>{time}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-sm font-bold ${isGym ? 'text-white' : 'text-gray-900'}`}>{label}</p>
                    {!isGym && (
                      <p className="text-[11px] tabular-nums text-gray-500 whitespace-nowrap">
                        {t.kcal} kcal · <span className="text-emerald-600 font-semibold">{t.p} g P</span>
                      </p>
                    )}
                  </div>
                  {!isGym && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {items.map(([key, qty]) => `${qty > 1 ? `${qty} × ` : ''}${FOOD[key].name}`).join(' + ')}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <MacroRow t={dayTotals} target={TARGETS[day.type]} />
      </Card>

      {/* 4. Favourites */}
      <Card>
        <SectionTitle step={4} icon={Pizza} title="Your favourites, structured"
          sub="Matt kept Jersey Mike's, BBQ and burgers. The trick was knowing exactly what to order." />
        <div className="grid sm:grid-cols-2 gap-3">
          {FAVOURITES.map((fav) => {
            const Icon = fav.icon;
            return (
              <div key={fav.name} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-amber-500" />
                  <p className="font-bold text-gray-900">{fav.name}</p>
                </div>
                <p className="text-[11px] font-semibold text-amber-600 mb-2">{fav.when}</p>
                <p className="text-sm text-gray-700 flex gap-1.5 mb-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />{fav.order}
                </p>
                <p className="text-xs font-bold text-gray-900 tabular-nums mb-2 ml-5">{fav.numbers}</p>
                <p className="text-xs text-gray-500 flex gap-1.5">
                  <XCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />{fav.skip}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 5. Sunday night */}
      <Card className="border-indigo-100">
        <SectionTitle step={5} icon={Moon} title="Sunday night game plan"
          sub="Matt had a drinking game plan for nights out, because that's where he used to fall off. Yours is Sunday night." />
        <ol className="space-y-2.5 text-sm text-gray-700">
          {[
            ['It\'s planned, not a cheat.', '1 small bag of chips + 1 mini Magnum ≈ 300 kcal, already counted in your Sunday.'],
            ['Buy single-serve packs only.', 'The family bag is how 300 kcal turns into 900.'],
            ['Bowl, sofa, no bag in your lap.', 'Pour it, put the rest away, then sit down.'],
            ['Protein first.', 'By the treat you\'ve had ~150 g of protein, so you\'re not starving for it.'],
            ['If it goes over, nothing happens.', 'No guilt, no "Monday reset". Monday is a normal rest day.'],
          ].map(([k, v], i) => (
            <li key={k} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span><strong className="text-gray-900">{k}</strong> {v}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* 6. Cardio */}
      <Card>
        <SectionTitle step={6} icon={Footprints} title="Cardio: almost none" sub="Matt did 10k steps and an optional 20-minute incline walk. No running, no HIIT." />
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="font-bold text-emerald-900">10k steps, every day</p>
            <p className="text-emerald-800/80 text-xs mt-1">You already do it. ≈ 350-400 kcal a day, zero extra hunger.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-bold text-gray-900">Optional: 20 min zone 2</p>
            <p className="text-gray-500 text-xs mt-1">Incline treadmill after lifting, at a pace where you can still talk.</p>
          </div>
          <div className="bg-rose-50 rounded-xl p-4">
            <p className="font-bold text-rose-900">Skip hard cardio</p>
            <p className="text-rose-800/80 text-xs mt-1">It burns more, then makes you hungrier and you eat it back.</p>
          </div>
        </div>
      </Card>

      {/* 7. Training */}
      <Card>
        <SectionTitle step={7} icon={Dumbbell} title="Training: 3 × 45 min, low volume"
          sub="Matt got stronger on every lift in a deficit by doing less, not more." />
        <div className="grid md:grid-cols-3 gap-3 mb-5">
          {PROGRAM.map((s) => (
            <div key={s.day} className="border border-gray-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{s.day}</p>
              <p className="font-bold text-gray-900 mb-3">{s.name}</p>
              <ul className="space-y-1.5">
                {s.exercises.map(([name, sets]) => (
                  <li key={name} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-gray-700">{name}</span>
                    <span className="text-xs font-bold text-gray-900 tabular-nums whitespace-nowrap">{sets}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p><strong className="text-gray-900">How to progress.</strong> Pick a weight where you reach the bottom of the rep range with 1-2 reps left.
            Add reps each session. When every set hits the top of the range, add the smallest step (+1 to 2 kg, or the next dumbbell).</p>
          <p><strong className="text-gray-900">Log every session</strong> in Exercise → Gym → Working Weight. If most lifts go up, you're keeping your muscle.</p>
          <p><strong className="text-gray-900">Abs:</strong> the cable crunches make them thicker, but only the diet makes them visible.</p>
        </div>
      </Card>

      {/* 8. Check-ins */}
      <Card>
        <SectionTitle step={8} icon={TrendingDown} title="Weekly check-in" sub="This is what corrects the calorie guess from Step 1." />
        <ul className="space-y-2 text-sm text-gray-700 mb-4">
          <li><strong className="text-gray-900">Weigh every morning</strong>, after the toilet, before food. Only the 7-day average counts.</li>
          <li><strong className="text-gray-900">Every Sunday</strong>: waist at the belly button, and photos every 2 weeks (same light, same time).</li>
        </ul>
        <div className="grid sm:grid-cols-3 gap-2 text-sm">
          <div className="bg-emerald-50 rounded-xl p-3"><p className="font-bold text-emerald-900">−0.4 to −0.7 kg/week</p><p className="text-xs text-emerald-800/80 mt-1">Perfect. Change nothing.</p></div>
          <div className="bg-amber-50 rounded-xl p-3"><p className="font-bold text-amber-900">Less than −0.3 for 2 weeks</p><p className="text-xs text-amber-800/80 mt-1">Drop 150 kcal on rest days: skip the rice at dinner.</p></div>
          <div className="bg-rose-50 rounded-xl p-3"><p className="font-bold text-rose-900">Faster than −0.8 kg/week</p><p className="text-xs text-rose-800/80 mt-1">Add 150 kcal. Losing too fast costs muscle.</p></div>
        </div>
      </Card>

      {/* 9. Reality check */}
      <Card>
        <SectionTitle step={9} icon={Scale} title="About 62 kg, 12% and jacked" sub="Worth knowing before you start, so you don't chase the wrong number." />
        <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <p>62 kg at 12% body fat means about <strong className="text-gray-900">54.5 kg of lean mass</strong>.</p>
          <p>If you're around <strong className="text-gray-900">20% fat now</strong>, you have ~55 kg of lean mass and you'll land at 12% right around
            62-63 kg, as long as you keep your muscle. If you're closer to <strong className="text-gray-900">17-18%</strong>, you'll hit 12% at about 64 kg.
            Stop there: going down to 62 would mean losing muscle.</p>
          <p><strong className="text-gray-900">The real goal is your abs and your waist, not the scale.</strong> Getting lean makes you look bigger.
            The extra size comes after, with a slow lean bulk once you're at 12%.</p>
        </div>
      </Card>

      {/* 10. Mindset */}
      <Card>
        <SectionTitle step={10} icon={Brain} title="The rules that make it stick" sub="Why Matt could keep going for 90 days instead of 10." />
        <div className="grid sm:grid-cols-2 gap-3">
          {MINDSET.map(([k, v]) => (
            <div key={k} className="flex gap-2.5">
              <Target size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700"><strong className="text-gray-900">{k}.</strong> {v}</p>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-center text-[11px] text-gray-400 px-4">
        Calories are approximate (±10%) and vary by country and brand. Scan the real packets with the Food Scanner to log them exactly.
      </p>
    </motion.div>
  );
}
