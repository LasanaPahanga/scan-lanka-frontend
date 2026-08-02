import type { ProductDetail } from '@/lib/catalog';
import { mediaUrl } from '@/lib/catalog';
import { absoluteUrl as absoluteSiteUrl, siteBase } from '@/lib/site';

/** Absolute URL for schema.org / Open Graph (Google requires absolute image URLs). */
export function absoluteUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  const path = mediaUrl(pathOrUrl) ?? pathOrUrl;
  return absoluteSiteUrl(path);
}

/**
 * Product JSON-LD for Google product snippets + merchant listings.
 * Does not invent reviews/ratings (Google forbids fake aggregateRating).
 */
export function buildProductJsonLd(product: ProductDetail, slug: string): Record<string, unknown> {
  const base = siteBase();
  const url = `${base}/products/${slug}`;
  const priceCents =
    (product.priceMode === 'SINGLE' ? product.singlePriceCents : product.priceMinCents) ?? 0;

  const images = product.imageUrls
    .map((img) => absoluteUrl(img.url))
    .filter((u): u is string => Boolean(u));
  const image = images.length > 0 ? images : [absoluteUrl('/logo.png')].filter(Boolean);

  const sku =
    product.variants.find((v) => v.sku?.trim())?.sku?.trim() ||
    `SL-${product.id}`;

  const availability =
    product.availability === 'OUT_OF_STOCK'
      ? 'https://schema.org/OutOfStock'
      : product.availability === 'LOW_STOCK'
        ? 'https://schema.org/LimitedAvailability'
        : 'https://schema.org/InStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? product.details ?? product.name,
    url,
    image,
    sku,
    mpn: sku,
    brand: {
      '@type': 'Brand',
      name: 'Scan Lanka',
    },
    category: product.category ?? undefined,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'LKR',
      price: (priceCents / 100).toFixed(2),
      // Merchant listings: when the current price offer became / remains valid.
      validFrom: new Date().toISOString().slice(0, 10),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Scan Lanka Trading Co.',
        url: base,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'LK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
        url: `${base}/returns`,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'LK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 5,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
        // Delivery fee is calculated at checkout (courier/lorry by size & district).
        shippingRate: {
          '@type': 'MonetaryAmount',
          currency: 'LKR',
          value: '0',
        },
      },
    },
  };
}
