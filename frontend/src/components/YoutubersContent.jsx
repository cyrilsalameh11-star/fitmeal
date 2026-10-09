import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Play, ExternalLink, X, Clock, Sparkles } from 'lucide-react';

// Per-channel minimum video length in seconds. Override per channel if you
// want to allow shorter content (e.g. set to 0 for a channel that posts mostly
// mid-form). All channels default to 420 (7 minutes).
const CHANNELS = [
  { handle: 'WillTennyson',  color: '#dc2626', minDurationSec: 420 },
  { handle: 'LeRoutin',      color: '#0891b2', minDurationSec: 420 },
  { handle: 'iWannaBurnFat', color: '#10b981', minDurationSec: 420 },
  { handle: 'Browney',       color: '#8b5cf6', minDurationSec: 420 },
];

// Bumped when the channel list changes so stale cached channels disappear.
const LOCAL_CACHE_KEY = 'fitmeal_youtube_v8';
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

// A video published in the last 3 days gets a "New" flag.
function isFresh(iso) {
  if (!iso) return false;
  const diff = Date.now() - new Date(iso).getTime();
  return diff >= 0 && diff < 3 * 86400000;
}

function monogram(name) {
  const clean = (name || '').replace(/[^A-Za-z0-9 ]/g, '').trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

function thumbFallback(e, videoId) {
  const el = e.currentTarget;
  if (el.dataset.fallback === 'done') return;
  el.dataset.fallback = 'done';
  el.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────────────────────

function DurationPill({ sec }) {
  const label = formatDuration(sec);
  if (!label) return null;
  return (
    <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-white text-[10px] font-bold tabular-nums leading-none pointer-events-none">
      {label}
    </span>
  );
}

function NewBadge() {
  return (
    <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-lg pointer-events-none">
      <Sparkles size={9} strokeWidth={2.5} /> New
    </span>
  );
}

function PlayOverlay({ size = 'md' }) {
  const dim = size === 'lg' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-11 h-11';
  const icon = size === 'lg' ? 28 : 18;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className={`${dim} rounded-full bg-red-600/95 backdrop-blur-sm flex items-center justify-center shadow-2xl ring-2 ring-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600`}>
        <Play size={icon} className="text-white fill-white ml-0.5" strokeWidth={0} />
      </div>
    </div>
  );
}

function Avatar({ name, color, size = 'md' }) {
  const dim = size === 'lg' ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs';
  return (
    <div
      className={`${dim} rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white shadow-md tracking-tight`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
    >
      {monogram(name)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero card: the channel's latest video, large with info panel beside it
// ─────────────────────────────────────────────────────────────────────────────

function HeroCard({ video, color, onPlay }) {
  return (
    <button
      onClick={onPlay}
      className="group w-full text-left bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 lg:flex"
    >
      <div className="relative lg:w-[58%] aspect-video bg-gray-900 overflow-hidden flex-shrink-0">
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
          onError={(e) => thumbFallback(e, video.videoId)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <PlayOverlay size="lg" />
        <DurationPill sec={video.durationSec} />
        {isFresh(video.published) && <NewBadge />}
      </div>

      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center gap-3 min-w-0">
        <span
          className="inline-flex w-fit items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{ background: `${color}14`, color }}
        >
          Latest upload
        </span>
        <h4 className="text-lg sm:text-2xl font-bold text-gray-900 leading-snug line-clamp-3">
          {video.title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span>{formatRelative(video.published)}</span>
          {formatDuration(video.durationSec) && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock size={11} /> {formatDuration(video.durationSec)}
            </span>
          )}
        </div>
        <span
          className="mt-1 inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow"
          style={{ background: color }}
        >
          <Play size={12} className="fill-white" strokeWidth={0} /> Watch now
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact card: thumbnail on top, title BELOW on white for real legibility
// ─────────────────────────────────────────────────────────────────────────────

function VideoCard({ video, color, onPlay }) {
  return (
    <button
      onClick={onPlay}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => thumbFallback(e, video.videoId)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
        <PlayOverlay />
        <DurationPill sec={video.durationSec} />
        {isFresh(video.published) && <NewBadge />}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors">
          {video.title}
        </p>
        <p className="mt-auto pt-2 text-[10px] font-medium text-gray-400">
          {formatRelative(video.published)}
        </p>
      </div>
      <div
        className="h-0.5 w-0 group-hover:w-full transition-all duration-500"
        style={{ background: color }}
      />
    </button>
  );
}

function SkeletonSection() {
  return (
    <section className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-2.5 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="bg-gray-100 rounded-3xl h-56 sm:h-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="aspect-video bg-gray-100 rounded-2xl" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-2/3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function YoutubersContent() {
  const [data, setData]       = useState(readLocalCache);
  const [loading, setLoading] = useState(!data);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('all');
  // playing: null OR { video, channelHandle, channelName, channelColor }
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    let abort = false;
    // Encode handle plus optional minDurationSec as "handle:min" pairs so the
    // backend can apply a different filter per channel.
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

  // Only keep channels still in the config, so a cached payload from an older
  // channel list cannot resurrect a removed creator.
  const channels = useMemo(() => {
    const allowed = new Set(CHANNELS.map(c => c.handle));
    return (data?.channels || []).filter(ch => allowed.has(ch.handle));
  }, [data]);

  const visible = filter === 'all' ? channels : channels.filter(ch => ch.handle === filter);
  const totalVideos = channels.reduce((n, ch) => n + (ch.videos?.length || 0), 0);

  return (
    <motion.div
      key="youtubers-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
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
          Latest long-form videos, over 7 minutes and no Shorts, from {CHANNELS.length} creators
          we follow{totalVideos > 0 ? ` (${totalVideos} videos)` : ''}. Tap any thumbnail to watch in place.
        </p>
      </div>

      {/* Channel filter pills */}
      {channels.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setFilter('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            All creators
          </button>
          {channels.map(ch => {
            const cfg = CHANNELS.find(c => c.handle === ch.handle) || { color: '#6b7280' };
            const active = filter === ch.handle;
            return (
              <button
                key={ch.handle}
                onClick={() => setFilter(ch.handle)}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  active
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
                style={active ? { background: cfg.color } : undefined}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: active ? 'rgba(255,255,255,0.9)' : cfg.color }}
                />
                {ch.channelName || ch.handle}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-10">
          <SkeletonSection />
          <SkeletonSection />
        </div>
      )}

      {error && !channels.length && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700 text-sm">
          Could not load videos: {error}
        </div>
      )}

      {/* Channels */}
      <div className="space-y-12">
        {visible.map(ch => {
          const cfg = CHANNELS.find(c => c.handle === ch.handle) || { color: '#6b7280' };
          const displayName = ch.channelName || ch.handle;
          const vids = ch.videos || [];
          const hero = vids[0];
          const rest = vids.slice(1, 5);

          const open = (v) => setPlaying({
            video: v,
            channelHandle: ch.handle,
            channelName: displayName,
            channelColor: cfg.color,
          });

          return (
            <section key={ch.handle} className="space-y-4">
              {/* Channel header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={displayName} color={cfg.color} size="lg" />
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">
                      {displayName}
                    </h3>
                    <a
                      href={`https://www.youtube.com/@${ch.handle}/videos`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 font-medium"
                    >
                      @{ch.handle} <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                {vids.length > 0 && (
                  <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                    {vids.length} video{vids.length === 1 ? '' : 's'}
                  </span>
                )}
                {ch.error && !vids.length && (
                  <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-red-500">
                    Temporarily unavailable
                  </span>
                )}
              </div>

              {/* Empty state: nothing passed the duration filter */}
              {!ch.error && !vids.length && (
                <p className="text-[11px] text-gray-500 italic ml-14">
                  Recent uploads are all under 7 minutes (mostly Shorts). Check the channel directly for older long-form videos.
                </p>
              )}

              {hero && <HeroCard video={hero} color={cfg.color} onPlay={() => open(hero)} />}

              {rest.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {rest.map(v => (
                    <VideoCard key={v.videoId} video={v} color={cfg.color} onPlay={() => open(v)} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

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
                <Avatar name={playing.channelName} color={playing.channelColor} />
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
                  <span className="hidden sm:inline text-gray-500 text-[10px] sm:text-xs">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono text-[9px] sm:text-[10px]">Esc</kbd> or tap outside to close
                  </span>
                  <a
                    href={`https://youtube.com/watch?v=${playing.video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-[10px] sm:text-xs font-bold transition-colors whitespace-nowrap"
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
