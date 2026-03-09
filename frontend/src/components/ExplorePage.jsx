import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ALL_RESTAURANT_DATA from '../data/restaurantData';
import { COUNTRIES, BRANDS } from '../data/metadata';

function AccordionFamily({ brand, items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-stone-100 last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 group hover:bg-stone-50 transition-colors px-4 rounded-xl"
      >
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm border border-stone-100 group-hover:border-amber-200 transition-all">
            <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-stone-800">{brand.name}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{brand.category}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{items.length} Items</p>
          </div>
          {isOpen ? <ChevronUp className="text-stone-300" /> : <ChevronDown className="text-stone-300" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-8 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((meal) => (
                <div key={meal.id} className="bg-stone-50 rounded-2xl p-5 border border-stone-100 hover:border-amber-100 transition-all hover:shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-bold text-stone-800 text-sm leading-tight">{meal.name}</p>
                    <div className="bg-white px-2 py-0.5 rounded-lg border border-stone-100 text-[9px] font-black text-stone-400 shadow-sm">
                      {meal.calories}K
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 mt-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter text-stone-400 mb-1">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fat}g</span>
                      </div>
                      <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${Math.min(100, (meal.protein / 50) * 100)}%` }}
                        />
                      </div>
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-16"
    >
      {/* Header section */}
      <div className="max-w-4xl">
        <h2 className="text-5xl lg:text-7xl mb-6 leading-tight">Brand <span className="italic font-normal text-stone-400">Library.</span></h2>
        <p className="text-xl text-stone-500 font-medium leading-relaxed">
          Access nutrition data for over <span className="text-stone-900 font-bold">600+ items</span> from your favorite local and international brands. Click a brand to explore its macro-calculated menu.
        </p>
      </div>

      {/* Country selection tags */}
      <div className="flex flex-wrap gap-3">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCountry(c.id)}
            className={`px-8 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all ${activeCountry === c.id 
              ? 'bg-stone-900 text-white shadow-xl scale-[1.05]' 
              : 'bg-white border border-stone-100 text-stone-400 hover:border-amber-200'}`}
          >
            <span className="mr-3">{c.flag}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="bg-white border border-stone-100 rounded-[2.5rem] p-4 lg:p-8 shadow-sm overflow-hidden">
        <div className="px-4 py-6 border-b border-stone-50 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300">
            Browsing Database: <span className="text-stone-900">{activeCountry}</span>
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
