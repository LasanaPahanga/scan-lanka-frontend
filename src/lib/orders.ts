import { api } from './api';

export interface OrderStatusView {
  orderNumber: string;
  status: string;
  totalCents: number;
}

export interface OrderSummary {
  orderNumber: string;
  status: string;
  totalCents: number;
  refundTotalCents: number;
  createdAt: string;
}

export interface OrderLine {
  name: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface StatusEvent {
  fromStatus: string | null;
  toStatus: string;
  at: string;
}

export interface OrderDetail {
  orderNumber: string;
  status: string;
  subtotalCents: number;
  deliveryCents: number;
  taxCents: number;
  totalCents: number;
  refundTotalCents: number;
  deliveryCodCents: number;
  fulfilmentType: string;
  deliveryPayment: string;
  carrier: string | null;
  trackingRef: string | null;
  shipStreet: string | null;
  shipCity: string | null;
  shipProvince: string | null;
  shipPostalCode: string | null;
  lines: OrderLine[];
  timeline: StatusEvent[];
}

export const lookupOrder = (orderNumber: string, email: string) =>
  api<OrderStatusView>('/api/orders/lookup', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, email }),
  });

export const lookupOrderDetail = (orderNumber: string, email: string) =>
  api<OrderDetail>('/api/orders/lookup/detail', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, email }),
  });

export const listMyOrders = () => api<OrderSummary[]>('/api/orders');

export const getMyOrder = (orderNumber: string) => api<OrderDetail>(`/api/orders/${encodeURIComponent(orderNumber)}`);

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
