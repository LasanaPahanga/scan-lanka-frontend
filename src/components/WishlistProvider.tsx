'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ProductChip } from '@/lib/catalog';
import { useAuth } from '@/components/AuthProvider';
import {
  GuestWishlistItem,
  addWishlistItem,
  clearGuestWishlist,
  fetchWishlist,
  loadGuestWishlist,
  mergeWishlist,
  removeWishlistItem,
  saveGuestWishlist,
} from '@/lib/wishlist';

interface WishlistState {
  items: ProductChip[];
  count: number;
  loading: boolean;
  isSaved: (productId: number) => boolean;
  toggle: (product: ProductChip) => Promise<void>;
}

const WishlistContext = createContext<WishlistState | undefined>(undefined);

function useServerWishlist(user: ReturnType<typeof useAuth>['user']) {
  return user?.role === 'CUSTOMER' && user.emailVerified;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const serverMode = useServerWishlist(user);
  const [guestItems, setGuestItems] = useState<GuestWishlistItem[]>([]);
  const [serverItems, setServerItems] = useState<ProductChip[]>([]);
  const [loading, setLoading] = useState(false);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !serverMode) {
      setGuestItems(loadGuestWishlist());
      setServerItems([]);
      syncedRef.current = false;
    }
  }, [authLoading, serverMode]);

  useEffect(() => {
    if (!serverMode) {
      saveGuestWishlist(guestItems);
    }
  }, [guestItems, serverMode]);

  useEffect(() => {
    if (authLoading || !serverMode) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const guest = loadGuestWishlist();
        if (guest.length > 0 && !syncedRef.current) {
          const merged = await mergeWishlist(guest.map((g) => g.id));
          clearGuestWishlist();
          syncedRef.current = true;
          if (!cancelled) {
            setServerItems(merged);
            setGuestItems([]);
          }
          return;
        }
        const items = await fetchWishlist();
        if (!cancelled) {
          setServerItems(items);
          setGuestItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, serverMode, user?.id]);

  const items = serverMode ? serverItems : guestItems;

  const isSaved = useCallback(
    (productId: number) => items.some((i) => i.id === productId),
    [items],
  );

  const toggle = useCallback(
    async (product: ProductChip) => {
      if (serverMode) {
        if (isSaved(product.id)) {
          await removeWishlistItem(product.id);
          setServerItems((prev) => prev.filter((i) => i.id !== product.id));
        } else {
          await addWishlistItem(product.id);
          setServerItems((prev) => [product, ...prev]);
        }
        return;
      }
      setGuestItems((prev) => {
        if (prev.some((i) => i.id === product.id)) {
          return prev.filter((i) => i.id !== product.id);
        }
        return [product, ...prev];
      });
    },
    [serverMode, isSaved],
  );

  const value = useMemo(
    () => ({ items, count: items.length, loading, isSaved, toggle }),
    [items, loading, isSaved, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistState {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
