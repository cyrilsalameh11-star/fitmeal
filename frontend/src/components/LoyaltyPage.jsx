import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ShoppingBag, CheckCircle2, ChevronRight, ChevronDown, Zap, Target, Star, Gift, ShoppingCart, X } from 'lucide-react';

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

const FULL_ANALYSIS = {
  "Charcutier": {
    headline: "Charcutier Rewards",
    subtitle: "Lebanon's premium deli chain runs a flat, instant-gratification model with no digital layer.",
    accentColor: "bg-amber-500",
    textAccent: "text-amber-500",
    stats: [
      { label: "Model", value: "Flat / No Tiers" },
      { label: "Redemption", value: "In-Store Only" },
      { label: "Digital App", value: "None" },
      { label: "Points Carry-Over", value: "No Expiry" },
    ],
    sections: [
      {
        title: "How It Works",
        body: "Charcutier operates a direct-discount model: instead of accumulating points toward a future reward, members receive fixed points per eligible item at checkout, which convert immediately into cash-back vouchers. Vouchers are printed on the receipt and redeemable on the next visit.",
      },
      {
        title: "Strengths",
        items: ["Zero learning curve — customers see the benefit immediately", "No app or registration required", "Works for infrequent shoppers who dislike expiring points"],
      },
      {
        title: "Weaknesses",
        items: ["No tier progression — heavy spenders get no extra reward", "No digital touchpoint to collect data or send offers", "Vouchers are easy to forget or lose (paper-only)"],
      },
      {
        title: "Strategic Verdict",
        body: "Ideal for impulse-driven, premium grocery shoppers who value simplicity. The lack of a digital layer is a structural gap that limits CRM potential and cross-sell opportunities.",
      },
    ],
  },
  "Carrefour Lebanon": {
    headline: "MyCLUB by Carrefour",
    subtitle: "Majid Al Futtaim's regional points engine — digital-first, partner-heavy, but with a steep LBP conversion.",
    accentColor: "bg-red-600",
    textAccent: "text-red-500",
    stats: [
      { label: "Accrual", value: "10 pts / 10,000 LBP" },
      { label: "Redemption", value: "Points = Cash" },
      { label: "Channel", value: "App / Website" },
      { label: "Tier System", value: "Digital Only" },
    ],
    sections: [
      {
        title: "How It Works",
        body: "MyCLUB awards 10 points for every 10,000 LBP spent (~$0.11 at current rates). Points accumulate in a digital wallet and can be redeemed as a direct cash discount at checkout. Partner deals extend earning opportunities beyond Carrefour stores to select merchants across the Majid Al Futtaim ecosystem.",
      },
      {
        title: "Strengths",
        items: ["Full digital wallet — balance visible in real time on the app", "Partner ecosystem extends value beyond grocery", "Carrefour's breadth (electronics, clothing, food) boosts accrual speed"],
      },
      {
        title: "Weaknesses",
        items: ["Digital-only creates a barrier for Lebanon's older or low-smartphone demographics", "LBP instability erodes point value between earning and redemption", "No tiered acceleration — spend more, earn the same rate"],
      },
      {
        title: "Strategic Verdict",
        body: "Strong program for digitally native shoppers and families doing large consolidated shops. The absence of tier multipliers and the LBP/point volatility risk reduce perceived value for high-frequency spenders.",
      },
    ],
  },
};

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
  const [expandedBrand, setExpandedBrand] = useState(null);
  const analysisRef = useRef(null);

  // Scroll to panel after animation completes (300ms)
  useEffect(() => {
    if (!expandedBrand) return;
    if (expandedBrand === 'Spinneys Lebanon') {
      setTimeout(() => {
        document.getElementById('spinneys-deep-dive')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return;
    }
    const timer = setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 320);
    return () => clearTimeout(timer);
  }, [expandedBrand]);

  const toggleBrand = (name) => setExpandedBrand(prev => prev === name ? null : name);

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

            <button
              onClick={() => toggleBrand(brand.name)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${
                expandedBrand === brand.name
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 group-hover:bg-stone-900 group-hover:text-white'
              }`}
            >
              <span className="text-xs font-black uppercase tracking-widest">Full Analysis</span>
              {expandedBrand === brand.name ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        ))}
      </div>

      {/* Expanded Full Analysis Panel */}
      <AnimatePresence>
        {expandedBrand && FULL_ANALYSIS[expandedBrand] && (() => {
          const a = FULL_ANALYSIS[expandedBrand];
          return (
            <motion.div
              key={expandedBrand}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              ref={analysisRef}
              className="bg-white rounded-[2.5rem] border border-stone-100 shadow-xl p-10 lg:p-14 space-y-10"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`inline-block w-2 h-8 rounded-full ${a.accentColor} mb-4`} />
                  <h3 className="text-3xl font-bold text-stone-900">{a.headline}</h3>
                  <p className="text-sm text-stone-500 font-medium mt-2 max-w-2xl">{a.subtitle}</p>
                </div>
                <button onClick={() => setExpandedBrand(null)} className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors flex-shrink-0">
                  <X size={16} className="text-stone-400" />
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {a.stats.map((s, i) => (
                  <div key={i} className="bg-stone-50 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{s.label}</p>
                    <p className={`text-lg font-black ${a.textAccent}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {a.sections.map((sec, i) => (
                  <div key={i} className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{sec.title}</p>
                    {sec.body && <p className="text-sm text-stone-600 font-medium leading-relaxed">{sec.body}</p>}
                    {sec.items && (
                      <ul className="space-y-2">
                        {sec.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-stone-600 font-medium">
                            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Spinneys Deep Dive */}
      <div id="spinneys-deep-dive" className="bg-stone-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl">
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

      {/* Spinneys Rewards Portal */}
      <div className="bg-white border border-stone-100 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="p-4 bg-blue-50 rounded-2xl flex-shrink-0">
              <Gift className="text-blue-600" size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Spinneys Portal</p>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Redeem Your Points</h3>
              <p className="text-sm text-stone-500 font-medium max-w-md">
                Browse the full Spinneys Rewards catalog, check your point balance, and redeem rewards directly on the official portal.
              </p>
            </div>
          </div>
          <a
            href="https://spinneysrewards.com/SpinneysRewards/Default.aspx?pageid=3296"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center space-x-2 px-7 py-4 bg-stone-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-stone-700 transition-all"
          >
            <span>Open Portal</span>
            <ChevronRight size={14} />
          </a>
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
