import { useState, useEffect } from 'react';
import MealForm from './components/MealForm';
import MealCard from './components/MealCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Menu, Phone, Mail, Instagram, Twitter, User, ArrowRight, Users } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState('planner');

  // Fetch initial stats
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setUserCount(data.count || 0))
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (userName.trim().length < 2) return;

    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName })
      });
      const data = await resp.json();
      if (resp.ok) {
        setUser(userName);
        setUserCount(data.count);
      }
    } catch (err) {
      setUser(userName); // Fallback for offline/dev
    }
  };

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

  const handleSwap = async (mealIndex) => {
    const mealToSwap = meals[mealIndex];
    try {
      const resp = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calorieTarget: mealToSwap.calories,
          mealType: mealToSwap.type[0], // Use first type
          country: mealToSwap.country,
          excludeIds: meals.map(m => m.id)
        })
      });
      const data = await resp.json();
      if (resp.ok && data.meal) {
        const newMeals = [...meals];
        newMeals[mealIndex] = data.meal;
        setMeals(newMeals);
      }
    } catch (err) {
      console.error("Swap failed", err);
    }
  };

  const handleShop = (meal) => {
    setShopItems(meal.shoppingItems || []);
    setShowShopModal(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 selection:bg-amber-100">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-12"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-white font-serif italic text-3xl mx-auto shadow-xl">F</div>
            <h1 className="text-4xl font-serif tracking-tight text-stone-900">Welcome to <span className="italic font-normal text-stone-400">FitMeal AI</span></h1>
            <p className="text-stone-500 font-medium px-4">The intelligent nutrition companion for global residents and health enthusiasts.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-4">Enter your first name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Cyril"
                  className="w-full bg-white border border-stone-200 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-serif text-lg text-stone-800 shadow-sm"
                  required
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white hover:bg-stone-800 transition-colors shadow-lg">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-stone-400 bg-white/50 py-3 rounded-full border border-stone-100 px-6">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Joined by <span className="text-stone-900">{userCount}</span> users globally</span>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-amber-100 selection:text-amber-900 bg-stone-50">
      {/* Moving Band (Ticker) */}
      <div className="ticker-wrap border-b border-stone-800">
        <div className="ticker">
          <span className="mx-8 font-bold text-amber-500">NEWS:</span> DATA EXPANDED FOR LEBANON & SPAIN 
          <span className="mx-8">•</span> DID YOU KNOW? PROTEIN HELPS WITH SATIETY 
          <span className="mx-8">•</span> <span className="text-amber-500">MACRO TIP:</span> FIBER IS ESSENTIAL FOR DIGESTION
          <span className="mx-8">•</span> NOW SERVING <span className="text-white">{userCount}</span> HEALTH ENTHUSIASTS
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

          <div className="flex items-center space-x-4">
             <div className="hidden sm:flex items-center space-x-2 bg-stone-100 px-4 py-1.5 rounded-full border border-stone-200">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{userCount} users</span>
             </div>
             <button className="md:hidden p-2 text-stone-500"><Menu className="w-6 h-6" /></button>
          </div>
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
              <div className="max-w-4xl">
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center">
                   <User className="w-3 h-3 mr-2" /> Welcome back, {user}
                </p>
                <h1 className="text-5xl lg:text-7xl mb-6 leading-tight">Elevate your daily <span className="italic font-normal text-stone-400">fitness nutrition.</span></h1>
                <p className="text-xl text-stone-500 font-medium leading-relaxed max-w-3xl">
                  FitMeal AI is the premier smart meal planner for the global fitness community. Whether you are in Europe, the Middle East, or the USA, we curate balanced, macro-friendly suggestions tailored to your regional availability and lifestyle.
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
                        <div key={i} className="h-64 bg-white border border-stone-100 rounded-3xl animate-pulse"></div>
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
                          <MealCard key={idx} index={idx} meal={meal} onShop={handleShop} onSwap={() => handleSwap(idx)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {!isLoading && meals.length === 0 && (
                    <div className="h-96 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center text-stone-400 text-center px-12">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <ShoppingBag className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-lg">Select your targets to generate <br/>your personalized meal suggestions.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'home' && (
             <motion.div 
               key="home"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="py-20 text-center space-y-10"
             >
                <h1 className="text-6xl lg:text-8xl mb-8">Nourish your <br/><span className="italic font-normal text-stone-400">global lifestyle.</span></h1>
                <p className="text-xl text-stone-500 font-medium leading-relaxed max-w-2xl mx-auto">
                   Explore curated database of regional restaurants, supermarket ready-meals, and automated macro calculation across 4 continents.
                </p>
                <button onClick={() => setActiveTab('planner')} className="px-12 py-5 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-2xl">Start Planning</button>
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
              <h2 className="text-5xl lg:text-5xl mb-8">Let's stay <span className="italic font-normal text-stone-400">connected.</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-10 bg-white border border-stone-100 rounded-3xl shadow-sm hover:border-amber-200 transition-colors">
                  <Phone className="w-8 h-8 mb-6 text-stone-400" />
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-2">WhatsApp</h4>
                  <p className="text-lg font-serif">+961 70 000 000</p>
                </div>
                <div className="p-10 bg-white border border-stone-100 rounded-3xl shadow-sm hover:border-amber-200 transition-colors">
                  <Mail className="w-8 h-8 mb-6 text-stone-400" />
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-2">Email</h4>
                  <p className="text-lg font-serif">hello@fitmeal.ai</p>
                </div>
                <div className="p-10 bg-white border border-stone-100 rounded-3xl shadow-sm hover:border-amber-200 transition-colors">
                  <Instagram className="w-8 h-8 mb-6 text-stone-400" />
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
