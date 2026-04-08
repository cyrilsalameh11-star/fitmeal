import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// REELS DATA — organized per account, newest first
// Page 1 = index 0 (newest), Page 6 = index 5 (oldest)
// To add new reels: prepend to the reels array. The last entry
// (index 5) gets pushed out automatically via TOTAL_PAGES.
// ─────────────────────────────────────────────────────────────────
const ACCOUNTS_DATA = [
  {
    handle: 'guide.lb',
    color: '#e11d48',
    url: 'https://www.instagram.com/guide.lb/',
    reels: [
      { shortcode: 'DWLqlhujWQn', type: 'p'    }, // page 1 — newest
      { shortcode: 'DUyUdKfDQfS', type: 'reel' }, // page 2
      { shortcode: 'DUgGrZDDYpl', type: 'reel' }, // page 3
      { shortcode: 'DSkvVRjjcMY', type: 'p'    }, // page 4
      { shortcode: 'DSC5LaRDTOI', type: 'reel' }, // page 5
      { shortcode: 'DRzc-I5jaoJ', type: 'reel' }, // page 6 — oldest
    ],
  },
  {
    handle: 'baroodiesfoodies',
    color: '#d97706',
    url: 'https://www.instagram.com/baroodiesfoodies/',
    reels: [
      { shortcode: 'DWefGLFjdu1', type: 'reel' }, // page 1 — newest
      { shortcode: 'DUlZ_JQjMSh', type: 'reel' }, // page 2
      { shortcode: 'DVVlCUiDaG6', type: 'reel' }, // page 3
      { shortcode: 'DVMfhvYDRYS', type: 'reel' }, // page 4
      { shortcode: 'DU-VE72jRn3', type: 'reel' }, // page 5
      { shortcode: 'DUvLEl5DTd_', type: 'reel' }, // page 6 — oldest
    ],
  },
  {
    handle: 'baroodiesfoodies.dxb',
    color: '#0891b2',
    url: 'https://www.instagram.com/baroodiesfoodies.dxb/',
    reels: [
      { shortcode: 'DQjgZMhkqh2', type: 'reel' }, // page 1 — newest
      { shortcode: 'DUxdhBqDU_T', type: 'reel' }, // page 2
      { shortcode: 'DUgGiWNEiZi', type: 'reel' }, // page 3
      { shortcode: 'DUKxO6VDczo', type: 'reel' }, // page 4
      { shortcode: 'DRAC021kvno', type: 'reel' }, // page 5
      { shortcode: 'DQjgZMhkqh2', type: 'reel' }, // page 6 — oldest
    ],
  },
  {
    handle: 'ellevousguide',
    color: '#7c3aed',
    url: 'https://www.instagram.com/ellevousguide/',
    blocked: true,
    reels: [
      { shortcode: 'DVti6aGDoWq', type: 'reel' }, // page 1 — newest
      { shortcode: 'DSzNG4tjAqu', type: 'reel' }, // page 2
      { shortcode: 'DRAQGGUjKy0', type: 'reel' }, // page 3
      { shortcode: 'DR2V9vuDML-', type: 'reel' }, // page 4
      { shortcode: 'DUfYlnuAvxJ', type: 'reel' }, // page 5
      { shortcode: 'DVti6aGDoWq', type: 'reel' }, // page 6 — oldest
    ],
  },
  {
    handle: 'laroutineyt',
    color: '#16a34a',
    url: 'https://www.instagram.com/laroutineyt/',
    reels: [
      { shortcode: 'DWzDerXjURf', type: 'reel' }, // page 1 — newest
      { shortcode: 'DVTx-Bdje99', type: 'reel' }, // page 2
      { shortcode: 'DVHRV8aDVMd', type: 'reel' }, // page 3
      { shortcode: 'DVG4b48jbNi', type: 'reel' }, // page 4
      { shortcode: 'DU5DbZWDQ42', type: 'reel' }, // page 5
      { shortcode: 'DUQzpVqDVlU', type: 'reel' }, // page 6 — oldest
    ],
  },
  {
    handle: 'wondersbyaline',
    color: '#f43f5e',
    url: 'https://www.instagram.com/wondersbyaline/',
    reels: [
      { shortcode: 'DWmFYn0DXsy', type: 'reel' }, // page 1 — newest
      { shortcode: 'DVRqFx7jYld', type: 'reel' }, // page 2
      { shortcode: 'DVB4QnTDVF-', type: 'reel' }, // page 3
      { shortcode: 'DU8mp01jZnu', type: 'reel' }, // page 4
      { shortcode: 'DUv5pNUjT4U', type: 'reel' }, // page 5
      { shortcode: 'DUtE9gqDUeY', type: 'reel' }, // page 6 — oldest
    ],
  },
  {
    handle: 'newinbeirut',
    color: '#f97316',
    url: 'https://www.instagram.com/newinbeirut/',
    reels: [
      { shortcode: 'DVy2il5DTsk', type: 'p'    }, // page 1 — newest
      { shortcode: 'DVthGdRDYhk', type: 'p'    }, // page 2
      { shortcode: 'DVeHssgDUKf', type: 'p'    }, // page 3
      { shortcode: 'DVRUcaTjaYu', type: 'p'    }, // page 4
      { shortcode: 'DUaUxCtjVdq', type: 'reel' }, // page 5
      { shortcode: 'DUTf12UDTbX', type: 'p'    }, // page 6 — oldest
    ],
  },
];

const MAX_PAGES = 6; // reels beyond this index are dropped when new ones come in
const TOTAL_PAGES = Math.max(...ACCOUNTS_DATA.map(a => Math.min(a.reels.length, MAX_PAGES)));

// Page N shows reels[N] for each account (skips accounts with fewer reels)
function getPageReels(page) {
  return ACCOUNTS_DATA
    .filter(acc => acc.reels[page])
    .map((acc, i) => ({
      id: page * ACCOUNTS_DATA.length + i,
      handle: acc.handle,
      color: acc.color,
      blocked: acc.blocked || false,
      ...acc.reels[page],
    }));
}

// All reels for a single account (newest first)
function getAccountReels(handle) {
  const acc = ACCOUNTS_DATA.find(a => a.handle === handle);
  if (!acc) return [];
  return acc.reels.slice(0, MAX_PAGES).map((r, i) => ({
    id: i,
    handle: acc.handle,
    color: acc.color,
    blocked: acc.blocked || false,
    ...r,
  }));
}

// Load embed.js once, globally
function loadEmbedScript(cb) {
  if (window.instgrm) { cb(); return; }
  if (document.getElementById('ig-embed-script')) {
    const existing = document.getElementById('ig-embed-script');
    existing.addEventListener('load', cb, { once: true });
    return;
  }
  const s = document.createElement('script');
  s.id = 'ig-embed-script';
  s.src = 'https://www.instagram.com/embed.js';
  s.async = true;
  s.onload = cb;
  document.body.appendChild(s);
}

function ReelCard({ reel, index }) {
  const acc     = ACCOUNTS_DATA.find(a => a.handle === reel.handle);
  const reelUrl = `https://www.instagram.com/${reel.type}/${reel.shortcode}/`;
  const embedRef = useRef(null);

  useEffect(() => {
    if (reel.blocked || !embedRef.current) return;
    embedRef.current.innerHTML = `<blockquote
      class="instagram-media"
      data-instgrm-captioned
      data-instgrm-permalink="${reelUrl}?utm_source=ig_embed&utm_campaign=loading"
      data-instgrm-version="14"
      style="background:#09090b;border:0;margin:0;max-width:100%;min-width:0;padding:0;width:100%;"
    ></blockquote>`;
    loadEmbedScript(() => window.instgrm?.Embeds.process());
  }, [reel.shortcode, reel.blocked, reelUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-stone-950 rounded-[1.5rem] border border-stone-800 shadow-xl overflow-hidden flex flex-col"
    >
      {/* Account header */}
      <div className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
          style={{ backgroundColor: reel.color }}
        >
          {reel.handle.charAt(0).toUpperCase()}
        </div>
        <span className="text-[11px] font-black text-stone-300 truncate">@{reel.handle}</span>
        <a
          href={acc?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-stone-600 hover:text-stone-300 transition-colors flex-shrink-0"
        >
          <ExternalLink size={12} />
        </a>
      </div>

      {reel.blocked ? (
        <a
          href={reelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-6 px-8 text-center no-underline"
          style={{ height: '700px', background: `linear-gradient(160deg, ${reel.color}22 0%, #09090b 60%)` }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl" style={{ backgroundColor: reel.color }}>
            <Play size={28} className="text-white ml-1" />
          </div>
          <div className="space-y-2">
            <p className="text-white font-black text-base">@{reel.handle}</p>
            <p className="text-stone-400 text-xs font-medium leading-relaxed">
              This account has embedding disabled.<br />Tap to watch on Instagram.
            </p>
          </div>
          <span className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: reel.color }}>
            Watch on Instagram ↗
          </span>
        </a>
      ) : (
        <div ref={embedRef} style={{ minHeight: '500px' }} />
      )}
    </motion.div>
  );
}

export default function TrendsPage() {
  const [page,          setPage]          = useState(0);
  const [activeAccount, setActiveAccount] = useState('all');

  const isAll      = activeAccount === 'all';
  const totalPages = isAll ? TOTAL_PAGES : 1;

  const currentReels = isAll
    ? getPageReels(page)
    : getAccountReels(activeAccount);

  const goTo = (p) => {
    setPage(Math.max(0, Math.min(totalPages - 1, p)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilter = (handle) => {
    setActiveAccount(handle);
    setPage(0);
  };

  return (
    <motion.div
      key="trends"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10 pb-20"
    >
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <TrendingUp size={14} /> Trends & Reels
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
          What the community<br />
          <span className="italic font-normal text-stone-400">is watching.</span>
        </h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">
          FMCG reels and food trends from the top regional creators — one per creator per page.
        </p>
      </div>

      {/* Account filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilter('all')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isAll
              ? 'bg-stone-900 text-white shadow-lg'
              : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
          }`}
        >
          All
        </button>
        {ACCOUNTS_DATA.map(acc => (
          <button
            key={acc.handle}
            onClick={() => handleFilter(acc.handle)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeAccount === acc.handle
                ? 'text-white shadow-lg'
                : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
            }`}
            style={activeAccount === acc.handle ? { backgroundColor: acc.color } : {}}
          >
            @{acc.handle}
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${page}-${activeAccount}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-start"
        >
          {currentReels.map((reel, i) => (
            <ReelCard key={reel.id} reel={reel} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-stone-400 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={18} className="text-stone-600" />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                  page === i
                    ? 'bg-stone-900 text-white shadow-lg'
                    : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages - 1}
            className="p-3 rounded-xl bg-white border border-stone-200 hover:border-stone-400 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={18} className="text-stone-600" />
          </button>
        </div>
      )}

      {/* Creator credits */}
      <div className="bg-stone-50 rounded-[2rem] p-8 border border-stone-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-5">Featured Creators</p>
        <div className="flex flex-wrap gap-3">
          {ACCOUNTS_DATA.map(acc => (
            <a
              key={acc.handle}
              href={acc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-stone-200 hover:shadow-md transition-all group"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                style={{ backgroundColor: acc.color }}
              >
                {acc.handle.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900 transition-colors">
                @{acc.handle}
              </span>
              <ExternalLink size={11} className="text-stone-300 group-hover:text-stone-500" />
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
