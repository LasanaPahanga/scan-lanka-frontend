'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductDetail, ResolvedVariant, mediaUrl, resolveVariant } from '@/lib/catalog';
import { formatLkr, formatRange } from '@/lib/money';
import { useCart } from '@/components/CartProvider';

function stockLabel(availability: string): string | null {
  if (availability === 'OUT_OF_STOCK') return 'Out of stock';
  if (availability === 'LOW_STOCK') return 'Low stock — order soon';
  return null;
}

export function ProductDetailView({ product }: { product: ProductDetail }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const images = product.imageUrls.map(mediaUrl).filter(Boolean) as string[];
  const [imageIndex, setImageIndex] = useState(0);
  const activeImage = images[imageIndex] ?? null;
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [resolved, setResolved] = useState<ResolvedVariant | null>(null);
  const [resolveError, setResolveError] = useState(false);

  const priceAffecting = useMemo(
    () => product.specGroups.filter((g) => g.priceAffecting),
    [product.specGroups],
  );
  const allSelected = priceAffecting.every((g) => selected[g.id] != null);

  useEffect(() => {
    if (product.priceMode !== 'VARIANT' || !allSelected) {
      setResolved(null);
      return;
    }
    const ids = priceAffecting.map((g) => selected[g.id]);
    let cancelled = false;
    resolveVariant(product.id, ids)
      .then((r) => !cancelled && (setResolved(r), setResolveError(false)))
      .catch(() => !cancelled && (setResolved(null), setResolveError(true)));
    return () => {
      cancelled = true;
    };
  }, [allSelected, selected, priceAffecting, product.id, product.priceMode]);

  const priceLabel =
    product.priceMode === 'SINGLE'
      ? formatLkr(product.singlePriceCents)
      : resolved
        ? formatLkr(resolved.priceCents)
        : formatRange(product.priceMinCents, product.priceMaxCents);

  const currentAvailability =
    product.priceMode === 'SINGLE' ? product.availability : resolved?.availability ?? '';
  const inStock = currentAvailability !== 'OUT_OF_STOCK';
  const stockMsg = stockLabel(currentAvailability);
  const canAddToCart = product.priceMode === 'SINGLE' || (allSelected && resolved != null && inStock);

  const showPrev = () => setImageIndex((i) => Math.max(0, i - 1));
  const showNext = () => setImageIndex((i) => Math.min(images.length - 1, i + 1));

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={layout}>
        <div>
          <div
            style={mainImg}
            onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
            onTouchEnd={(e) => {
              if (touchStartX == null || images.length < 2) return;
              const dx = touchStartX - (e.changedTouches[0]?.clientX ?? touchStartX);
              if (Math.abs(dx) > 40) {
                if (dx > 0) showNext();
                else showPrev();
              }
              setTouchStartX(null);
            }}
          >
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeImage} alt={product.name} style={{ width: '100%', borderRadius: 'var(--radius)' }} />
            ) : (
              <div style={imgPlaceholder}>No image</div>
            )}
          </div>
          {images.length > 1 && (
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

        <div>
          <h1 style={{ marginTop: 0 }}>{product.name}</h1>
          <div style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            {priceLabel || '—'}
          </div>
          {stockMsg && (
            <p style={{ color: currentAvailability === 'LOW_STOCK' ? 'var(--accent)' : 'var(--danger)', marginTop: 0 }}>
              {stockMsg}
            </p>
          )}

          {product.specGroups.map((g) => (
            <div key={g.id} style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                {g.name}
                {!g.priceAffecting && <span style={{ color: 'var(--muted)' }}> (optional)</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {g.options.map((o) => {
                  const active = selected[g.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelected((s) => ({ ...s, [g.id]: o.id }))}
                      style={{ ...optBtn, ...(active ? optBtnActive : {}) }}
                    >
                      {o.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {resolveError && <p style={{ color: 'var(--danger)' }}>That combination isn&apos;t available.</p>}

          <button
            type="button"
            disabled={!canAddToCart}
            onClick={() => {
              add({
                productId: product.id,
                variantId: product.priceMode === 'VARIANT' ? (resolved?.variantId ?? null) : null,
                quantity: 1,
                name: product.name,
              });
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
            style={{ ...addBtn, opacity: canAddToCart ? 1 : 0.5, cursor: canAddToCart ? 'pointer' : 'not-allowed' }}
          >
            {added ? 'Added ✓' : 'Add to cart'}
          </button>

          {product.description && <p style={{ color: 'var(--muted)', marginTop: '1.5rem' }}>{product.description}</p>}
          {product.details && <p style={{ whiteSpace: 'pre-line' }}>{product.details}</p>}
        </div>
      </div>
    </main>
  );
}

const layout = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' } as const;
const mainImg = { background: 'var(--bg-muted)', borderRadius: 'var(--radius)', minHeight: 200 } as const;
const imgPlaceholder = { padding: '4rem', textAlign: 'center', color: 'var(--muted)' } as const;
const thumbs = { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' } as const;
const thumb = { width: 64, height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' } as const;
const optBtn = {
  padding: '0.45rem 0.8rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--bg)',
  cursor: 'pointer',
} as const;
const optBtnActive = { borderColor: 'var(--primary)', background: 'var(--primary)', color: 'var(--primary-contrast)' } as const;
const addBtn = {
  padding: '0.7rem 1.5rem',
  background: 'var(--accent)',
  color: 'var(--primary-contrast)',
  border: 'none',
  borderRadius: 'var(--radius)',
  fontSize: '1rem',
} as const;
