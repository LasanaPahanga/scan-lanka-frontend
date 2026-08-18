import { EMAIL, HOTLINE } from '@/lib/contactInfo';
import { SITE_LEGAL_NAME, SITE_NAME, absoluteUrl, siteBase } from '@/lib/site';

/**
 * Organization + WebSite JSON-LD for Google site name / knowledge signals.
 * @see https://developers.google.com/search/docs/appearance/site-names
 */
export function buildSiteJsonLd(): Record<string, unknown> {
  const base = siteBase();
  const logo = absoluteUrl('/icon-512.png');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Store', 'Organization'],
        '@id': `${base}/#organization`,
        name: SITE_NAME,
        legalName: SITE_LEGAL_NAME,
        url: base,
        logo: logo
          ? {
              '@type': 'ImageObject',
              url: logo,
              width: 512,
              height: 512,
            }
          : undefined,
        image: logo ?? undefined,
        email: EMAIL,
        telephone: HOTLINE.replace(/\s/g, ''),
        foundingDate: '1998',
        priceRange: 'Rs 216 - Rs 87,800',
        currenciesAccepted: 'LKR',
        paymentAccepted: 'Cash, Bank Transfer, Credit Card',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'No 385, Kaduwela Road',
          addressLocality: 'Malabe',
          addressRegion: 'Western Province',
          postalCode: '10115',
          addressCountry: 'LK',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 6.9036,
          longitude: 79.9547,
        },
        areaServed: {
          '@type': 'Country',
          name: 'Sri Lanka',
        },
        sameAs: ['https://scanlanka.com'],
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        name: SITE_NAME,
        alternateName: ['canvasboards.lk', SITE_LEGAL_NAME],
        url: base,
        inLanguage: 'en-LK',
        publisher: { '@id': `${base}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${base}/products?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}
