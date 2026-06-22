'use client';

import { useAuth } from '@/components/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** UX-only route guard (07-auth T-22). Server still enforces authz. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <main style={{ maxWidth: 440, margin: '3rem auto', padding: '0 1.5rem', color: 'var(--muted)' }}>
        Loading…
      </main>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}
