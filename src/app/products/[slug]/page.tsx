import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getRelatedProducts } from '@/lib/catalog';
import { ProductDetailView } from '@/components/ProductDetail';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, buildProductJsonLd } from '@/lib/product-jsonld';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: 'Not found - Scan Lanka' };
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.canvasboards.lk';
  const url = `${base.replace(/\/$/, '')}/products/${slug}`;
  const ogImage = absoluteUrl(p.imageUrls[0]?.url ?? null) ?? absoluteUrl('/logo.png') ?? undefined;
  return {
    title: `${p.name} - Scan Lanka`,
    description: p.description ?? undefined,
    alternates: { canonical: url, languages: { 'en-LK': url, 'x-default': url } },
    openGraph: {
      title: p.name,
      description: p.description ?? undefined,
      url,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product, 4);
  const jsonLd = buildProductJsonLd(product, slug);
  return (
    <>
      <JsonLd data={jsonLd} />
      <ProductDetailView product={product} related={related} />
    </>
  );
}
