import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Play, ExternalLink, Loader2 } from 'lucide-react';

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
  const [playing, setPlaying] = useState(null); // `${handle}:${videoId}`

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
                {ch.videos.slice(0, 5).map(v => {
                  const key = `${ch.handle}:${v.videoId}`;
                  const isPlaying = playing === key;
                  return (
                    <div key={v.videoId} className="group relative rounded-2xl overflow-hidden bg-gray-900 aspect-video shadow-sm">
                      {/* No AnimatePresence wrap: when the user taps the thumb the
                         iframe must mount synchronously so the user-gesture token
                         carries over to the embed and YouTube allows autoplay.
                         An animated swap defers the iframe by ~200ms and the
                         autoplay silently fails on iOS Safari. */}
                      {isPlaying ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${v.videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          title={v.title}
                        />
                      ) : (
                        <button
                          onClick={() => setPlaying(key)}
                          className="absolute inset-0 w-full h-full text-left"
                        >
                          <img
                            src={v.thumbnail}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.currentTarget.src = `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`; }}
                          />
                          {/* Gradient + play button */}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/20 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                              <Play size={20} className="text-white fill-white ml-0.5" strokeWidth={0} />
                            </div>
                          </div>
                          {/* Duration badge (top-right) */}
                          {formatDuration(v.durationSec) && (
                            <div className="absolute top-2 right-2 bg-black/85 px-1.5 py-0.5 rounded text-white text-[10px] font-bold tabular-nums leading-none pointer-events-none">
                              {formatDuration(v.durationSec)}
                            </div>
                          )}
                          {/* Title overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-2.5 pointer-events-none">
                            <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2 mb-0.5 drop-shadow-md">
                              {v.title}
                            </p>
                            <p className="text-gray-300 text-[9px] font-medium">{formatRelative(v.published)}</p>
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </motion.div>
  );
}
