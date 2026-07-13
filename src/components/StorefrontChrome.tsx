'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CustomerCareWidget } from '@/components/CustomerCareWidget';
import { CookieConsent } from '@/components/CookieConsent';
import { IntroSplash } from '@/components/IntroSplash';
import { MobileTabBar } from '@/components/MobileTabBar';

/** Storefront chrome is hidden on admin routes for a focused console UI. */
export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div className="app-main app-main--admin">{children}</div>;
  }

  return (
    <>
      <IntroSplash />
      <Header />
      <div className="app-main">{children}</div>
      <Footer />
      <WhatsAppButton />
      <CustomerCareWidget />
      <CookieConsent />
      <MobileTabBar />
    </>
  );
}
