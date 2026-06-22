import { api } from './api';

const KEY = 'sl_cart';

export interface GuestCartItem {
  productId: number;
  variantId: number | null;
  quantity: number;
  name: string;
}

export interface PricedLine {
  productId: number;
  variantId: number | null;
  name: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  status: string;
}
export interface PricedCart {
  lines: PricedLine[];
  subtotalCents: number;
}

export function loadGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

/** Server-authoritative pricing + stock cap for the client-held cart (SEC-CART-2). */
export const validateCart = (items: GuestCartItem[]) =>
  api<PricedCart>('/api/cart/validate', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    }),
  });
