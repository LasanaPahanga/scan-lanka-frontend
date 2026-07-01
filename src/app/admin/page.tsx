'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardView, fetchDashboard } from '@/lib/admin';
import { adminMain } from '@/components/formStyles';
import { useAuth } from '@/components/AuthProvider';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardView | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard().then(setData).catch(() => setData(null));
  }, []);

  const badge = user?.totpEnabled ? (
    <span className="admin-badge admin-badge--success">2FA enrolled</span>
  ) : user?.adminTotpRequired ? (
    <Link href="/admin/2fa" className="admin-badge admin-badge--warn">
      Enable 2FA
    </Link>
  ) : (
    <span className="admin-badge admin-badge--muted">2FA off (dev)</span>
  );

  return (
    <main style={adminMain}>
      <AdminPageHeader title="Dashboard" description="Order pipeline overview and stock alerts." actions={badge} />

      {!data ? (
        <p className="admin-empty">Loading…</p>
      ) : (
        <>
          <div className="admin-stat-grid">
            <Stat label="Pending payment" value={data.pendingPayment} href="/admin/orders?view=pending_payment" />
            <Stat label="Awaiting bank" value={data.awaitingBank} href="/admin/orders?view=pending_payment" />
            <Stat label="Paid" value={data.paid} href="/admin/orders?view=paid" />
            <Stat label="In fulfilment" value={data.inFulfilment} href="/admin/orders?view=in_fulfilment" />
            <Stat label="Delivered" value={data.delivered} href="/admin/orders?view=delivered" />
            <Stat label="Cancelled" value={data.cancelled} href="/admin/orders?view=cancelled" />
          </div>

          {data.lowStock.length > 0 && (
            <AdminSection title="Low stock">
              <ul className="admin-line-list">
                {data.lowStock.map((p) => (
                  <li key={p.id}>
                    <span>
                      {p.name} ({p.sku})
                    </span>
                    <span className="admin-badge admin-badge--warn">{p.stockQty} left</span>
                  </li>
                ))}
              </ul>
            </AdminSection>
          )}
        </>
      )}
    </main>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="admin-stat-card">
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
    </Link>
  );
}
