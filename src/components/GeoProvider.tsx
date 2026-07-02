'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchGeo, fetchFxRates, GeoView } from '@/lib/geo';

type GeoState = GeoView & { loading: boolean; countryOverride: string | null; usdRate: number };

const GeoContext = createContext<{
  geo: GeoState;
  setCountry: (code: string) => void;
  refresh: () => void;
} | null>(null);

export function GeoProvider({ children }: { children: React.ReactNode }) {
  const [countryOverride, setCountryOverride] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoState>({
    country: 'LK',
    currency: 'LKR',
    isSriLanka: true,
    canCheckout: true,
    whatsappNumber: '0717817447',
    indicativePricing: false,
    loading: true,
    countryOverride: null,
    usdRate: 300,
  });

  const refresh = useCallback(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('sl_country') : null;
    const country = countryOverride ?? stored ?? undefined;
    setGeo((g) => ({ ...g, loading: true }));
    Promise.all([fetchGeo(country), fetchFxRates()])
      .then(([g, fx]) => {
        setGeo({
          ...g,
          loading: false,
          countryOverride: country ?? null,
          usdRate: Number(fx.rates.USD ?? 300),
        });
      })
      .catch(() => setGeo((g) => ({ ...g, loading: false })));
  }, [countryOverride]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setCountry = useCallback((code: string) => {
    window.localStorage.setItem('sl_country', code.toUpperCase());
    setCountryOverride(code.toUpperCase());
  }, []);

  const value = useMemo(() => ({ geo, setCountry, refresh }), [geo, setCountry, refresh]);
  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
}

export function useGeo() {
  const ctx = useContext(GeoContext);
  if (!ctx) throw new Error('useGeo requires GeoProvider');
  return ctx;
}
