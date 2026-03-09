import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ALL_RESTAURANT_DATA from '../data/restaurantData';

const COUNTRIES = [
  { id: 'France', flag: '🇫🇷', label: 'France' },
  { id: 'Spain', flag: '🇪🇸', label: 'Spain' },
  { id: 'Lebanon', flag: '🇱🇧', label: 'Lebanon' },
  { id: 'USA', flag: '🇺🇸', label: 'USA' },
];

const BRANDS = {
  France: [
    {
      name: "McDonald's France", emoji: '🍔', category: 'Fast Food', color: 'from-yellow-400 to-red-500',
      
    },
    {
      name: 'Burger King France', emoji: '👑', category: 'Fast Food', color: 'from-red-500 to-orange-400',
      
    },
    {
      name: 'KFC France', emoji: '🍗', category: 'Fast Food', color: 'from-red-700 to-red-400',
      
    },
    {
      name: 'Quick', emoji: '⚡', category: 'Fast Food', color: 'from-orange-600 to-yellow-400',
      
    },
    {
      name: 'O\'Tacos', emoji: '🌮', category: 'Fast Food', color: 'from-green-600 to-lime-400',
      
    },
    {
      name: 'Chicken Street', emoji: '🐔', category: 'Fast Food', color: 'from-amber-600 to-orange-400',
      
    },
    {
      name: 'Peppe Chicken', emoji: '🌶️', category: 'Fast Food', color: 'from-red-600 to-amber-500',
      
    },
    {
      name: 'Subway France', emoji: '🥖', category: 'Fast Food', color: 'from-green-500 to-yellow-400',
      
    },
    {
      name: 'Prêt à Manger', emoji: '🥗', category: 'Restaurant', color: 'from-emerald-600 to-teal-400',
      
    },
    {
      name: 'Boulangerie Paul', emoji: '🥐', category: 'Bakery', color: 'from-amber-700 to-amber-400',
      
    },
    {
      name: 'Carrefour', emoji: '🛒', category: 'Supermarket', color: 'from-blue-500 to-blue-700',
      
    },
    {
      name: 'Auchan', emoji: '🏬', category: 'Supermarket', color: 'from-red-500 to-red-700',
      
    },
  ],
  Spain: [
    {
      name: 'VIPS', emoji: '🥩', category: 'Restaurant', color: 'from-orange-500 to-red-400',
      
    },
    {
      name: '100 Montaditos', emoji: '🥖', category: 'Fast Food', color: 'from-amber-500 to-amber-700',
      
    },
    {
      name: 'Goiko', emoji: '🍔', category: 'Restaurant', color: 'from-stone-900 to-stone-600',
      
    },
    {
      name: "McDonald's Spain", emoji: '🍔', category: 'Fast Food', color: 'from-yellow-400 to-red-500',
      
    },
    {
      name: 'KFC Spain', emoji: '🍗', category: 'Fast Food', color: 'from-red-700 to-red-400',
      
    },
    {
      name: 'Telepizza', emoji: '🍕', category: 'Fast Food', color: 'from-red-600 to-orange-500',
      
    },
    {
      name: 'Mercadona', emoji: '🏪', category: 'Supermarket', color: 'from-green-600 to-emerald-400',
      
    },
    {
      name: 'Carrefour Spain', emoji: '🛒', category: 'Supermarket', color: 'from-blue-500 to-blue-700',
      
    },
    {
      name: 'Alcampo', emoji: '🏬', category: 'Supermarket', color: 'from-teal-600 to-cyan-400',
      
    },
  ],
  Lebanon: [
    {
      name: 'Malak al Taouk', emoji: '🐓', category: 'Restaurant', color: 'from-amber-600 to-orange-500',
      
    },
    {
      name: 'Roadster Diner', emoji: '🏁', category: 'Restaurant', color: 'from-red-800 to-stone-700',
      
    },
    {
      name: "McDonald's Lebanon", emoji: '🍔', category: 'Fast Food', color: 'from-yellow-400 to-red-500',
      
    },
    {
      name: 'Zaatar w Zeit', emoji: '🫓', category: 'Restaurant', color: 'from-green-700 to-lime-500',
      
    },
    {
      name: 'Bartartine', emoji: '🥪', category: 'Restaurant', color: 'from-stone-600 to-amber-600',
      
    },
    {
      name: 'Crepaway', emoji: '🥞', category: 'Restaurant', color: 'from-purple-600 to-pink-500',
      
    },
    {
      name: 'Abdallah', emoji: '🧆', category: 'Restaurant', color: 'from-stone-700 to-stone-500',
      
    },
    {
      name: 'Dip n Dip', emoji: '🍫', category: 'Desserts', color: 'from-amber-900 to-stone-700',
      
    },
    {
      name: 'Pinkberry', emoji: '🍦', category: 'Frozen Yogurt', color: 'from-pink-500 to-fuchsia-400',
      
    },
    {
      name: 'Spinneys', emoji: '🛒', category: 'Supermarket', color: 'from-teal-600 to-cyan-400',
      
    },
  ],
  USA: [
    {
      name: 'Chipotle', emoji: '🌯', category: 'Restaurant', color: 'from-red-700 to-orange-500',
      
    },
    {
      name: 'Cava', emoji: '🥙', category: 'Restaurant', color: 'from-sky-600 to-blue-400',
      
    },
    {
      name: 'Five Guys', emoji: '🍟', category: 'Fast Food', color: 'from-red-600 to-red-800',
      
    },
    {
      name: "McDonald's USA", emoji: '🍔', category: 'Fast Food', color: 'from-yellow-400 to-red-500',
      
    },
    {
      name: 'Chick-fil-A', emoji: '🐔', category: 'Fast Food', color: 'from-red-600 to-red-800',
      
    },
    {
      name: 'Sweetgreen', emoji: '🥗', category: 'Restaurant', color: 'from-green-600 to-lime-400',
      
    },
    {
      name: '7-Eleven', emoji: '🏪', category: 'Convenience', color: 'from-green-600 to-red-600',
      
    },
    {
      name: "Trader Joe's", emoji: '🌿', category: 'Supermarket', color: 'from-red-700 to-amber-500',
      
    },
    {
      name: 'Walmart', emoji: '🏬', category: 'Supermarket', color: 'from-blue-600 to-blue-800',
      
    },
    {
      name: 'Whole Foods Market', emoji: '🌿', category: 'Supermarket', color: 'from-green-700 to-emerald-500',
      
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

function AccordionFamily({ brand, items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm transition-all mb-4">
      {/* Accordion Header (Family Line) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-gradient-to-r ${brand.color} p-6 flex flex-row justify-between items-center transition-opacity hover:opacity-95`}
      >
        <div className="flex items-center space-x-4">
          <span className="text-4xl drop-shadow-md">{brand.emoji}</span>
          <div>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">{brand.category}</p>
            <h3 className="text-white font-black text-xl md:text-2xl leading-tight drop-shadow-sm">{brand.name}</h3>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline-block bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {items.length} items
          </span>
          <div className="bg-white/20 backdrop-blur-md rounded-full p-2 text-white shadow-sm transition-transform duration-300">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-white"
          >
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.length === 0 ? (
                <p className="text-stone-500 italic text-sm">No items found for this brand.</p>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="border border-stone-100 rounded-2xl p-4 hover:shadow-md transition-shadow bg-stone-50/50">
                    <p className="font-bold text-stone-900 text-sm mb-3 line-clamp-2">{item.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <MacroPill label="kcal" value={item.calories || item.cal} color="bg-amber-100 text-amber-800" />
                      <MacroPill label="prot" value={`${item.protein}g`} color="bg-blue-100 text-blue-800" />
                      <MacroPill label="carbs" value={`${item.carbs}g`} color="bg-emerald-100 text-emerald-800" />
                      <MacroPill label="fat" value={`${item.fat}g`} color="bg-stone-200 text-stone-700" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExplorePage() {
  const [activeCountry, setActiveCountry] = useState('France');

  const brandMeta = BRANDS[activeCountry] || [];

  return (
    <motion.div
      key="explore"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10 md:space-y-12"
    >
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Global Database</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Explore Menus &amp; <br /><span className="italic font-normal text-stone-400">Track Macros.</span></h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">Browse restaurants, fast-food chains, and supermarkets across 4 countries — with full nutritional breakdowns.</p>
      </div>

      {/* Country Tabs — horizontally scrollable on mobile */}
      <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-hide">
        {COUNTRIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCountry(c.id)}
            className={`flex-shrink-0 flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest border transition-all ${
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

      {/* Accordion Family Layout */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs text-stone-400 font-medium">
            <span className="font-black text-stone-900">{brandMeta.length}</span> brands in {activeCountry}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCountry}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {brandMeta.map((brand) => {
              const itemsForBrand = ALL_RESTAURANT_DATA.filter(m => m.brand === brand.name);
              return <AccordionFamily key={brand.name} brand={brand} items={itemsForBrand} />;
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
