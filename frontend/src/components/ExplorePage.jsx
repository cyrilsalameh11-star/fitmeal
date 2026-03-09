import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTRIES = [
  { id: 'France', flag: '🇫🇷', label: 'France' },
  { id: 'Spain', flag: '🇪🇸', label: 'Spain' },
  { id: 'Lebanon', flag: '🇱🇧', label: 'Lebanon' },
  { id: 'USA', flag: '🇺🇸', label: 'USA' },
];

const BRANDS = {
  France: [
    {
      name: "McDonald's France",
      emoji: '🍔',
      category: 'Fast Food',
      color: 'from-yellow-400 to-red-500',
      items: [
        { name: 'Big Mac', cal: 508, protein: 27, carbs: 43, fat: 25 },
        { name: 'McWrap Poulet', cal: 498, protein: 31, carbs: 44, fat: 21 },
        { name: 'Salade Caesar Poulet', cal: 405, protein: 27, carbs: 20, fat: 24 },
        { name: 'Filet-O-Fish', cal: 327, protein: 15, carbs: 35, fat: 14 },
      ],
    },
    {
      name: 'Burger King France',
      emoji: '👑',
      category: 'Fast Food',
      color: 'from-red-500 to-orange-400',
      items: [
        { name: 'Whopper', cal: 629, protein: 28, carbs: 49, fat: 35 },
        { name: 'Steakhouse Burger', cal: 829, protein: 40, carbs: 56, fat: 50 },
        { name: 'Cheddar Lover', cal: 640, protein: 30, carbs: 42, fat: 38 },
      ],
    },
    {
      name: 'KFC France',
      emoji: '🍗',
      category: 'Fast Food',
      color: 'from-red-700 to-red-400',
      items: [
        { name: 'Boxmaster', cal: 657, protein: 36, carbs: 56, fat: 33 },
        { name: 'Tenders x5', cal: 464, protein: 37, carbs: 32, fat: 21 },
        { name: 'Twister Poulet', cal: 498, protein: 26, carbs: 50, fat: 21 },
      ],
    },
    {
      name: 'Prêt à Manger',
      emoji: '🥗',
      category: 'Restaurant',
      color: 'from-emerald-600 to-teal-400',
      items: [
        { name: 'Bowl Protéiné Quinoa', cal: 490, protein: 38, carbs: 42, fat: 14 },
        { name: 'Sandwich Poulet Avocat', cal: 430, protein: 28, carbs: 36, fat: 18 },
        { name: 'Bowl Saumon Riz Noir', cal: 510, protein: 32, carbs: 50, fat: 20 },
      ],
    },
    {
      name: 'Carrefour',
      emoji: '🛒',
      category: 'Supermarket',
      color: 'from-blue-500 to-blue-700',
      items: [
        { name: 'Escalope de Poulet', cal: 165, protein: 31, carbs: 1, fat: 4 },
        { name: 'Filet de Saumon', cal: 208, protein: 22, carbs: 0, fat: 13 },
        { name: 'Skyr Nature', cal: 68, protein: 11, carbs: 5, fat: 0 },
      ],
    },
  ],
  Spain: [
    {
      name: 'VIPS',
      emoji: '🥩',
      category: 'Restaurant',
      color: 'from-orange-500 to-red-400',
      items: [
        { name: 'BBQ Ribs (Half)', cal: 550, protein: 52, carbs: 2, fat: 37 },
        { name: 'Pechugas con Cottage', cal: 298, protein: 43, carbs: 14, fat: 8 },
        { name: 'Ensalada Cesar', cal: 460, protein: 25, carbs: 34, fat: 25 },
        { name: 'Burger Pampera', cal: 850, protein: 40, carbs: 52, fat: 55 },
      ],
    },
    {
      name: '100 Montaditos',
      emoji: '🥖',
      category: 'Fast Food',
      color: 'from-amber-500 to-amber-700',
      items: [
        { name: 'Montadito Pollo Kebab', cal: 240, protein: 12, carbs: 28, fat: 9 },
        { name: 'Montadito Club', cal: 190, protein: 9, carbs: 22, fat: 8 },
        { name: 'Montadito Lacón y Queso', cal: 160, protein: 7, carbs: 20, fat: 6 },
      ],
    },
    {
      name: 'Goiko',
      emoji: '🍔',
      category: 'Restaurant',
      color: 'from-stone-900 to-stone-600',
      items: [
        { name: 'Kevin Bacon Burger', cal: 1100, protein: 55, carbs: 45, fat: 75 },
      ],
    },
    {
      name: 'Mercadona',
      emoji: '🏪',
      category: 'Supermarket',
      color: 'from-green-600 to-emerald-400',
      items: [
        { name: 'Pechuga de Pollo', cal: 110, protein: 24, carbs: 0, fat: 2 },
        { name: 'Salmón Atlántico', cal: 208, protein: 20, carbs: 0, fat: 14 },
        { name: 'Yogur Proteico (0%)', cal: 65, protein: 10, carbs: 5, fat: 0 },
      ],
    },
  ],
  Lebanon: [
    {
      name: 'Malak al Taouk',
      emoji: '🐓',
      category: 'Restaurant',
      color: 'from-amber-600 to-orange-500',
      items: [
        { name: 'Classic Tawouk Sandwich', cal: 650, protein: 45, carbs: 55, fat: 28 },
        { name: 'Franji Tawouk (Baguette)', cal: 580, protein: 42, carbs: 50, fat: 22 },
        { name: 'Tawouk Platter', cal: 950, protein: 55, carbs: 70, fat: 45 },
        { name: 'Malak Burger', cal: 850, protein: 35, carbs: 65, fat: 50 },
      ],
    },
    {
      name: 'Crepaway',
      emoji: '🥞',
      category: 'Restaurant',
      color: 'from-purple-600 to-pink-500',
      items: [
        { name: 'Chicken Sub', cal: 510, protein: 36, carbs: 48, fat: 18 },
        { name: 'Beatrice Crepe', cal: 540, protein: 32, carbs: 45, fat: 26 },
        { name: 'Salad Caesar', cal: 420, protein: 28, carbs: 18, fat: 24 },
        { name: 'Magali Crepe (Dessert)', cal: 450, protein: 6, carbs: 58, fat: 22 },
      ],
    },
    {
      name: 'Abdallah',
      emoji: '🧆',
      category: 'Restaurant',
      color: 'from-stone-700 to-stone-500',
      items: [
        { name: 'Shish Taouk Platter', cal: 550, protein: 42, carbs: 50, fat: 22 },
        { name: 'Kofta Platter', cal: 580, protein: 38, carbs: 35, fat: 32 },
        { name: 'Hummus with Meat', cal: 450, protein: 22, carbs: 28, fat: 28 },
        { name: 'Assorted Baklava', cal: 240, protein: 3, carbs: 32, fat: 12 },
      ],
    },
    {
      name: 'Spinneys',
      emoji: '🛒',
      category: 'Supermarket',
      color: 'from-teal-600 to-cyan-400',
      items: [
        { name: 'Chicken Breast (100g)', cal: 120, protein: 26, carbs: 0, fat: 2 },
        { name: 'Greek Yoghurt', cal: 100, protein: 9, carbs: 4, fat: 5 },
        { name: 'Labneh (100g)', cal: 170, protein: 8, carbs: 4, fat: 14 },
      ],
    },
  ],
  USA: [
    {
      name: 'Chipotle',
      emoji: '🌯',
      category: 'Restaurant',
      color: 'from-red-700 to-orange-500',
      items: [
        { name: 'Chicken Burrito Bowl', cal: 660, protein: 52, carbs: 70, fat: 18 },
      ],
    },
    {
      name: 'Sweetgreen',
      emoji: '🥗',
      category: 'Restaurant',
      color: 'from-green-600 to-lime-400',
      items: [
        { name: 'Harvest Bowl', cal: 705, protein: 36, carbs: 68, fat: 34 },
      ],
    },
    {
      name: "McDonald's USA",
      emoji: '🍔',
      category: 'Fast Food',
      color: 'from-yellow-400 to-red-500',
      items: [
        { name: 'Quarter Pounder w/ Cheese', cal: 520, protein: 30, carbs: 42, fat: 26 },
      ],
    },
    {
      name: 'Chick-fil-A',
      emoji: '🐔',
      category: 'Fast Food',
      color: 'from-red-600 to-red-800',
      items: [
        { name: 'Chicken Sandwich', cal: 440, protein: 28, carbs: 41, fat: 19 },
      ],
    },
    {
      name: 'Whole Foods Market',
      emoji: '🌿',
      category: 'Supermarket',
      color: 'from-green-700 to-emerald-500',
      items: [
        { name: 'Organic Chicken Breast', cal: 165, protein: 31, carbs: 0, fat: 4 },
        { name: 'Wild Salmon Fillet', cal: 208, protein: 25, carbs: 0, fat: 11 },
        { name: 'Greek Yogurt (Plain)', cal: 100, protein: 17, carbs: 6, fat: 1 },
      ],
    },
  ],
};

function MacroPill({ label, value, color }) {
  return (
    <span className={`inline-flex flex-col items-center px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${color}`}>
      <span className="text-[11px] font-black">{value}</span>
      <span className="opacity-70">{label}</span>
    </span>
  );
}

function BrandCard({ brand, reverse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-shadow ${reverse ? 'lg:grid-flow-col-dense' : ''}`}
    >
      {/* Brand Identity Panel */}
      <div className={`bg-gradient-to-br ${brand.color} p-10 flex flex-col justify-between min-h-[200px] ${reverse ? 'lg:order-2' : ''}`}>
        <div>
          <span className="text-4xl">{brand.emoji}</span>
          <div className="mt-4">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{brand.category}</p>
            <h3 className="text-white font-black text-2xl leading-tight">{brand.name}</h3>
          </div>
        </div>
        <p className="text-white/50 text-xs font-semibold mt-6">{brand.items.length} items available</p>
      </div>

      {/* Menu Items Panel */}
      <div className={`bg-white p-8 space-y-4 ${reverse ? 'lg:order-1' : ''}`}>
        {brand.items.map((item, i) => (
          <div key={i} className="border-b border-stone-50 pb-4 last:border-0 last:pb-0">
            <p className="font-bold text-stone-900 text-sm mb-2">{item.name}</p>
            <div className="flex flex-wrap gap-1.5">
              <MacroPill label="kcal" value={item.cal} color="bg-amber-50 text-amber-800" />
              <MacroPill label="prot" value={`${item.protein}g`} color="bg-blue-50 text-blue-800" />
              <MacroPill label="carbs" value={`${item.carbs}g`} color="bg-emerald-50 text-emerald-800" />
              <MacroPill label="fat" value={`${item.fat}g`} color="bg-stone-100 text-stone-700" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [activeCountry, setActiveCountry] = useState('France');
  const brands = BRANDS[activeCountry] || [];

  return (
    <motion.div
      key="explore"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Global Database</p>
        <h1 className="text-5xl lg:text-6xl mb-4 leading-tight">Explore Menus &amp; <br /><span className="italic font-normal text-stone-400">Track Macros.</span></h1>
        <p className="text-lg text-stone-500 font-medium">Browse available restaurants, fast-food chains, and supermarkets across 4 countries — with full nutritional breakdowns.</p>
      </div>

      {/* Country Tabs */}
      <div className="flex flex-wrap gap-3">
        {COUNTRIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCountry(c.id)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest border transition-all ${
              activeCountry === c.id
                ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-[1.03]'
                : 'bg-white text-stone-500 border-stone-200 hover:border-amber-200'
            }`}
          >
            <span className="text-xl">{c.flag}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Z-Layout Brand Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCountry}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {brands.map((brand, idx) => (
            <BrandCard key={brand.name} brand={brand} reverse={idx % 2 === 1} />
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
