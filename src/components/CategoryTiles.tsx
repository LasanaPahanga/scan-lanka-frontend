import Link from 'next/link';
import { CategoryCount } from '@/lib/catalog';

/**
 * Clickable category tiles for the shop, mirroring the live site's category row
 * (name + product count). Selecting a tile filters the grid via ?category=.
 */
export function CategoryTiles({
  categories,
  active,
}: {
  categories: CategoryCount[];
  active?: string;
}) {
  if (categories.length === 0) return null;
  const total = categories.reduce((n, c) => n + c.count, 0);

  return (
    <nav className="category-tiles" style={wrap} aria-label="Product categories">
      <Link href="/products" style={{ ...tile, ...(active ? null : tileActive) }}>
        <span style={tileName}>All products</span>
        <span style={tileCount}>{total} Products</span>
      </Link>
      {categories.map((c) => {
        const isActive = active === c.name;
        return (
          <Link
            key={c.name}
            href={`/products?category=${encodeURIComponent(c.name)}`}
            style={{ ...tile, ...(isActive ? tileActive : null) }}
          >
            <span style={tileName}>{c.name}</span>
            <span style={tileCount}>
              {c.count} {c.count === 1 ? 'Product' : 'Products'}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

const wrap = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '0.6rem',
  justifyContent: 'center',
  margin: '0 0 2rem',
};
const tile = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '0.15rem',
  padding: '0.7rem 1rem',
  minWidth: 130,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  textDecoration: 'none',
  color: 'var(--text)',
  transition: 'border-color 0.15s var(--ease), box-shadow 0.15s var(--ease)',
} as const;
const tileActive = {
  borderColor: 'var(--primary)',
  boxShadow: '0 0 0 1px var(--primary)',
  background: 'var(--primary-light)',
} as const;
const tileName = { fontWeight: 700, fontSize: '0.86rem', textAlign: 'center' as const, color: 'var(--primary)' };
const tileCount = { fontSize: '0.74rem', color: 'var(--muted)' } as const;
