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
  deliveryMethod: string; // "COMPANY_LORRY" | "COURIER" (17)
  courierEstimateCents: number; // Domex estimate, display-only - 0 for lorry orders
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

/**
 * In-flight PayHere attempt. Reused on retry when the cart + contact fingerprint still matches,
 * so clicking Place Order again does not mint a second PENDING_PAYMENT row.
 */
export interface CardCheckoutAttempt {
  orderNumber: string;
  email: string;
  fingerprint: string;
  onlineTotalCents: number;
}

const CARD_ATTEMPT_KEY = 'sl_card_checkout_attempt';

export function saveCardCheckoutAttempt(attempt: CardCheckoutAttempt) {
  try {
    window.sessionStorage.setItem(CARD_ATTEMPT_KEY, JSON.stringify(attempt));
  } catch {
    /* ignore */
  }
}

export function loadCardCheckoutAttempt(): CardCheckoutAttempt | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CARD_ATTEMPT_KEY);
    return raw ? (JSON.parse(raw) as CardCheckoutAttempt) : null;
  } catch {
    return null;
  }
}

export function clearCardCheckoutAttempt() {
  try {
    window.sessionStorage.removeItem(CARD_ATTEMPT_KEY);
  } catch {
    /* ignore */
  }
}

/** Stable fingerprint of cart lines + contact/delivery fields used for PayHere retry dedupe. */
export function cardCheckoutFingerprint(input: {
  items: { productId: number; variantId?: number | null; quantity: number }[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryMethod: string;
  onlineTotalCents: number;
}): string {
  const lines = [...input.items]
    .map((i) => `${i.productId}:${i.variantId ?? ''}:${i.quantity}`)
    .sort()
    .join('|');
  return [
    lines,
    input.contactName.trim().toLowerCase(),
    input.contactPhone.trim(),
    input.contactEmail.trim().toLowerCase(),
    input.street.trim().toLowerCase(),
    input.city.trim().toLowerCase(),
    input.province.trim().toLowerCase(),
    input.postalCode.trim(),
    input.deliveryMethod,
    String(input.onlineTotalCents),
  ].join('::');
}

/**
 * Snapshot of the "Order placed" confirmation screen so it survives navigation.
 * Without this, clicking "Track this order" and pressing Back re-mounts the (now
 * empty) cart and the confirmation is lost. Kept in sessionStorage (this tab only).
 */
export interface PlacedOrderSnapshot {
  orderNumber: string;
  onlineTotalCents: number;
  isCourier: boolean;
  paymentChoice: 'ONLINE' | 'COD';
  method: 'CARD' | 'BANK';
  needsOnlinePayment: boolean;
  codDueCents: number;
  slipUploaded: boolean;
}

const PLACED_KEY = 'sl_placed_order';

export function savePlacedOrder(snapshot: PlacedOrderSnapshot) {
  try {
    window.sessionStorage.setItem(PLACED_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage unavailable — confirmation just won't survive a back-nav */
  }
}

export function loadPlacedOrder(): PlacedOrderSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PLACED_KEY);
    return raw ? (JSON.parse(raw) as PlacedOrderSnapshot) : null;
  } catch {
    return null;
  }
}

export function clearPlacedOrder() {
  try {
    window.sessionStorage.removeItem(PLACED_KEY);
  } catch {
    /* ignore */
  }
}
