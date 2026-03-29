import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// REELS DATA — 7 accounts × 5 pages (newinbeirut added)
// Interleaved: page N shows one reel per account
// ─────────────────────────────────────────────────────────────────
const REELS_DATA = [
  // PAGE 1
  { id: 1,  handle: 'guide.lb',             color: '#e11d48', shortcode: 'DUyUdKfDQfS', type: 'reel' },
  { id: 2,  handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DWefGLFjdu1', type: 'reel' },
  { id: 3,  handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DQjgZMhkqh2', type: 'reel' },
  { id: 4,  handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DVti6aGDoWq', type: 'reel', blocked: true },
  { id: 5,  handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DVTx-Bdje99', type: 'reel' },
  { id: 6,  handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DVRqFx7jYld', type: 'reel' },
  { id: 7,  handle: 'newinbeirut',          color: '#f97316', shortcode: 'DVthGdRDYhk', type: 'p'    },

  // PAGE 2
  { id: 8,  handle: 'guide.lb',             color: '#e11d48', shortcode: 'DUgGrZDDYpl', type: 'reel' },
  { id: 9,  handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DUlZ_JQjMSh', type: 'reel' },
  { id: 10, handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DUxdhBqDU_T', type: 'reel' },
  { id: 11, handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DSzNG4tjAqu', type: 'reel', blocked: true },
  { id: 12, handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DVHRV8aDVMd', type: 'reel' },
  { id: 13, handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DVB4QnTDVF-', type: 'reel' },
  { id: 14, handle: 'newinbeirut',          color: '#f97316', shortcode: 'DVeHssgDUKf', type: 'p'    },

  // PAGE 3
  { id: 15, handle: 'guide.lb',             color: '#e11d48', shortcode: 'DSkvVRjjcMY', type: 'p'    },
  { id: 16, handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DVVlCUiDaG6', type: 'reel' },
  { id: 17, handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DUgGiWNEiZi', type: 'reel' },
  { id: 18, handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DRAQGGUjKy0', type: 'reel', blocked: true },
  { id: 19, handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DVG4b48jbNi', type: 'reel' },
  { id: 20, handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DU8mp01jZnu', type: 'reel' },
  { id: 21, handle: 'newinbeirut',          color: '#f97316', shortcode: 'DVRUcaTjaYu', type: 'p'    },

  // PAGE 4
  { id: 22, handle: 'guide.lb',             color: '#e11d48', shortcode: 'DSC5LaRDTOI', type: 'reel' },
  { id: 23, handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DVMfhvYDRYS', type: 'reel' },
  { id: 24, handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DUKxO6VDczo', type: 'reel' },
  { id: 25, handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DR2V9vuDML-', type: 'reel', blocked: true },
  { id: 26, handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DU5DbZWDQ42', type: 'reel' },
  { id: 27, handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DUv5pNUjT4U', type: 'reel' },
  { id: 28, handle: 'newinbeirut',          color: '#f97316', shortcode: 'DUaUxCtjVdq', type: 'reel' },

  // PAGE 5
  { id: 29, handle: 'guide.lb',             color: '#e11d48', shortcode: 'DRzc-I5jaoJ', type: 'reel' },
  { id: 30, handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DU-VE72jRn3', type: 'reel' },
  { id: 31, handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DRAC021kvno', type: 'reel' },
  { id: 32, handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DUfYlnuAvxJ', type: 'reel', blocked: true },
  { id: 33, handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DUQzpVqDVlU', type: 'reel' },
  { id: 34, handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DUtE9gqDUeY', type: 'reel' },
  { id: 35, handle: 'newinbeirut',          color: '#f97316', shortcode: 'DUTf12UDTbX', type: 'p'    },

  // PAGE 6 (newinbeirut 6th reel)
  { id: 36, handle: 'guide.lb',             color: '#e11d48', shortcode: 'DUyUdKfDQfS', type: 'reel' },
  { id: 37, handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DUvLEl5DTd_', type: 'reel' },
  { id: 38, handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DQjgZMhkqh2', type: 'reel' },
  { id: 39, handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DVti6aGDoWq', type: 'reel', blocked: true },
  { id: 40, handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DVTx-Bdje99', type: 'reel' },
  { id: 41, handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DVRqFx7jYld', type: 'reel' },
  { id: 42, handle: 'newinbeirut',          color: '#f97316', shortcode: 'DUAfUqQDWGe', type: 'reel' },
];

const ACCOUNTS = [
  { handle: 'guide.lb',             color: '#e11d48', url: 'https://www.instagram.com/guide.lb/'             },
  { handle: 'baroodiesfoodies',     color: '#d97706', url: 'https://www.instagram.com/baroodiesfoodies/'     },
  { handle: 'baroodiesfoodies.dxb', color: '#0891b2', url: 'https://www.instagram.com/baroodiesfoodies.dxb/' },
  { handle: 'ellevousguide',        color: '#7c3aed', url: 'https://www.instagram.com/ellevousguide/'        },
  { handle: 'laroutineyt',          color: '#16a34a', url: 'https://www.instagram.com/laroutineyt/'          },
  { handle: 'wondersbyaline',       color: '#f43f5e', url: 'https://www.instagram.com/wondersbyaline/'       },
  { handle: 'newinbeirut',          color: '#f97316', url: 'https://www.instagram.com/newinbeirut/'          },
];

const REELS_PER_PAGE = 7;
const TOTAL_PAGES    = 6;

// Flat slice — data is pre-interleaved so each page is balanced
function getPageReels(page) {
  return REELS_DATA.slice(page * REELS_PER_PAGE, (page + 1) * REELS_PER_PAGE);
}

// Single account filter — show all 6, no pagination needed
function getAccountReels(handle) {
  return REELS_DATA.filter(r => r.handle === handle);
}

// Load embed.js once, globally
function loadEmbedScript(cb) {
  if (window.instgrm) { cb(); return; }
  if (document.getElementById('ig-embed-script')) {
    // already injected but not yet loaded — wait
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
  const account  = ACCOUNTS.find(a => a.handle === reel.handle);
  const reelUrl  = `https://www.instagram.com/${reel.type}/${reel.shortcode}/`;
  const embedRef = useRef(null);

  useEffect(() => {
    if (reel.blocked || !embedRef.current) return;
    // Write the blockquote directly into the DOM so React never touches it again
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
          href={account?.url}
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
        /* embed.js writes into this div — React never touches its children */
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
        {ACCOUNTS.map(acc => (
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

      {/* Grid — 5 columns on xl, 3 on lg, 2 on sm */}
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
          {ACCOUNTS.map(acc => (
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
