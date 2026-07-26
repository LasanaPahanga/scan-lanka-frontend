'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  images: string[];
  alt: string;
  /** Rendered in the top-right of the main image (e.g. wishlist). */
  cornerAction?: React.ReactNode;
};

// Past this horizontal drag distance (px) a touch swipe flips to the next image.
const SWIPE_THRESHOLD = 45;

export function ProductImageGallery({ images, alt, cornerAction }: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const [lightbox, setLightbox] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const dragXRef = useRef(0);
  const movedRef = useRef(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const activeImage = images[imageIndex] ?? null;
  const hasMultiple = images.length > 1;

  const showPrev = useCallback(() => setImageIndex((i) => Math.max(0, i - 1)), []);
  const showNext = useCallback(() => setImageIndex((i) => Math.min(images.length - 1, i + 1)), [images.length]);

  // Reset to the first image whenever the image set changes (e.g. a variant with
  // its own photos is selected) so we never point past the end of a shorter set.
  useEffect(() => {
    setImageIndex(0);
  }, [images]);

  useEffect(() => {
    setHoverZoom(false);
  }, [imageIndex]);

  // Keep the active thumbnail scrolled into view in the horizontal strip.
  useEffect(() => {
    const strip = thumbsRef.current;
    const active = strip?.children[imageIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [imageIndex]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft' && hasMultiple) showPrev();
      if (e.key === 'ArrowRight' && hasMultiple) showNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, hasMultiple, showPrev, showNext]);

  function onMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (!activeImage || window.matchMedia('(hover: none)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
    setHoverZoom(true);
  }

  return (
    <>
      <div className="pdp-gallery">
        <div
          style={{ ...mainImg, position: 'relative', touchAction: 'pan-y' }}
          onTouchStart={(e) => {
            if (!hasMultiple) return;
            touchStartX.current = e.changedTouches[0]?.clientX ?? null;
            dragXRef.current = 0;
            movedRef.current = false;
            setDragging(true);
          }}
          onTouchMove={(e) => {
            if (touchStartX.current == null) return;
            let dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
            if (Math.abs(dx) > 6) movedRef.current = true;
            // Rubber-band at the ends so it feels bounded, not stuck.
            if ((imageIndex === 0 && dx > 0) || (imageIndex === images.length - 1 && dx < 0)) dx *= 0.3;
            dragXRef.current = dx;
            setDragX(dx);
          }}
          onTouchEnd={() => {
            const dx = dragXRef.current;
            setDragging(false);
            setDragX(0);
            touchStartX.current = null;
            if (Math.abs(dx) > SWIPE_THRESHOLD) {
              if (dx < 0) showNext();
              else showPrev();
            }
          }}
        >
          {cornerAction && <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>{cornerAction}</div>}

          {activeImage ? (
            <button
              type="button"
              aria-label="Zoom image"
              style={{
                ...zoomBtn,
                transform: `translateX(${dragX}px)`,
                transition: dragging ? 'none' : 'transform 0.25s var(--ease)',
              }}
              onClick={() => {
                // Suppress the zoom click that fires at the end of a swipe.
                if (movedRef.current) {
                  movedRef.current = false;
                  return;
                }
                setLightbox(true);
              }}
              onMouseMove={onMouseMove}
              onMouseLeave={() => setHoverZoom(false)}
            >
              {/* next/image serves a resized WebP/AVIF from the CDN instead of the full backend image,
                  so the main product photo paints fast. `fill` needs the sized, relative zoomBtn wrapper. */}
              <Image
                src={activeImage}
                alt={alt}
                fill
                sizes="(max-width: 900px) 92vw, 600px"
                quality={70}
                priority
                draggable={false}
                style={{
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-sm)',
                  transform: hoverZoom ? 'scale(2)' : 'scale(1)',
                  transformOrigin: zoomOrigin,
                  transition: hoverZoom ? 'none' : 'transform 0.2s var(--ease)',
                }}
              />
              <span className="zoom-hint" style={zoomHint}>Click to zoom</span>
            </button>
          ) : (
            <div style={imgPlaceholder}>No image</div>
          )}

          {/* Warm the browser cache for the adjacent images so left/right switching
              paints instantly instead of fetching on click. Optimized at the same
              size as the main image, so the switch reuses the cached URL. */}
          {hasMultiple &&
            [imageIndex - 1, imageIndex + 1]
              .filter((i) => i >= 0 && i < images.length)
              .map((i) => (
                <Image
                  key={`preload-${images[i]}`}
                  src={images[i]}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 92vw, 600px"
                  quality={70}
                  aria-hidden
                  style={{ objectFit: 'contain', opacity: 0, pointerEvents: 'none', visibility: 'hidden' }}
                />
              ))}

          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                style={{ ...navBtn, left: 8, opacity: imageIndex === 0 ? 0.35 : 1 }}
                disabled={imageIndex === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next image"
                style={{ ...navBtn, right: 8, opacity: imageIndex === images.length - 1 ? 0.35 : 1 }}
                disabled={imageIndex === images.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
              >
                ›
              </button>
            </>
          )}
        </div>

        {hasMultiple && (
          <div className="pdp-thumbs" ref={thumbsRef}>
            {images.map((src, idx) => (
              <button
                type="button"
                key={src}
                className={`pdp-thumb${idx === imageIndex ? ' is-active' : ''}`}
                aria-label={`View image ${idx + 1}`}
                aria-current={idx === imageIndex}
                onClick={() => setImageIndex(idx)}
              >
                <Image src={src} alt="" width={64} height={64} style={thumbImg} />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && activeImage && (
        <div style={lightboxBackdrop} onClick={() => setLightbox(false)} role="dialog" aria-modal="true">
          <button type="button" aria-label="Close" style={closeBtn} onClick={() => setLightbox(false)}>
            ✕
          </button>
          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Previous"
                style={{ ...lightboxNav, left: '1rem' }}
                disabled={imageIndex === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next"
                style={{ ...lightboxNav, right: '1rem' }}
                disabled={imageIndex === images.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
              >
                ›
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage}
            alt={alt}
            style={lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          {hasMultiple && (
            <p style={lightboxCount}>
              {imageIndex + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}

const mainImg = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
  padding: '1.25rem',
  minHeight: 240,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
} as const;
const imgPlaceholder = { padding: '4rem', textAlign: 'center' as const, color: 'var(--muted)' };
const thumbImg = {
  width: '100%',
  height: '100%',
  objectFit: 'contain' as const,
  display: 'block',
};
const zoomBtn = {
  position: 'relative' as const,
  display: 'block',
  width: '100%',
  height: 'min(460px, 78vw)', // defined height so next/image `fill` has a box to fill
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'zoom-in',
  overflow: 'hidden',
  borderRadius: 'var(--radius-sm)',
  touchAction: 'pan-y' as const,
};
const zoomHint = {
  position: 'absolute' as const,
  bottom: 8,
  right: 8,
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text)',
  background: 'rgba(255,255,255,0.92)',
  padding: '0.25rem 0.5rem',
  borderRadius: 6,
  border: '1px solid var(--border)',
  pointerEvents: 'none' as const,
};
const navBtn = {
  position: 'absolute' as const,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.92)',
  cursor: 'pointer',
  fontSize: '1.4rem',
  lineHeight: 1,
  color: 'var(--primary)',
};
const lightboxBackdrop = {
  position: 'fixed' as const,
  inset: 0,
  zIndex: 2000,
  background: 'rgba(0,0,0,0.88)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
};
const lightboxImg = {
  maxWidth: 'min(96vw, 1200px)',
  maxHeight: '90vh',
  objectFit: 'contain' as const,
  borderRadius: 'var(--radius-sm)',
};
const closeBtn = {
  position: 'absolute' as const,
  top: '1rem',
  right: '1rem',
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  fontSize: '1.25rem',
  cursor: 'pointer',
};
const lightboxNav = {
  position: 'absolute' as const,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  fontSize: '1.75rem',
  cursor: 'pointer',
};
const lightboxCount = {
  position: 'absolute' as const,
  bottom: '1.25rem',
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#fff',
  margin: 0,
  fontSize: '0.9rem',
};
