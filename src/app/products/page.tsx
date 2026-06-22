import { listProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';

export const revalidate = 60; // ISR — static + revalidated (global/03 §3b)

export const metadata = {
  title: 'Products — Scan Lanka',
  description: 'Browse boards & teaching equipment from Scan Lanka.',
};

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ color: 'var(--text)' }}>Products</h1>
      {products.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No products yet. Please check back soon.</p>
      ) : (
        <div style={grid}>
          {products.map((p) => (
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
