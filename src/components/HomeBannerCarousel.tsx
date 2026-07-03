'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { HomeBanner } from '@/lib/home';
import { mediaUrl } from '@/lib/catalog';

function BannerLink({ banner, children }: { banner: HomeBanner; children: React.ReactNode }) {
  const url = banner.linkUrl?.trim();
  if (!url) return <>{children}</>;
  if (url.startsWith('/') || url.startsWith('#')) {
    return (
      <Link href={url} className="home-banner-carousel__link">
        {children}
      </Link>
    );
  }
  return (
    <a href={url} className="home-banner-carousel__link" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function NavIcon({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={direction === 'prev' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeBannerCarousel({ banners }: { banners: HomeBanner[] }) {
  const slides = banners.filter((b) => mediaUrl(b.imageUrl));
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  return (
    <section className="home-banner-carousel-section" aria-label="Promotions">
      <div className="container home-banner-carousel-wrap">
        <div
          className="home-banner-carousel"
          onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchStartX == null || count < 2) return;
            const dx = touchStartX - (e.changedTouches[0]?.clientX ?? touchStartX);
            if (Math.abs(dx) > 40) go(dx > 0 ? index + 1 : index - 1);
            setTouchStartX(null);
          }}
        >
          <div
            className="home-banner-carousel__track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((banner) => {
              const src = mediaUrl(banner.imageUrl)!;
              const img = (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="home-banner-carousel__img" draggable={false} />
              );
              return (
                <div key={banner.id} className="home-banner-carousel__slide">
                  <BannerLink banner={banner}>{img}</BannerLink>
                </div>
              );
            })}
          </div>

          <div className="home-banner-carousel__scrim" aria-hidden />

          {count > 1 && (
            <>
              <button
                type="button"
                className="home-banner-carousel__nav home-banner-carousel__nav--prev"
                aria-label="Previous banner"
                onClick={() => go(index - 1)}
              >
                <NavIcon direction="prev" />
              </button>
              <button
                type="button"
                className="home-banner-carousel__nav home-banner-carousel__nav--next"
                aria-label="Next banner"
                onClick={() => go(index + 1)}
              >
                <NavIcon direction="next" />
              </button>
              <div className="home-banner-carousel__dots" role="tablist" aria-label="Banner slides">
                {slides.map((banner, i) => (
                  <button
                    key={banner.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Banner ${i + 1} of ${count}`}
                    className={i === index ? 'home-banner-carousel__dot is-active' : 'home-banner-carousel__dot'}
                    onClick={() => go(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
