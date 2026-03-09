import { useState } from 'react';
import MealForm from './components/MealForm';
import MealCard from './components/MealCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';

function App() {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopItems, setShopItems] = useState([]);

  const handleGenerate = async (target) => {
    setIsLoading(true);
    setError(null);
    setMeals([]);

    try {
      const resp = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
      
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to generate meals');
      }
      
      setMeals(data.suggestions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShop = (meal) => {
    if (meal.ingredients && meal.ingredients.length > 0) {
      setShopItems(meal.ingredients);
    } else {
      setShopItems([{ item: meal.title, quantity: '1 portion', category: 'Plat préparé' }]);
    }
    setShowShopModal(true);
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=2665&auto=format&fit=crop')] bg-cover bg-fixed bg-center">
      {/* Overlay to soften the background */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-3xl fixed -z-10"></div>
      
      <main className="container mx-auto px-4 py-12 lg:py-24 relative">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-block p-4 rounded-3xl bg-white shadow-xl mb-6 border border-gray-100"
          >
            <span className="text-5xl">🥗</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight lg:leading-tight mb-4"
          >
            FitMeal <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">AI Planner</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 font-medium max-w-xl mx-auto"
          >
            Powered by French Supermarkets & Restaurants Open Data
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto space-y-16">
          <MealForm onSubmit={handleGenerate} isLoading={isLoading} />

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl text-center font-medium shadow-sm border border-red-100 max-w-2xl mx-auto"
            >
              {error}
            </motion.div>
          )}

          {meals.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Your Suggestions</h2>
                <div className="text-sm font-semibold px-4 py-2 bg-white/60 rounded-full border border-gray-200">
                  {meals.length} Options Found
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {meals.map((meal, idx) => (
                  <MealCard key={idx} index={idx} meal={meal} onShop={handleShop} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Shopping Modal */}
      <AnimatePresence>
        {showShopModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShopModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center text-gray-800">
                  <ShoppingBag className="w-5 h-5 mr-3 text-emerald-500" />
                  Shopping List
                </h3>
                <button 
                  onClick={() => setShowShopModal(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {shopItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800">{item.item}</p>
                      {item.category && <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{item.category}</p>}
                    </div>
                    <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-lg text-gray-600">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
