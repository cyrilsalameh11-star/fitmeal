import { useState, useEffect } from 'react';
import { Flame, Dumbbell, Sun, Moon, Apple, Cookie, Globe, Shield, Store } from 'lucide-react';
import { BRANDS } from '../data/metadata';

export default function MealForm({ onSubmit, isLoading }) {
  const [target, setTarget] = useState({
    calorieTarget: '600',
    proteinTarget: '40',
    mealType: 'lunch',
    country: 'France',
    brand: '',
    dietary: []
  });

  // Reset brand when country changes
  useEffect(() => {
    setTarget(prev => ({ ...prev, brand: '' }));
  }, [target.country]);

  const availableBrands = BRANDS[target.country] || [];

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
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-8">
        {/* Row 1: Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
              <Flame className="w-4 h-4" />
              <span>Daily Calorie Target</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="calorieTarget"
                value={target.calorieTarget}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-serif text-2xl"
                required
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-300">KCAL</span>
            </div>
          </div>

          {target.mealType !== 'dessert' && (
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                <Dumbbell className="w-4 h-4" />
                <span>Protein Target</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="proteinTarget"
                  value={target.proteinTarget}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-serif text-2xl"
                  required
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-300">GRAMS</span>
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Regional & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
              <Globe className="w-4 h-4" />
              <span>Regional Data</span>
            </label>
            <select 
              name="country" 
              value={target.country} 
              onChange={handleChange}
              className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-bold text-sm uppercase tracking-wider appearance-none"
            >
              <option value="France">France 🇫🇷</option>
              <option value="Spain">Spain 🇪🇸</option>
              <option value="Lebanon">Lebanon 🇱🇧</option>
              <option value="USA">USA 🇺🇸</option>
              <option value="UAE">UAE 🇦🇪</option>
              <option value="Saudi Arabia">Saudi Arabia 🇸🇦</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
              <Store className="w-4 h-4" />
              <span>Specific Brand (Optional)</span>
            </label>
            <div className="relative">
              <select 
                name="brand" 
                value={target.brand} 
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-bold text-sm uppercase tracking-wider appearance-none"
              >
                <option value="">Any Global Brand</option>
                {availableBrands.map(b => (
                  <option key={b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Dietary */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
            <Shield className="w-4 h-4" />
            <span>Dietary Filter</span>
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { id: 'halal', label: 'Halal' },
              { id: 'vegan', label: 'Vegan' },
              { id: 'vegetarian', label: 'Vegetarian' },
              { id: 'keto', label: 'Keto' },
              { id: 'lactose_free', label: 'Lactose Free' },
              { id: 'gluten_free', label: 'Gluten Free' }
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTarget(prev => ({
                    ...prev,
                    dietary: prev.dietary.includes(opt.id)
                      ? prev.dietary.filter(d => d !== opt.id)
                      : [...prev.dietary, opt.id]
                  }));
                }}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  target.dietary.includes(opt.id) 
                    ? 'bg-stone-900 border-stone-900 text-white shadow-md' 
                    : 'bg-stone-50 border-stone-100 text-stone-500 hover:border-amber-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
            {target.dietary.length === 0 && (
              <span className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 italic">
                Standard Diet
              </span>
            )}
          </div>
        </div>

        {/* Row 4: Meal Type */}
        <div className="space-y-4">
          <label className="flex items-center space-x-2 text-xs font-bold text-stone-400 uppercase tracking-widest text-center justify-center">
            <span>Meal Category Selection</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'lunch', icon: Sun, label: 'Lunch' },
              { id: 'dinner', icon: Moon, label: 'Dinner' },
              { id: 'snack', icon: Apple, label: 'Snack' },
              { id: 'dessert', icon: Cookie, label: 'Dessert' },
            ].map((type) => (
              <label
                key={type.id}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl cursor-pointer border-2 transition-all ${
                  target.mealType === type.id
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xl scale-[1.05]'
                    : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-amber-200'
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
                <type.icon className="w-6 h-6 mb-3" />
                <span className="text-xs font-bold uppercase tracking-widest">{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        disabled={isLoading}
        type="submit"
        className="w-full py-6 rounded-3xl bg-stone-900 text-white font-black text-xl shadow-2xl hover:shadow-amber-100 transition-all flex items-center justify-center space-x-4 disabled:opacity-50 tracking-tighter"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-4 border-stone-700 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="font-serif italic font-normal text-amber-500 mr-2">fit.</span>
            <span>Generate Plan</span>
          </>
        )}
      </button>
    </form>
  );
}

function ChevronDown({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
