import type { Metadata } from 'next';
import '../styles/tokens.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Scan Lanka — Boards & Teaching Equipment',
  description:
    'Scan Lanka Trading Co. — manufacturer & supplier of boards and teaching equipment since 1998.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
