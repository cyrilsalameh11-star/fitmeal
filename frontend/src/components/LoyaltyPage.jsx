import { motion } from 'framer-motion';
import { Award, ShoppingBag, CheckCircle2, ChevronRight, Zap, Target, Star, Gift, ShoppingCart } from 'lucide-react';

const COMPARISON_DATA = [
  {
    name: "Spinneys Lebanon",
    program: "Spinneys Loyalty",
    points: "1 Point per $1",
    benefits: ["Points for items", "Tiered rewards", "App integration", "Exclusive discounts"],
    tier: "Gold/Platinum",
    color: "bg-blue-600"
  },
  {
    name: "Charcutier",
    program: "Charcutier Rewards",
    points: "Fixed points per item",
    benefits: ["Direct discounts", "Cashback vouchers", "In-store redemption"],
    tier: "Standard",
    color: "bg-amber-500"
  },
  {
    name: "Carrefour Lebanon",
    program: "MyCLUB",
    points: "10 Points per 10,000 LBP",
    benefits: ["Instant discounts", "Points for cash", "Partner deals"],
    tier: "Digital Only",
    color: "bg-red-600"
  }
];

const SPINNEYS_TIERS = [
  {
    name: "Blue",
    range: "0 - 5,000 Points",
    reward: "Standard point accumulation. Access to basic rewards catalog.",
    icon: <Star size={24} className="text-blue-400" />
  },
  {
    name: "Gold",
    range: "5,001 - 15,000 Points",
    reward: "1.5x points on select items. Free delivery on App orders.",
    icon: <Award size={24} className="text-amber-400" />
  },
  {
    name: "Platinum",
    range: "15,001+ Points",
    reward: "2x points everywhere. Dedicated checkout. Personal shopper access.",
    icon: <Zap size={24} className="text-stone-400" />
  }
];

export default function LoyaltyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-20 pb-20 px-4"
    >
      {/* Premium Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-5xl font-serif tracking-tight">Reward <span className="italic font-normal text-stone-400">Architectures.</span></h2>
        <p className="text-lg text-stone-500 font-medium max-w-2xl mx-auto text-balance">
          Analyzing and comparing the most powerful retail loyalty structures in Lebanon.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {COMPARISON_DATA.map((brand, i) => (
          <div key={i} className="group bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-2 h-full ${brand.color} opacity-80`} />
            <div className="mb-8 p-4 bg-stone-50 rounded-2xl w-fit">
              <ShoppingBag className="text-stone-800" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">{brand.name}</h3>
            <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-8">{brand.program}</p>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-center space-x-4">
                <Target size={18} className="text-stone-300" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-stone-400">Accrual Rate</p>
                  <p className="text-sm font-bold text-stone-800">{brand.points}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-tighter text-stone-400">Member Benefits</p>
                {brand.benefits.map((b, j) => (
                  <div key={j} className="flex items-center space-x-3 text-stone-600">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs font-medium">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full flex items-center justify-between p-5 bg-stone-50 group-hover:bg-stone-900 group-hover:text-white rounded-2xl transition-all duration-300">
              <span className="text-xs font-black uppercase tracking-widest">Full Analysis</span>
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Spinneys Deep Dive */}
      <div className="bg-stone-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
          <Star size={300} strokeWidth={0.5} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xl">
                < Award className="text-amber-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">Spotlight Program</span>
            </div>
            
            <h2 className="text-5xl font-serif">Spinneys <span className="italic text-white/50">Elite.</span></h2>
            <p className="text-white/60 leading-relaxed font-medium">
              Spinneys Lebanon offers the region's most sophisticated loyalty tiering. Members progress from standard accumulation to high-velocity earning cycles with personalized benefit matrices.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                <p className="text-2xl font-bold">1:1</p>
                <p className="text-[10px] font-black uppercase text-white/40">Point to Dollar</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                <p className="text-2xl font-bold">48h</p>
                <p className="text-[10px] font-black uppercase text-white/40">Points Sync</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-8">Program Tiers</p>
            {SPINNEYS_TIERS.map((tier, i) => (
              <div key={i} className="group bg-white/5 hover:bg-white/10 p-6 rounded-[2rem] border border-white/10 transition-all duration-300 flex items-start space-x-6">
                <div className="mt-1">{tier.icon}</div>
                <div>
                  <h4 className="text-lg font-bold mb-1">{tier.name}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">{tier.range}</p>
                  <p className="text-xs text-white/50 line-clamp-2">{tier.reward}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward Catalog */}
      <div id="reward-catalog" className="space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-stone-900">Spinneys Rewards Catalog</h3>
            <p className="text-sm text-stone-400 font-medium">Exchange your hard-earned points for premium lifestyle rewards.</p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
            <Target size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Live Availability</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { pts: "1,000", item: "Spinneys Shop-to-Win Voucher", val: "$5 Cashback", icon: <Gift className="text-rose-500" /> },
            { pts: "2,500", item: "Premium Kitchen Gadget Set", val: "Tefal / Moulinex", icon: <ShoppingCart className="text-blue-500" /> },
            { pts: "5,000", item: "Home Appliance Discount Card", val: "$30 Value", icon: <Award className="text-amber-500" /> },
            { pts: "15,000", item: "Batroun Weekend Experience", val: "Staycation Deal", icon: <Star className="text-purple-500" /> }
          ].map((reward, i) => (
            <div key={i} className="bg-white border border-stone-100 p-8 rounded-[2rem] hover:shadow-xl hover:border-amber-200 transition-all group">
              <div className="mb-6 p-4 bg-stone-50 rounded-2xl w-fit group-hover:bg-amber-50 transition-colors">
                {reward.icon}
              </div>
              <p className="text-2xl font-black text-stone-900 mb-1">{reward.pts}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Points Required</p>
              <h4 className="text-sm font-bold text-stone-800 mb-1">{reward.item}</h4>
              <p className="text-xs text-stone-400 font-medium">{reward.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loyalty CTA */}
      <div className="bg-amber-500 rounded-[3rem] p-12 text-center space-y-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col items-center">
            <Gift className="text-white mb-6" size={48} />
            <h3 className="text-3xl font-bold text-white mb-4">Maximalist Rewards Strategy</h3>
             <p className="text-white/80 max-w-xl mx-auto mb-10 font-medium">
              We recommend synchronizing all three cards for maximum market coverage. Most Lebanese households achieve a 12% annual return on spend by alternating between weekly specials.
             </p>
             <button 
               onClick={() => {
                 const el = document.getElementById('reward-catalog');
                 el?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="px-10 py-5 bg-white text-stone-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
             >
                Explore Points Tiers Above
             </button>
        </div>
      </div>
    </motion.div>
  );
}
