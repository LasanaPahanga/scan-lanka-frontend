'use client';

import Link from 'next/link';
import { AdminGuard } from '@/components/AdminGuard';

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/delivery', label: 'Delivery' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/notifications', label: 'Emails' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/quotes', label: 'Quotes' },
  { href: '/admin/2fa', label: '2FA' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: 200, padding: '1.5rem 1rem', borderRight: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Admin</h2>
          <nav style={{ display: 'grid', gap: '0.5rem' }}>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} style={{ color: 'var(--primary)' }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </AdminGuard>
  );
}
