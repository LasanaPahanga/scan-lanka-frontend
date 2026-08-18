import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getRelatedProducts } from '@/lib/catalog';
import { ProductDetailView } from '@/components/ProductDetail';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, buildProductJsonLd } from '@/lib/product-jsonld';
import { SITE_NAME, siteBase } from '@/lib/site';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: 'Not found' };
  const url = `${siteBase()}/products/${slug}`;
  const ogImage = absoluteUrl(p.imageUrls[0]?.url ?? null) ?? absoluteUrl('/logo.png') ?? undefined;
  const description =
    p.description?.trim() ||
    `Buy ${p.name} from ${SITE_NAME} — quality boards & teaching equipment in Sri Lanka since 1998.`;
  const seoTitle = `${p.name} Price in Sri Lanka`;
  return {
    title: seoTitle,
    description,
    alternates: { canonical: url, languages: { 'en-LK': url, 'x-default': url } },
    openGraph: {
      title: seoTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
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
