'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { listMyOrders, OrderSummary } from '@/lib/orders';
import { formatLkr } from '@/lib/money';
import { mutedText, pageWrap } from '@/components/formStyles';

function OrdersList() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Your orders</h1>
      {loading ? (
        <p style={mutedText}>Loading…</p>
      ) : orders.length === 0 ? (
        <p style={mutedText}>
          No orders yet. <Link href="/products">Browse products</Link>
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {orders.map((o) => (
            <li key={o.orderNumber} style={row}>
              <div>
                <Link href={`/account/orders/${encodeURIComponent(o.orderNumber)}`} style={{ fontWeight: 600 }}>
                  {o.orderNumber}
                </Link>
                <div style={mutedText}>
                  <OrderStatusBadge status={o.status} refundTotalCents={o.refundTotalCents} /> ·{' '}
                  {new Date(o.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>{formatLkr(o.totalCents)}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function AccountOrdersPage() {
  return (
    <AuthGuard>
      <OrdersList />
    </AuthGuard>
  );
}

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.85rem 0',
  borderBottom: '1px solid var(--border)',
} as const;
