'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductDetail, ResolvedVariant, mediaUrl, resolveVariant } from '@/lib/catalog';
import { formatDisplayPrice } from '@/lib/displayMoney';
import { useGeo } from '@/components/GeoProvider';
import { t } from '@/lib/i18n';
import { useCart } from '@/components/CartProvider';
import { WishlistToggle } from '@/components/WishlistToggle';

function stockLabel(availability: string): string | null {
  if (availability === 'OUT_OF_STOCK') return 'Out of stock';
  if (availability === 'LOW_STOCK') return 'Low stock - order soon';
  return null;
}

export function ProductDetailView({ product }: { product: ProductDetail }) {
  const { add } = useCart();
  const { geo } = useGeo();
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
      ? formatDisplayPrice(product.singlePriceCents, geo)
      : resolved
        ? formatDisplayPrice(resolved.priceCents, geo)
        : `${formatDisplayPrice(product.priceMinCents, geo)} – ${formatDisplayPrice(product.priceMaxCents, geo)}`;

  const currentAvailability =
    product.priceMode === 'SINGLE' ? product.availability : resolved?.availability ?? '';
  const inStock = currentAvailability !== 'OUT_OF_STOCK';
  const stockMsg = stockLabel(currentAvailability);
  const whatsappOnly = product.whatsappOnly;
  const canAddToCart =
    geo.canCheckout &&
    !whatsappOnly &&
    (product.priceMode === 'SINGLE' || (allSelected && resolved != null && inStock));

  const chip = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    previewImageUrl: product.imageUrls[0] ?? null,
    priceMode: product.priceMode,
    priceCents: product.singlePriceCents,
    priceMinCents: product.priceMinCents,
    priceMaxCents: product.priceMaxCents,
    availability: product.availability,
  };

  const showPrev = () => setImageIndex((i) => Math.max(0, i - 1));
  const showNext = () => setImageIndex((i) => Math.min(images.length - 1, i + 1));

  return (
    <main className="page">
      <Link href="/products" className="icon-link" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
        ← Back to products
      </Link>
      <div className="product-detail-layout" style={layout}>
        <div>
          <div
            style={{ ...mainImg, position: 'relative' }}
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
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
              <WishlistToggle product={chip} />
            </div>
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={product.name}
                style={{ width: '100%', maxHeight: 460, objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
              />
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
          <h1 className="page-title" style={{ marginTop: 0 }}>{product.name}</h1>
          <div style={{ fontSize: '1.6rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
            {priceLabel || ''}
          </div>
          {geo.indicativePricing && (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{t('geo.indicative')}</p>
          )}
          {!geo.canCheckout && (
            <p style={{ marginTop: '0.75rem' }}>
              {t('geo.noCheckout')}{' '}
              <Link href="/quote" style={{ color: 'var(--primary)' }}>
                Request a quote
              </Link>{' '}
              or{' '}
              <Link href="/contact" style={{ color: 'var(--primary)' }}>
                contact us
              </Link>
              .
            </p>
          )}
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

          <div style={deliveryBox}>
            <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Delivery</div>
            {whatsappOnly ? (
              <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>
                This item is arranged via{' '}
                <Link href="/contact" style={{ color: 'var(--primary)' }}>
                  contact
                </Link>{' '}
                or{' '}
                <Link href="/quote" style={{ color: 'var(--primary)' }}>
                  quote
                </Link>{' '}
                not available for standard online checkout.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                <li>Company lorry - prepaid online (orders over Rs 6,000)</li>
                {product.couriable ? (
                  <li>Courier (Citrek) - pay on delivery{product.weightKg ? ` (~${product.weightKg} kg)` : ''}</li>
                ) : (
                  <li>Courier not available for this item (weight not set)</li>
                )}
              </ul>
            )}
          </div>

          <button
            type="button"
            disabled={!canAddToCart}
            onClick={() => {
              void add({
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
            {added ? 'Added ✓' : whatsappOnly ? 'Contact us to order' : geo.canCheckout ? 'Add to cart' : 'Quote / contact only'}
          </button>

          {product.description && <p style={{ color: 'var(--muted)', marginTop: '1.5rem' }}>{product.description}</p>}
          {product.details && <p style={{ whiteSpace: 'pre-line' }}>{product.details}</p>}
        </div>
      </div>
    </main>
  );
}

const layout = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' } as const;
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
} as const;
const imgPlaceholder = { padding: '4rem', textAlign: 'center', color: 'var(--muted)' } as const;
const thumbs = { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' } as const;
const thumb = {
  width: 64,
  height: 64,
  objectFit: 'cover',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  cursor: 'pointer',
  background: 'var(--surface)',
} as const;
const optBtn = {
  padding: '0.5rem 0.9rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'border-color 0.15s var(--ease), background 0.15s var(--ease)',
} as const;
const optBtnActive = { borderColor: 'var(--primary)', background: 'var(--primary)', color: 'var(--primary-contrast)' } as const;
const deliveryBox = {
  marginTop: '1rem',
  marginBottom: '0.5rem',
  padding: '0.75rem 1rem',
  background: 'var(--bg-muted)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
} as const;
const addBtn = {
  padding: '0.85rem 1.75rem',
  background: 'var(--primary)',
  color: 'var(--primary-contrast)',
  border: 'none',
  borderRadius: 'var(--radius)',
  fontSize: '1rem',
  fontWeight: 600,
  marginTop: '0.5rem',
  transition: 'background 0.18s var(--ease)',
} as const;
