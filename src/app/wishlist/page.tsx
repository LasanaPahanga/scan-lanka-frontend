'use client';

import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { useWishlist } from '@/components/WishlistProvider';

export default function WishlistPage() {
  const { items, loading } = useWishlist();

  return (
    <main className="page">
      <h1 className="page-title">My Wishlist</h1>
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
        <div className="product-grid" style={{ marginTop: '1.5rem' }}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
