'use client';

import Link from 'next/link';
import { ProductChip, mediaUrl } from '@/lib/catalog';
import { formatDisplayPrice, formatDisplayRange } from '@/lib/displayMoney';
import { useGeo } from '@/components/GeoProvider';
import { WishlistToggle } from '@/components/WishlistToggle';

export function ProductCard({ product }: { product: ProductChip }) {
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
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.name} className="zoom" loading="lazy" />
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
