import type { Metadata, Viewport } from 'next';
import '../styles/tokens.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { WishlistProvider } from '@/components/WishlistProvider';
import { GeoProvider } from '@/components/GeoProvider';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CustomerCareWidget } from '@/components/CustomerCareWidget';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { Header } from '@/components/Header';
import { IntroSplash } from '@/components/IntroSplash';

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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <GeoProvider>
            <CartProvider>
              <WishlistProvider>
                <IntroSplash />
                <Header />
                <div className="app-main">{children}</div>
                <Footer />
                <WhatsAppButton />
                <CustomerCareWidget />
                <CookieConsent />
              </WishlistProvider>
            </CartProvider>
          </GeoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
