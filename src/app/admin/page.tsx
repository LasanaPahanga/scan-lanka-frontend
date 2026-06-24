'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardView, fetchDashboard } from '@/lib/admin';
import { formatLkr } from '@/lib/money';
import { mutedText, adminMain } from '@/components/formStyles';
import { useAuth } from '@/components/AuthProvider';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardView | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard().then(setData).catch(() => setData(null));
  }, []);

  return (
    <main style={adminMain}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          Dashboard
        </h1>
        {user?.totpEnabled ? (
          <span style={badgeOk}>🔒 2FA enrolled ✓</span>
        ) : (
          <Link href="/admin/2fa" style={badgeWarn}>
            ⚠ Enable 2FA
          </Link>
        )}
      </div>
      {!data ? (
        <p style={mutedText}>Loading…</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            <Stat label="Pending payment" value={data.pendingPayment} href="/admin/orders?view=pending_payment" />
            <Stat label="Awaiting bank" value={data.awaitingBank} href="/admin/orders?view=pending_payment" />
            <Stat label="Paid" value={data.paid} href="/admin/orders?view=paid" />
            <Stat label="In fulfilment" value={data.inFulfilment} href="/admin/orders?view=in_fulfilment" />
            <Stat label="Delivered" value={data.delivered} href="/admin/orders?view=delivered" />
            <Stat label="Cancelled" value={data.cancelled} href="/admin/orders?view=cancelled" />
          </div>
          {data.lowStock.length > 0 && (
            <section style={{ marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.05rem' }}>Low stock</h2>
              <ul>
                {data.lowStock.map((p) => (
                  <li key={p.id}>
                    {p.name} ({p.sku}) — {p.stockQty} left
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}

const badgeOk = {
  background: '#e7f6ec',
  color: 'var(--success)',
  border: '1px solid #b8e6c6',
  borderRadius: 999,
  padding: '0.25rem 0.7rem',
  fontSize: '0.8rem',
  fontWeight: 700,
} as const;
const badgeWarn = {
  background: '#fff4e5',
  color: 'var(--warning, #b45309)',
  border: '1px solid #f3d39b',
  borderRadius: 999,
  padding: '0.25rem 0.7rem',
  fontSize: '0.8rem',
  fontWeight: 700,
  textDecoration: 'none',
} as const;

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="card-hover"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        padding: '1.1rem 1.25rem',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{value}</div>
      <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>{label}</div>
    </Link>
  );
}
