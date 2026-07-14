import Link from 'next/link';
import type { ProductChip } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';

/** Same-category (or sibling) strip under the PDP — mirrors home category rows. */
export function RecommendedProducts({
  products,
  category,
}: {
  products: ProductChip[];
  category: string | null;
}) {
  if (products.length === 0) return null;

  const browseHref = category?.trim()
    ? `/products?category=${encodeURIComponent(category.trim())}`
    : '/products';

  return (
    <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <h2 className="section-title" style={{ margin: 0 }}>
          Recommended products
        </h2>
        <Link href={browseHref} className="icon-link" style={{ color: 'var(--primary)' }}>
          View all →
        </Link>
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
