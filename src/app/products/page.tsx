import { Suspense } from 'react';
import { listProducts, getFacets, getCategoryCounts } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import { ProductBrowseToolbar } from '@/components/ProductBrowseToolbar';
import { ProductPagination } from '@/components/ProductPagination';
import { CategoryTiles } from '@/components/CategoryTiles';

export const revalidate = 60;

export const metadata = {
  title: 'Products - Scan Lanka',
  description: 'Browse boards & teaching equipment from Scan Lanka.',
};

type SearchParams = {
  q?: string;
  category?: string;
  parentId?: string;
  sort?: string;
  page?: string;
};

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(0, Number(searchParams.page ?? 0) || 0);
  const parentId = searchParams.parentId ? Number(searchParams.parentId) : undefined;
  const sort = (searchParams.sort as 'newest' | 'price_asc' | 'price_desc' | 'name') ?? 'newest';

  const [productPage, facets, categoryCounts] = await Promise.all([
    listProducts({
      q: searchParams.q,
      category: searchParams.category,
      parentId: Number.isFinite(parentId) ? parentId : undefined,
      sort,
      page,
      size: 24,
    }),
    getFacets(),
    getCategoryCounts(),
  ]);

  const { content: products, totalPages, number } = productPage;
  const hasFilters = Boolean(searchParams.q || searchParams.category || searchParams.parentId);

  return (
    <main className="page">
      <h1 className="page-title">Our Products</h1>
      <p className="page-intro">
        Browse our full range of boards and teaching equipment - manufactured locally, delivered
        island-wide.
      </p>
      <CategoryTiles categories={categoryCounts} active={searchParams.category} />
      <Suspense fallback={null}>
        <ProductBrowseToolbar
          facets={facets}
          q={searchParams.q}
          category={searchParams.category}
          parentId={Number.isFinite(parentId) ? parentId : undefined}
          sort={sort}
        />
      </Suspense>

      {products.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>
          {hasFilters
            ? 'No products match your filters. Try clearing search or choosing a different category.'
            : 'No products yet. Please check back soon.'}
        </p>
      ) : (
        <>
          <div style={grid}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <Suspense fallback={null}>
            <ProductPagination page={number} totalPages={totalPages} />
          </Suspense>
        </>
      )}
    </main>
  );
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '1.25rem',
} as const;
