'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';

export function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();

  return (
    <header style={bar}>
      <Link href="/" style={{ ...link, fontWeight: 700, color: 'var(--primary)' }}>
        Scan Lanka
      </Link>
      <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <Link href="/products" style={link}>
          Products
        </Link>
        <Link href="/cart" style={link}>
          Cart{count > 0 ? ` (${count})` : ''}
        </Link>
        {user ? (
          <>
            <Link href="/account" style={link}>
              Account
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin/2fa" style={link}>
                Admin 2FA
              </Link>
            )}
            <button type="button" onClick={() => void logout()} style={ghostBtn}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={link}>
              Sign in
            </Link>
            <Link href="/register" style={{ ...link, color: 'var(--primary)' }}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

const bar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.9rem 1.5rem',
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  background: 'var(--bg)',
  zIndex: 10,
} as const;
const link = { textDecoration: 'none', color: 'var(--text)' } as const;
const ghostBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--muted)',
  cursor: 'pointer',
  fontSize: '0.95rem',
  padding: 0,
} as const;
