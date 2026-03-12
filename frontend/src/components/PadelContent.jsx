import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Smartphone } from 'lucide-react';

export default function PadelContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center">
          <Activity size={14} className="mr-2" /> Court Booking
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Lebanon Padel <br /><span className="italic font-normal text-stone-400">Community.</span></h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">Book your courts instantly through Sportciety, the premier padel booking platform in Lebanon.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 border border-stone-100 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="space-y-6 max-w-lg">
          <h2 className="text-3xl font-serif">Ready to play?</h2>
          <p className="text-stone-500 text-lg">Browse available courts, join matches, and manage your bookings directly through the official Sportciety app.</p>
          <ul className="space-y-3">
            <li className="flex items-center text-stone-600 font-medium"><CheckCircle2 className="text-emerald-500 mr-3 w-5 h-5 flex-shrink-0" /> Real-time court availability</li>
            <li className="flex items-center text-stone-600 font-medium"><CheckCircle2 className="text-emerald-500 mr-3 w-5 h-5 flex-shrink-0" /> Join active matches nearby</li>
            <li className="flex items-center text-stone-600 font-medium"><CheckCircle2 className="text-emerald-500 mr-3 w-5 h-5 flex-shrink-0" /> Rent equipment on the go</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <a 
            href="https://apps.apple.com/search?term=sportciety" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-sm shadow-xl shadow-stone-200"
          >
            <Smartphone className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" /> App Store
          </a>
          <a 
            href="https://play.google.com/store/search?q=sportciety&c=apps" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-white text-stone-900 border-2 border-stone-100 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:border-amber-500 hover:text-amber-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-sm shadow-lg shadow-stone-100"
          >
            <Smartphone className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" /> Google Play
          </a>
        </div>
      </div>
    </motion.div>
  );
}
