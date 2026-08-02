'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const SPLASH_KEY = 'sl_intro_splash_seen';
const SPLASH_SECONDS = 5;
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
    let retryTimer: number | undefined;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      try {
        video.pause();
      } catch {
        /* ignore */
      }
      setPhase('fading');
      window.setTimeout(() => {
        sessionStorage.setItem(SPLASH_KEY, '1');
        setPhase('idle');
        document.body.style.overflow = '';
      }, FADE_MS);
    };

    const tryPlay = () => {
      if (finished) return;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise) {
        void playPromise.catch(() => {
          // Do not dismiss the splash on autoplay failure — retry when more data is ready.
          if (!finished) {
            retryTimer = window.setTimeout(tryPlay, 250);
          }
        });
      }
    };

    const onTimeUpdate = () => {
      if (video.currentTime >= SPLASH_SECONDS) finish();
    };
    const onEnded = () => finish();
    const onReady = () => tryPlay();

    video.muted = true;
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('canplay', onReady);
    video.addEventListener('loadeddata', onReady);

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.preload = 'auto';
      tryPlay();
    }

    const fallback = window.setTimeout(finish, (SPLASH_SECONDS + 1.25) * 1000);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('loadeddata', onReady);
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
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
        autoPlay
        preload="auto"
      />
    </div>
  );
}
