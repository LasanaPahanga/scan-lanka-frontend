'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { CountrySelector } from '@/components/CountrySelector';
import { NotificationBell } from '@/components/NotificationBell';

const HOTLINE = '071 781 7447';
const EMAIL = 'scanlankagroup.info@gmail.com';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/products', label: 'Our Products' },
  { href: '/clientele', label: 'Clientele' },
  { href: '/quote', label: 'Request a Quote' },
  { href: '/delivery', label: 'Delivery' },
  { href: '/returns', label: 'Help Center' },
  { href: '/contact', label: 'Contact Us' },
] as const;

export function Header() {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Render the notification bell in the brand row on phones (the actions row
  // is replaced by the bottom tab bar there) and in the actions row on desktop.
  // One instance only: each bell polls the inbox on an interval.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setMenuOpen(false);
    router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products');
  }

  return (
    <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
      <div className="header-util-bar" style={utilBar}>
        <div className="container header-util-inner">
          <div className="header-util-contact">
            <a href={`tel:${HOTLINE.replace(/\s/g, '')}`} className="util-hotline-link" style={utilItem}>
              ☎ <span className="util-hotline-text"><span className="util-hotline-word">Hotline </span>{HOTLINE}</span>
            </a>
            <a href={`mailto:${EMAIL}`} className="util-email" style={utilItem}>
              ✉ {EMAIL}
            </a>
          </div>
          <div className="header-util-meta">
            <span className="util-tagline">Manufacturer &amp; supplier since 1998</span>
            <CountrySelector />
            {user && (
              <button type="button" onClick={() => void logout()} className="header-signout-btn">
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="header-main-bar" style={mainBar}>
        <div className="container header-main-inner">
          <div className="header-brand-row">
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
                <img src="/logo.png" alt="Scan Lanka" className="header-logo" style={logoImg} onError={() => setLogoError(true)} />
              )}
            </Link>

            {isMobile && (
              <span className="header-bell-mobile">
                <NotificationBell />
              </span>
            )}
            <button
              type="button"
              className="header-menu-btn"
              aria-expanded={menuOpen}
              aria-controls="site-nav"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>

          <form onSubmit={search} className="header-search" style={searchWrap} role="search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              style={searchInput}
            />
            <button type="submit" className="btn btn-primary header-search-btn" style={{ borderRadius: '0 var(--radius) var(--radius) 0' }}>
              Search
            </button>
          </form>

          <div className="header-actions">
            {!isMobile && <NotificationBell />}
            <Link href="/wishlist" className="icon-link" aria-label="Wishlist">
              ♡ <span style={countPill}>{wishlistCount}</span>
            </Link>
            <Link href="/cart" className="icon-link" aria-label="Cart">
              🛒 <span style={countPill}>{cartCount}</span>
            </Link>
            {user ? (
              <Link href="/account" className="icon-link header-account-link">
                Account
              </Link>
            ) : (
              <Link href="/login" className="icon-link header-login-link">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <button type="button" className="nav-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
      )}

      <nav id="site-nav" className={`site-nav${menuOpen ? ' is-open' : ''}`} style={navBar} aria-label="Main">
        <div className="container site-nav-inner">
          <div className="site-nav-list">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link" onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="nav-link nav-link-admin-mobile" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
            {user && (
              <button
                type="button"
                className="header-signout-btn header-signout-btn--nav"
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
              >
                Sign out
              </button>
            )}
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
const utilItem = { color: 'var(--muted)', textDecoration: 'none' } as const;

const mainBar = { background: 'var(--surface)', borderBottom: '1px solid var(--border)' } as const;
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

const searchWrap = { display: 'flex', flex: '1 1 320px', minWidth: 0, maxWidth: 560 } as const;
const searchInput = {
  flex: 1,
  minWidth: 0,
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
