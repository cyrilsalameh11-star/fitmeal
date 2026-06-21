import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Play, ExternalLink, Loader2, X } from 'lucide-react';

// Per-channel minimum video length in seconds. Override per channel if you
// want to allow shorter content (e.g. set to 0 for a channel that posts mostly
// mid-form). All channels default to 420 (7 minutes).
const CHANNELS = [
  { handle: 'WillTennyson',  color: '#dc2626', minDurationSec: 420 },
  { handle: 'LeRoutin',      color: '#0891b2', minDurationSec: 420 },
  { handle: 'bazinga.',      color: '#f97316', minDurationSec: 420 },
  { handle: 'iWannaBurnFat', color: '#10b981', minDurationSec: 420 },
];

const LOCAL_CACHE_KEY = 'fitmeal_youtube_v6';
const LOCAL_TTL_MS = 6 * 60 * 60 * 1000;

function readLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj?.savedAt || Date.now() - obj.savedAt > LOCAL_TTL_MS) return null;
    return obj.payload;
  } catch { return null; }
}

function writeLocalCache(payload) {
  try { localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({ payload, savedAt: Date.now() })); } catch {}
}

function formatRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff) || diff < 0) return '';
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60)  return `${m}m ago`;
  if (h < 24)  return `${h}h ago`;
  if (d < 7)   return `${d}d ago`;
  if (d < 30)  return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function formatDuration(sec) {
  if (!sec || sec <= 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function YoutubersContent() {
  const [data, setData]       = useState(readLocalCache);
  const [loading, setLoading] = useState(!data);
  const [error, setError]     = useState(null);
  // playing: null OR { video, channelHandle, channelName, channelColor }
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    let abort = false;
    // Encode handle plus optional minDurationSec as "handle:min" pairs so the
    // backend can apply a different filter per channel (LeRoutin gets 0).
    const handles = CHANNELS.map(c => `${c.handle}:${c.minDurationSec ?? 420}`).join(',');
    fetch(`/api/youtube?handles=${encodeURIComponent(handles)}`)
      .then(r => r.json())
      .then(d => {
        if (abort) return;
        setData(d);
        setLoading(false);
        writeLocalCache(d);
      })
      .catch(e => {
        if (abort) return;
        setError(e.message || 'fetch failed');
        setLoading(false);
      });
    return () => { abort = true; };
  }, []);

  // Modal: lock body scroll + esc-to-close while a video is playing.
  useEffect(() => {
    if (!playing) return;
    const onKey = (e) => { if (e.key === 'Escape') setPlaying(null); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [playing]);

  const channels = data?.channels || [];

  return (
    <motion.div
      key="youtubers-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10"
    >
      {/* Header */}
      <div className="max-w-2xl">
        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Youtube size={13} /> YouTubers we follow
        </p>
        <h2 className="text-4xl lg:text-5xl tracking-tight text-gray-900">
          Fitness <span className="italic font-normal text-gray-400">creators.</span>
        </h2>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mt-3">
          The latest long-form videos (over 7 minutes, no Shorts) from 5 fitness, podcast and routine creators we follow. Tap any thumbnail to watch in place.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="animate-spin text-gray-400" size={20} />
          <span className="text-gray-500 text-sm font-medium">Fetching latest videos...</span>
        </div>
      )}

      {error && !channels.length && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700 text-sm">
          Could not load videos: {error}
        </div>
      )}

      {/* Channels */}
      {channels.map(ch => {
        const cfg = CHANNELS.find(c => c.handle === ch.handle) || { color: '#6b7280' };
        const displayName = ch.channelName || ch.handle;
        return (
          <section key={ch.handle} className="space-y-4">
            {/* Channel header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center shadow-md"
                  style={{ background: cfg.color }}
                >
                  <Youtube size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">
                    {displayName}
                  </h3>
                  <a
                    href={`https://www.youtube.com/@${ch.handle}/videos`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium"
                  >
                    @{ch.handle} <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              {ch.error && !ch.videos?.length && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                  Temporarily unavailable
                </span>
              )}
            </div>

            {/* Empty-state: no videos passed the 8-minute filter */}
            {!ch.error && !ch.videos?.length && (
              <p className="text-[11px] text-gray-500 italic ml-14">
                Recent uploads are all under 7 minutes (mostly Shorts). Check the channel directly for older long-form videos.
              </p>
            )}

            {/* Video grid */}
            {ch.videos?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {ch.videos.slice(0, 5).map(v => (
                  <div key={v.videoId} className="group relative rounded-2xl overflow-hidden bg-gray-900 aspect-video shadow-sm">
                    <button
                      onClick={() => setPlaying({
                        video: v,
                        channelHandle: ch.handle,
                        channelName: displayName,
                        channelColor: cfg.color,
                      })}
                      className="absolute inset-0 w-full h-full text-left"
                    >
                      <img
                        src={v.thumbnail}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.src = `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                          <Play size={20} className="text-white fill-white ml-0.5" strokeWidth={0} />
                        </div>
                      </div>
                      {formatDuration(v.durationSec) && (
                        <div className="absolute top-2 right-2 bg-black/85 px-1.5 py-0.5 rounded text-white text-[10px] font-bold tabular-nums leading-none pointer-events-none">
                          {formatDuration(v.durationSec)}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 pointer-events-none">
                        <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2 mb-0.5 drop-shadow-md">
                          {v.title}
                        </p>
                        <p className="text-gray-300 text-[9px] font-medium">{formatRelative(v.published)}</p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* ── Cinema-mode modal ───────────────────────────────────────────────
         When `playing` is set we render the iframe SYNCHRONOUSLY in the same
         render cycle as the click that opened it. framer-motion's initial
         opacity/scale only changes visual style, not DOM mounting, so the
         user-gesture token survives and YouTube autoplay works on iOS Safari.
         Wrapping the iframe in an AnimatePresence-exit-animated component
         would defer the embed by ~200ms and silently break autoplay. */}
      <AnimatePresence>
        {playing && (
          <motion.div
            key="yt-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setPlaying(null)}
            className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-gray-950 rounded-2xl sm:rounded-3xl shadow-[0_30px_80px_-20px_rgba(220,38,38,0.35)] overflow-hidden ring-1 ring-white/10"
            >
              {/* Channel-coloured accent bar */}
              <div className="h-1 w-full" style={{ background: playing.channelColor }} />

              {/* Header */}
              <div className="flex items-center gap-3 px-3 sm:px-5 py-3 sm:py-4 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg"
                  style={{ background: playing.channelColor }}
                >
                  <Youtube size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm font-bold truncate leading-tight">
                    {playing.channelName}
                  </p>
                  <p className="text-gray-400 text-[10px] sm:text-xs truncate leading-tight mt-0.5">
                    @{playing.channelHandle} · {formatRelative(playing.video.published)}
                    {formatDuration(playing.video.durationSec) && ` · ${formatDuration(playing.video.durationSec)}`}
                  </p>
                </div>
                <button
                  onClick={() => setPlaying(null)}
                  aria-label="Close video"
                  className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Video */}
              <div className="relative bg-black aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${playing.video.videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={playing.video.title}
                />
              </div>

              {/* Footer */}
              <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-white/10 bg-gradient-to-t from-white/[0.04] to-transparent">
                <p className="text-white text-xs sm:text-sm font-semibold leading-snug line-clamp-2 mb-2">
                  {playing.video.title}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 text-[10px] sm:text-xs">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono text-[9px] sm:text-[10px]">Esc</kbd> or tap outside to close
                  </span>
                  <a
                    href={`https://youtube.com/watch?v=${playing.video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-[10px] sm:text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    <ExternalLink size={12} /> Open in YouTube
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
