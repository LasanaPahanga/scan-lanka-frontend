'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProductChip, mediaUrl } from '@/lib/catalog';
import { formatDisplayPrice, formatDisplayRange } from '@/lib/displayMoney';
import { useGeo } from '@/components/GeoProvider';
import { WishlistToggle } from '@/components/WishlistToggle';

export function ProductCard({ product, priority = false }: { product: ProductChip; priority?: boolean }) {
  const { geo } = useGeo();
  const img = mediaUrl(product.previewImageUrl);
  const price =
    product.priceMode === 'SINGLE'
      ? formatDisplayPrice(product.priceCents, geo)
      : formatDisplayRange(product.priceMinCents, product.priceMaxCents, geo);

  return (
    <Link href={`/products/${product.slug}`} className="card-hover product-card">
      <div className="product-card-img">
        <WishlistToggle product={product} />
        {img ? (
          // next/image resizes to card size + serves WebP/AVIF from the CDN, instead of shipping the
          // full backend image; the container is position:relative with a fixed aspect-ratio, so `fill` fits.
          <Image
            src={img}
            alt={product.name}
            className="zoom"
            fill
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 260px"
            style={{ objectFit: 'cover' }}
            priority={priority}
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
