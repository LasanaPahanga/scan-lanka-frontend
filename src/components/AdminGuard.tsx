'use client';

import { useAuth } from '@/components/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** UX guard for admin routes — server still enforces ADMIN + TOTP. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    // When the server enforces admin TOTP, send un-enrolled admins straight to 2FA setup instead of
    // letting every admin API fail with a 403. (Enforcement is off during development.)
    if (user.adminTotpRequired && user.totpEnabled === false && pathname !== '/admin/2fa') {
      router.replace('/admin/2fa');
    }
  }, [loading, user, router, pathname]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <main style={{ padding: '2rem', color: 'var(--muted)' }}>Loading admin…</main>;
  }
  if (user.adminTotpRequired && user.totpEnabled === false && pathname !== '/admin/2fa') {
    return (
      <main style={{ padding: '2rem', color: 'var(--muted)' }}>
        Two-factor authentication is required for admin access — redirecting to setup…
      </main>
    );
  }
  return <>{children}</>;
}
