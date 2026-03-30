import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, RefreshCw, PlusCircle, Check } from 'lucide-react';
import { useState } from 'react';
import { logMealToday } from './CalorieBar';

export default function MealCard({ meal, index, onShop, onSwap }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [logged, setLogged] = useState(false);
  
  // Calculate macros ratio for the small bars
  const totalMacros = (meal.protein || 0) + (meal.carbs || 0) + (meal.fat || 0);
  const pPct = totalMacros > 0 ? (meal.protein / totalMacros) * 100 : 0;
  const cPct = totalMacros > 0 ? (meal.carbs / totalMacros) * 100 : 0;
  const fPct = totalMacros > 0 ? (meal.fat / totalMacros) * 100 : 0;

  // Source categorization for badges
  const getSourceBadge = () => {
    if (meal.source === 'restaurant') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (meal.source === 'supermarket') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const handleSwapClick = async () => {
    setIsSwapping(true);
    await onSwap();
    setIsSwapping(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-3xl overflow-hidden border border-stone-100 hover:border-amber-200 transition-all duration-300 shadow-sm hover:shadow-xl group relative"
    >
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getSourceBadge()}`}>
              {meal.brand || meal.source}
            </span>
            <h3 className="text-2xl font-serif leading-tight text-stone-800 group-hover:text-stone-900 transition-colors">
              {meal.name}
            </h3>
          </div>
          <button 
            onClick={handleSwapClick}
            disabled={isSwapping}
            className={`p-2 rounded-full border border-stone-100 text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all ${isSwapping ? 'animate-spin' : ''}`}
            title="Swap Meal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-baseline space-x-2">
          <span className="text-5xl font-black text-stone-900 leading-none">
            {meal.calories}
          </span>
          <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Calories</span>
        </div>

        {/* Nutritional Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest leading-none">Protein</p>
            <p className="text-xl font-bold text-stone-800">{meal.protein}g</p>
            <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-stone-800" style={{ width: `${pPct}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest leading-none">Carbs</p>
            <p className="text-xl font-bold text-stone-800">{meal.carbs}g</p>
            <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${cPct}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest leading-none">Fat</p>
            <p className="text-xl font-bold text-stone-800">{meal.fat}g</p>
            <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-stone-300" style={{ width: `${fPct}%` }} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 space-y-3">
          <button
            onClick={() => {
              const ok = logMealToday(meal);
              if (ok) { setLogged(true); setTimeout(() => setLogged(false), 2500); }
            }}
            className={`w-full flex justify-between items-center px-6 py-3.5 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all ${
              logged
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-white hover:bg-amber-400'
            }`}
          >
            <span className="flex items-center">
              {logged ? <Check className="w-4 h-4 mr-3" /> : <PlusCircle className="w-4 h-4 mr-3" />}
              {logged ? 'Logged!' : `Log ${meal.calories} kcal`}
            </span>
          </button>
          <button
            onClick={() => onShop(meal)}
            className="w-full flex justify-between items-center px-6 py-3.5 bg-stone-900 text-white rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-stone-800 transition-all group/btn"
          >
            <span className="flex items-center">
              <ShoppingBag className="w-4 h-4 mr-3" />
              View Resources
            </span>
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
