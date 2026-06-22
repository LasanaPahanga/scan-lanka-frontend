'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { GuestCartItem, PricedCart, loadGuestCart, saveGuestCart, validateCart } from '@/lib/cart';

interface CartState {
  items: GuestCartItem[];
  priced: PricedCart | null;
  count: number;
  add: (item: GuestCartItem) => void;
  setQuantity: (productId: number, variantId: number | null, quantity: number) => void;
  remove: (productId: number, variantId: number | null) => void;
}

const CartContext = createContext<CartState | undefined>(undefined);

const sameLine = (a: GuestCartItem, productId: number, variantId: number | null) =>
  a.productId === productId && (a.variantId ?? null) === (variantId ?? null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<GuestCartItem[]>([]);
  const [priced, setPriced] = useState<PricedCart | null>(null);

  useEffect(() => {
    setItems(loadGuestCart());
  }, []);

  useEffect(() => {
    saveGuestCart(items);
    if (items.length === 0) {
      setPriced({ lines: [], subtotalCents: 0 });
      return;
    }
    let cancelled = false;
    validateCart(items)
      .then((p) => !cancelled && setPriced(p))
      .catch(() => !cancelled && setPriced(null));
    return () => {
      cancelled = true;
    };
  }, [items]);

  const add = useCallback((item: GuestCartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item.productId, item.variantId));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item.productId, item.variantId) ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const setQuantity = useCallback((productId: number, variantId: number | null, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (sameLine(i, productId, variantId) ? { ...i, quantity: Math.max(1, quantity) } : i)),
    );
  }, []);

  const remove = useCallback((productId: number, variantId: number | null) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, variantId)));
  }, []);

  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, priced, count, add, setQuantity, remove }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
