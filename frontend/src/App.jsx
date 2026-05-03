import { useState, useEffect } from 'react';
import ExplorePage from './components/ExplorePage';
import CaloriePage from './components/CaloriePage';
import ExercisePage from './components/ExercisePage';
import WeeklyCaloriesPage from './components/WeeklyCaloriesPage';
import ScannerPage from './components/ScannerPage';
import ProgressPage from './components/ProgressPage';
import CalorieBar from './components/CalorieBar';
import MapPage from './components/MapPage';
import NewsPage from './components/NewsPage';
import TrendsPage from './components/TrendsPage';
import DeepDivePage from './components/DeepDivePage';
import LoyaltyPage from './components/LoyaltyPage';
import StepsWidget from './components/StepsWidget';
import WaterTracker from './components/WaterTracker';
import WeekStrip from './components/WeekStrip';
import SplashScreen from './components/SplashScreen';
import ParticleCanvas from './components/ParticleCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer } from 'vaul';
import { X, Menu, Instagram, Twitter, User, ArrowRight, Users, Map as MapIcon, Newspaper, Award, Flame, TrendingUp, CalendarDays, ScanLine, Scale, Search } from 'lucide-react';

function App() {
  const [user, setUser] = useState(() => localStorage.getItem('fitmeal_username') || null);
  const [userName, setUserName] = useState(() => localStorage.getItem('fitmeal_firstname') || '');
  const [userLastName, setUserLastName] = useState(() => localStorage.getItem('fitmeal_lastname') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('fitmeal_email') || '');
  const [userCount, setUserCount] = useState(0);
  const [splashDone, setSplashDone] = useState(() => !!sessionStorage.getItem('fitmeal_splash_v1'));
  const [loginFocus, setLoginFocus] = useState(null);
  const [loginParticleText, setLoginParticleText] = useState('FitMeal AI');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Fetch initial stats
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setUserCount(data.count || 0))
      .catch(() => { });
  }, []);

  // Pre-load Instagram embed.js silently so Trends tab is instant
  useEffect(() => {
    if (!document.getElementById('ig-embed-script')) {
      const s = document.createElement('script');
      s.id = 'ig-embed-script';
      s.src = 'https://www.instagram.com/embed.js';
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    }
    if (!document.getElementById('iframely-script')) {
      const s = document.createElement('script');
      s.id = 'iframely-script';
      s.src = 'https://iframely.net/embed.js';
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    }
  }, []);

  // Silently update last_login for returning users on every page load
  useEffect(() => {
    const savedName = localStorage.getItem('fitmeal_username');
    const savedEmail = localStorage.getItem('fitmeal_email');
    if (savedName) {
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: savedName, email: savedEmail || '' })
      })
        .then(res => res.json())
        .then(data => { if (data && data.count) setUserCount(data.count); })
        .catch(() => { });
    }
  }, []);

  // Particle text for login form, debounced 250ms
  useEffect(() => {
    if (user) return;
    let text = 'FitMeal AI';
    const full = [userName, userLastName].filter(Boolean).join(' ');
    if (loginFocus === 'firstName') text = userName || 'Your name';
    else if (loginFocus === 'lastName') text = full || userLastName || 'Your name';
    else if (loginFocus === 'email') text = full || 'FitMeal AI';
    else if (full) text = full;
    const t = setTimeout(() => setLoginParticleText(text), 250);
    return () => clearTimeout(t);
  }, [loginFocus, userName, userLastName, user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (userName.trim().length < 2) return;
    if (userLastName.trim().length < 2) return;
    if (!userEmail.trim().includes('@')) return;

    const fullName = `${userName.trim()} ${userLastName.trim()}`;

    localStorage.setItem('fitmeal_username', fullName);
    localStorage.setItem('fitmeal_firstname', userName.trim());
    localStorage.setItem('fitmeal_lastname', userLastName.trim());
    localStorage.setItem('fitmeal_email', userEmail.trim());
    setUser(fullName);

    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email: userEmail.trim() })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.count) {
          setUserCount(data.count);
        }
      }
    } catch (err) {
      console.warn("Login API failed. User kept local.", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 selection:bg-amber-50">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-10"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="11" fill="#0F0F0F"/>
                <rect x="13" y="12" width="4.5" height="24" rx="2.25" fill="#F59E0B"/>
                <rect x="13" y="12" width="22" height="4.5" rx="2.25" fill="#F59E0B"/>
                <rect x="13" y="21" width="15" height="4.5" rx="2.25" fill="#F59E0B"/>
              </svg>
            </div>

            {/* Particle hero, shows "FitMeal AI" then morphs to typed name */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#080d1a' }}>
              <ParticleCanvas
                text={loginParticleText}
                height={140}
                color="#F59E0B"
                sphereDelay={900}
              />
              <div className="px-4 pb-3 text-center">
                <p className="text-[11px] text-slate-600">
                  {loginFocus ? 'Type to see your name come alive' : 'The intelligent nutrition companion'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex space-x-3">
              <div className="text-left space-y-1.5 flex-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 ml-1">First name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onFocus={() => setLoginFocus('firstName')}
                  onBlur={() => setLoginFocus(null)}
                  placeholder="e.g. Cyril"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition-all font-medium text-gray-800"
                  required
                />
              </div>
              <div className="text-left space-y-1.5 flex-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 ml-1">Last name</label>
                <input
                  type="text"
                  value={userLastName}
                  onChange={(e) => setUserLastName(e.target.value)}
                  onFocus={() => setLoginFocus('lastName')}
                  onBlur={() => setLoginFocus(null)}
                  placeholder="e.g. Salameh"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition-all font-medium text-gray-800"
                  required
                />
              </div>
            </div>
            <div className="text-left space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 ml-1">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  onFocus={() => setLoginFocus('email')}
                  onBlur={() => setLoginFocus(null)}
                  placeholder="e.g. cyril@gmail.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition-all font-medium text-gray-800"
                  required
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-gray-400 bg-gray-50 py-3 rounded-lg border border-gray-100 px-6">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Joined by <span className="text-gray-900">{userCount}</span> users globally</span>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
    <div className="min-h-screen font-sans selection:bg-amber-50 selection:text-amber-900 bg-gray-50">
      {/* Moving Band (Ticker), mobile only */}
      <div className="ticker-wrap border-b border-gray-800 md:hidden">
        <div className="ticker">
          <span className="mx-8 font-bold text-amber-500">NEWS:</span> DATA EXPANDED FOR LEBANON & SPAIN
          <span className="mx-8">•</span> DID YOU KNOW? PROTEIN HELPS WITH SATIETY
          <span className="mx-8">•</span> <span className="text-amber-500">MACRO TIP:</span> FIBER IS ESSENTIAL FOR DIGESTION
          <span className="mx-8">•</span> NOW SERVING <span className="text-white">{userCount}</span> HEALTH ENTHUSIASTS
          <span className="mx-8">•</span> 6 TOTAL SUGGESTIONS NOW AVAILABLE FOR A BALANCED DIET
        </div>
      </div>

      <CalorieBar />
      <nav className="sticky top-0 z-40 bg-[#0c1022] px-6 py-0 md:py-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-14 md:h-[52px]">
          <button
            onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }}
            className="flex items-center space-x-2.5 group hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="7" fill="#1e2340"/>
                <rect x="9" y="8" width="3" height="16" rx="1.5" fill="#F59E0B"/>
                <rect x="9" y="8" width="14" height="3" rx="1.5" fill="#F59E0B"/>
                <rect x="9" y="14" width="10" height="3" rx="1.5" fill="#F59E0B"/>
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">FitMeal <span className="text-amber-400">AI</span></span>
          </button>

          <div className="hidden md:flex items-center space-x-1 text-[13px] font-medium text-gray-400">
            {[
              ['explore', 'Explore'],
              ['scanner', 'Scanner'],
              ['calories', 'TDEE'],
              ['weekly', 'Weekly Cal.'],
              ['progress', 'Progress'],
              ['exercise', 'Exercise'],
              ['map', 'Map'],
              ['news', 'FMCG News'],
              ['trends', 'Trends'],
              ['deepdive', 'Deep Dive'],
              ['loyalty', 'Loyalty'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setShowMobileMenu(false); }}
                className={`relative px-3 py-[18px] transition-colors duration-150 ${activeTab === tab ? 'text-white' : 'hover:text-white'}`}
              >
                {label}
                {activeTab === tab && (
                  <motion.span layoutId="nav-underline" className="absolute bottom-0 left-3 right-3 h-[2px] bg-amber-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{userCount} users</span>
            </div>
            <button
              className="md:hidden flex items-center space-x-1.5 bg-white/10 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500 transition-all duration-200 active:scale-95"
              onClick={() => setShowMobileMenu(m => !m)}
            >
              {showMobileMenu ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              <span>{showMobileMenu ? 'Close' : 'Menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu, Vaul bottom drawer */}
        <Drawer.Root open={showMobileMenu} onOpenChange={setShowMobileMenu}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40 md:hidden" />
            <Drawer.Content className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-950 rounded-t-2xl outline-none">
              <div className="mx-auto w-10 h-1 bg-gray-700 rounded-full mt-3 mb-1" />
              <Drawer.Title className="sr-only">Navigation</Drawer.Title>
              <div className="px-4 pb-2 pt-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-600 px-3 mb-2">Navigate</p>
                <div className="space-y-0.5 max-h-[70vh] overflow-y-auto pb-safe">
                  {[
                    ['explore', 'Explore'],
                    ['scanner', 'Food Scanner'],
                    ['calories', 'TDEE Calculator'],
                    ['weekly', 'Weekly Calories'],
                    ['progress', 'Progress'],
                    ['exercise', 'Exercise'],
                    ['map', 'Map'],
                    ['news', 'FMCG News'],
                    ['trends', 'Trends / Reels'],
                    ['deepdive', 'Deep Dive'],
                    ['loyalty', 'Loyalty Programs'],
                  ].map(([tab, label]) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setShowMobileMenu(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-150 ${
                        activeTab === tab
                          ? 'bg-amber-500 text-white'
                          : 'text-gray-400 active:text-white active:bg-gray-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="pb-6" />
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16 lg:py-28">
        <AnimatePresence mode="wait">
          {activeTab === 'exercise' && (
            <ExercisePage />
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="max-w-4xl">
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-6 flex items-center">
                  <User className="w-3 h-3 mr-2" /> Welcome back, {user}
                </p>
                <h1 className="text-3xl md:text-5xl lg:text-7xl mb-4 md:mb-8 leading-[1.08] tracking-tight font-bold">Professional nutrition <br /><span className="font-light text-gray-400">simplified for everyone.</span></h1>
                <p className="text-base md:text-xl text-gray-500 font-medium leading-relaxed max-w-3xl">
                  FitMeal AI is a sophisticated nutritional engine designed for the modern lifestyle. We bridge the gap between regional food availability and individual fitness goals, providing clear, balanced, and actionable meal paths across the globe.
                </p>
              </div>

              <WeekStrip />
              <StepsWidget />
              <WaterTracker />
            </motion.div>
          )}

          {activeTab === 'explore' && <ExplorePage />}

          {activeTab === 'calories' && <CaloriePage />}

          {activeTab === 'weekly' && <WeeklyCaloriesPage />}

          {activeTab === 'progress' && <ProgressPage />}

          {activeTab === 'scanner' && <ScannerPage />}

          {activeTab === 'news' && <NewsPage />}

          {activeTab === 'trends' && <TrendsPage />}

          {activeTab === 'deepdive' && <DeepDivePage />}

          {activeTab === 'loyalty' && <LoyaltyPage />}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-[72vh] w-[96%] mx-auto sm:h-[80vh] sm:w-full sm:mx-0"
            >
              <MapPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-gray-200 bg-white py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="5" fill="#0F0F0F"/>
                <rect x="6.5" y="6" width="2.25" height="12" rx="1.125" fill="#F59E0B"/>
                <rect x="6.5" y="6" width="11" height="2.25" rx="1.125" fill="#F59E0B"/>
                <rect x="6.5" y="10.75" width="7.5" height="2.25" rx="1.125" fill="#F59E0B"/>
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-gray-900">FitMeal <span className="text-amber-500">AI</span></span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 Crafted with care for the global health community.</p>
          <div className="flex space-x-6 text-gray-400">
            <Twitter className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
            <Instagram className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

export default App;
