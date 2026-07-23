import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getRelatedProducts } from '@/lib/catalog';
import { ProductDetailView } from '@/components/ProductDetail';
import { JsonLd } from '@/components/JsonLd';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: 'Not found - Scan Lanka' };
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = `${base}/products/${slug}`;
  return {
    title: `${p.name} - Scan Lanka`,
    description: p.description ?? undefined,
    alternates: { canonical: url, languages: { 'en-LK': url, 'x-default': url } },
    openGraph: { title: p.name, description: p.description ?? undefined, url, type: 'website' },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product, 4);
  const priceCents = (product.priceMode === 'SINGLE' ? product.singlePriceCents : product.priceMinCents) ?? 0;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/products/${slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'LKR',
      price: (priceCents / 100).toFixed(2),
      availability:
        product.availability === 'OUT_OF_STOCK'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <ProductDetailView product={product} related={related} />
    </>
  );
}
