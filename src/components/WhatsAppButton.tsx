'use client';

import { useEffect, useState } from 'react';
import { useGeo } from '@/components/GeoProvider';
import { fetchWhatsApp } from '@/lib/geo';

export function WhatsAppButton() {
  const { geo } = useGeo();
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    fetchWhatsApp(geo.country)
      .then((w) => {
        const num = w.number.replace(/\D/g, '');
        setHref(`https://wa.me/94${num.replace(/^0/, '')}?text=${encodeURIComponent(w.prefill)}`);
      })
      .catch(() => {
        const num = geo.whatsappNumber.replace(/\D/g, '');
        setHref(`https://wa.me/94${num.replace(/^0/, '')}`);
      });
  }, [geo.country, geo.whatsappNumber]);

  if (!href) return null;

  return (
    <a href={href} target="_blank" rel="noreferrer" className="fab-widget" style={fab} aria-label="Chat with us on WhatsApp" title="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.42 1.31-1.95 1.35-.5.04-.5.4-3.15-.66-2.65-1.06-4.3-3.78-4.43-3.96-.13-.18-1.06-1.41-1.06-2.69 0-1.28.67-1.91.91-2.17.24-.26.52-.32.7-.32.18 0 .35.002.5.01.16.008.38-.06.59.45.24.59.81 2.04.88 2.19.07.15.12.32.02.51-.09.18-.14.29-.28.45-.14.16-.29.36-.42.48-.14.13-.28.27-.12.53.16.26.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.2 1.36.26.13.42.11.57-.07.15-.18.66-.77.84-1.03.18-.26.35-.21.59-.13.24.09 1.53.72 1.79.85.26.13.43.2.49.31.06.11.06.64-.18 1.32z" />
      </svg>
    </a>
  );
}

const fab = {
  position: 'fixed' as const,
  right: '1.25rem',
  bottom: '5.5rem', // raised so it clears the cookie-consent bar
  zIndex: 50,
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#25D366',
  borderRadius: 999,
  textDecoration: 'none',
  boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
};
