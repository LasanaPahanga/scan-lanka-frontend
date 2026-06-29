'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/AdminGuard';

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/messages', label: 'Order messages' },
  { href: '/admin/quotes', label: 'Quotes' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/support', label: 'Customer care' },
  { href: '/admin/delivery', label: 'Delivery & Tax' },
  { href: '/admin/merch', label: 'Merchandising' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/notifications', label: 'Emails' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/2fa', label: 'Two-factor' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="admin-shell" style={shell}>
        <aside className="admin-sidebar" style={sidebar}>
          <div style={brand}>
            <span style={brandMark}>SL</span>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text)' }}>Admin Console</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Scan Lanka</div>
            </div>
          </div>
          <nav className="admin-nav" style={{ display: 'grid', gap: '0.2rem' }}>
            {nav.map((n) => {
              const active = n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} style={{ ...navItem, ...(active ? navItemActive : null) }}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/" style={backLink}>
            ← Back to store
          </Link>
        </aside>
        <div className="admin-content" style={{ flex: 1, minWidth: 0, background: 'var(--bg-muted)' }}>{children}</div>
      </div>
    </AdminGuard>
  );
}

const shell = { display: 'flex', minHeight: '70vh', alignItems: 'stretch' } as const;
const sidebar = {
  width: 230,
  flex: '0 0 230px',
  padding: '1.5rem 1rem',
  background: 'var(--surface)',
  borderRight: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1.25rem',
};
const brand = { display: 'flex', alignItems: 'center', gap: '0.6rem' } as const;
const brandMark = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 38,
  height: 38,
  borderRadius: 9,
  background: 'var(--primary)',
  color: '#fff',
  fontWeight: 800,
} as const;
const navItem = {
  display: 'block',
  padding: '0.55rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text)',
  textDecoration: 'none',
  fontSize: '0.92rem',
  fontWeight: 500,
  borderLeft: '3px solid transparent',
  transition: 'background 0.15s var(--ease), color 0.15s var(--ease)',
} as const;
const navItemActive = {
  background: 'var(--primary-light)',
  color: 'var(--primary)',
  fontWeight: 700,
  borderLeftColor: 'var(--primary)',
} as const;
const backLink = {
  marginTop: 'auto',
  color: 'var(--muted)',
  textDecoration: 'none',
  fontSize: '0.88rem',
  paddingTop: '1rem',
  borderTop: '1px solid var(--border)',
} as const;
