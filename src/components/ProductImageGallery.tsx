'use client';

import { useCallback, useEffect, useState } from 'react';

type Props = {
  images: string[];
  alt: string;
  /** Rendered in the top-right of the main image (e.g. wishlist). */
  cornerAction?: React.ReactNode;
};

export function ProductImageGallery({ images, alt, cornerAction }: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [hoverZoom, setHoverZoom] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const [lightbox, setLightbox] = useState(false);

  const activeImage = images[imageIndex] ?? null;
  const hasMultiple = images.length > 1;

  const showPrev = useCallback(() => setImageIndex((i) => Math.max(0, i - 1)), []);
  const showNext = useCallback(() => setImageIndex((i) => Math.min(images.length - 1, i + 1)), [images.length]);

  useEffect(() => {
    setHoverZoom(false);
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
      <div>
        <div
          style={{ ...mainImg, position: 'relative' }}
          onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchStartX == null || !hasMultiple) return;
            const dx = touchStartX - (e.changedTouches[0]?.clientX ?? touchStartX);
            if (Math.abs(dx) > 40) {
              if (dx > 0) showNext();
              else showPrev();
            }
            setTouchStartX(null);
          }}
        >
          {cornerAction && <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>{cornerAction}</div>}

          {activeImage ? (
            <button
              type="button"
              aria-label="Zoom image"
              style={zoomBtn}
              onClick={() => setLightbox(true)}
              onMouseMove={onMouseMove}
              onMouseLeave={() => setHoverZoom(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={alt}
                draggable={false}
                style={{
                  width: '100%',
                  maxHeight: 460,
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
          <div style={thumbs}>
            {images.map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                onClick={() => setImageIndex(idx)}
                style={{ ...thumb, outline: idx === imageIndex ? '2px solid var(--primary)' : 'none' }}
              />
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
const thumbs = { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' as const };
const thumb = {
  width: 64,
  height: 64,
  objectFit: 'cover' as const,
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  cursor: 'pointer',
  background: 'var(--surface)',
};
const zoomBtn = {
  position: 'relative' as const,
  display: 'block',
  width: '100%',
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'zoom-in',
  overflow: 'hidden',
  borderRadius: 'var(--radius-sm)',
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
