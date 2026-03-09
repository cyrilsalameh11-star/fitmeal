import { useState, useEffect } from 'react';
import MealForm from './components/MealForm';
import MealCard from './components/MealCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Menu, Phone, Mail, Instagram, Twitter } from 'lucide-react';

function App() {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('planner');

  const handleGenerate = async (target) => {
    setIsLoading(true);
    setError(null);
    setMeals([]);

    try {
      const resp = await fetch('/api/suggestions', {
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
    setShopItems(meal.shoppingItems || []);
    setShowShopModal(true);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Moving Band (Ticker) */}
      <div className="ticker-wrap border-b border-stone-800">
        <div className="ticker">
          <span className="mx-8 font-bold text-amber-500">NEWS:</span> NEW MEALS ADDED FOR SPAIN & LEBANON 
          <span className="mx-8">•</span> DID YOU KNOW? PROTEIN HELPS WITH SATIETY 
          <span className="mx-8">•</span> <span className="text-amber-500">MACRO TIP:</span> FIBER IS ESSENTIAL FOR DIGESTION
          <span className="mx-8">•</span> 6 TOTAL SUGGESTIONS NOW AVAILABLE FOR A BALANCED DIET
        </div>
      </div>

      {/* Professional Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white font-bold italic">F</div>
            <span className="text-xl font-black font-serif tracking-tight">FitMeal AI</span>
          </div>
          
          <div className="hidden md:flex space-x-10 text-sm font-bold uppercase tracking-widest text-stone-500">
            <button onClick={() => setActiveTab('home')} className={`hover:text-stone-900 transition-colors ${activeTab === 'home' ? 'text-stone-900' : ''}`}>Home</button>
            <button onClick={() => setActiveTab('planner')} className={`hover:text-stone-900 transition-colors ${activeTab === 'planner' ? 'text-stone-900' : ''}`}>Planner</button>
            <button onClick={() => setActiveTab('contact')} className={`hover:text-stone-900 transition-colors ${activeTab === 'contact' ? 'text-stone-900' : ''}`}>Contact</button>
          </div>

          <button className="md:hidden p-2 text-stone-500"><Menu className="w-6 h-6" /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <AnimatePresence mode="wait">
          {activeTab === 'planner' && (
            <motion.div 
              key="planner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-20"
            >
              <div className="max-w-3xl">
                <h1 className="text-5xl lg:text-7xl mb-6 leading-tight">Your daily dose of <span className="italic font-normal text-stone-400">fitness nutrition.</span></h1>
                <p className="text-xl text-stone-500 font-medium leading-relaxed">
                  The smart meal planner for the diaspora and health enthusiasts. Sourcing data from French supermarkets, Lebanese restaurants, and Spanish fast-food chains.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-4 sticky top-28">
                  <div className="p-8 bg-white border border-stone-100 rounded-3xl shadow-sm">
                    <h3 className="text-2xl mb-6">Meal Targets</h3>
                    <MealForm onSubmit={handleGenerate} isLoading={isLoading} />
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-12">
                  {error && (
                    <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-medium">
                      {error}
                    </div>
                  )}

                  {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-stone-100 rounded-3xl animate-pulse"></div>
                      ))}
                    </div>
                  )}

                  {meals.length > 0 && (
                    <div className="space-y-10">
                      <div className="flex items-center space-x-4 border-b border-stone-100 pb-6">
                        <span className="bg-stone-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Plan</span>
                        <h2 className="text-3xl">Suggested Menu</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {meals.map((meal, idx) => (
                          <MealCard key={idx} index={idx} meal={meal} onShop={handleShop} />
                        ))}
                      </div>
                    </div>
                  )}

                  {!isLoading && meals.length === 0 && (
                    <div className="h-96 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center text-stone-400 text-center px-12">
                      <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-lg">Select your targets to generate <br/>your personalized meal suggestions.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div 
              key="contact"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto py-20 text-center space-y-12"
            >
              <h2 className="text-5xl lg:text-6xl mb-8">Let's stay <span className="italic font-normal text-stone-400">connected.</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-10 bg-white border border-stone-100 rounded-3xl shadow-sm hover:border-amber-200 transition-colors">
                  <Phone className="w-8 h-8 mx-auto mb-6 text-stone-400" />
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-2">WhatsApp</h4>
                  <p className="text-lg font-serif">+961 70 000 000</p>
                </div>
                <div className="p-10 bg-white border border-stone-100 rounded-3xl shadow-sm hover:border-amber-200 transition-colors">
                  <Mail className="w-8 h-8 mx-auto mb-6 text-stone-400" />
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-2">Email</h4>
                  <p className="text-lg font-serif">hello@fitmeal.ai</p>
                </div>
                <div className="p-10 bg-white border border-stone-100 rounded-3xl shadow-sm hover:border-amber-200 transition-colors">
                  <Instagram className="w-8 h-8 mx-auto mb-6 text-stone-400" />
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-2">Social</h4>
                  <p className="text-lg font-serif">@fitmeal_ai</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-stone-100 bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-stone-900 rounded-md flex items-center justify-center text-white font-bold italic text-xs">F</div>
            <span className="text-lg font-serif tracking-tight">FitMeal AI</span>
          </div>
          <p className="text-stone-400 text-sm italic">© 2026 Crafted with care for the global health community.</p>
          <div className="flex space-x-6 text-stone-400">
            <Twitter className="w-5 h-5 cursor-pointer hover:text-stone-900 transition-colors" />
            <Instagram className="w-5 h-5 cursor-pointer hover:text-stone-900 transition-colors" />
          </div>
        </div>
      </footer>

      {/* Shopping Modal */}
      <AnimatePresence>
        {showShopModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/20 backdrop-blur-sm"
            onClick={() => setShowShopModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-2xl font-serif">Shopping Bag</h3>
                <button onClick={() => setShowShopModal(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                {shopItems.map((item, i) => (
                  <div key={i} className="flex items-center py-4 border-b border-stone-50 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mr-4" />
                    <p className="text-lg text-stone-700">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
