import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

// For Nano Banana 2 & Stitch MCP - We use an idealized placeholder system
// You can drop generated images into src/assets/generated/
export default function MealCard({ meal, index, onShop }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate macros ratio for the small bars
  const totalMacros = meal.macros.protein + meal.macros.carbs + meal.macros.fat;
  const pPct = (meal.macros.protein / totalMacros) * 100;
  const cPct = (meal.macros.carbs / totalMacros) * 100;
  const fPct = (meal.macros.fat / totalMacros) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="glass rounded-3xl overflow-hidden relative group cursor-pointer border border-white/50 hover:border-purple-300/50 transition-all duration-300 shadow-lg hover:shadow-2xl"
    >
      {/* 
        Nano Banana 2 Placeholder Area 
        This div is perfectly sized for 4:3 generated images 
      */}
      <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-50 relative overflow-hidden">
        {meal.image ? (
            <img src={meal.image} alt={meal.title} className="w-full h-full object-cover" />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40 mix-blend-overlay group-hover:scale-110 transition-transform duration-500">
              {meal.title.toLowerCase().includes('poulet') ? '🍗' : '🥗'}
            </div>
        )}
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm border border-white/40">
          {meal.source.brand}
        </div>
      </div>

      <div className="p-6 relative bg-white/40 backdrop-blur-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
          {meal.title}
        </h3>
        
        <div className="flex items-end space-x-2 mb-6">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            {meal.macros.calories}
          </span>
          <span className="text-sm font-medium text-gray-500 mb-1">kcal</span>
        </div>

        {/* Macros */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-medium">
            <div className="flex flex-col">
              <span className="text-blue-500">{meal.macros.protein}g</span>
              <span className="text-gray-400 text-xs">Protein</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-amber-500">{meal.macros.carbs}g</span>
              <span className="text-gray-400 text-xs">Carbs</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-rose-500">{meal.macros.fat}g</span>
              <span className="text-gray-400 text-xs">Fat</span>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <motion.div initial={{width: 0}} animate={{width: `${pPct}%`}} transition={{duration: 1, delay: 0.2}} className="bg-blue-500 h-full" />
            <motion.div initial={{width: 0}} animate={{width: `${cPct}%`}} transition={{duration: 1, delay: 0.2}} className="bg-amber-500 h-full" />
            <motion.div initial={{width: 0}} animate={{width: `${fPct}%`}} transition={{duration: 1, delay: 0.2}} className="bg-rose-500 h-full" />
          </div>
        </div>
        
        {/* Shopping Action */}
        <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
            className="mt-4 pt-4 border-t border-gray-200/50"
        >
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onShop(meal);
                }}
                className="w-full py-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-lg font-medium text-sm flex justify-center items-center shadow-md transition-colors"
            >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to List
            </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
