import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronLeft, ChevronRight, Store, Layout, Smartphone, Leaf,
  TrendingUp, Award, ArrowUpRight, Users, ShoppingCart, Globe, Zap, Shield,
  BarChart2, CheckCircle, XCircle, Quote
} from 'lucide-react';

const PAGES = [
  { id: 1, label: 'Retail Formats', icon: Store },
  { id: 2, label: 'Store Layouts', icon: Layout },
  { id: 3, label: 'DNVBs', icon: Smartphone },
  { id: 4, label: 'CSR & Patagonia', icon: Leaf },
];

const Logo = ({ domain, alt, size = 28, bg = 'bg-white' }) => (
  <div className={`rounded-xl flex items-center justify-center shadow-sm border border-stone-100 overflow-hidden ${bg}`}
    style={{ width: size, height: size, minWidth: size }}>
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt={alt}
      width={size - 8}
      height={size - 8}
      className="object-contain"
      onError={e => { e.target.style.display = 'none'; }}
    />
  </div>
);

// ─── PAGE 1 ────────────────────────────────────────────────────────────────
function RetailFormatsPage() {
  const formats = [
    {
      name: 'Convenience Store',
      domain: '7-eleven.com',
      color: 'bg-orange-50 border-orange-200',
      badgeColor: 'bg-orange-500',
      tagColor: 'text-orange-700 bg-orange-100',
      size: '< 500 m²',
      avgBasket: '€8–12',
      margin: '25–35%',
      examples: [
        { name: '7-Eleven', domain: '7-eleven.com' },
        { name: 'Spar', domain: 'spar.com' },
        { name: 'FamilyMart', domain: 'family.co.jp' },
      ],
      desc: 'Open 24/7. Serves impulse and top-up missions. Premium pricing (15–30% above supermarket) justified by proximity and convenience. High footfall per m².',
      highlight: true,
    },
    {
      name: 'Supermarket',
      domain: 'carrefour.com',
      color: 'bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-600',
      tagColor: 'text-blue-700 bg-blue-100',
      size: '1 000–4 500 m²',
      avgBasket: '€35–60',
      margin: '18–25%',
      examples: [
        { name: 'Carrefour Market', domain: 'carrefour.com' },
        { name: 'Monoprix', domain: 'monoprix.fr' },
        { name: 'Waitrose', domain: 'waitrose.com' },
      ],
      desc: 'Full grocery assortment. Weekly shop destination. Balances price, range and freshness. Typically anchored in urban & suburban neighbourhoods.',
    },
    {
      name: 'Hypermarket',
      domain: 'walmart.com',
      color: 'bg-violet-50 border-violet-200',
      badgeColor: 'bg-violet-600',
      tagColor: 'text-violet-700 bg-violet-100',
      size: '> 5 000 m²',
      avgBasket: '€80–150',
      margin: '15–22%',
      examples: [
        { name: 'Carrefour', domain: 'carrefour.com' },
        { name: 'Walmart', domain: 'walmart.com' },
        { name: 'Tesco Extra', domain: 'tesco.com' },
      ],
      desc: 'Food + non-food under one roof. Destination shopping requiring a car. Under pressure from e-commerce repurposing as fulfilment hubs.',
    },
    {
      name: 'Discount Store',
      domain: 'lidl.com',
      color: 'bg-red-50 border-red-200',
      badgeColor: 'bg-red-600',
      tagColor: 'text-red-700 bg-red-100',
      size: '700–1 500 m²',
      avgBasket: '€22–40',
      margin: '20–28%',
      examples: [
        { name: 'Lidl', domain: 'lidl.com' },
        { name: 'Aldi', domain: 'aldi.com' },
        { name: 'Leader Price', domain: 'leaderprice.fr' },
      ],
      desc: 'Limited SKU count (~1 500 vs 30 000+ in hypermarkets). Private-label share >80%. Stripped-down experience. Fastest-growing format in Europe.',
    },
    {
      name: 'Department Store',
      domain: 'selfridges.com',
      color: 'bg-amber-50 border-amber-200',
      badgeColor: 'bg-amber-600',
      tagColor: 'text-amber-700 bg-amber-100',
      size: '10 000–70 000 m²',
      avgBasket: '€120–300',
      margin: '35–50%',
      examples: [
        { name: 'Selfridges', domain: 'selfridges.com' },
        { name: 'Galeries Lafayette', domain: 'galerieslafayette.com' },
        { name: 'Nordstrom', domain: 'nordstrom.com' },
      ],
      desc: 'Multi-category premium. Concession model (brands rent space). Under existential pressure surviving through experiential retail and food courts.',
    },
    {
      name: 'Drug Store / Pharmacy',
      domain: 'boots.com',
      color: 'bg-emerald-50 border-emerald-200',
      badgeColor: 'bg-emerald-600',
      tagColor: 'text-emerald-700 bg-emerald-100',
      size: '200–800 m²',
      avgBasket: '€18–35',
      margin: '30–45%',
      examples: [
        { name: 'Boots', domain: 'boots.com' },
        { name: 'CVS', domain: 'cvs.com' },
        { name: 'Pharmacie Lafayette', domain: 'pharmacies-lafayette.fr' },
      ],
      desc: 'Health, beauty & wellness hub. High-margin OTC and cosmetics cross-selling. Trust-driven category with strong loyalty mechanics.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden bg-stone-950 rounded-3xl p-10 text-white">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)' }} />
        <div className="relative space-y-3 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">Chapter 01 Retail Formats</span>
          <h2 className="text-5xl font-serif leading-[1.1]">The Retail <span className="italic text-stone-400">Landscape</span></h2>
          <p className="text-stone-300 text-base leading-relaxed">
            Retail is not one industry it is a portfolio of distinct business models, each optimised for a different customer mission, basket size, and location economics. Understanding the format is understanding the strategy.
          </p>
          <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
            {[['$30T+', 'Global retail market'], ['~60%', 'Share held by top 250 retailers'], ['3×', 'Discount growth vs. total market'], ['#1', 'Convenience fastest urbanising format']].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-black text-amber-400">{v}</p>
                <p className="text-[11px] text-stone-400 uppercase tracking-widest">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Format Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {formats.map(f => (
          <div key={f.name} className={`rounded-2xl border p-6 space-y-4 transition-shadow hover:shadow-lg ${f.color} ${f.highlight ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Logo domain={f.domain} alt={f.name} size={40} />
                <div>
                  <h4 className="font-black text-stone-900 text-base leading-tight">{f.name}</h4>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${f.tagColor}`}>{f.size}</span>
                </div>
              </div>
              {f.highlight && <span className="text-[9px] font-black uppercase tracking-widest bg-orange-500 text-white px-2 py-1 rounded-full whitespace-nowrap">Case Study</span>}
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">{f.desc}</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Avg. Basket</p>
                <p className="text-base font-black text-stone-900 mt-0.5">{f.avgBasket}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Gross Margin</p>
                <p className="text-base font-black text-stone-900 mt-0.5">{f.margin}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {f.examples.map(ex => (
                <div key={ex.name} className="flex items-center gap-1.5 bg-white/80 border border-white rounded-full px-2.5 py-1">
                  <Logo domain={ex.domain} alt={ex.name} size={16} bg="bg-transparent" />
                  <span className="text-[11px] font-bold text-stone-600">{ex.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 7-Eleven Cluster Model */}
      <div className="bg-stone-950 text-white rounded-3xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Logo domain="7-eleven.com" alt="7-Eleven" size={52} bg="bg-white" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">Spotlight Cluster Model</p>
              <h3 className="text-3xl font-serif">7-Eleven's Urban Dominance Strategy</h3>
              <p className="text-stone-400 text-sm mt-1">How a Thai-owned, American-born brand became the world's largest retailer by store count</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: '01', icon: '📍', title: 'Cluster First, Expand Later', desc: 'Saturate a single city with stores before entering the next market. Shared cold-chain logistics, regional marketing spend, and brand awareness compound together.' },
              { n: '02', icon: '🚇', title: 'Captive Traffic Anchoring', desc: 'Locate at transit nodes, university gates, office towers. 7-Eleven targets locations where 3 000+ people pass daily footfall replaces marketing budget.' },
              { n: '03', icon: '🤝', title: 'Franchise-Fuelled Scale', desc: 'Over 85% of stores are franchised. Capital-light growth model: local operators bear capex, 7-Eleven collects royalties and controls brand standards.' },
            ].map(item => (
              <div key={item.n} className="bg-white/8 border border-white/10 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400">Step {item.n}</span>
                </div>
                <h4 className="font-black text-white">{item.title}</h4>
                <p className="text-stone-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-6">
            {[['85 000+', 'Stores in 19 countries'], ['#1', 'Convenience chain globally'], ['70%', 'Stores in Asia-Pacific'], ['$95B+', 'System-wide annual sales']].map(([v, l]) => (
              <div key={l} className="text-center bg-white/5 rounded-2xl py-5">
                <p className="text-3xl font-black text-amber-400">{v}</p>
                <p className="text-[11px] text-stone-400 uppercase tracking-widest mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Private Labeling */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-amber-500 text-stone-950 rounded-3xl p-8 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Trending Topic</span>
            <h3 className="text-4xl font-serif leading-tight">Private<br/>Labeling</h3>
            <p className="text-stone-900/70 text-sm leading-relaxed">
              Retailers are no longer just distributors they are brand owners. By owning the product, they capture manufacturer margin, build exclusivity, and lock in loyalty.
            </p>
          </div>
          <div className="space-y-2 border-t border-stone-900/20 pt-5">
            <div className="flex justify-between text-sm font-black">
              <span>EU private-label share</span>
              <span>~35%</span>
            </div>
            <div className="w-full bg-stone-900/20 rounded-full h-2"><div className="bg-stone-900 h-2 rounded-full" style={{ width: '35%' }} /></div>
            <div className="flex justify-between text-sm font-black">
              <span>Discount store PL share</span>
              <span>{'>'+'80%'}</span>
            </div>
            <div className="w-full bg-stone-900/20 rounded-full h-2"><div className="bg-stone-900 h-2 rounded-full" style={{ width: '80%' }} /></div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 gap-4">
          {[
            { icon: '💰', title: 'Margin Capture', desc: 'Private-label gross margins run 2–3× higher than national brands. The retailer earns both the distributor and the manufacturer margin. For Lidl, this explains their price-quality dominance.', tag: 'Economics' },
            { icon: '🔐', title: 'Exclusivity & Lock-in', desc: 'You can only buy Kirkland at Costco. You can only buy George at ASDA. Exclusive products create a switching cost a behavioural moat that media spend cannot replicate.', tag: 'Strategy' },
            { icon: '📊', title: 'Tiered Architecture', desc: 'Best retailers operate three PL tiers: economy (price fight), standard (volume), and premium (margin & image). Each tier serves a different customer segment within the same basket.', tag: 'Portfolio' },
          ].map(item => (
            <div key={item.title} className="bg-white border border-stone-100 rounded-2xl p-6 flex gap-4 hover:shadow-md transition-shadow">
              <span className="text-3xl flex-shrink-0">{item.icon}</span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-stone-900">{item.title}</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{item.tag}</span>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
            <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3">Notable Private-Label Brands</p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Kirkland (Costco)', domain: 'costco.com' },
                { name: 'Carrefour Bio', domain: 'carrefour.com' },
                { name: 'George (ASDA)', domain: 'asda.com' },
                { name: 'Up&Up (Target)', domain: 'target.com' },
                { name: 'Lidl Deluxe', domain: 'lidl.com' },
                { name: "President's Choice", domain: 'presidentschoice.ca' },
              ].map(b => (
                <div key={b.name} className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-full px-3 py-1.5">
                  <Logo domain={b.domain} alt={b.name} size={18} bg="bg-transparent" />
                  <span className="text-[11px] font-bold text-stone-700">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SVG FLOOR PLANS ───────────────────────────────────────────────────────
function GridFloorPlan() {
  return (
    <svg viewBox="0 0 200 160" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" rx="8" fill="#1e293b" />
      {/* Aisles */}
      {[20, 60, 100, 140].map(x => (
        <rect key={x} x={x} y={10} width={22} height={120} rx="3" fill="#334155" />
      ))}
      {/* Labels */}
      <rect x={0} y={140} width={200} height={20} rx="0" fill="#0f172a" />
      <text x={100} y={153} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">CHECKOUT →</text>
      <text x={10} y={8} fill="#60a5fa" fontSize="7" fontFamily="sans-serif">ENTRANCE</text>
      {/* Aisle dots (products) */}
      {[20, 60, 100, 140].flatMap(x => [20, 40, 60, 80, 100].map(y => (
        <circle key={`${x}-${y}`} cx={x + 11} cy={y + 15} r={2} fill="#60a5fa" opacity="0.6" />
      )))}
    </svg>
  );
}

function FreeFlowFloorPlan() {
  return (
    <svg viewBox="0 0 200 160" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" rx="8" fill="#1e1b4b" />
      {/* Organic fixture clusters */}
      <ellipse cx="50" cy="45" rx="28" ry="18" fill="#312e81" stroke="#6366f1" strokeWidth="1" />
      <ellipse cx="140" cy="55" rx="22" ry="25" fill="#312e81" stroke="#6366f1" strokeWidth="1" />
      <ellipse cx="90" cy="110" rx="35" ry="20" fill="#312e81" stroke="#6366f1" strokeWidth="1" />
      <ellipse cx="30" cy="120" rx="18" ry="15" fill="#312e81" stroke="#6366f1" strokeWidth="1" />
      <ellipse cx="165" cy="120" rx="20" ry="16" fill="#312e81" stroke="#6366f1" strokeWidth="1" />
      {/* Circulation paths */}
      <path d="M 20 10 Q 100 30 180 10" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" fill="none" />
      <path d="M 80 70 Q 120 90 80 130" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" fill="none" />
      <text x={100} y={153} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">FREE CIRCULATION</text>
      <text x={10} y={8} fill="#a5b4fc" fontSize="7" fontFamily="sans-serif">ENTRANCE</text>
    </svg>
  );
}

function SLoopFloorPlan() {
  return (
    <svg viewBox="0 0 200 160" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" rx="8" fill="#052e16" />
      {/* Room zones */}
      <rect x="10" y="10" width="80" height="55" rx="4" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
      <rect x="110" y="10" width="80" height="55" rx="4" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
      <rect x="110" y="95" width="80" height="55" rx="4" fill="#14532d" stroke="#22c55e" strokeWidth="1" />
      <rect x="10" y="95" width="80" height="55" rx="4" fill="#166534" stroke="#4ade80" strokeWidth="1.5" />
      {/* Arrow path */}
      <path d="M 50 10 L 50 65 L 110 65 L 150 65 L 150 10" stroke="#4ade80" strokeWidth="2" strokeDasharray="4 2" fill="none" markerEnd="url(#arr)" />
      <path d="M 150 95 L 150 150 L 110 150 L 50 150 L 50 95" stroke="#4ade80" strokeWidth="2" strokeDasharray="4 2" fill="none" />
      {/* Labels */}
      <text x="50" y="38" textAnchor="middle" fill="#86efac" fontSize="7" fontFamily="sans-serif">SHOWROOM 1</text>
      <text x="150" y="38" textAnchor="middle" fill="#86efac" fontSize="7" fontFamily="sans-serif">SHOWROOM 2</text>
      <text x="150" y="123" textAnchor="middle" fill="#86efac" fontSize="7" fontFamily="sans-serif">MARKETPLACE</text>
      <text x="50" y="123" textAnchor="middle" fill="#4ade80" fontSize="7" fontFamily="sans-serif" fontWeight="bold">CHECKOUT</text>
      <text x="12" y="8" fill="#4ade80" fontSize="7" fontFamily="sans-serif">ENTRANCE ↓</text>
    </svg>
  );
}

// ─── PAGE 2 ────────────────────────────────────────────────────────────────
function StoreLayoutsPage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden bg-stone-950 rounded-3xl p-10 text-white">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)' }} />
        <div className="relative space-y-3 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">Chapter 02 Store Architecture</span>
          <h2 className="text-5xl font-serif leading-[1.1]">Store <span className="italic text-stone-400">Layouts</span></h2>
          <p className="text-stone-300 leading-relaxed">
            Floor design is a conversion tool. The path a customer walks determines what they see, how long they stay, and ultimately how much they spend. Layout is strategy made physical.
          </p>
        </div>
      </div>

      {/* Three Layout Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Grid / Rack Layout',
            color: 'bg-blue-950',
            accent: 'text-blue-300',
            border: 'border-blue-700',
            plan: <GridFloorPlan />,
            usage: 'Grocery, Pharmacy, Hardware',
            idea: 'Maximum efficiency. Parallel aisles. Customers navigate systematically, covering the full store.',
            pros: ['Highest fixture density per m²', 'Easy restocking & inventory management', 'Customers find products predictably'],
            cons: ['Minimal discovery or serendipity', 'Clinical feel reduces dwell time'],
          },
          {
            name: 'Free Flow Layout',
            color: 'bg-violet-950',
            accent: 'text-violet-300',
            border: 'border-violet-700',
            plan: <FreeFlowFloorPlan />,
            usage: 'Fashion, Lifestyle, Luxury',
            idea: 'Fixtures placed organically. Customers wander freely, creating unplanned discovery moments.',
            pros: ['High browsing and dwell time', 'Encourages impulse discovery', 'Premium, boutique atmosphere'],
            cons: ['Lower space efficiency', 'Harder to navigate for task shoppers'],
          },
          {
            name: 'S-Layout (Loop)',
            color: 'bg-emerald-950',
            accent: 'text-emerald-300',
            border: 'border-emerald-600',
            plan: <SLoopFloorPlan />,
            usage: 'IKEA, Furniture, Experience Retail',
            idea: 'One forced path through every room. You cannot skip sections. 100% store exposure guaranteed.',
            highlight: true,
            pros: ['Every customer sees every department', 'Maximises average basket size', 'Curated journey with narrative arc'],
            cons: ['Frustrating for quick missions', 'Hard to revisit a section'],
          },
        ].map(l => (
          <div key={l.name} className={`${l.color} text-white rounded-3xl overflow-hidden ${l.highlight ? `ring-2 ${l.border} ring-offset-2` : ''}`}>
            <div className="p-4 pb-2">
              {l.plan}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-black">{l.name}</h3>
                <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${l.accent}`}>{l.usage}</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{l.idea}</p>
              <div className="space-y-1.5">
                {l.pros.map(p => (
                  <div key={p} className="flex items-start gap-2 text-xs text-white/80">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />{p}
                  </div>
                ))}
                {l.cons.map(c => (
                  <div key={c} className="flex items-start gap-2 text-xs text-white/50">
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />{c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IKEA Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-amber-400 rounded-3xl p-8 space-y-5">
          <div className="flex items-center gap-4">
            <Logo domain="ikea.com" alt="IKEA" size={52} bg="bg-white" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-700">Deep Dive S-Layout</p>
              <h3 className="text-3xl font-serif text-stone-900">Why IKEA Built a Maze</h3>
            </div>
          </div>
          <p className="text-stone-800 leading-relaxed text-sm">
            IKEA's layout is deliberate behavioural architecture. The forced path ensures every customer walks past every department. The "IKEA effect" where customers value items they have physically touched and carried is amplified by proximity and navigation effort.
          </p>
          <p className="text-stone-800 leading-relaxed text-sm">
            The in-store restaurant isn't a service gesture it is a <strong>dwell-time extension device</strong>. A fed customer stays longer, sees more, and buys more. Average visit: 3 hours.
          </p>
          <div className="border-t border-stone-900/20 pt-4">
            <blockquote className="italic text-stone-700 text-sm flex gap-2">
              <Quote className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-500" />
              "We want customers to leave with more than they came for and the building is designed to make that happen."
            </blockquote>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Average time in store', value: '3 hours', bar: 75, color: 'bg-amber-500' },
            { label: 'Unplanned purchases', value: '~60%', bar: 60, color: 'bg-emerald-500' },
            { label: 'Restaurant contribution to dwell time', value: '+45 min', bar: 40, color: 'bg-blue-500' },
            { label: 'Revenue per m² vs. standard furniture', value: '2.3×', bar: 85, color: 'bg-violet-500' },
          ].map(item => (
            <div key={item.label} className="bg-white border border-stone-100 rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-stone-700">{item.label}</span>
                <span className="text-lg font-black text-stone-900">{item.value}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5">
                <div className={`${item.color} h-1.5 rounded-full transition-all`} style={{ width: `${item.bar}%` }} />
              </div>
            </div>
          ))}

          <div className="bg-stone-950 text-white rounded-2xl p-5 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-amber-400">The 3-Zone Model</p>
            {[
              ['Showroom', 'Experience-led. Room settings. Emotion purchase.'],
              ['Marketplace', 'Self-service accessories. Impulse & add-ons.'],
              ['Warehouse', 'Flat-pack pickup. Operational, efficient.'],
            ].map(([zone, desc], i) => (
              <div key={zone} className="flex gap-3 text-sm">
                <span className="text-amber-400 font-black w-4 flex-shrink-0">{i + 1}</span>
                <div><span className="font-bold text-white">{zone} </span><span className="text-stone-400">{desc}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-5 shadow-sm">
        <h4 className="font-black text-stone-900 text-xl">Layout Comparison Matrix</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-stone-900">
                {['Layout', 'Space Efficiency', 'Customer Journey', 'Dwell Time', 'Impulse Buying', 'Best Mission'].map(h => (
                  <th key={h} className="text-left py-3 pr-6 text-[10px] font-black uppercase tracking-widest text-stone-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[
                ['Grid / Rack', '★★★★★', 'Predictable', '★★☆☆☆', '★★☆☆☆', 'Weekly grocery shop'],
                ['Free Flow', '★★★☆☆', 'Exploratory', '★★★★☆', '★★★★☆', 'Fashion, discovery'],
                ['S-Layout (Loop)', '★★★★☆', 'Forced / Curated', '★★★★★', '★★★★★', 'Experience & inspiration'],
              ].map((row, i) => (
                <tr key={i} className="hover:bg-stone-50">
                  {row.map((cell, j) => (
                    <td key={j} className={`py-4 pr-6 ${j === 0 ? 'font-black text-stone-900' : 'text-stone-500'}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 3 ────────────────────────────────────────────────────────────────
function DNVBsPage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden bg-stone-950 rounded-3xl p-10 text-white">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)' }} />
        <div className="relative space-y-3 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">Chapter 03 Digital Retail</span>
          <h2 className="text-5xl font-serif leading-[1.1]">Digitally Native <span className="italic text-stone-400">Vertical Brands</span></h2>
          <p className="text-stone-300 leading-relaxed">
            DNVBs did not disrupt retail by building better stores they disrupted it by eliminating them. Born online, owning their supply chain, speaking directly to their community.
          </p>
        </div>
      </div>

      {/* Definition */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Globe, title: 'Digital-First', desc: 'Born online. Community and revenue built through owned digital channels before any physical presence.', color: 'bg-blue-50 border-blue-200', icon_color: 'text-blue-600' },
          { icon: BarChart2, title: 'Vertically Integrated', desc: 'Owns design, production, logistics and retail. No wholesale, no intermediary, no margin dilution.', color: 'bg-violet-50 border-violet-200', icon_color: 'text-violet-600' },
          { icon: Users, title: 'Direct Relationship', desc: 'Owns all customer data end-to-end. Every transaction is a first-party signal no Amazon, no retailer.', color: 'bg-emerald-50 border-emerald-200', icon_color: 'text-emerald-600' },
          { icon: Store, title: 'Selective Offline', desc: 'Physical stores are brand embassies, not mass distribution. Opened only where they add brand equity.', color: 'bg-amber-50 border-amber-200', icon_color: 'text-amber-600' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className={`rounded-2xl border p-5 space-y-3 ${item.color}`}>
              <Icon className={`w-6 h-6 ${item.icon_color}`} />
              <h4 className="font-black text-stone-900 text-sm">{item.title}</h4>
              <p className="text-stone-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Jimmy Fairly */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-indigo-950 text-white rounded-3xl p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Logo domain="jimmyfairly.com" alt="Jimmy Fairly" size={52} bg="bg-white" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">🇫🇷 Eyewear Founded 2011</p>
                <h3 className="text-3xl font-serif">Jimmy Fairly</h3>
                <p className="text-indigo-300 italic text-sm">"Good eyewear. Good deeds."</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Jimmy Fairly entered a market structurally protected by the optician lobby and dismantled the pricing model with radical transparency. One price, everything included.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['€145', 'All-inclusive price'], ['~90', 'Selective stores'], ['1:1', 'Donation model'], ['D2C', 'No intermediary']].map(([v, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-indigo-300">{v}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400">Why Jimmy Fairly Succeeded</p>
          {[
            { n: '01', title: 'Radical Price Transparency', body: 'Traditional opticians mark up frames 10–20×. Jimmy Fairly exposed this and offered a credible €145 all-in alternative. The disruption was not product innovation it was pricing honesty.' },
            { n: '02', title: 'Cause as Conversion Driver', body: 'Each pair sold funds a donated pair. The cause is not a PR overlay it is baked into the purchase. Customers buy better because it feels better. CSR as a DNVB growth lever.' },
            { n: '03', title: 'Physical Stores as Brand Events', body: '"Fairly Labs" concept stores in premium neighbourhoods are editorial spaces coffee, events, opticians on-site. They complement the DTC model without competing with it.' },
            { n: '04', title: 'Community Before Commerce', body: 'Built a community of advocates through content and collaborations before scaling the store network. Social proof replaces advertising budget.' },
          ].map(item => (
            <div key={item.n} className="bg-white border border-stone-100 rounded-2xl p-5 flex gap-4 hover:shadow-md transition-shadow">
              <span className="text-xs font-black text-indigo-300 bg-indigo-50 rounded-lg px-2 py-1 h-fit">{item.n}</span>
              <div className="space-y-1">
                <h4 className="font-black text-stone-900 text-sm">{item.title}</h4>
                <p className="text-stone-500 text-xs leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sézane */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-stone-400">Why Sézane Succeeded</p>
          {[
            { n: '01', title: 'Community Built Before Product', body: 'Founder Morgane Sézalory launched on Instagram in 2013 when the platform was 3 years old. The first collection sold out in minutes because the community was already primed.' },
            { n: '02', title: 'Scarcity as a Strategic Weapon', body: 'Limited drops, never restocked. The urgency is engineered. Waiting lists reinforce desirability. Scarcity collapses the decision window and eliminates price comparison.' },
            { n: '03', title: '"Appartement" Format Experience, Not Retail', body: 'Physical stores are called Appartements curated Parisian apartments where you can try clothes, have a coffee, attend events. They are brand experiences that happen to sell clothes.' },
            { n: '04', title: 'Sustainable Positioning as Identity', body: 'Sézane was among the first fashion DNVBs to integrate sustainability as a brand pillar, not a footnote. This resonates powerfully with their core Gen-Z and Millennial audience.' },
          ].map(item => (
            <div key={item.n} className="bg-white border border-stone-100 rounded-2xl p-5 flex gap-4 hover:shadow-md transition-shadow">
              <span className="text-xs font-black text-rose-300 bg-rose-50 rounded-lg px-2 py-1 h-fit">{item.n}</span>
              <div className="space-y-1">
                <h4 className="font-black text-stone-900 text-sm">{item.title}</h4>
                <p className="text-stone-500 text-xs leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-rose-950 text-white rounded-3xl p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Logo domain="sezane.com" alt="Sézane" size={52} bg="bg-white" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-300">🇫🇷 Fashion Founded 2013</p>
                <h3 className="text-3xl font-serif">Sézane</h3>
                <p className="text-rose-300 italic text-sm">"French elegance, digital first."</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Sézane proved that luxury positioning and digital-native DNA are not contradictory they are complementary when community-first strategy replaces advertising spend.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['100%', 'Digital origin'], ['Limited', 'Drop model'], ['~3M', 'Community'], ['Appartement', 'Physical concept']].map(([v, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-rose-300">{v}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-5">
        <h4 className="font-black text-stone-900 text-xl">DNVB vs. Traditional Brand</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-stone-900">
                {['Dimension', 'Traditional Brand', 'DNVB'].map(h => (
                  <th key={h} className="text-left py-3 pr-6 text-[10px] font-black uppercase tracking-widest text-stone-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[
                ['Distribution', 'Factory → Wholesale → Retailer → Customer', 'Factory → Brand → Customer'],
                ['Customer Data', 'Partial (retailer owns most of it)', 'Full 1st-party data ownership'],
                ['Gross Margin', '30–45% (compressed by chain)', '55–70% (direct model)'],
                ['Speed to Market', '18–24 months', '6–12 weeks'],
                ['Community Building', 'Paid advertising', 'Content, social, earned media'],
                ['Product Feedback Loop', 'Slow (retail buyer filter)', 'Real-time (direct customer signal)'],
              ].map(row => (
                <tr key={row[0]} className="hover:bg-stone-50">
                  <td className="py-4 pr-6 font-black text-stone-900">{row[0]}</td>
                  <td className="py-4 pr-6 text-stone-400">{row[1]}</td>
                  <td className="py-4 pr-6 text-stone-900 font-medium">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 4 ────────────────────────────────────────────────────────────────
function CSRPatagoniaPage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden bg-stone-950 rounded-3xl p-10 text-white">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)' }} />
        <div className="relative space-y-3 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">Chapter 04 Sustainability & Ethics</span>
          <h2 className="text-5xl font-serif leading-[1.1]">CSR, <span className="italic text-stone-400">Patagonia</span> & Veja</h2>
          <p className="text-stone-300 leading-relaxed">
            Corporate Social Responsibility has shifted from compliance obligation to competitive advantage. In retail, sustainability strategy shapes brand positioning, talent attraction, and increasingly purchasing decisions.
          </p>
        </div>
      </div>

      {/* CSR Framework Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Definition Brundtland Commission, 1987</p>
            <h3 className="text-2xl font-serif">Sustainable Development</h3>
          </div>
          <blockquote className="border-l-2 border-emerald-400 pl-5 italic text-white/80 text-base leading-relaxed">
            "Development that meets the needs of the present without compromising the ability of future generations to meet their own needs."
          </blockquote>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: '💰', label: 'Economic', desc: 'Profitable & financially viable' },
              { icon: '👥', label: 'Social', desc: 'Fair labour, inclusion, health' },
              { icon: '🌍', label: 'Environmental', desc: 'Reduce footprint, circularity' },
            ].map(p => (
              <div key={p.label} className="bg-white/10 rounded-xl p-4 text-center space-y-1.5">
                <span className="text-2xl">{p.icon}</span>
                <p className="font-black text-sm">{p.label}</p>
                <p className="text-white/40 text-[10px]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-stone-400">UN Framework 2030 Agenda</p>
            <h3 className="text-2xl font-bold text-stone-900">17 Sustainable Development Goals</h3>
          </div>
          <p className="text-stone-500 text-sm">Retailers align their ESG commitments to specific SDGs. Below: the goals most relevant to FMCG and retail.</p>
          <div className="flex flex-wrap gap-2">
            {[
              ['SDG 2', 'Zero Hunger', 'bg-amber-100 text-amber-900'],
              ['SDG 8', 'Decent Work', 'bg-red-100 text-red-900'],
              ['SDG 10', 'Reduced Inequalities', 'bg-pink-100 text-pink-900'],
              ['SDG 12', 'Responsible Consumption', 'bg-orange-100 text-orange-900'],
              ['SDG 13', 'Climate Action', 'bg-green-100 text-green-900'],
              ['SDG 14', 'Life Below Water', 'bg-blue-100 text-blue-900'],
              ['SDG 15', 'Life on Land', 'bg-emerald-100 text-emerald-900'],
              ['SDG 17', 'Partnerships', 'bg-stone-100 text-stone-900'],
            ].map(([code, name, cls]) => (
              <div key={code} className={`${cls} rounded-xl px-3 py-2`}>
                <span className="text-[10px] font-black">{code}</span>
                <span className="text-[10px] font-medium ml-1">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patagonia Full Feature */}
      <div className="bg-stone-950 text-white rounded-3xl overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          <div className="flex items-center gap-5">
            <Logo domain="patagonia.com" alt="Patagonia" size={64} bg="bg-white" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Case Study Anti-Consumption Retail</p>
              <h3 className="text-4xl font-serif">Patagonia</h3>
              <p className="text-stone-400 italic text-base mt-1">"We're in business to save our home planet."</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">The Anti-Consumption Paradox</p>
              <p className="text-white/80 leading-relaxed text-sm">
                On Black Friday 2011, Patagonia ran a full-page ad in the New York Times that read: <strong>"Don't Buy This Jacket."</strong> It detailed the environmental cost of producing their best-selling fleece water consumption, carbon emissions, waste.
              </p>
              <p className="text-white/80 leading-relaxed text-sm">
                Sales <strong>rose by 30%</strong> the following year. The ad didn't kill demand it created trust. In a category defined by greenwashing, radical honesty was a differentiator.
              </p>
              <p className="text-white/80 leading-relaxed text-sm">
                Patagonia's logic: <em>buy less, but buy better</em>. Products are designed to last decades, not seasons. This is not anti-business it is anti-disposability.
              </p>
              <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                <blockquote className="italic text-white/70 text-sm flex gap-2">
                  <Quote className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                  "The more we grow, the more responsibility we have to use business to fight the environmental crisis."
                  <br />Yvon Chouinard, Founder
                </blockquote>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: '🌱', title: '1% for the Planet', desc: 'Donates 1% of annual sales not profit, sales to environmental causes. Over $140M donated since 1985. Even in loss-making years, the pledge holds.' },
                { icon: '🔄', title: 'Worn Wear Programme', desc: 'Repair, resale and recycling service. Customers bring back damaged gear. Patagonia repairs it free of charge or resells refurbished items. Circular economy made operational.' },
                { icon: '🌾', title: 'Regenerative Organic Certified', desc: 'Supply chain standard that goes beyond organic. Covers soil health, animal welfare and farmworker equity. Full traceability from farm to shelf.' },
                { icon: '🏛️', title: '2022 Ownership Transfer', desc: 'Chouinard transferred the company to a purpose trust and a non-profit. $100M/year in profits now legally mandated for environmental causes. The planet is the shareholder.' },
              ].map(item => (
                <div key={item.title} className="bg-white/8 border border-white/10 rounded-2xl p-5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <h4 className="font-black text-emerald-400 text-sm">{item.title}</h4>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-6">
            {[
              ['$1.5B+', 'Annual revenue (2023)'],
              ['>$140M', 'Donated to planet since 1985'],
              ['+30%', 'Sales growth after "Don\'t Buy" ad'],
              ['100%', 'Renewable energy at HQ'],
            ].map(([v, l]) => (
              <div key={l} className="bg-white/5 rounded-2xl py-6 text-center space-y-1">
                <p className="text-3xl font-black text-emerald-400">{v}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Veja Case Study */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          <div className="flex items-center gap-5">
            <Logo domain="veja-store.com" alt="Veja" size={64} bg="bg-white" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Case Study Radical Supply Chain Transparency</p>
              <h3 className="text-4xl font-serif text-stone-900">Veja</h3>
              <p className="text-stone-400 italic text-base mt-1">"No advertising. Just accountability."</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">The No-Advertising Model</p>
              <p className="text-stone-700 leading-relaxed text-sm">
                Founded in Paris in 2004, Veja makes sneakers and spends <strong>zero on traditional advertising</strong>. Instead, the entire budget that competitors spend on media goes into the supply chain paying cotton farmers in Brazil a fair price, sourcing wild rubber from the Amazon, and using recycled materials.
              </p>
              <p className="text-stone-700 leading-relaxed text-sm">
                The result: Veja sneakers cost <strong>5–7× more to produce</strong> than a comparable conventional shoe. Yet they retail at a premium that customers willingly pay because the story is credible, verifiable, and embedded in the product itself.
              </p>
              <p className="text-stone-700 leading-relaxed text-sm">
                When Meghan Markle wore Veja at the Invictus Games in 2017, the brand received global press worth millions. They had paid <strong>nothing</strong> for it. Authenticity became their media strategy.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <blockquote className="italic text-stone-600 text-sm flex gap-2">
                  <Quote className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                  "We spend nothing on advertising and 5× more on production costs. That's our model."
                  <br />Sébastien Kopp, Co-founder
                </blockquote>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: '🌿', title: 'Organic Cotton from Brazil', desc: 'Veja sources cotton directly from small-scale farmers in Brazil certified by Esplar. Farmers are paid 60% above market price no middlemen, no speculation.' },
                { icon: '🌳', title: 'Wild Amazonian Rubber', desc: 'Soles use rubber tapped by seringueiros in the Amazon. This gives the forest more economic value standing than deforested, preserving biodiversity and livelihoods.' },
                { icon: '♻️', title: 'Recycled & Biosourced Materials', desc: 'Uppers use sugarcane-derived B-Mesh, recycled plastic bottles (K-Swiss), and corn waste. Material innovation is a core R&D investment, not a marketing claim.' },
                { icon: '🏭', title: 'Fair Factory in Porto Alegre', desc: 'Manufactured in a single certified factory in Brazil. Workers earn 3× the local minimum wage. Factory audit reports are published annually on their website.' },
              ].map(item => (
                <div key={item.title} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <h4 className="font-black text-emerald-700 text-sm">{item.title}</h4>
                  </div>
                  <p className="text-stone-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-stone-200 pt-6">
            {[
              ['$0', 'Spent on advertising'],
              ['5–7×', 'Higher production cost vs. conventional'],
              ['60%', 'Premium paid to cotton farmers above market'],
              ['B Corp', 'Certified since 2020'],
            ].map(([v, l]) => (
              <div key={l} className="bg-emerald-50 border border-emerald-200 rounded-2xl py-6 text-center space-y-1">
                <p className="text-3xl font-black text-emerald-700">{v}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patagonia vs Veja comparison */}
      <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-5 shadow-sm">
        <h4 className="font-black text-stone-900 text-xl">Two Models, One Philosophy</h4>
        <p className="text-stone-500 text-sm max-w-2xl">Patagonia and Veja both reject the conventional playbook but through very different mechanisms.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-stone-900">
                {['Dimension', 'Patagonia', 'Veja'].map(h => (
                  <th key={h} className="text-left py-3 pr-6 text-[10px] font-black uppercase tracking-widest text-stone-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[
                ['Industry', 'Outdoor apparel', 'Footwear / Sneakers'],
                ['Core CSR lever', 'Anti-consumption + repair', 'Supply chain transparency'],
                ['Advertising spend', 'Minimal', 'Zero'],
                ['Ownership model', 'Purpose trust (planet as shareholder)', 'Private, founder-led'],
                ['Key proof point', '"Don\'t Buy This Jacket" ad', 'Factory wage reports published publicly'],
                ['Price positioning', 'Premium durability justifies cost', 'Premium ethics justifies cost'],
                ['Community building', 'Environmental activism', 'Product authenticity & earned media'],
              ].map(row => (
                <tr key={row[0]} className="hover:bg-stone-50">
                  <td className="py-3 pr-6 font-black text-stone-900">{row[0]}</td>
                  <td className="py-3 pr-6 text-stone-500">{row[1]}</td>
                  <td className="py-3 pr-6 text-stone-700 font-medium">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSR vs Greenwashing */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-stone-400" />
          <h4 className="font-black text-stone-900 text-xl">Genuine CSR vs. Greenwashing</h4>
        </div>
        <p className="text-stone-500 text-sm max-w-2xl">
          The EU Green Claims Directive (2023) is cracking down on unsubstantiated sustainability claims. Retailers face fines and reputational damage if their ESG communications don't hold up to scrutiny.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Genuine CSR
            </p>
            {[
              ['Measurable targets', 'Specific KPIs tied to SDGs with public reporting'],
              ['Third-party certification', 'B Corp, FSC, Fairtrade, RSPO audited externally'],
              ['Supply chain transparency', 'Published supplier lists and audits'],
              ['Embedded in P&L', 'Sustainability is a cost of doing business, not a budget line'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div><span className="text-sm font-bold text-stone-900">{title}: </span><span className="text-sm text-stone-500">{desc}</span></div>
              </div>
            ))}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Greenwashing
            </p>
            {[
              ['Vague language', '"Natural", "eco-friendly", "conscious" with no definition'],
              ['No verification', 'Self-certified claims, no independent audit'],
              ['Marketing-only scope', 'Sustainability lives in comms, not operations'],
              ['Core contradiction', 'Claims sustainability while growing fast fashion volume'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div><span className="text-sm font-bold text-stone-900">{title}: </span><span className="text-sm text-stone-500">{desc}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
          <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-black text-stone-900 text-sm">Regulatory Watch: EU Green Claims Directive</p>
            <p className="text-stone-600 text-xs leading-relaxed">From 2026, retailers operating in the EU must substantiate all environmental claims with scientific evidence before publication. Generic claims like "good for the planet" will be banned without third-party verification. This is forcing the industry to operationalise sustainability, not just communicate it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function DeepDivePage() {
  const [activePage, setActivePage] = useState(1);

  const pages = {
    1: <RetailFormatsPage />,
    2: <StoreLayoutsPage />,
    3: <DNVBsPage />,
    4: <CSRPatagoniaPage />,
  };

  return (
    <motion.div
      key="deepdive"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10"
    >
      {/* Section Header */}
      <div className="flex items-start justify-between flex-wrap gap-6 pb-6 border-b border-stone-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">International Retail Management</p>
            <h1 className="text-3xl font-serif tracking-tight text-stone-900">Deep Dive</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PAGES.map(p => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setActivePage(p.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 border ${
                  activePage === p.id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-[1.02]'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{p.label}</span>
                <span className="sm:hidden">{p.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          {pages[activePage]}
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      <div className="flex justify-between items-center pt-6 border-t border-stone-100">
        <button
          onClick={() => setActivePage(p => Math.max(1, p - 1))}
          disabled={activePage === 1}
          className="flex items-center gap-2 text-sm font-black text-stone-500 hover:text-stone-900 disabled:opacity-25 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <div className="flex gap-2">
          {PAGES.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePage(p.id)}
              className={`w-2 h-2 rounded-full transition-all ${activePage === p.id ? 'bg-stone-900 scale-125' : 'bg-stone-200 hover:bg-stone-400'}`}
            />
          ))}
        </div>
        <button
          onClick={() => setActivePage(p => Math.min(PAGES.length, p + 1))}
          disabled={activePage === PAGES.length}
          className="flex items-center gap-2 text-sm font-black text-stone-500 hover:text-stone-900 disabled:opacity-25 disabled:pointer-events-none transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
