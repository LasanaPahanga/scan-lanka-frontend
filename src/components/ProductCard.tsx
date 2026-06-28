import Link from 'next/link';
import { ProductChip, mediaUrl } from '@/lib/catalog';
import { formatLkr, formatRange } from '@/lib/money';
import { WishlistToggle } from '@/components/WishlistToggle';

export function ProductCard({ product }: { product: ProductChip }) {
  const img = mediaUrl(product.previewImageUrl);
  const price =
    product.priceMode === 'SINGLE'
      ? formatLkr(product.priceCents)
      : formatRange(product.priceMinCents, product.priceMaxCents);

  return (
    <Link href={`/products/${product.slug}`} className="card-hover" style={card}>
      <div style={{ ...imgWrap, position: 'relative' }}>
        <WishlistToggle product={product} />
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.name} className="zoom" style={imgStyle} />
        ) : (
          <div style={imgPlaceholder}>No image</div>
        )}
      </div>
      <div style={{ padding: '0.9rem 0.75rem', textAlign: 'center' }}>
        <div style={nameStyle}>{product.name}</div>
        <div style={{ color: 'var(--primary)', marginTop: '0.4rem', fontWeight: 700 }}>{price || ''}</div>
        {product.availability === 'OUT_OF_STOCK' && (
          <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Out of stock</div>
        )}
        {product.availability === 'LOW_STOCK' && (
          <div style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Low stock</div>
        )}
      </div>
    </Link>
  );
}

const card = {
  display: 'block',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  overflow: 'hidden',
  textDecoration: 'none',
  color: 'var(--text)',
  boxShadow: 'var(--shadow)',
  background: 'var(--bg)',
} as const;
const nameStyle = {
  fontWeight: 600,
  fontSize: '0.92rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.3px',
  color: 'var(--text)',
  minHeight: '2.4em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const imgWrap = { aspectRatio: '4 / 3', background: 'var(--bg-muted)', overflow: 'hidden' } as const;
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' } as const;
const imgPlaceholder = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--muted)',
  fontSize: '0.85rem',
} as const;
