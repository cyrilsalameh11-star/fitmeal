import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// REELS DATA — 6 accounts × 5 reels = 30 total
// Interleaved: page N shows reel[N] from each account (1 per creator)
// ─────────────────────────────────────────────────────────────────
const REELS_DATA = [
  // PAGE 1
  { id: 1,  handle: 'guide.lb',             color: '#e11d48', shortcode: 'DUyUdKfDQfS', type: 'reel' },
  { id: 2,  handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DUlZ_JQjMSh', type: 'reel' },
  { id: 3,  handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DQjgZMhkqh2', type: 'reel' },
  { id: 4,  handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DVti6aGDoWq', type: 'reel' },
  { id: 5,  handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DVTx-Bdje99', type: 'reel' },
  { id: 6,  handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DVRqFx7jYld', type: 'reel' },

  // PAGE 2
  { id: 7,  handle: 'guide.lb',             color: '#e11d48', shortcode: 'DUgGrZDDYpl', type: 'reel' },
  { id: 8,  handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DVVlCUiDaG6', type: 'reel' },
  { id: 9,  handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DUxdhBqDU_T', type: 'reel' },
  { id: 10, handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DSzNG4tjAqu', type: 'reel' },
  { id: 11, handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DVHRV8aDVMd', type: 'reel' },
  { id: 12, handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DVB4QnTDVF-', type: 'reel' },

  // PAGE 3
  { id: 13, handle: 'guide.lb',             color: '#e11d48', shortcode: 'DSkvVRjjcMY', type: 'p'    },
  { id: 14, handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DVMfhvYDRYS', type: 'reel' },
  { id: 15, handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DUgGiWNEiZi', type: 'reel' },
  { id: 16, handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DRAQGGUjKy0', type: 'reel' },
  { id: 17, handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DVG4b48jbNi', type: 'reel' },
  { id: 18, handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DU8mp01jZnu', type: 'reel' },

  // PAGE 4
  { id: 19, handle: 'guide.lb',             color: '#e11d48', shortcode: 'DSC5LaRDTOI', type: 'reel' },
  { id: 20, handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DU-VE72jRn3', type: 'reel' },
  { id: 21, handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DUKxO6VDczo', type: 'reel' },
  { id: 22, handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DQPkCGBjFqm', type: 'p'    },
  { id: 23, handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DU5DbZWDQ42', type: 'reel' },
  { id: 24, handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DUv5pNUjT4U', type: 'reel' },

  // PAGE 5
  { id: 25, handle: 'guide.lb',             color: '#e11d48', shortcode: 'DRzc-I5jaoJ', type: 'reel' },
  { id: 26, handle: 'baroodiesfoodies',     color: '#d97706', shortcode: 'DUvLEl5DTd_', type: 'reel' },
  { id: 27, handle: 'baroodiesfoodies.dxb', color: '#0891b2', shortcode: 'DRAC021kvno', type: 'reel' },
  { id: 28, handle: 'ellevousguide',        color: '#7c3aed', shortcode: 'DQE8Pp8jMHX', type: 'reel' },
  { id: 29, handle: 'laroutineyt',          color: '#16a34a', shortcode: 'DUQzpVqDVlU', type: 'reel' },
  { id: 30, handle: 'wondersbyaline',       color: '#f43f5e', shortcode: 'DUtE9gqDUeY', type: 'reel' },
];

const ACCOUNTS = [
  { handle: 'guide.lb',             color: '#e11d48', url: 'https://www.instagram.com/guide.lb/'             },
  { handle: 'baroodiesfoodies',     color: '#d97706', url: 'https://www.instagram.com/baroodiesfoodies/'     },
  { handle: 'baroodiesfoodies.dxb', color: '#0891b2', url: 'https://www.instagram.com/baroodiesfoodies.dxb/' },
  { handle: 'ellevousguide',        color: '#7c3aed', url: 'https://www.instagram.com/ellevousguide/'        },
  { handle: 'laroutineyt',          color: '#16a34a', url: 'https://www.instagram.com/laroutineyt/'          },
  { handle: 'wondersbyaline',       color: '#f43f5e', url: 'https://www.instagram.com/wondersbyaline/'       },
];

const REELS_PER_PAGE = 6;
const TOTAL_PAGES    = 5;

// Flat slice — data is pre-interleaved so each page is balanced
function getPageReels(page) {
  return REELS_DATA.slice(page * REELS_PER_PAGE, (page + 1) * REELS_PER_PAGE);
}

// Single account filter — show all 6, no pagination needed
function getAccountReels(handle) {
  return REELS_DATA.filter(r => r.handle === handle);
}

function ReelCard({ reel, index }) {
  const account = ACCOUNTS.find(a => a.handle === reel.handle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-[1.5rem] border border-stone-100 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Account header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-stone-50 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
          style={{ backgroundColor: reel.color }}
        >
          {reel.handle.charAt(0).toUpperCase()}
        </div>
        <span className="text-[11px] font-black text-stone-700 truncate">@{reel.handle}</span>
        <a
          href={account?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-stone-300 hover:text-stone-600 transition-colors flex-shrink-0"
        >
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Embed or fallback */}
      {reel.shortcode ? (
        <iframe
          src={`https://www.instagram.com/${reel.type}/${reel.shortcode}/embed/`}
          className="w-full border-0 flex-1"
          style={{ minHeight: 560 }}
          allowFullScreen
          allow="autoplay; encrypted-media"
          scrolling="no"
          loading="lazy"
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-4 px-5 py-14 flex-1"
          style={{ background: `linear-gradient(135deg, ${reel.color}14, ${reel.color}05)` }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: reel.color }}
          >
            <Play size={18} className="text-white ml-0.5" />
          </div>
          <p className="text-sm text-stone-500 font-medium text-center leading-relaxed">{reel.caption}</p>
          <a
            href={account?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: reel.color }}
          >
            View on Instagram
          </a>
        </div>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start"
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
