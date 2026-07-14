'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { useAuth } from '@/components/AuthProvider';

/**
 * App-style bottom navigation for phones/tablets (hidden ≥ 901px via CSS).
 * Hidden on product detail pages, where the sticky buy bar owns the bottom
 * edge, and on /cart - which now carries the full checkout/payment flow inline
 * (owner 2026-07-14, 04 FR-CART-10) - to keep that flow distraction-free.
 */
export function MobileTabBar() {
  const pathname = usePathname() ?? '/';
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth();

  const isProductDetail = /^\/products\/[^/]+$/.test(pathname);
  if (isProductDetail || pathname.startsWith('/cart')) return null;

  const accountHref = user ? '/account' : '/login';
  const items = [
    { href: '/', label: 'Home', icon: HomeIcon, active: pathname === '/' },
    { href: '/products', label: 'Shop', icon: ShopIcon, active: pathname.startsWith('/products') },
    { href: '/cart', label: 'Cart', icon: CartIcon, active: pathname.startsWith('/cart'), badge: cartCount },
    { href: '/wishlist', label: 'Wishlist', icon: HeartIcon, active: pathname.startsWith('/wishlist'), badge: wishlistCount },
    {
      href: accountHref,
      label: user ? 'Account' : 'Login',
      icon: UserIcon,
      active: pathname.startsWith('/account') || pathname.startsWith('/login'),
    },
  ];

  return (
    <nav className="mobile-tabbar" aria-label="Quick navigation">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`mobile-tab${item.active ? ' is-active' : ''}`}
          aria-current={item.active ? 'page' : undefined}
        >
          <span className="mobile-tab-icon">
            <item.icon />
            {item.badge != null && item.badge > 0 && (
              <span className="mobile-tab-badge">{item.badge > 99 ? '99+' : item.badge}</span>
            )}
          </span>
          <span className="mobile-tab-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

function HomeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
      <path d="M2.5 3.5h2.6l2.3 12h10.8l2.3-8.8H6.1" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 20.5s-7.5-4.7-9.3-9.2C1.5 8.2 3.4 5 6.6 5c2 0 3.6 1.1 4.4 2.7h2C13.8 6.1 15.4 5 17.4 5c3.2 0 5.1 3.2 3.9 6.3-1.8 4.5-9.3 9.2-9.3 9.2Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.2c1.2-3.5 4-5.2 7.5-5.2s6.3 1.7 7.5 5.2" />
    </svg>
  );
}
