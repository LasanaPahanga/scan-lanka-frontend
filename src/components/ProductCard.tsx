import Link from 'next/link';
import { ProductChip, mediaUrl } from '@/lib/catalog';
import { formatLkr, formatRange } from '@/lib/money';

export function ProductCard({ product }: { product: ProductChip }) {
  const img = mediaUrl(product.previewImageUrl);
  const price =
    product.priceMode === 'SINGLE'
      ? formatLkr(product.priceCents)
      : formatRange(product.priceMinCents, product.priceMaxCents);

  return (
    <Link href={`/products/${product.slug}`} style={card}>
      <div style={imgWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={img} alt={product.name} style={imgStyle} /> : <div style={imgPlaceholder}>No image</div>}
      </div>
      <div style={{ padding: '0.75rem' }}>
        <div style={{ fontWeight: 600 }}>{product.name}</div>
        <div style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>{price || '—'}</div>
        {product.availability === 'OUT_OF_STOCK' && (
          <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>Out of stock</div>
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
const imgWrap = { aspectRatio: '4 / 3', background: 'var(--bg-muted)' } as const;
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
