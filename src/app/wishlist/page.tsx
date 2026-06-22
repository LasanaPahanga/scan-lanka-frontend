'use client';

import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { useWishlist } from '@/components/WishlistProvider';

export default function WishlistPage() {
  const { items, loading } = useWishlist();

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ color: 'var(--text)' }}>Wishlist</h1>
      {loading && items.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>
          No saved items yet.{' '}
          <Link href="/products" style={{ color: 'var(--primary)' }}>
            Browse products
          </Link>
        </p>
      ) : (
        <div style={grid}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '1.25rem',
  marginTop: '1.5rem',
} as const;
