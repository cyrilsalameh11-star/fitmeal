import { motion } from 'framer-motion';
import { Flame, Dumbbell, Utensils, Sun, Moon, Apple } from 'lucide-react';
import { useState } from 'react';

export default function MealForm({ onSubmit, isLoading }) {
  const [target, setTarget] = useState({
    calorieTarget: '',
    proteinTarget: '',
    mealType: 'dinner',
  });

  const handleChange = (e) => {
    setTarget({
      ...target,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(target);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-3xl p-8 max-w-2xl mx-auto border border-white/40 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative blurred blobs */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
        Design Your Perfect Meal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calories */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Calorie Target</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="calorieTarget"
                value={target.calorieTarget}
                onChange={handleChange}
                placeholder="e.g. 600"
                min="50"
                max="3000"
                required
                className="w-full pl-4 pr-12 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-400 font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">kcal</span>
            </div>
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Dumbbell className="w-4 h-4 text-blue-500" />
              <span>Protein Target</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="proteinTarget"
                value={target.proteinTarget}
                onChange={handleChange}
                placeholder="e.g. 40"
                min="1"
                max="300"
                required
                className="w-full pl-4 pr-12 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-400 font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">g</span>
            </div>
          </div>
        </div>

        {/* Meal Type */}
        <div className="space-y-3 pt-4 border-t border-gray-200/50">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Utensils className="w-4 h-4 text-emerald-500" />
            <span>Meal Type</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'lunch', icon: Sun, label: 'Lunch', color: 'text-amber-500' },
              { id: 'dinner', icon: Moon, label: 'Dinner', color: 'text-indigo-500' },
              { id: 'snack', icon: Apple, label: 'Snack', color: 'text-red-500' },
            ].map((type) => (
              <label
                key={type.id}
                className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${
                  target.mealType === type.id
                    ? 'border-purple-500 bg-purple-50/50 scale-[1.02] shadow-sm'
                    : 'border-white/60 bg-white/30 hover:bg-white/50'
                }`}
              >
                <input
                  type="radio"
                  name="mealType"
                  value={type.id}
                  checked={target.mealType === type.id}
                  onChange={handleChange}
                  className="sr-only"
                />
                <type.icon className={`w-6 h-6 mb-2 ${type.color}`} />
                <span className="text-sm font-semibold text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          type="submit"
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Generate Meals ✨</span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
