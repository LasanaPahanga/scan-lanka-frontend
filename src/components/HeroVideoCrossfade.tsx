'use client';

import { useEffect, useRef, useState } from 'react';

const SOURCES = ['/hero-1.mp4', '/hero-2.mp4'] as const;
const CROSSFADE_SEC = 1.2;

export function HeroVideoCrossfade() {
  const ref0 = useRef<HTMLVideoElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);
  const activeRef = useRef(0);
  const switchingRef = useRef(false);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [secondLoaded, setSecondLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFailed(true);
      return undefined;
    }

    const videos = [ref0.current, ref1.current].filter(Boolean) as HTMLVideoElement[];
    if (videos.length < 2) return undefined;

    let cancelled = false;

    const crossfadeTo = (next: number) => {
      if (switchingRef.current || next === activeRef.current) return;
      switchingRef.current = true;
      activeRef.current = next;

      const incoming = next === 0 ? ref0.current : ref1.current;
      const outgoing = next === 0 ? ref1.current : ref0.current;
      if (incoming) {
        incoming.currentTime = 0;
        void incoming.play().catch(() => setFailed(true));
      }

      setActive(next);

      window.setTimeout(() => {
        if (outgoing) outgoing.pause();
        switchingRef.current = false;
      }, CROSSFADE_SEC * 1000 + 80);
    };

    const onTick = () => {
      const i = activeRef.current;
      const el = i === 0 ? ref0.current : ref1.current;
      if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return;
      if (el.duration - el.currentTime <= CROSSFADE_SEC) {
        crossfadeTo((i + 1) % 2);
      }
    };

    const onReady = () => {
      if (!cancelled) setReady(true);
    };

    videos.forEach((v) => {
      v.addEventListener('timeupdate', onTick);
      v.addEventListener('canplay', onReady);
    });

    // Load the second (crossfade) video only once the first is playable, so it doesn't
    // compete for bandwidth with the video the visitor actually sees first.
    const firstVideo = videos[0];
    const onFirstReady = () => {
      if (!cancelled) setSecondLoaded(true);
      firstVideo.removeEventListener('canplay', onFirstReady);
    };
    firstVideo.addEventListener('canplay', onFirstReady);

    void videos[0].play().catch(() => setFailed(true));

    return () => {
      cancelled = true;
      videos.forEach((v) => {
        v.removeEventListener('timeupdate', onTick);
        v.removeEventListener('canplay', onReady);
      });
      firstVideo.removeEventListener('canplay', onFirstReady);
    };
  }, []);

  if (failed) return null;

  return (
    <div style={wrap} aria-hidden="true">
      <video
        ref={ref0}
        src={SOURCES[0]}
        poster="/CB-free-01herosection.png"
        muted
        playsInline
        preload="auto"
        style={{ ...videoStyle, opacity: active === 0 ? 1 : 0 }}
      />
      <video
        ref={ref1}
        src={secondLoaded ? SOURCES[1] : undefined}
        muted
        playsInline
        preload="auto"
        style={{ ...videoStyle, opacity: active === 1 ? 1 : 0 }}
      />
      <div className="hero-scrim" style={{ ...scrim, opacity: ready ? 1 : 0, transition: 'opacity 0.6s ease' }} />
    </div>
  );
}

const wrap = {
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  background: 'var(--bg-muted)',
} as const;

const videoStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center center',
  transition: `opacity ${CROSSFADE_SEC}s ease-in-out`,
  willChange: 'opacity',
} as const;

// Lighter than before (owner: "video must be a bit more visible") - legibility for the
// text itself now comes from the frosted panel behind it (HomePageView `heroTextPanel`),
// not from crushing the whole hero under a near-opaque scrim.
const scrim = {
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(105deg, rgba(248,250,252,0.72) 0%, rgba(248,250,252,0.58) 38%, rgba(248,250,252,0.32) 72%, rgba(248,250,252,0.16) 100%)',
  pointerEvents: 'none',
} as const;
