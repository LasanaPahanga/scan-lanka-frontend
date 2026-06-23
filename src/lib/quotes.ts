import { CAPTCHA_TOKEN } from '@/lib/geo';
import { api } from './api';

export interface QuoteItemInput {
  productId: number;
  variantId?: number;
  quantity: number;
  note?: string;
}

export interface QuoteView {
  id: number;
  requesterName: string;
  email: string;
  phone: string;
  country: string | null;
  status: string;
  quotedTotalCents: number | null;
  expiresAt: string | null;
  items: { id: number; name: string; quantity: number; note: string | null }[];
  thread: { id: number; sender: string; body: string; quotedPriceCents: number | null; at: string }[];
}

export interface SubmitQuoteResult {
  id: number;
  accessToken: string;
}

export const submitQuote = (body: {
  requesterName: string;
  email: string;
  phone: string;
  country?: string;
  message?: string;
  items: QuoteItemInput[];
}) =>
  api<SubmitQuoteResult>('/api/quotes', {
    method: 'POST',
    headers: { 'X-Captcha-Token': CAPTCHA_TOKEN },
    body: JSON.stringify(body),
  });

export const getQuoteByToken = (token: string) =>
  api<QuoteView>(`/api/quotes/${encodeURIComponent(token)}`);

export const postQuoteMessage = (token: string, body: string) =>
  api<void>(`/api/quotes/${encodeURIComponent(token)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const acceptQuote = (token: string) =>
  api<void>(`/api/quotes/${encodeURIComponent(token)}/accept`, { method: 'POST' });

export interface QuotePage {
  content: QuoteView[];
  totalElements: number;
}

export const listAdminQuotes = (status?: string, page = 0) => {
  const params = new URLSearchParams({ page: String(page), size: '25' });
  if (status) params.set('status', status);
  return api<QuotePage>(`/api/admin/quotes?${params}`);
};

export const getAdminQuote = (id: number) => api<QuoteView>(`/api/admin/quotes/${id}`);

export const adminQuoteMessage = (id: number, body: string, quotedPriceCents?: number) =>
  api<void>(`/api/admin/quotes/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body, quotedPriceCents }),
  });

export const adminConvertQuote = (id: number) =>
  api<{ orderNumber: string }>(`/api/admin/quotes/${id}/convert`, { method: 'POST' });
