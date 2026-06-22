import { api } from './api';

export interface OrderStatusView {
  orderNumber: string;
  status: string;
  totalCents: number;
}

export const lookupOrder = (orderNumber: string, email: string) =>
  api<OrderStatusView>('/api/orders/lookup', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, email }),
  });

const PENDING_KEY = 'sl_pending_order';

export function savePendingOrder(orderNumber: string, email: string) {
  window.localStorage.setItem(PENDING_KEY, JSON.stringify({ orderNumber, email }));
}

export function loadPendingOrder(): { orderNumber: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingOrder() {
  window.localStorage.removeItem(PENDING_KEY);
}
