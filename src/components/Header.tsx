'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { CountrySelector } from '@/components/CountrySelector';

const HOTLINE = '070 5 307 685';
const EMAIL = 'scanlk@sltnet.lk';

export function Header() {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [logoError, setLogoError] = useState(false);

  function search(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products');
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20 }}>
      {/* utility bar */}
      <div style={utilBar}>
        <div className="container" style={utilInner}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href={`tel:${HOTLINE.replace(/\s/g, '')}`} style={utilItem}>
              ☎ Hotline {HOTLINE}
            </a>
            <a href={`mailto:${EMAIL}`} style={utilItem}>
              ✉ {EMAIL}
            </a>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ opacity: 0.85 }}>Manufacturer &amp; supplier since 1998</span>
            <CountrySelector />
          </div>
        </div>
      </div>

      {/* main bar */}
      <div style={mainBar}>
        <div className="container" style={mainInner}>
          <Link href="/" style={brand} aria-label="Scan Lanka - home">
            {logoError ? (
              <>
                <span style={brandMark}>SL</span>
                <span>
                  <span style={brandName}>Scan Lanka</span>
                  <span style={brandSub}>Trading Co. - Teaching Equipment</span>
                </span>
              </>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/logo.png" alt="Scan Lanka" style={logoImg} onError={() => setLogoError(true)} />
            )}
          </Link>

          <form onSubmit={search} style={searchWrap} role="search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search whiteboards, notice boards, carrom boards…"
              aria-label="Search products"
              style={searchInput}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: '0 var(--radius) var(--radius) 0' }}
            >
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <Link href="/wishlist" className="icon-link" aria-label="Wishlist">
              ♡ <span style={countPill}>{wishlistCount}</span>
            </Link>
            <Link href="/cart" className="icon-link" aria-label="Cart">
              🛒 <span style={countPill}>{cartCount}</span>
            </Link>
            {user ? (
              <>
                <Link href="/account" className="icon-link">
                  My account
                </Link>
                <button type="button" onClick={() => void logout()} style={ghostBtn}>
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" className="icon-link">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* primary nav */}
      <nav style={navBar} aria-label="Main">
        <div className="container" style={navInner}>
          <div style={navList}>
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/about" className="nav-link">
              About Us
            </Link>
            <Link href="/products" className="nav-link">
              Our Products
            </Link>
            <Link href="/clientele" className="nav-link">
              Clientele
            </Link>
            <Link href="/quote" className="nav-link">
              Request a Quote
            </Link>
            <Link href="/delivery" className="nav-link">
              Delivery
            </Link>
            <Link href="/returns" className="nav-link">
              Returns
            </Link>
            <Link href="/contact" className="nav-link">
              Contact Us
            </Link>
          </div>
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="nav-link nav-link-admin">
              Admin
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

const utilBar = {
  background: '#eef2f6',
  color: 'var(--muted)',
  fontSize: '0.82rem',
  borderBottom: '1px solid var(--border)',
} as const;
const utilInner = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap' as const,
  gap: '0.5rem',
  padding: '0.4rem 0',
};
const utilItem = { color: 'var(--muted)', textDecoration: 'none' } as const;

const mainBar = { background: 'var(--surface)', borderBottom: '1px solid var(--border)' } as const;
const mainInner = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  padding: '0.9rem 0',
  flexWrap: 'wrap' as const,
};
const brand = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  textDecoration: 'none',
  color: 'var(--text)',
} as const;
const logoImg = { height: 52, width: 'auto', display: 'block' } as const;
const brandMark = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 42,
  height: 42,
  borderRadius: 10,
  background: 'var(--primary)',
  color: '#fff',
  fontWeight: 800,
  fontSize: '1.05rem',
  letterSpacing: '0.5px',
} as const;
const brandName = {
  display: 'block',
  fontWeight: 800,
  fontSize: '1.25rem',
  color: 'var(--primary)',
  lineHeight: 1.1,
} as const;
const brandSub = {
  display: 'block',
  fontSize: '0.72rem',
  color: 'var(--muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const searchWrap = { display: 'flex', flex: '1 1 320px', minWidth: 220, maxWidth: 560 } as const;
const searchInput = {
  flex: 1,
  padding: '0.6rem 0.85rem',
  border: '1px solid var(--border)',
  borderRight: 'none',
  borderRadius: 'var(--radius) 0 0 var(--radius)',
  fontSize: '0.95rem',
  outline: 'none',
} as const;

const navBar = {
  background: 'var(--surface)',
  borderBottom: '1px solid var(--border)',
  boxShadow: 'var(--shadow)',
} as const;

const navInner = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  padding: '0',
  minHeight: 46,
  position: 'relative' as const,
};

const navList = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
  gap: '0.25rem 1.75rem',
  width: '100%',
  padding: '0.35rem 0',
} as const;

const countPill = {
  background: 'var(--accent)',
  color: '#fff',
  borderRadius: 999,
  fontSize: '0.72rem',
  fontWeight: 700,
  minWidth: 18,
  height: 18,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 5px',
} as const;
const ghostBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--muted)',
  cursor: 'pointer',
  fontSize: '0.9rem',
  padding: 0,
} as const;
