'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  DisplayCartLine,
  GuestCartItem,
  PricedCart,
  ServerCart,
  addServerCartItem,
  clearGuestCart,
  fetchServerCart,
  loadGuestCart,
  mergeServerCart,
  removeServerCartItem,
  saveGuestCart,
  serverCartToPriced,
  updateServerCartItem,
  validateCart,
} from '@/lib/cart';

interface CartState {
  lines: DisplayCartLine[];
  priced: PricedCart | null;
  count: number;
  loading: boolean;
  isServer: boolean;
  add: (item: GuestCartItem) => Promise<void>;
  setQuantity: (line: DisplayCartLine, quantity: number) => Promise<void>;
  remove: (line: DisplayCartLine) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartState | undefined>(undefined);

const sameLine = (a: GuestCartItem, productId: number, variantId: number | null) =>
  a.productId === productId && (a.variantId ?? null) === (variantId ?? null);

function useServerCart(user: ReturnType<typeof useAuth>['user']) {
  return user?.role === 'CUSTOMER' && user.emailVerified;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const serverMode = useServerCart(user);
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [serverCart, setServerCart] = useState<ServerCart | null>(null);
  const [priced, setPriced] = useState<PricedCart | null>(null);
  const [loading, setLoading] = useState(false);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !serverMode) {
      setGuestItems(loadGuestCart());
      setServerCart(null);
      syncedRef.current = false;
    }
  }, [authLoading, serverMode]);

  useEffect(() => {
    if (authLoading || serverMode) return;
    saveGuestCart(guestItems);
    if (guestItems.length === 0) {
      setPriced({ lines: [], subtotalCents: 0 });
      return;
    }
    let cancelled = false;
    validateCart(guestItems)
      .then((p) => !cancelled && setPriced(p))
      .catch(() => !cancelled && setPriced(null));
    return () => {
      cancelled = true;
    };
  }, [guestItems, authLoading, serverMode]);

  useEffect(() => {
    if (authLoading || !serverMode) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const guest = loadGuestCart();
        if (guest.length > 0 && !syncedRef.current) {
          const merged = await mergeServerCart(guest);
          clearGuestCart();
          syncedRef.current = true;
          if (!cancelled) {
            setServerCart(merged);
            setPriced(serverCartToPriced(merged));
            setGuestItems([]);
          }
          return;
        }
        const cart = await fetchServerCart();
        if (!cancelled) {
          setServerCart(cart);
          setPriced(serverCartToPriced(cart));
          setGuestItems([]);
        }
      } catch {
        if (!cancelled) setPriced(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, serverMode, user?.id]);

  const lines: DisplayCartLine[] = useMemo(() => {
    if (serverMode && serverCart) {
      return serverCart.lines.map((l) => ({
        key: String(l.itemId),
        itemId: l.itemId,
        productId: l.productId,
        variantId: l.variantId,
        name: l.name,
        quantity: l.quantity,
        lineTotalCents: l.lineTotalCents,
        status: l.status,
      }));
    }
    return guestItems.map((item) => {
      const line = priced?.lines.find(
        (l) => l.productId === item.productId && (l.variantId ?? null) === (item.variantId ?? null),
      );
      return {
        key: `${item.productId}-${item.variantId ?? 's'}`,
        productId: item.productId,
        variantId: item.variantId,
        name: line?.name ?? item.name,
        quantity: line?.quantity ?? item.quantity,
        lineTotalCents: line?.lineTotalCents ?? null,
        status: line?.status ?? null,
      };
    });
  }, [serverMode, serverCart, guestItems, priced]);

  const count = lines.reduce((n, l) => n + l.quantity, 0);

  const add = useCallback(
    async (item: GuestCartItem) => {
      if (serverMode) {
        const cart = await addServerCartItem(item.productId, item.variantId, item.quantity);
        setServerCart(cart);
        setPriced(serverCartToPriced(cart));
        return;
      }
      setGuestItems((prev) => {
        const existing = prev.find((i) => sameLine(i, item.productId, item.variantId));
        if (existing) {
          return prev.map((i) =>
            sameLine(i, item.productId, item.variantId)
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
        }
        return [...prev, item];
      });
    },
    [serverMode],
  );

  const setQuantity = useCallback(
    async (line: DisplayCartLine, quantity: number) => {
      const qty = Math.max(1, quantity);
      if (serverMode && line.itemId != null) {
        const cart = await updateServerCartItem(line.itemId, qty);
        setServerCart(cart);
        setPriced(serverCartToPriced(cart));
        return;
      }
      setGuestItems((prev) =>
        prev.map((i) =>
          sameLine(i, line.productId, line.variantId) ? { ...i, quantity: qty } : i,
        ),
      );
    },
    [serverMode],
  );

  const remove = useCallback(
    async (line: DisplayCartLine) => {
      if (serverMode && line.itemId != null) {
        const cart = await removeServerCartItem(line.itemId);
        setServerCart(cart);
        setPriced(serverCartToPriced(cart));
        return;
      }
      setGuestItems((prev) => prev.filter((i) => !sameLine(i, line.productId, line.variantId)));
    },
    [serverMode],
  );

  const clear = useCallback(async () => {
    if (serverMode && serverCart && serverCart.lines.length > 0) {
      let cart = serverCart;
      for (const line of [...serverCart.lines]) {
        cart = await removeServerCartItem(line.itemId);
      }
      setServerCart(cart);
      setPriced(serverCartToPriced(cart));
      return;
    }
    setGuestItems([]);
    clearGuestCart();
  }, [serverMode, serverCart]);

  return (
    <CartContext.Provider
      value={{ lines, priced, count, loading, isServer: serverMode, add, setQuantity, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
