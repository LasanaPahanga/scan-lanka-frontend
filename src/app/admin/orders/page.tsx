'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { listOrders, OrderSummary } from '@/lib/admin';
import { formatLkr } from '@/lib/money';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

const VIEWS = [
  { id: 'pending_payment', label: 'Pending payment' },
  { id: 'paid', label: 'Paid' },
  { id: 'in_fulfilment', label: 'In fulfilment' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'all', label: 'All' },
];

export default function AdminOrdersPage() {
  const params = useSearchParams();
  const view = params.get('view') ?? 'all';
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<OrderSummary[]>([]);

  useEffect(() => {
    listOrders(view, q || undefined).then((p) => setRows(p.content)).catch(() => setRows([]));
  }, [view, q]);

  return (
    <main style={adminMain}>
      <AdminPageHeader title="Orders" description="Search and filter orders by fulfilment stage." />

      <div className="admin-filter-bar">
        {VIEWS.map((v) => (
          <Link
            key={v.id}
            href={`/admin/orders?view=${v.id}`}
            className={`admin-filter-chip${view === v.id ? ' admin-filter-chip--active' : ''}`}
          >
            {v.label}
          </Link>
        ))}
        <input
          className="admin-search"
          placeholder="Search order #, name, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <p className="admin-empty">No orders in this view.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.orderNumber}>
                  <td>
                    <Link href={`/admin/orders/${encodeURIComponent(o.orderNumber)}`}>{o.orderNumber}</Link>
                  </td>
                  <td>{o.contactName}</td>
                  <td>
                    <span className="admin-badge admin-badge--muted">{o.status}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatLkr(o.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
