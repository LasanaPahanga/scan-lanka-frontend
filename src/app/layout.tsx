import type { Metadata, Viewport } from 'next';
import { Sora, Montserrat } from 'next/font/google';
import '../styles/tokens.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { WishlistProvider } from '@/components/WishlistProvider';
import { GeoProvider } from '@/components/GeoProvider';
import { StorefrontChrome } from '@/components/StorefrontChrome';

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

export const metadata: Metadata = {
  title: 'Scan Lanka - Boards & Teaching Equipment',
  description:
    'Scan Lanka Trading Co. - manufacturer & supplier of boards and teaching equipment since 1998.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  alternates: { canonical: '/', languages: { 'en-LK': '/', 'x-default': '/' } },
  openGraph: {
    title: 'Scan Lanka',
    description: 'Boards & teaching equipment - Sri Lanka manufacturer since 1998.',
    locale: 'en_LK',
    type: 'website',
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
    <html lang="en" className={`${montserrat.variable} ${sora.variable}`}>
      <body>
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
