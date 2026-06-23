import { api } from './api';

export const CAPTCHA_TOKEN = process.env.NEXT_PUBLIC_CAPTCHA_TOKEN ?? 'test-captcha-bypass';

export interface GeoView {
  country: string;
  currency: string;
  isSriLanka: boolean;
  canCheckout: boolean;
  whatsappNumber: string;
  indicativePricing: boolean;
}

export interface FxRatesView {
  base: string;
  rates: Record<string, number>;
}

export const fetchGeo = (country?: string) =>
  api<GeoView>(country ? `/api/geo?country=${encodeURIComponent(country)}` : '/api/geo');

export const fetchFxRates = () => api<FxRatesView>('/api/fx-rates');

export const fetchWhatsApp = (country?: string, context?: string) => {
  const params = new URLSearchParams();
  if (country) params.set('country', country);
  if (context) params.set('context', context);
  const q = params.toString();
  return api<{ number: string; prefill: string }>(`/api/contact/whatsapp${q ? `?${q}` : ''}`);
};
