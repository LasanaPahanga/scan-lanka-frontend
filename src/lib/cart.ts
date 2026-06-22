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

export interface ServerCartLine {
  itemId: number;
  productId: number;
  variantId: number | null;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  status: string;
}

export interface ServerCart {
  lines: ServerCartLine[];
  subtotalCents: number;
}

export interface DisplayCartLine {
  key: string;
  itemId?: number;
  productId: number;
  variantId: number | null;
  name: string;
  quantity: number;
  lineTotalCents: number | null;
  status: string | null;
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

export function clearGuestCart() {
  window.localStorage.removeItem(KEY);
}

export function serverCartToPriced(cart: ServerCart): PricedCart {
  return {
    lines: cart.lines.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      name: l.name,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
      lineTotalCents: l.lineTotalCents,
      status: l.status,
    })),
    subtotalCents: cart.subtotalCents,
  };
}

/** Server-authoritative pricing + stock cap for the client-held cart (SEC-CART-2). */
export const validateCart = (items: GuestCartItem[]) =>
  api<PricedCart>('/api/cart/validate', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    }),
  });

export const fetchServerCart = () => api<ServerCart>('/api/cart');

export const addServerCartItem = (productId: number, variantId: number | null, quantity: number) =>
  api<ServerCart>('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, variantId, quantity }),
  });

export const updateServerCartItem = (itemId: number, quantity: number) =>
  api<ServerCart>(`/api/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });

export const removeServerCartItem = (itemId: number) =>
  api<ServerCart>(`/api/cart/items/${itemId}`, { method: 'DELETE' });

export const mergeServerCart = (items: GuestCartItem[]) =>
  api<ServerCart>('/api/cart/merge', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    }),
  });
