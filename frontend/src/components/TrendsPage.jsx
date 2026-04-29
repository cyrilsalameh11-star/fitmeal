import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// REELS DATA, organized per account, newest first
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
      { shortcode: 'DWLqlhujWQn', type: 'p', carousel: true }, // page 1, newest, swipeable carousel
      { shortcode: 'DUyUdKfDQfS', type: 'reel', localMedia: { kind: 'video', src: '/reels/guide-lb-DUyUdKfDQfS.mp4' } }, // page 2
      { shortcode: 'DUgGrZDDYpl', type: 'reel', localMedia: { kind: 'video', src: '/reels/guide-lb-DUgGrZDDYpl.mp4' } }, // page 3
      { shortcode: 'DSkvVRjjcMY', type: 'p',    carousel: true }, // page 4, swipeable carousel
      { shortcode: 'DSC5LaRDTOI', type: 'reel', localMedia: { kind: 'video', src: '/reels/guide-lb-DSC5LaRDTOI.mp4' } }, // page 5
      { shortcode: 'DRzc-I5jaoJ', type: 'reel', localMedia: { kind: 'video', src: '/reels/guide-lb-DRzc-I5jaoJ.mp4' } }, // page 6, oldest
    ],
  },
  {
    handle: 'baroodiesfoodies',
    color: '#d97706',
    url: 'https://www.instagram.com/baroodiesfoodies/',
    reels: [
      { shortcode: 'DXRvz-wDBEH', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-DXRvz-wDBEH.mp4', caption: 'Save this! 14 outdoor places to enjoy the sun in Lebanon 🌞🌴 Part 2 soon. #beirut #lebanon #explore #summer' } }, // page 1, newest
      { shortcode: 'DWefGLFjdu1', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-DWefGLFjdu1.mp4' } }, // page 2
      { shortcode: 'DUlZ_JQjMSh', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-DUlZ_JQjMSh.mp4' } }, // page 3
      { shortcode: 'DVVlCUiDaG6', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-DVVlCUiDaG6.mp4' } }, // page 4
      { shortcode: 'DVMfhvYDRYS', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-DVMfhvYDRYS.mp4' } }, // page 5
      { shortcode: 'DU-VE72jRn3', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-DU-VE72jRn3.mp4' } }, // page 6, oldest
    ],
  },
  {
    handle: 'baroodiesfoodies.dxb',
    color: '#0891b2',
    url: 'https://www.instagram.com/baroodiesfoodies.dxb/',
    reels: [
      { shortcode: 'DQjgZMhkqh2', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-dxb-DQjgZMhkqh2.mp4', caption: 'Trying Middle Child 📍 Al Serkal Avenue, the viral Dubai spot ✨👀 All details in reel! Share with your foodie friends.' } }, // page 1, newest
      { shortcode: 'DUxdhBqDU_T', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-dxb-DUxdhBqDU_T.mp4' } }, // page 2
      { shortcode: 'DUgGiWNEiZi', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-dxb-DUgGiWNEiZi.mp4' } }, // page 3
      { shortcode: 'DUKxO6VDczo', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-dxb-DUKxO6VDczo.mp4' } }, // page 4
      { shortcode: 'DRAC021kvno', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-dxb-DRAC021kvno.mp4' } }, // page 5
      { shortcode: 'DQjgZMhkqh2', type: 'reel', localMedia: { kind: 'video', src: '/reels/baroodiesfoodies-dxb-DQjgZMhkqh2.mp4' } }, // page 6, oldest
    ],
  },
  {
    handle: 'ellevousguide',
    color: '#7c3aed',
    url: 'https://www.instagram.com/ellevousguide/',
    reels: [
      { shortcode: 'DXesY5UM_g4', type: 'p', localMedia: { kind: 'video', src: '/reels/ellevousguide-DXesY5UM_g4.mp4', caption: 'Yes you can also eat for less than €10 in Paris 😉 #cheapeats #parisguide #parisfood' } },     // page 1, newest
      { shortcode: 'DVti6aGDoWq', type: 'p', localMedia: { kind: 'video', src: '/reels/ellevousguide-DVti6aGDoWq.mp4' } }, // page 2
      { shortcode: 'DSzNG4tjAqu', type: 'reel', localMedia: { kind: 'video', src: '/reels/ellevousguide-DSzNG4tjAqu.mp4' } }, // page 3
      { shortcode: 'DRAQGGUjKy0', type: 'reel', localMedia: { kind: 'video', src: '/reels/ellevousguide-DRAQGGUjKy0.mp4' } }, // page 4
      { shortcode: 'DR2V9vuDML-', type: 'reel', localMedia: { kind: 'video', src: '/reels/ellevousguide-DR2V9vuDML-.mp4' } }, // page 5
      { shortcode: 'DUfYlnuAvxJ', type: 'reel', localMedia: { kind: 'video', src: '/reels/ellevousguide-DUfYlnuAvxJ.mp4' } }, // page 6
    ],
  },
  {
    handle: 'laroutineyt',
    color: '#16a34a',
    url: 'https://www.instagram.com/laroutineyt/',
    reels: [
      { shortcode: 'DXZ-s8TDebM', type: 'reel', localMedia: { kind: 'video', src: '/reels/laroutineyt-DXZ-s8TDebM.mp4', caption: "J'ai testé les nouvelles chips de crêpes sucrées déclinées en 4 versions par les bons de chez Bret's, lesquelles préférez-vous ?" } }, // page 1, newest
      { shortcode: 'DWzDerXjURf', type: 'reel', localMedia: { kind: 'video', src: '/reels/laroutineyt-DWzDerXjURf.mp4' } }, // page 2
      { shortcode: 'DVTx-Bdje99', type: 'reel', localMedia: { kind: 'video', src: '/reels/laroutineyt-DVTx-Bdje99.mp4' } }, // page 3
      { shortcode: 'DVHRV8aDVMd', type: 'reel', localMedia: { kind: 'video', src: '/reels/laroutineyt-DVHRV8aDVMd.mp4' } }, // page 4
      { shortcode: 'DVG4b48jbNi', type: 'reel', localMedia: { kind: 'video', src: '/reels/laroutineyt-DVG4b48jbNi.mp4' } }, // page 5
      { shortcode: 'DU5DbZWDQ42', type: 'reel', localMedia: { kind: 'video', src: '/reels/laroutineyt-DU5DbZWDQ42.mp4' } }, // page 6, oldest
    ],
  },
  {
    handle: 'wondersbyaline',
    color: '#f43f5e',
    url: 'https://www.instagram.com/wondersbyaline/',
    reels: [
      { shortcode: 'DWmFYn0DXsy', type: 'reel', localMedia: { kind: 'video', src: '/reels/wondersbyaline-DWmFYn0DXsy.mp4', caption: "We tried Le Dada Bistro at @maisondada.lb last week in Beirut's Saifi district and it's exactly the kind of spot you save for slow Sunday lunches." } }, // page 1, newest
      { shortcode: 'DVRqFx7jYld', type: 'reel', localMedia: { kind: 'video', src: '/reels/wondersbyaline-DVRqFx7jYld.mp4' } }, // page 2
      { shortcode: 'DVB4QnTDVF-', type: 'reel', localMedia: { kind: 'video', src: '/reels/wondersbyaline-DVB4QnTDVF-.mp4' } }, // page 3
      { shortcode: 'DU8mp01jZnu', type: 'reel', localMedia: { kind: 'video', src: '/reels/wondersbyaline-DU8mp01jZnu.mp4' } }, // page 4
      { shortcode: 'DUv5pNUjT4U', type: 'reel', localMedia: { kind: 'video', src: '/reels/wondersbyaline-DUv5pNUjT4U.mp4' } }, // page 5
      { shortcode: 'DUtE9gqDUeY', type: 'reel', localMedia: { kind: 'video', src: '/reels/wondersbyaline-DUtE9gqDUeY.mp4' } }, // page 6, oldest
    ],
  },
  {
    handle: 'newinbeirut',
    color: '#f97316',
    url: 'https://www.instagram.com/newinbeirut/',
    reels: [
      { shortcode: 'DXjpqghiPAM', type: 'p',    localMedia: { kind: 'image', src: '/reels/newinbeirut-DXjpqghiPAM.jpg', caption: '✈️ Beirut Flight Update, as of today (23.04.2026). 🟢 Currently operating: Middle East Airlines. Stay updated, save and share.' } }, // page 1, newest
      { shortcode: 'DXfBjG3jZbp', type: 'p',    localMedia: { kind: 'video', src: '/reels/newinbeirut-DXfBjG3jZbp.mp4' } }, // page 2
      { shortcode: 'DVthGdRDYhk', type: 'p',    localMedia: { kind: 'image', src: '/reels/newinbeirut-DVthGdRDYhk.jpg' } }, // page 3
      { shortcode: 'DVeHssgDUKf', type: 'p',    localMedia: { kind: 'video', src: '/reels/newinbeirut-DVeHssgDUKf.mp4' } }, // page 4
      { shortcode: 'DVRUcaTjaYu', type: 'p',    localMedia: { kind: 'video', src: '/reels/newinbeirut-DVRUcaTjaYu.mp4' } }, // page 5
      { shortcode: 'DUaUxCtjVdq', type: 'reel', localMedia: { kind: 'video', src: '/reels/newinbeirut-DUaUxCtjVdq.mp4' } }, // page 6, oldest
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

// Figma-quality device mockup, thin 2px bezel, pill notch, side buttons outside overflow clip
function PhoneFrame({ children }) {
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{ position: 'relative', padding: '0 3px' }}>
      {/* Volume down */}
      <div style={{ position: 'absolute', left: 0, top: 96, width: 3, height: 28, background: '#3a3a3c', borderRadius: '2px 0 0 2px' }} />
      {/* Volume up */}
      <div style={{ position: 'absolute', left: 0, top: 136, width: 3, height: 56, background: '#3a3a3c', borderRadius: '2px 0 0 2px' }} />
      {/* Mute */}
      <div style={{ position: 'absolute', left: 0, top: 64, width: 3, height: 22, background: '#3a3a3c', borderRadius: '2px 0 0 2px' }} />
      {/* Power */}
      <div style={{ position: 'absolute', right: 0, top: 116, width: 3, height: 68, background: '#3a3a3c', borderRadius: '0 2px 2px 0' }} />

      {/* Phone body */}
      <div style={{
        borderRadius: 48,
        overflow: 'hidden',
        background: '#000',
        border: '2px solid #3a3a3c',
        boxShadow: 'inset 0 0 0 1px #111, 0 30px 60px -8px rgba(0,0,0,0.55)',
      }}>
        {/* Status bar */}
        <div style={{ height: 48, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: '-0.3px', fontFamily: 'system-ui' }}>{time}</span>
          {/* Dynamic Island */}
          <div style={{ width: 112, height: 30, background: '#000', border: '1.5px solid #222', borderRadius: 20 }} />
          {/* Icons */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
              <rect x="0" y="8" width="3" height="4" rx="1" opacity="0.4"/>
              <rect x="4.5" y="5" width="3" height="7" rx="1" opacity="0.6"/>
              <rect x="9" y="2" width="3" height="10" rx="1" opacity="0.8"/>
              <rect x="13.5" y="0" width="3" height="12" rx="1"/>
            </svg>
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <rect x="0.75" y="0.75" width="18" height="10.5" rx="3" stroke="white" strokeOpacity="0.3" strokeWidth="1.5"/>
              <rect x="2" y="2" width="13" height="8" rx="1.5" fill="white"/>
              <path d="M20 4v4a2 2 0 000-4z" fill="white" opacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* Screen content */}
        {children}

        {/* Home indicator */}
        <div style={{ height: 26, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 120, height: 4, background: '#3a3a3c', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

// Lazy embed: only initializes Instagram embed when in viewport, big perf
// win on mobile snap-scroll where only one card is visible at a time.
function EmbedCard({ html, height }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);
  const embedRef = useRef(null);

  // Watch for viewport intersection before injecting embed
  useEffect(() => {
    if (!containerRef.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.disconnect(); }
    }, { rootMargin: '300px' }); // start a bit before card enters
    io.observe(containerRef.current);
    return () => io.disconnect();
  }, []);

  // Once in view, inject HTML and trigger embed processing
  useEffect(() => {
    if (!inView || !embedRef.current) return;
    embedRef.current.innerHTML = html;
    if (window.instgrm) window.instgrm.Embeds.process();
    const obs = new MutationObserver(() => {
      if (embedRef.current?.querySelector('iframe')) { setLoaded(true); obs.disconnect(); }
    });
    obs.observe(embedRef.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [inView, html]);

  return (
    <div ref={containerRef} style={{ position: 'relative', height, overflow: 'hidden' }}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, background: '#f0f0f0', zIndex: 1 }}>
          <div style={{ height: 68, background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e5e5' }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: 100, height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ width: 60, height: 8, background: '#ebebeb', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ height: height - 68, background: 'linear-gradient(110deg,#e8e8e8 30%,#f5f5f5 50%,#e8e8e8 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        </div>
      )}
      <div ref={embedRef} style={{ minHeight: height }} />
    </div>
  );
}

// Caption overlay, like Instagram's caption strip at bottom of reels
function CaptionOverlay({ text, handle, instaUrl }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = (text || '').length > 80;
  const display = !text ? '' : (expanded || !isLong ? text : text.slice(0, 80).trimEnd() + '… ');
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '40px 14px 14px',
      background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0) 100%)',
      pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: text ? 4 : 0, gap: 8 }}>
          <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            @{handle}
          </div>
          {instaUrl && (
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 9px', borderRadius: 999,
                background: 'rgba(255,255,255,0.95)', color: '#000',
                fontSize: 9.5, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Open
            </a>
          )}
        </div>
        {text && (
          <div style={{
            color: '#fff', fontSize: 11, lineHeight: 1.4, fontWeight: 400,
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            maxHeight: expanded ? 200 : 50, overflow: 'hidden', transition: 'max-height 0.25s ease',
          }}>
            {display}
            {isLong && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
                style={{ background: 'none', border: 0, color: '#bbb', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0, marginLeft: 2 }}
              >
                {expanded ? 'less' : 'more'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Self-hosted media card, tap-to-play MP4 or static image (object-fit: contain)
function LocalMediaCard({ media, height, color, handle, instaUrl }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);

  if (media.kind === 'image') {
    return (
      <div style={{ position: 'relative', height, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={media.src} alt="" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
        <CaptionOverlay text={media.caption} handle={handle} instaUrl={instaUrl} />
      </div>
    );
  }

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  };

  return (
    <div
      style={{ position: 'relative', height, overflow: 'hidden', background: '#000' }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={media.src}
        playsInline
        loop
        muted={muted}
        preload="metadata"
        poster=""
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.1; }}
        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', display: 'block' }}
      />

      {/* Big centered play button when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          aria-label="Play"
          style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.18)', border: 0, cursor: 'pointer', padding: 0,
          }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.35, animation: 'ping 1.6s ease-out infinite' }} />
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 30px ${color}80`,
            }}>
              <Play size={26} fill="white" color="white" style={{ marginLeft: 3 }} />
            </div>
          </div>
        </button>
      )}

      {/* Mute toggle, top-right so it doesn't overlap the caption Open-in-IG pill */}
      {(playing || showControls) && (
        <button
          onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          style={{
            position: 'absolute', top: 12, right: 12, width: 32, height: 32, zIndex: 3,
            borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(10px)', padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            {muted ? (
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            ) : (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            )}
          </svg>
        </button>
      )}

      <CaptionOverlay text={media.caption} handle={handle} instaUrl={instaUrl} />
    </div>
  );
}

// Iframely card, bypasses Instagram's embedding restrictions
function IframelyCard({ iframelyUrl, reelUrl, height }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  // Use exact wrapper structure iframely requires
  const html = `<div class="iframely-embed"><div class="iframely-responsive" style="height:${height}px;padding-bottom:0;"><a href="${reelUrl}" data-iframely-url="${iframelyUrl}"></a></div></div>`;

  useEffect(() => {
    if (!ref.current) return;

    // Watch for the iframe iframely injects, only then hide skeleton
    const obs = new MutationObserver(() => {
      if (ref.current?.querySelector('iframe')) { setLoaded(true); obs.disconnect(); }
    });
    obs.observe(ref.current, { childList: true, subtree: true });

    // Trigger iframely with retries until script is ready
    let attempts = 0;
    const tryLoad = () => {
      if (window.iframely) { window.iframely.load(); return; }
      if (++attempts < 20) setTimeout(tryLoad, 200);
    };
    tryLoad();

    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ position: 'relative', height, overflow: 'hidden' }}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, background: '#f0f0f0', zIndex: 1 }}>
          <div style={{ height: 68, background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e5e5' }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: 100, height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ width: 60, height: 8, background: '#ebebeb', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ height: height - 68, background: 'linear-gradient(110deg,#e8e8e8 30%,#f5f5f5 50%,#e8e8e8 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        </div>
      )}
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} style={{ width: '100%' }} />
    </div>
  );
}

function loadEmbedScript() {
  return new Promise(resolve => {
    if (window.instgrm) { resolve(); return; }
    const existing = document.getElementById('ig-embed-script');
    if (existing) {
      // Script tag exists, if already loaded instgrm would be set; wait for load
      existing.addEventListener('load', resolve, { once: true });
      return;
    }
    const s = document.createElement('script');
    s.id = 'ig-embed-script';
    s.src = 'https://www.instagram.com/embed.js';
    s.async = true;
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

function ReelCard({ reel, index }) {
  const acc     = ACCOUNTS_DATA.find(a => a.handle === reel.handle);
  const reelUrl = `https://www.instagram.com/${reel.type}/${reel.shortcode}/`;
  const [thumb, setThumb] = useState(null);

  // Fetch thumbnail when there's no local media AND it's not a carousel
  // (carousels get the swipeable IG blockquote embed instead).
  const useThumbCard = !reel.localMedia && !reel.carousel;
  useEffect(() => {
    if (!useThumbCard) return;
    fetch(`/api/ig-thumb?shortcode=${reel.shortcode}&type=${reel.type}`)
      .then(r => r.json())
      .then(d => { if (d.url) setThumb(d.url); })
      .catch(() => {});
  }, [reel.shortcode, useThumbCard, reel.type]);

  const SCREEN_H = 560;

  const blockquoteHtml = `<blockquote
    class="instagram-media"
    data-instgrm-captioned
    data-instgrm-permalink="${reelUrl}?utm_source=ig_embed&utm_campaign=loading"
    data-instgrm-version="14"
    style="background:#fff;border:0;border-radius:0;margin:0;max-width:100%;min-width:0;padding:0;width:100%;min-height:${SCREEN_H}px;"
  ></blockquote>`;

  // In-phone Instagram-style header
  const igHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#000', borderBottom: '1px solid #1c1c1e' }}>
      <div style={{ padding: 2, borderRadius: '50%', background: `linear-gradient(135deg, ${reel.color}, #f9c74f)`, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>
          {reel.handle.charAt(0).toUpperCase()}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{reel.handle}</div>
        <div style={{ color: '#666', fontSize: 9, fontWeight: 500 }}>Reel</div>
      </div>
      <a href={acc?.url} target="_blank" rel="noopener noreferrer" style={{ color: '#555', flexShrink: 0 }}>
        <ExternalLink size={13} />
      </a>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex justify-center"
    >
      <div style={{ width: '100%', maxWidth: 340 }}>
      <PhoneFrame>
        {igHeader}

        {reel.localMedia ? (
          <LocalMediaCard media={reel.localMedia} height={SCREEN_H} color={reel.color} handle={reel.handle} instaUrl={reelUrl} />
        ) : reel.carousel ? (
          <div style={{ position: 'relative', height: SCREEN_H, overflow: 'hidden', background: '#fff' }}>
            <EmbedCard html={blockquoteHtml} height={SCREEN_H} />
            <CaptionOverlay text={reel.caption} handle={reel.handle} instaUrl={reelUrl} />
          </div>
        ) : (
          <a href={reelUrl} target="_blank" rel="noopener noreferrer"
             style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: SCREEN_H, overflow: 'hidden', textDecoration: 'none' }}>
            {/* Thumbnail or gradient bg */}
            {thumb
              ? <img src={thumb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(170deg, ${reel.color}50 0%, #000 70%)` }} />
            }
            {/* Scrim */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
            {/* Play button (centered) */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: reel.color, opacity: 0.35, animation: 'ping 1.5s ease-out infinite' }} />
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: reel.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${reel.color}80` }}>
                <Play size={26} fill="white" color="white" style={{ marginLeft: 3 }} />
              </div>
            </div>
            {/* Side actions */}
            <div style={{ position: 'absolute', right: 12, bottom: 90, display: 'flex', flexDirection: 'column', gap: 18, zIndex: 2, alignItems: 'center' }}>
              {[['♥','12k'],['💬','438'],['↗','284']].map(([icon, count], i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontSize: 20, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>{icon}</span>
                  <span style={{ color: '#fff', fontSize: 9, fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>
            {/* Caption + Open in Instagram, on top of everything */}
            <CaptionOverlay text={reel.caption} handle={reel.handle} instaUrl={reelUrl} />
          </a>
        )}
      </PhoneFrame>
      </div>
    </motion.div>
  );
}

export default function TrendsPage() {
  const [page,          setPage]          = useState(0);
  const [activeAccount, setActiveAccount] = useState('all');

  // Single effect processes ALL blockquotes after each page/filter change
  const pageKey = `${page}-${activeAccount}`;
  useEffect(() => {
    const t = setTimeout(async () => {
      await loadEmbedScript();
      window.instgrm?.Embeds.process();
    }, 50);
    return () => clearTimeout(t);
  }, [pageKey]);

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
      className="space-y-6 pb-20"
    >
      {/* Header, compact on mobile */}
      <div>
        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp size={12} /> Trends & Reels
        </p>
        <h1 className="text-2xl md:text-5xl lg:text-6xl leading-tight font-bold">
          What the community <span className="italic font-normal text-gray-400">is watching.</span>
        </h1>
        <p className="text-sm md:text-lg text-gray-500 font-medium mt-1 hidden sm:block">
          FMCG reels and food trends from the top regional creators.
        </p>
      </div>

      {/* Account filter, horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => handleFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
            isAll ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500'
          }`}
        >All</button>
        {ACCOUNTS_DATA.map(acc => (
          <button
            key={acc.handle}
            onClick={() => handleFilter(acc.handle)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all ${
              activeAccount === acc.handle ? 'text-white' : 'bg-white border border-gray-200 text-gray-500'
            }`}
            style={activeAccount === acc.handle ? { backgroundColor: acc.color } : {}}
          >
            @{acc.handle}
          </button>
        ))}
      </div>

      {/* Mobile: horizontal snap-scroll (1 card at a time) */}
      <AnimatePresence mode="wait">
        <motion.div key={`${page}-${activeAccount}-mob`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex sm:hidden gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-4"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {currentReels.map((reel, i) => (
            <div key={reel.id} className="snap-center flex-shrink-0 w-[88vw] max-w-[340px]">
              <ReelCard reel={reel} index={i} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Desktop: grid */}
      <AnimatePresence mode="wait">
        <motion.div key={`${page}-${activeAccount}-desk`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-6 items-start"
        >
          {currentReels.map((reel, i) => (
            <ReelCard key={reel.id} reel={reel} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination, compact dots + arrows on mobile */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => goTo(page - 1)} disabled={page === 0}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-gray-400 disabled:opacity-30 transition-all">
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`rounded-full transition-all ${
                  page === i
                    ? 'w-6 h-6 bg-gray-900 text-white text-[10px] font-bold'
                    : 'w-6 h-6 bg-white border border-gray-200 text-gray-400 text-[10px]'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
          <button onClick={() => goTo(page + 1)} disabled={page === totalPages - 1}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-gray-400 disabled:opacity-30 transition-all">
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* Creator credits, horizontal scroll on mobile */}
      <div className="bg-gray-50 rounded-xl p-4 md:p-8 border border-gray-100">
        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-3">Featured Creators</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {ACCOUNTS_DATA.map(acc => (
            <a key={acc.handle} href={acc.url} target="_blank" rel="noopener noreferrer"
               className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                   style={{ backgroundColor: acc.color }}>
                {acc.handle.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-bold text-gray-600 whitespace-nowrap">@{acc.handle}</span>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
