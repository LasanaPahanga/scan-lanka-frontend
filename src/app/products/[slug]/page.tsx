import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/catalog';
import { ProductDetailView } from '@/components/ProductDetail';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p) return { title: 'Not found — Scan Lanka' };
  return { title: `${p.name} — Scan Lanka`, description: p.description ?? undefined };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();
  return <ProductDetailView product={product} />;
}
