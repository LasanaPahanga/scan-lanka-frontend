import type { Metadata, Viewport } from 'next';
import { Playfair_Display } from 'next/font/google';
import '../styles/tokens.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { WishlistProvider } from '@/components/WishlistProvider';
import { GeoProvider } from '@/components/GeoProvider';
import { StorefrontChrome } from '@/components/StorefrontChrome';

// Elegant serif display face for the homepage hero brand mark/headline only —
// body/nav copy stays on the sans font in tokens.css (`--font`).
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Storefront is light-only by design (brand blue on white). Without this,
  // some Android browsers (Chrome/Samsung Internet "force dark") auto-invert
  // pages that don't declare a color scheme, muddying the brand palette.
  colorScheme: 'only light',
  themeColor: '#1a6db5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={playfair.variable}>
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
