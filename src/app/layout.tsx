import type { Metadata } from 'next';
import '../styles/tokens.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { WishlistProvider } from '@/components/WishlistProvider';
import { GeoProvider } from '@/components/GeoProvider';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Scan Lanka — Boards & Teaching Equipment',
  description:
    'Scan Lanka Trading Co. — manufacturer & supplier of boards and teaching equipment since 1998.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  alternates: { canonical: '/', languages: { 'en-LK': '/', 'x-default': '/' } },
  openGraph: {
    title: 'Scan Lanka',
    description: 'Boards & teaching equipment — Sri Lanka manufacturer since 1998.',
    locale: 'en_LK',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <GeoProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                {children}
                <WhatsAppButton />
              </WishlistProvider>
            </CartProvider>
          </GeoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
