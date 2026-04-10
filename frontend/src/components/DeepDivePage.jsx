import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Store, Layout, Smartphone, Leaf } from 'lucide-react';

const PAGES = [
  { id: 1, label: 'Retail Formats', icon: Store },
  { id: 2, label: 'Store Layouts', icon: Layout },
  { id: 3, label: 'DNVBs', icon: Smartphone },
  { id: 4, label: 'CSR & Patagonia', icon: Leaf },
];

// ─── PAGE 1 ────────────────────────────────────────────────────────────────
function RetailFormatsPage() {
  const formats = [
    {
      emoji: '🏪',
      name: 'Convenience Store',
      color: 'bg-orange-50 border-orange-200',
      badge: 'bg-orange-500',
      size: '< 500 m²',
      examples: '7-Eleven, Spar Express',
      desc: 'Open late / 24h. High traffic, impulse purchases. Premium pricing justified by proximity.',
      highlight: true,
    },
    {
      emoji: '🏬',
      name: 'Supermarket',
      color: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-500',
      size: '1 000 – 4 500 m²',
      examples: 'Monoprix, Carrefour Market',
      desc: 'Full grocery assortment. Weekly shop destination. Balance of price, range & freshness.',
    },
    {
      emoji: '🏢',
      name: 'Hypermarket',
      color: 'bg-violet-50 border-violet-200',
      badge: 'bg-violet-500',
      size: '> 5 000 m²',
      examples: 'Carrefour, Walmart',
      desc: 'Food + non-food under one roof. Destination shopping. Parking-dependent suburban model.',
    },
    {
      emoji: '🏷️',
      name: 'Discount Store',
      color: 'bg-red-50 border-red-200',
      badge: 'bg-red-500',
      size: '700 – 1 500 m²',
      examples: 'Lidl, Aldi, Leader Price',
      desc: 'Limited SKUs, high private-label share (>80%). Stripped-down experience, unbeatable price.',
    },
    {
      emoji: '🧱',
      name: 'Brick & Mortar',
      color: 'bg-stone-50 border-stone-200',
      badge: 'bg-stone-600',
      size: 'Varies',
      examples: 'Any physical retail store',
      desc: 'Physical presence. Tangibility, immediacy, service. Increasingly augmented by digital (phygital).',
    },
    {
      emoji: '💊',
      name: 'Drug Store / Pharmacy',
      color: 'bg-green-50 border-green-200',
      badge: 'bg-green-600',
      size: '200 – 800 m²',
      examples: 'Boots, CVS, Pharmacie',
      desc: 'Health, beauty & wellness. High margin categories. Cross-selling OTC with cosmetics.',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Chapter 01 — Retail Management</span>
        <h2 className="text-4xl font-serif tracking-tight text-stone-900">Retail Store Formats</h2>
        <p className="text-stone-500 text-base max-w-2xl">
          Retailers operate across a spectrum of formats — each optimised for a specific customer mission, basket size, and location strategy.
        </p>
      </div>

      {/* 7-Eleven Cluster Model Spotlight */}
      <div className="bg-stone-950 text-white rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🗺️</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Spotlight — Cluster Model</p>
            <h3 className="text-2xl font-serif">7-Eleven's Dominance Strategy</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Cluster Saturation', desc: 'Open dense networks in one city before expanding. Shared logistics + marketing spend.', icon: '📍' },
            { step: '2', title: 'Traffic Anchoring', desc: 'Locate near transport hubs, offices, universities — where daily footfall is guaranteed.', icon: '🚇' },
            { step: '3', title: 'Franchise Scale', desc: '85,000+ stores worldwide via franchising. Capital-light growth, local operator accountability.', icon: '🌏' },
          ].map(item => (
            <div key={item.step} className="bg-white/10 rounded-2xl p-5 space-y-2">
              <div className="text-2xl">{item.icon}</div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Step {item.step}</p>
              <p className="font-bold text-white">{item.title}</p>
              <p className="text-stone-300 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-4 flex flex-wrap gap-6 text-center">
          {[['85 000+', 'Stores globally'], ['19', 'Countries'], ['#1', 'Convenience chain'], ['24/7', 'Always open']].map(([val, lbl]) => (
            <div key={lbl}>
              <p className="text-2xl font-bold text-amber-400">{val}</p>
              <p className="text-xs text-stone-400 uppercase tracking-widest">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Format Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {formats.map(f => (
          <div key={f.name} className={`rounded-2xl border p-6 space-y-3 ${f.color} ${f.highlight ? 'ring-2 ring-orange-400 ring-offset-1' : ''}`}>
            <div className="flex items-start justify-between">
              <span className="text-3xl">{f.emoji}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded-full ${f.badge}`}>{f.size}</span>
            </div>
            <h4 className="text-lg font-bold text-stone-900">{f.name}</h4>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{f.examples}</p>
            <p className="text-sm text-stone-600">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Private Label Trend */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">🏷</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Trending Topic</p>
            <h3 className="text-2xl font-bold text-stone-900">Private Labeling</h3>
          </div>
        </div>
        <p className="text-stone-700 max-w-2xl">
          Retailers are becoming brand owners. Private-label (own-brand) products now account for <strong>~35% of European grocery sales</strong> — and growing. It's vertical integration from shelf to factory.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '💰', title: 'Higher Margins', desc: 'Retailer captures manufacturer margin. Gross margins 2–3× vs national brands.' },
            { icon: '🔒', title: 'Customer Lock-in', desc: 'Exclusive products unavailable elsewhere. Drives loyalty and repeat visits.' },
            { icon: '📈', title: 'Price Positioning', desc: 'Offers a credible value alternative. Especially powerful in inflationary periods.' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl p-5 border border-amber-100 space-y-2">
              <span className="text-2xl">{item.icon}</span>
              <p className="font-bold text-stone-900">{item.title}</p>
              <p className="text-sm text-stone-500">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          {['Carrefour Bio', 'Kirkland (Costco)', 'George (ASDA)', 'Up&Up (Target)', 'Lidl Deluxe', 'President\'s Choice'].map(b => (
            <span key={b} className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE 2 ────────────────────────────────────────────────────────────────
function StoreLayoutsPage() {
  const layouts = [
    {
      name: 'Rack / Grid Layout',
      icon: '⊞',
      color: 'bg-blue-950',
      accent: 'text-blue-300',
      badge: 'bg-blue-600',
      example: 'Supermarkets, Pharmacies',
      pros: ['Maximum shelf density', 'Easy restocking', 'Customer navigates systematically'],
      cons: ['Less discovery', 'Can feel clinical'],
      visual: 'grid',
      desc: 'Parallel aisles arranged in a grid. The most space-efficient layout. Customers move in a predictable linear path.',
    },
    {
      name: 'Free Flow Layout',
      icon: '〰',
      color: 'bg-violet-950',
      accent: 'text-violet-300',
      badge: 'bg-violet-600',
      example: 'Boutiques, Lifestyle stores, H&M',
      pros: ['Encourages browsing', 'Creates discovery moments', 'Premium atmosphere'],
      cons: ['Less efficient use of space', 'Harder to navigate'],
      visual: 'flow',
      desc: 'Open floor with grouped fixtures placed organically. Promotes exploration and dwell time. Common in fashion retail.',
    },
    {
      name: 'S-Layout (Loop / Racetrack)',
      icon: '↩',
      color: 'bg-emerald-950',
      accent: 'text-emerald-300',
      badge: 'bg-emerald-600',
      example: 'IKEA, IKEA, IKEA',
      pros: ['100% store exposure', 'Journey feels curated', 'Upsell at every turn'],
      cons: ['Hard to exit early', 'Confusing for quick visits'],
      visual: 'loop',
      highlight: true,
      desc: 'A single forced path guides customers through every department before reaching the exit. The customer cannot skip sections.',
    },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Chapter 02 — Store Design</span>
        <h2 className="text-4xl font-serif tracking-tight text-stone-900">Store Layouts</h2>
        <p className="text-stone-500 text-base max-w-2xl">
          The physical arrangement of a store is a strategic tool — it shapes the customer journey, dwell time, and ultimately the basket size.
        </p>
      </div>

      {/* Layout Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {layouts.map(l => (
          <div key={l.name} className={`${l.color} text-white rounded-3xl p-7 space-y-5 ${l.highlight ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}>
            <div className="flex items-start justify-between">
              <span className="text-5xl font-mono leading-none">{l.icon}</span>
              {l.highlight && <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2.5 py-1 rounded-full">Case Study</span>}
            </div>
            <div>
              <h3 className="text-xl font-bold">{l.name}</h3>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${l.accent}`}>{l.example}</p>
            </div>
            <p className="text-sm text-white/70">{l.desc}</p>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Advantages</p>
              {l.pros.map(p => (
                <div key={p} className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span className="text-white/80">{p}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Limitations</p>
              {l.cons.map(c => (
                <div key={c} className="flex items-start gap-2 text-sm">
                  <span className="text-red-400 mt-0.5">✗</span>
                  <span className="text-white/70">{c}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* IKEA Deep Dive */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center text-stone-900 font-black text-2xl">↩</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Deep Dive</p>
            <h3 className="text-2xl font-bold text-stone-900">Why IKEA Built a Maze</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-stone-700">
              IKEA's S-layout is not accidental — it is a <strong>deliberate psychological architecture</strong>. The "IKEA effect" is well documented: customers feel ownership and attachment to products they discover along the path, not on a shopping list.
            </p>
            <p className="text-stone-700">
              The forced path ensures every customer sees every department. Combined with the café and restaurant (which extend dwell time), the average IKEA visit lasts <strong>3 hours</strong>.
            </p>
          </div>
          <div className="space-y-3">
            {[
              ['3h', 'Average time spent in store'],
              ['~60%', 'Purchases that were unplanned'],
              ['450+', 'Stores across 60 countries'],
              ['Showroom → Warehouse → Checkout', 'The 3-zone journey'],
            ].map(([val, lbl]) => (
              <div key={lbl} className="flex items-center justify-between bg-white rounded-xl px-5 py-3 border border-amber-100">
                <span className="text-sm text-stone-500">{lbl}</span>
                <span className="text-sm font-bold text-stone-900">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Diagram Legend */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 space-y-4">
        <h4 className="font-bold text-stone-900 text-lg">Layout Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                {['Layout', 'Space Efficiency', 'Customer Journey', 'Impulse Buying', 'Best For'].map(h => (
                  <th key={h} className="text-left py-3 pr-6 text-xs font-bold uppercase tracking-widest text-stone-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[
                ['Grid / Rack', '★★★★★', 'Predictable', '★★☆☆☆', 'Grocery, pharmacy'],
                ['Free Flow', '★★★☆☆', 'Exploratory', '★★★★☆', 'Fashion, lifestyle'],
                ['S-Layout (Loop)', '★★★★☆', 'Forced / Curated', '★★★★★', 'Furniture, experience retail'],
              ].map(row => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i} className={`py-3 pr-6 ${i === 0 ? 'font-bold text-stone-900' : 'text-stone-600'}`}>{cell}</td>
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
  const brands = [
    {
      name: 'Jimmy Fairly',
      category: 'Eyewear',
      color: 'bg-indigo-950',
      accent: 'bg-indigo-500',
      founded: '2011',
      flag: '🇫🇷',
      tagline: '"Good eyewear. Good deeds."',
      why: [
        'Direct-to-consumer: cut optician middleman, pass savings to customer.',
        'Transparent pricing (€145 all-inclusive) disrupted a market with opaque mark-ups.',
        'Each pair sold = pair donated. Cause-driven purchase.',
        'Selective physical stores act as brand showrooms, not just transactional points.',
      ],
      stats: [['~90', 'Physical stores'], ['D2C', 'Business model'], ['1:1', 'Buy one, give one'], ['2×', 'Lower price than traditional optician']],
    },
    {
      name: 'Sézane',
      category: 'Fashion',
      color: 'bg-rose-950',
      accent: 'bg-rose-500',
      founded: '2013',
      flag: '🇫🇷',
      tagline: '"French elegance, digital first."',
      why: [
        'Born on Instagram — community built before the first garment sold.',
        'Limited drops create scarcity and urgency. Items sell out within hours.',
        '"Appartement" concept stores are brand experiences, not traditional retail.',
        'Transparent production commitments. Sustainability is part of the identity.',
      ],
      stats: [['100%', 'Online origin'], ['Limited', 'Drop model'], ['~3M', 'Community followers'], ['Appartement', 'Physical format']],
    },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Chapter 03 — Digital Retail</span>
        <h2 className="text-4xl font-serif tracking-tight text-stone-900">DNVBs</h2>
        <p className="text-stone-500 text-base max-w-2xl">
          Digitally Native Vertical Brands are rewriting the rules of retail — born online, owning the full value chain, and building communities before selling products.
        </p>
      </div>

      {/* Definition Card */}
      <div className="bg-stone-950 text-white rounded-3xl p-8 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📱</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Definition</p>
            <h3 className="text-2xl font-serif">What is a DNVB?</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: '🌐', title: 'Digital-first', desc: 'Born online. Community and sales built through digital channels before any physical presence.' },
            { icon: '🏭', title: 'Vertically Integrated', desc: 'Controls design, production, distribution and retail. No intermediary.' },
            { icon: '🤝', title: 'Direct Relationship', desc: 'Owns the customer data and experience end-to-end. No wholesale, no Amazon.' },
            { icon: '🏪', title: 'Selective Offline', desc: 'Opens physical touchpoints strategically — for brand experience, not mass distribution.' },
          ].map(item => (
            <div key={item.title} className="bg-white/10 rounded-2xl p-5 space-y-2">
              <span className="text-2xl">{item.icon}</span>
              <p className="font-bold text-white text-sm">{item.title}</p>
              <p className="text-stone-300 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Deep Dives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {brands.map(brand => (
          <div key={brand.name} className={`${brand.color} text-white rounded-3xl p-7 space-y-6`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">{brand.flag} {brand.category} · Founded {brand.founded}</p>
                <h3 className="text-3xl font-serif mt-1">{brand.name}</h3>
                <p className="text-white/60 italic mt-1">{brand.tagline}</p>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-full ${brand.accent}`}>DNVB</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Why They Succeed</p>
              {brand.why.map((w, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-amber-400 font-bold mt-0.5">{i + 1}.</span>
                  <span className="text-white/80">{w}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
              {brand.stats.map(([val, lbl]) => (
                <div key={lbl} className="bg-white/10 rounded-xl p-3">
                  <p className="text-xl font-bold text-amber-400">{val}</p>
                  <p className="text-xs text-white/50 uppercase tracking-widest mt-1">{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* DNVB vs Traditional */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 space-y-5">
        <h4 className="font-bold text-stone-900 text-xl">DNVB vs Traditional Retail</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                {['Dimension', 'Traditional Brand', 'DNVB'].map(h => (
                  <th key={h} className="text-left py-3 pr-6 text-xs font-bold uppercase tracking-widest text-stone-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {[
                ['Distribution', 'Wholesale → Retailer → Customer', 'Brand → Customer (direct)'],
                ['Customer Data', 'Limited (retailer owns it)', 'Full ownership of 1st-party data'],
                ['Margins', 'Compressed by intermediaries', 'Higher — no middleman'],
                ['Speed to market', 'Slow (18–24 months)', 'Fast (weeks to months)'],
                ['Community', 'Built through advertising', 'Built through content & social'],
              ].map(row => (
                <tr key={row[0]}>
                  <td className="py-3 pr-6 font-bold text-stone-900">{row[0]}</td>
                  <td className="py-3 pr-6 text-stone-500">{row[1]}</td>
                  <td className="py-3 pr-6 text-stone-900 font-medium">{row[2]}</td>
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
    <div className="space-y-10">
      <div className="space-y-2">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Chapter 04 — Sustainability</span>
        <h2 className="text-4xl font-serif tracking-tight text-stone-900">CSR & Patagonia</h2>
        <p className="text-stone-500 text-base max-w-2xl">
          Corporate Social Responsibility is no longer optional. In retail, it defines brand identity, attracts talent, and increasingly, drives purchasing decisions.
        </p>
      </div>

      {/* CSR Framework */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 space-y-5">
          <span className="text-3xl">🌱</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Definition</p>
            <h3 className="text-2xl font-serif">Brundtland (1987)</h3>
          </div>
          <p className="text-white/80 text-base leading-relaxed">
            "Development that meets the needs of the present without compromising the ability of future generations to meet their own needs."
          </p>
          <div className="border-t border-white/10 pt-4 space-y-3">
            {[
              ['🏛️', 'Economic', 'Profitable and financially viable'],
              ['👥', 'Social', 'Fair labor, community, health & safety'],
              ['🌍', 'Environmental', 'Reduce footprint, circular economy'],
            ].map(([icon, dim, desc]) => (
              <div key={dim} className="flex items-start gap-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="font-bold text-sm">{dim}</p>
                  <p className="text-white/50 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 space-y-5">
          <span className="text-3xl">🎯</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">UN Framework</p>
            <h3 className="text-2xl font-bold text-stone-900">17 SDGs</h3>
          </div>
          <p className="text-stone-600 text-sm">The Sustainable Development Goals provide a global blueprint. Retailers align their CSR commitments to specific goals.</p>
          <div className="flex flex-wrap gap-2">
            {[
              ['SDG 2', 'Zero Hunger', 'bg-amber-100 text-amber-800'],
              ['SDG 8', 'Decent Work', 'bg-red-100 text-red-800'],
              ['SDG 12', 'Responsible Consumption', 'bg-orange-100 text-orange-800'],
              ['SDG 13', 'Climate Action', 'bg-green-100 text-green-800'],
              ['SDG 15', 'Life on Land', 'bg-emerald-100 text-emerald-800'],
              ['SDG 17', 'Partnerships', 'bg-blue-100 text-blue-800'],
            ].map(([code, name, cls]) => (
              <div key={code} className={`${cls} rounded-xl px-3 py-2 text-xs font-bold`}>
                <span className="font-black">{code}</span> — {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patagonia Spotlight */}
      <div className="bg-stone-950 text-white rounded-3xl p-8 space-y-7">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl">🏔️</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Case Study</p>
            <h3 className="text-3xl font-serif">Patagonia</h3>
            <p className="text-white/50 italic text-sm">"We're in business to save our home planet."</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">The Anti-Consumption Logic</p>
            <p className="text-white/80 text-sm leading-relaxed">
              Patagonia actively discourages overconsumption — paradoxically driving fierce brand loyalty. Their famous 2011 Black Friday ad <strong>"Don't Buy This Jacket"</strong> ran in the New York Times, urging customers to buy only what they need.
            </p>
            <p className="text-white/80 text-sm leading-relaxed">
              The message: <strong>we make products designed to last</strong>. Buy less, but buy better. This positions Patagonia against fast fashion's disposability culture.
            </p>
          </div>

          <div className="space-y-3">
            {[
              ['1% for the Planet', 'Commits 1% of all sales to environmental causes — not profit, sales.'],
              ['Worn Wear', 'Repair, resale, and recycling program. Extends product life.'],
              ['Regenerative Organic', 'Certified supply chain standards. Farm-to-store traceability.'],
              ['2022 Ownership Transfer', 'Founder Yvon Chouinard transferred company to a trust for the planet.'],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white/10 rounded-2xl p-4 space-y-1">
                <p className="font-bold text-emerald-400 text-sm">{title}</p>
                <p className="text-white/60 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-6">
          {[
            ['$1.5B+', 'Annual revenue'],
            ['>$140M', 'Donated to planet since 1985'],
            ['100%', 'Renewable energy in HQ'],
            ['~$0', 'Paid for "Don\'t Buy This Jacket" ad ROI'],
          ].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{val}</p>
              <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CSR vs Greenwashing */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-5">
        <h4 className="font-bold text-stone-900 text-xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span> CSR vs. Greenwashing
        </h4>
        <p className="text-stone-700 text-sm max-w-2xl">
          Not all sustainability claims are equal. Greenwashing — making misleading environmental claims — is increasingly scrutinised by regulators and consumers alike.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Genuine CSR</p>
            {['Measurable targets tied to SDGs', 'Third-party certification (B Corp, FSC)', 'Supply chain transparency', 'Embedded in business model, not add-on'].map(i => (
              <div key={i} className="flex items-start gap-2 text-sm text-stone-700">
                <span className="text-emerald-500">✓</span>{i}
              </div>
            ))}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-red-600">Greenwashing</p>
            {['Vague claims ("eco-friendly", "natural")', 'No third-party verification', 'Sustainability limited to comms/marketing', 'Core business contradicts the message'].map(i => (
              <div key={i} className="flex items-start gap-2 text-sm text-stone-700">
                <span className="text-red-500">✗</span>{i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function DeepDivePage() {
  const [activePage, setActivePage] = useState(1);

  const pageContent = {
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
      <div className="flex items-start justify-between flex-wrap gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500">International Retail Management</p>
              <h1 className="text-3xl font-serif tracking-tight text-stone-900">Deep Dive</h1>
            </div>
          </div>
          <p className="text-stone-400 text-sm max-w-lg pl-[52px]">
            Four chapters from the emlyon business school retail curriculum — formats, layouts, digital brands & sustainability.
          </p>
        </div>

        {/* Page navigation pills */}
        <div className="flex flex-wrap gap-2">
          {PAGES.map(p => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setActivePage(p.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 border ${
                  activePage === p.id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-lg'
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
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {pageContent[activePage]}
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      <div className="flex justify-between items-center pt-4 border-t border-stone-100">
        <button
          onClick={() => setActivePage(p => Math.max(1, p - 1))}
          disabled={activePage === 1}
          className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-300">{activePage} / {PAGES.length}</span>
        <button
          onClick={() => setActivePage(p => Math.min(PAGES.length, p + 1))}
          disabled={activePage === PAGES.length}
          className="flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
