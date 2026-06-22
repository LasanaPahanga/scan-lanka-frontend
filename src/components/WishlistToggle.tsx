'use client';

import type { ProductChip } from '@/lib/catalog';
import { useWishlist } from '@/components/WishlistProvider';

export function WishlistToggle({ product }: { product: ProductChip }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product.id);

  return (
    <button
      type="button"
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(product);
      }}
      style={btn}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}

const btn = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 2,
  border: 'none',
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '50%',
  width: 32,
  height: 32,
  cursor: 'pointer',
  fontSize: '1.1rem',
  lineHeight: 1,
  boxShadow: 'var(--shadow)',
} as const;
