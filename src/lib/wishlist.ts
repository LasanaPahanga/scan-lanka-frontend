import { api } from './api';
import type { ProductChip } from './catalog';

const KEY = 'sl_wishlist';

export type GuestWishlistItem = ProductChip;

export function loadGuestWishlist(): GuestWishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveGuestWishlist(items: GuestWishlistItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function clearGuestWishlist() {
  window.localStorage.removeItem(KEY);
}

export const fetchWishlist = () => api<ProductChip[]>('/api/wishlist');

export const addWishlistItem = (productId: number) =>
  api<{ added: boolean }>(`/api/wishlist/${productId}`, { method: 'POST' });

export const removeWishlistItem = (productId: number) =>
  api<{ removed: boolean }>(`/api/wishlist/${productId}`, { method: 'DELETE' });

export const mergeWishlist = (productIds: number[]) =>
  api<ProductChip[]>('/api/wishlist/merge', {
    method: 'POST',
    body: JSON.stringify({ productIds }),
  });
