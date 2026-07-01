'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/AdminGuard';
import '@/styles/admin.css';

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/quotes', label: 'Quotes' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/support', label: 'Customer care' },
  { href: '/admin/delivery', label: 'Delivery & tax' },
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
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <img src="/favicon.ico" alt="" className="admin-sidebar-logo" />
            <div>
              <div className="admin-sidebar-title">Admin Console</div>
              <div className="admin-sidebar-sub">Scan Lanka</div>
            </div>
          </div>
          <nav className="admin-nav">
            {nav.map((n) => {
              const active = n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className={active ? 'admin-nav-active' : undefined}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/" className="admin-back-link">
            ← Back to store
          </Link>
        </aside>
        <div className="admin-content">{children}</div>
      </div>
    </AdminGuard>
  );
}
