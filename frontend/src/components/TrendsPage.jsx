import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// REELS DATA — 25 entries, 5 per account, sorted recent → oldest
// To update: grab the shortcode from each Instagram post URL
//   e.g. instagram.com/reel/ABC123xyz/ → shortcode is "ABC123xyz"
//   Set type to "reel" or "p" (post) accordingly
// ─────────────────────────────────────────────────────────────────
const REELS_DATA = [
  // ── guide.lb ──────────────────────────────────────────────────
  { id: 1,  account: 'guide.lb',              handle: 'guide.lb',              color: '#e11d48', shortcode: null, type: 'reel', caption: 'Best Lebanese supermarket finds this week' },
  { id: 2,  account: 'guide.lb',              handle: 'guide.lb',              color: '#e11d48', shortcode: null, type: 'reel', caption: 'New FMCG launches in Beirut — March 2026'    },
  { id: 3,  account: 'guide.lb',              handle: 'guide.lb',              color: '#e11d48', shortcode: null, type: 'reel', caption: 'Lebanese pantry staples ranked'              },
  { id: 4,  account: 'guide.lb',              handle: 'guide.lb',              color: '#e11d48', shortcode: null, type: 'reel', caption: 'Top healthy snacks available in Lebanon'     },
  { id: 5,  account: 'guide.lb',              handle: 'guide.lb',              color: '#e11d48', shortcode: null, type: 'reel', caption: 'Trending food products: Jan 2026'            },

  // ── baroodiesfoodies ──────────────────────────────────────────
  { id: 6,  account: 'baroodiesfoodies',      handle: 'baroodiesfoodies',      color: '#d97706', shortcode: null, type: 'reel', caption: 'Street food meets supermarket — taste test'  },
  { id: 7,  account: 'baroodiesfoodies',      handle: 'baroodiesfoodies',      color: '#d97706', shortcode: null, type: 'reel', caption: 'Best new condiments in Lebanon 2026'         },
  { id: 8,  account: 'baroodiesfoodies',      handle: 'baroodiesfoodies',      color: '#d97706', shortcode: null, type: 'reel', caption: 'Protein snack haul — local brands only'      },
  { id: 9,  account: 'baroodiesfoodies',      handle: 'baroodiesfoodies',      color: '#d97706', shortcode: null, type: 'reel', caption: 'Lebanese vs imported — which is better?'    },
  { id: 10, account: 'baroodiesfoodies',      handle: 'baroodiesfoodies',      color: '#d97706', shortcode: null, type: 'reel', caption: 'Grocery haul: value picks under 50k LBP'    },

  // ── baroodiesfoodies.dxb ──────────────────────────────────────
  { id: 11, account: 'baroodiesfoodies.dxb',  handle: 'baroodiesfoodies.dxb',  color: '#0891b2', shortcode: null, type: 'reel', caption: 'Dubai FMCG trend watch — March 2026'        },
  { id: 12, account: 'baroodiesfoodies.dxb',  handle: 'baroodiesfoodies.dxb',  color: '#0891b2', shortcode: null, type: 'reel', caption: 'Carrefour vs Spinneys: best value snacks'   },
  { id: 13, account: 'baroodiesfoodies.dxb',  handle: 'baroodiesfoodies.dxb',  color: '#0891b2', shortcode: null, type: 'reel', caption: 'New health food brands hitting UAE shelves' },
  { id: 14, account: 'baroodiesfoodies.dxb',  handle: 'baroodiesfoodies.dxb',  color: '#0891b2', shortcode: null, type: 'reel', caption: 'Top protein bars available in Dubai'        },
  { id: 15, account: 'baroodiesfoodies.dxb',  handle: 'baroodiesfoodies.dxb',  color: '#0891b2', shortcode: null, type: 'reel', caption: 'Ramadan FMCG picks — Dubai edition'         },

  // ── ellevousguide ─────────────────────────────────────────────
  { id: 16, account: 'ellevousguide',         handle: 'ellevousguide',         color: '#7c3aed', shortcode: null, type: 'reel', caption: 'French FMCG trends landing in Lebanon'      },
  { id: 17, account: 'ellevousguide',         handle: 'ellevousguide',         color: '#7c3aed', shortcode: null, type: 'reel', caption: 'Luxury food gifts guide 2026'               },
  { id: 18, account: 'ellevousguide',         handle: 'ellevousguide',         color: '#7c3aed', shortcode: null, type: 'reel', caption: 'Organic & bio: what is worth buying'       },
  { id: 19, account: 'ellevousguide',         handle: 'ellevousguide',         color: '#7c3aed', shortcode: null, type: 'reel', caption: 'Healthy breakfast products ranked'          },
  { id: 20, account: 'ellevousguide',         handle: 'ellevousguide',         color: '#7c3aed', shortcode: null, type: 'reel', caption: 'Imported vs local: dairy products'          },

  // ── laroutineyt ───────────────────────────────────────────────
  { id: 21, account: 'laroutineyt',           handle: 'laroutineyt',           color: '#16a34a', shortcode: null, type: 'reel', caption: 'Ma routine nutrition — produits FMCG'       },
  { id: 22, account: 'laroutineyt',           handle: 'laroutineyt',           color: '#16a34a', shortcode: null, type: 'reel', caption: 'Les meilleurs snacks santé du moment'       },
  { id: 23, account: 'laroutineyt',           handle: 'laroutineyt',           color: '#16a34a', shortcode: null, type: 'reel', caption: 'Courses de la semaine — haul FMCG'          },
  { id: 24, account: 'laroutineyt',           handle: 'laroutineyt',           color: '#16a34a', shortcode: null, type: 'reel', caption: 'Test produits tendance — mars 2026'         },
  { id: 25, account: 'laroutineyt',           handle: 'laroutineyt',           color: '#16a34a', shortcode: null, type: 'reel', caption: 'Routine alimentation saine — mes essentiels' },
];

const ACCOUNTS = [
  { handle: 'guide.lb',             color: '#e11d48', url: 'https://www.instagram.com/guide.lb/'              },
  { handle: 'baroodiesfoodies',     color: '#d97706', url: 'https://www.instagram.com/baroodiesfoodies/'      },
  { handle: 'baroodiesfoodies.dxb', color: '#0891b2', url: 'https://www.instagram.com/baroodiesfoodies.dxb/'  },
  { handle: 'ellevousguide',        color: '#7c3aed', url: 'https://www.instagram.com/ellevousguide/'         },
  { handle: 'laroutineyt',          color: '#16a34a', url: 'https://www.instagram.com/laroutineyt/'           },
];

const REELS_PER_PAGE = 5;
const TOTAL_PAGES    = 5;

function ReelCard({ reel, index }) {
  const account = ACCOUNTS.find(a => a.handle === reel.handle);
  const initial = reel.handle.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white rounded-[1.5rem] border border-stone-100 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Account header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-50">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          style={{ backgroundColor: reel.color }}
        >
          {initial}
        </div>
        <span className="text-xs font-black text-stone-700 tracking-wide">@{reel.handle}</span>
        <a
          href={account?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-stone-300 hover:text-stone-600 transition-colors"
        >
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Embed or fallback */}
      {reel.shortcode ? (
        <div className="w-full" style={{ minHeight: 480 }}>
          <iframe
            src={`https://www.instagram.com/${reel.type}/${reel.shortcode}/embed/`}
            className="w-full border-0"
            style={{ minHeight: 480 }}
            allowFullScreen
            scrolling="no"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-4 px-6 py-12 flex-1"
          style={{ background: `linear-gradient(135deg, ${reel.color}12, ${reel.color}06)` }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: reel.color }}
          >
            <Play size={22} className="text-white ml-1" />
          </div>
          <p className="text-sm text-stone-600 font-medium text-center leading-relaxed">{reel.caption}</p>
          <a
            href={account?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:opacity-80 active:scale-95"
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

  const filtered = activeAccount === 'all'
    ? REELS_DATA
    : REELS_DATA.filter(r => r.handle === activeAccount);

  const totalPages   = Math.min(TOTAL_PAGES, Math.ceil(filtered.length / REELS_PER_PAGE));
  const currentReels = filtered.slice(page * REELS_PER_PAGE, (page + 1) * REELS_PER_PAGE);

  const goTo = (p) => {
    setPage(Math.max(0, Math.min(totalPages - 1, p)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAccountFilter = (handle) => {
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
          FMCG reels and food trends curated from the top regional food creators.
        </p>
      </div>

      {/* Account filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAccountFilter('all')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeAccount === 'all'
              ? 'bg-stone-900 text-white shadow-lg'
              : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
          }`}
        >
          All
        </button>
        {ACCOUNTS.map(acc => (
          <button
            key={acc.handle}
            onClick={() => handleAccountFilter(acc.handle)}
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

      {/* Reel grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${page}-${activeAccount}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
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
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black"
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
