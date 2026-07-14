'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ProductChip, mediaUrl } from '@/lib/catalog';
import { formatDisplayPrice, formatDisplayRange } from '@/lib/displayMoney';
import { useGeo } from '@/components/GeoProvider';
import { useCart } from '@/components/CartProvider';
import { WishlistToggle } from '@/components/WishlistToggle';

export function ProductCard({ product, priority = false }: { product: ProductChip; priority?: boolean }) {
  const { geo } = useGeo();
  const { add, count } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const img = mediaUrl(product.previewImageUrl);
  const price =
    product.priceMode === 'SINGLE'
      ? formatDisplayPrice(product.priceCents, geo)
      : formatDisplayRange(product.priceMinCents, product.priceMaxCents, geo);

  // A chip can quick-add only a single-priced, in-stock, checkout-eligible product - one
  // with spec-driven pricing (VARIANT) has no default size/variant to add without visiting
  // the product page, same gating the PDP buy-bar already applies (04 FR-CART-9).
  const canQuickAdd =
    product.priceMode === 'SINGLE' && product.availability !== 'OUT_OF_STOCK' && geo.canCheckout;
  const productHref = `/products/${product.slug}`;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canQuickAdd) {
      router.push(productHref);
      return;
    }
    void add({ productId: product.id, variantId: null, quantity: 1, name: product.name });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  function buyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (canQuickAdd) {
      void add({ productId: product.id, variantId: null, quantity: 1, name: product.name }).then(() => {
        router.push('/cart');
      });
    } else {
      router.push(productHref);
    }
  }

  function viewCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push('/cart');
  }

  return (
    <Link href={productHref} className="card-hover product-card">
      <div className="product-card-img">
        <WishlistToggle product={product} />
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="zoom"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...(priority ? { fetchPriority: 'high' as const } : {})}
          />
        ) : (
          <div className="product-card-noimg">No image</div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">{price || ''}</div>
        {product.availability === 'OUT_OF_STOCK' && (
          <div className="product-card-stock product-card-stock--out">Out of stock</div>
        )}
        {product.availability === 'LOW_STOCK' && (
          <div className="product-card-stock product-card-stock--low">Low stock</div>
        )}
        <div className="product-card-actions">
          <button type="button" className="product-card-action" onClick={quickAdd}>
            {added ? 'Added ✓' : canQuickAdd ? 'Add to cart' : 'Select options'}
          </button>
          <button type="button" className="product-card-action product-card-action--primary" onClick={buyNow}>
            Buy now
          </button>
          <button
            type="button"
            className="product-card-action product-card-action--icon"
            onClick={viewCart}
            aria-label="View cart"
            title="View cart"
          >
            <CartGlyph />
            {count > 0 && <span className="product-card-action-badge">{count > 99 ? '99+' : count}</span>}
          </button>
        </div>
      </div>
    </Link>
  );
}

export function CartGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
      <path d="M2.5 3.5h2.6l2.3 12h10.8l2.3-8.8H6.1" />
    </svg>
  );
}
