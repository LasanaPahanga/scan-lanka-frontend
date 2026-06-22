'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export function Header() {
  const { count } = useCart();
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
