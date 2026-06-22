'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, Me } from '@/lib/auth';

interface AuthState {
  user: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: Me | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await authApi.me());
    } catch {
      try {
        await authApi.refresh();
        setUser(await authApi.me());
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Silent refresh before access token expiry (~15 min).
  useEffect(() => {
    if (!user) return;
    const id = window.setInterval(() => {
      void authApi.refresh().catch(() => setUser(null));
    }, 12 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
