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
    <a href={href} target="_blank" rel="noreferrer" style={fab} aria-label="Chat on WhatsApp">
      WhatsApp
    </a>
  );
}

const fab = {
  position: 'fixed' as const,
  right: '1.25rem',
  bottom: '1.25rem',
  zIndex: 50,
  background: '#25D366',
  color: '#fff',
  padding: '0.65rem 1rem',
  borderRadius: 999,
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
};
