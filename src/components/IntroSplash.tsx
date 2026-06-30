'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const SPLASH_KEY = 'sl_intro_splash_seen';
const SPLASH_SECONDS = 3.5;
const FADE_MS = 400;

export function IntroSplash() {
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'fading'>('idle');

  useEffect(() => {
    if (pathname !== '/') return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SPLASH_KEY)) return;

    setPhase('playing');
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [pathname]);

  useEffect(() => {
    if (phase !== 'playing') return;

    const video = videoRef.current;
    if (!video) return;

    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      video.pause();
      setPhase('fading');
      window.setTimeout(() => {
        sessionStorage.setItem(SPLASH_KEY, '1');
        setPhase('idle');
        document.body.style.overflow = '';
      }, FADE_MS);
    };

    const onTimeUpdate = () => {
      if (video.currentTime >= SPLASH_SECONDS) finish();
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    const fallback = window.setTimeout(finish, (SPLASH_SECONDS + 0.75) * 1000);

    void video.play().catch(() => finish());

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      window.clearTimeout(fallback);
    };
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <div
      className={`intro-splash${phase === 'fading' ? ' intro-splash--out' : ''}`}
      role="presentation"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="intro-splash-video"
        src="/intro_splash.mp4"
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
