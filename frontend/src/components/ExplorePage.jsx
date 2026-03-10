import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Utensils, ShoppingCart, IceCream } from 'lucide-react';
import ALL_RESTAURANT_DATA from '../data/restaurantData';
import { COUNTRIES, BRANDS } from '../data/metadata';

const CATEGORY_ICONS = {
  "Fast Food": <Utensils size={14} />,
  "Supermarket": <ShoppingCart size={14} />,
  "Dessert": <IceCream size={14} />,
  "Restaurant": <Utensils size={14} />,
  "Convenience": <ShoppingCart size={14} />
};

const BRAND_COLORS = [
  'border-l-amber-500',
  'border-l-blue-500',
  'border-l-emerald-500',
  'border-l-rose-500',
  'border-l-purple-500',
  'border-l-orange-500',
  'border-l-indigo-500'
];

// Brand color palette for letter avatars (when logo unavailable)
const AVATAR_COLORS = [
  'bg-amber-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-rose-500', 'bg-purple-500', 'bg-orange-500', 'bg-indigo-500'
];

function BrandLogo({ brand, index }) {
  const [failed, setFailed] = useState(false);
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initial = brand.name.charAt(0).toUpperCase();

  if (failed) {
    return (
      <div className={`w-full h-full rounded-lg ${colorClass} flex items-center justify-center text-white font-black text-lg`}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={brand.logo}
      alt={brand.name}
      className="w-full h-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function BrandLine({ brand, items, index }) {
  const [isOpen, setIsOpen] = useState(false);
  const colorClass = BRAND_COLORS[index % BRAND_COLORS.length];

  return (
    <div className={`mb-4 bg-white border border-stone-100 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-lg ring-1 ring-stone-100' : 'hover:border-stone-200 shadow-sm'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 border-l-4 ${colorClass} transition-colors ${isOpen ? 'bg-stone-50/50' : ''}`}
      >
        <div className="flex items-center space-x-5">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-stone-50 group-hover:scale-110 transition-transform">
            <BrandLogo brand={brand} index={index} />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-stone-800 tracking-tight">{brand.name}</h3>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-stone-300">{CATEGORY_ICONS[brand.category] || <Utensils size={14} />}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">{brand.category}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 opacity-60">{items.length} Options</p>
          </div>
          <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-stone-900 text-white rotate-180' : 'bg-stone-50 text-stone-300'}`}>
            <ChevronDown size={16} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-stone-50"
          >
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-gradient-to-b from-stone-50/30 to-white">
              {items.map((meal) => (
                <div key={meal.id} className="group bg-white rounded-2xl p-5 border border-stone-100 hover:border-amber-200 transition-all hover:shadow-md relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-bold text-stone-800 text-sm leading-snug pr-8">{meal.name}</p>
                    <div className="absolute top-4 right-4 bg-stone-50 px-2 py-1 rounded-lg border border-stone-100 text-[10px] font-black text-stone-500 shadow-sm group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-colors">
                      {meal.calories}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex space-x-3">
                        <div className="text-center">
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-tighter">Prot</p>
                          <p className="text-xs font-bold text-stone-700">{meal.protein}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-tighter">Carb</p>
                          <p className="text-xs font-bold text-stone-700">{meal.carbs}g</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-tighter">Fat</p>
                          <p className="text-xs font-bold text-stone-700">{meal.fat}g</p>
                        </div>
                      </div>
                    </div>

                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (meal.protein / 50) * 100)}%` }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 pb-20"
    >
      {/* Premium Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-6xl font-serif tracking-tight">Global <span className="italic font-normal text-stone-400 text-5xl lg:text-7xl">Catalog.</span></h2>
        <p className="text-lg text-stone-500 font-medium max-w-2xl mx-auto">
          Explore nutritional signatures for <span className="text-stone-900 border-b-2 border-amber-200">630+ real-world items</span> across top restaurant and grocery families.
        </p>
      </div>

      {/* Country Selection - Premium Tabs */}
      <div className="flex justify-center flex-wrap gap-4">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCountry(c.id)}
            className={`flex items-center space-x-3 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeCountry === c.id
              ? 'bg-stone-900 text-white shadow-2xl scale-105 ring-4 ring-stone-100'
              : 'bg-white border border-stone-100 text-stone-400 hover:text-stone-600 hover:border-stone-300 shadow-sm'}`}
          >
            <span className="text-lg">{c.flag}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Brand Lines Layout */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCountry}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 gap-1"
          >
            {brandMeta.map((brand, idx) => {
              // Smart matching: Filter by country AND brand name (partial match for suffixes)
              const itemsForBrand = ALL_RESTAURANT_DATA.filter(m =>
                m.country === activeCountry &&
                m.brand.toLowerCase().includes(brand.name.toLowerCase())
              );

              return (
                <BrandLine
                  key={brand.name}
                  brand={brand}
                  items={itemsForBrand}
                  index={idx}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
