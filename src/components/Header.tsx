'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { CountrySelector } from '@/components/CountrySelector';

export function Header() {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
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
          Cart{cartCount > 0 ? ` (${cartCount})` : ''}
        </Link>
        <Link href="/wishlist" style={link}>
          Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
        </Link>
        <Link href="/delivery" style={link}>
          Delivery
        </Link>
        <Link href="/returns" style={link}>
          Returns
        </Link>
        <Link href="/contact" style={link}>
          Contact
        </Link>
        <Link href="/quote" style={link}>
          Quote
        </Link>
        <CountrySelector />
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
