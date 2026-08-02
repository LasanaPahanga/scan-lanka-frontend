import type { Metadata, Viewport } from 'next';
import { Sora, Montserrat } from 'next/font/google';
import '../styles/tokens.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { WishlistProvider } from '@/components/WishlistProvider';
import { GeoProvider } from '@/components/GeoProvider';
import { StorefrontChrome } from '@/components/StorefrontChrome';
import { JsonLd } from '@/components/JsonLd';
import { buildSiteJsonLd } from '@/lib/site-jsonld';
import { SITE_NAME, SITE_TAGLINE, absoluteUrl, siteBase } from '@/lib/site';

// Modern, professional sans for the whole storefront (body, nav, headings,
// homepage category titles). Wired into `--font` via tokens.css.
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

// Sleek modern display face for the homepage hero headline/eyebrow only
// (owner pick). Exposed as `--font-display`.
const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const siteUrl = siteBase();
const ogImage = absoluteUrl('/CB-free-01herosection.png') ?? absoluteUrl('/icon-512.png');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Sri Lanka's leading manufacturer and supplier of boards and teaching equipment since 1998 — whiteboards, notice boards, carrom boards, easels and more.",
  applicationName: SITE_NAME,
  keywords: [
    'Scan Lanka',
    'whiteboard Sri Lanka',
    'canvas boards',
    'carrom board',
    'teaching equipment',
    'notice board',
    'Malabe',
  ],
  authors: [{ name: SITE_NAME, url: siteUrl }],
  alternates: { canonical: '/', languages: { 'en-LK': '/', 'x-default': '/' } },
  manifest: '/site.webmanifest',
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description:
      'Manufacturer & supplier of boards and teaching equipment in Sri Lanka since 1998.',
    url: siteUrl,
    siteName: SITE_NAME,
    locale: 'en_LK',
    type: 'website',
    images: ogImage
      ? [{ url: ogImage, width: 1200, height: 630, alt: `${SITE_NAME} boards & teaching equipment` }]
      : undefined,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description:
      'Manufacturer & supplier of boards and teaching equipment in Sri Lanka since 1998.',
    images: ogImage ? [ogImage] : undefined,
  },
  icons: {
    // Google prefers a square PNG ≥48px; list that first (favicon.ico is browser fallback).
    icon: [
      { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Storefront is light-only by design (brand blue on white). Without this,
  // some Android browsers (Chrome/Samsung Internet "force dark") auto-invert
  // pages that don't declare a color scheme, muddying the brand palette.
  colorScheme: 'only light',
  themeColor: '#00a2e8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-LK" className={`${montserrat.variable} ${sora.variable}`}>
      <body>
        <JsonLd data={buildSiteJsonLd()} />
        <AuthProvider>
          <GeoProvider>
            <CartProvider>
              <WishlistProvider>
                <StorefrontChrome>{children}</StorefrontChrome>
              </WishlistProvider>
            </CartProvider>
          </GeoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
