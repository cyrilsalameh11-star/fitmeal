import { motion } from 'framer-motion';
import { Target, MapPin, Smartphone, ArrowRight, Zap, ExternalLink } from 'lucide-react';

export default function PilatesContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center">
          <Target size={14} className="mr-2" /> Reformer & Mat
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Premium Pilates <br /><span className="italic font-normal text-stone-400">Studios.</span></h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">Connect your mind and body at Lebanon's top rated pilates studios. Book easily using the standard IN2 app.</p>
      </div>

      {/* ── Lebanon ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="text-lg">🇱🇧</span>
        <p className="text-xs font-black uppercase tracking-widest text-stone-400">Lebanon</p>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Studios</span>
              <MapPin className="text-stone-300 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif mb-3 group-hover:text-amber-600 transition-colors">IN2 Connect</h2>
            <p className="text-stone-500">Access classes at Exhale, Body Garage, and dozens of other premier studios across the country.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <a 
              href="https://apps.apple.com/search?term=in2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-stone-50 border border-stone-100 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-stone-900 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:rotate-12 transition-all" /> 
                App Store
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="https://play.google.com/store/search?q=in2&c=apps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-stone-50 border border-stone-100 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-stone-900 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:rotate-12 transition-all" /> 
                Google Play
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="bg-stone-900 text-white rounded-3xl p-8 border border-stone-800 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-stone-800 text-stone-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Featured</span>
              <Zap className="text-amber-500 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif mb-3 group-hover:text-amber-400 transition-colors">Posto Nove</h2>
            <p className="text-stone-400">A specialized luxury studio experience. Check their official site to book their proprietary classes.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <a 
              href="https://apps.apple.com/search?term=posto%20nove" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-stone-800/50 border border-stone-700/50 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-white hover:bg-stone-800 hover:border-amber-500/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:rotate-12 transition-all" /> 
                App Store
              </div>
              <ExternalLink className="w-4 h-4 text-stone-500 group-hover:scale-110 transition-transform" />
            </a>
            <a 
              href="https://play.google.com/store/search?q=posto%20nove&c=apps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-stone-800/50 border border-stone-700/50 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-white hover:bg-stone-800 hover:border-amber-500/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:rotate-12 transition-all" /> 
                Google Play
              </div>
              <ExternalLink className="w-4 h-4 text-stone-500 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Qatar ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="text-lg">🇶🇦</span>
        <p className="text-xs font-black uppercase tracking-widest text-stone-400">Doha (Qatar)</p>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Studios</span>
              <MapPin className="text-stone-300 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif mb-3 group-hover:text-amber-600 transition-colors">Mindbody</h2>
            <p className="text-stone-500">Book pilates classes at top Doha studios including Oxygen Fitness, The Studio Doha, and more — all through one app used by studios worldwide.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href="https://apps.apple.com/search?term=mindbody"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-stone-50 border border-stone-100 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-stone-900 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:rotate-12 transition-all" />
                App Store
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://play.google.com/store/search?q=mindbody&c=apps"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-stone-50 border border-stone-100 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-stone-900 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:rotate-12 transition-all" />
                Google Play
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="bg-stone-900 text-white rounded-3xl p-8 border border-stone-800 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-stone-800 text-stone-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Featured</span>
              <Zap className="text-amber-500 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif mb-3 group-hover:text-amber-400 transition-colors">ClassPass Doha</h2>
            <p className="text-stone-400">Access reformer and mat pilates studios across Doha with a flexible ClassPass subscription — no long-term commitment required.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href="https://apps.apple.com/search?term=classpass"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-stone-800/50 border border-stone-700/50 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-white hover:bg-stone-800 hover:border-amber-500/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:rotate-12 transition-all" />
                App Store
              </div>
              <ExternalLink className="w-4 h-4 text-stone-500 group-hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://play.google.com/store/search?q=classpass&c=apps"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-stone-800/50 border border-stone-700/50 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-white hover:bg-stone-800 hover:border-amber-500/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:rotate-12 transition-all" />
                Google Play
              </div>
              <ExternalLink className="w-4 h-4 text-stone-500 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* ── France ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="text-lg">🇫🇷</span>
        <p className="text-xs font-black uppercase tracking-widest text-stone-400">France</p>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Studios</span>
              <MapPin className="text-stone-300 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif mb-3 group-hover:text-amber-600 transition-colors">Gymlib</h2>
            <p className="text-stone-500">France's leading fitness booking platform. Access hundreds of pilates studios across Paris and major French cities in one app.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href="https://apps.apple.com/fr/app/gymlib/id1263836908"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-stone-50 border border-stone-100 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-stone-900 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:rotate-12 transition-all" />
                App Store
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.gymlib.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-stone-50 border border-stone-100 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-stone-900 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-400 group-hover:text-amber-500 group-hover:rotate-12 transition-all" />
                Google Play
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="bg-stone-900 text-white rounded-3xl p-8 border border-stone-800 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-stone-800 text-stone-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Featured</span>
              <Zap className="text-amber-500 w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif mb-3 group-hover:text-amber-400 transition-colors">ClassPass France</h2>
            <p className="text-stone-400">Book reformer and mat pilates at top Paris studios including Cadillac Factory, Studio Pilates, and more — all from one subscription.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href="https://apps.apple.com/search?term=classpass"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-stone-800/50 border border-stone-700/50 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-white hover:bg-stone-800 hover:border-amber-500/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:rotate-12 transition-all" />
                App Store
              </div>
              <ExternalLink className="w-4 h-4 text-stone-500 group-hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://play.google.com/store/search?q=classpass&c=apps"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-stone-800/50 border border-stone-700/50 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-between text-white hover:bg-stone-800 hover:border-amber-500/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-center">
                <Smartphone className="mr-3 w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:rotate-12 transition-all" />
                Google Play
              </div>
              <ExternalLink className="w-4 h-4 text-stone-500 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
