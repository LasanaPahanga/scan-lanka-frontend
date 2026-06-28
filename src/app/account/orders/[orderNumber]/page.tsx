'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { ContactReturnsCta } from '@/components/ContactReturnsCta';
import { OrderThread } from '@/components/OrderThread';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { getMyOrder, OrderDetail } from '@/lib/orders';
import { formatLkr } from '@/lib/money';
import { downloadMyReceiptPdf, saveBlob } from '@/lib/admin-notifications';
import { mutedText, pageWrap } from '@/components/formStyles';

function OrderDetailView() {
  const params = useParams();
  const orderNumber = decodeURIComponent(String(params.orderNumber));
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState(false);
  const [receiptBusy, setReceiptBusy] = useState(false);

  useEffect(() => {
    getMyOrder(orderNumber)
      .then(setOrder)
      .catch(() => setError(true));
  }, [orderNumber]);

  if (error) {
    return (
      <main style={pageWrap}>
        <p style={mutedText}>Order not found.</p>
        <Link href="/account/orders">Back to orders</Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main style={pageWrap}>
        <p style={mutedText}>Loading…</p>
      </main>
    );
  }

  return (
    <main style={pageWrap}>
      <p>
        <Link href="/account/orders">← Orders</Link>
      </p>
      <h1 style={{ color: 'var(--primary)' }}>{order.orderNumber}</h1>
      <p style={mutedText}>
        Status:{' '}
        <strong>
          <OrderStatusBadge status={order.status} refundTotalCents={order.refundTotalCents} />
        </strong>{' '}
        · {order.fulfilmentType.replace('_', ' ')}
      </p>
      {order.refundTotalCents > 0 && (
        <p style={mutedText}>Refunded online: {formatLkr(order.refundTotalCents)}</p>
      )}
      {['PAID', 'CONFIRMED', 'PACKED', 'SHIPPED', 'READY_FOR_PICKUP', 'COMPLETED'].includes(order.status) && (
        <p>
          <button
            type="button"
            disabled={receiptBusy}
            onClick={async () => {
              setReceiptBusy(true);
              try {
                const blob = await downloadMyReceiptPdf(order.orderNumber);
                saveBlob(blob, `SL-${order.orderNumber}-receipt.pdf`);
              } finally {
                setReceiptBusy(false);
              }
            }}
          >
            {receiptBusy ? 'Preparing PDF…' : 'Download receipt PDF'}
          </button>
        </p>
      )}
      {order.trackingRef && (
        <p>
          Tracking ({order.carrier ?? 'carrier'}): <strong>{order.trackingRef}</strong>
        </p>
      )}

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Items</h2>
        <ul>
          {order.lines.map((l) => (
            <li key={l.sku}>
              {l.name} × {l.quantity} - {formatLkr(l.lineTotalCents)}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <Row label="Subtotal" value={formatLkr(order.subtotalCents)} />
        <Row label="Delivery" value={formatLkr(order.deliveryCents)} />
        <Row label="Tax" value={formatLkr(order.taxCents)} />
        <Row label="Total paid online" value={formatLkr(order.totalCents)} bold />
        {order.deliveryCodCents > 0 && (
          <Row label="Delivery (COD)" value={formatLkr(order.deliveryCodCents)} muted />
        )}
      </section>

      {order.timeline.length > 0 && (
        <section style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>Status timeline</h2>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.2rem' }}>
            {order.timeline.map((e) => (
              <li key={e.at + e.toStatus}>
                {new Date(e.at).toLocaleString()} - {e.toStatus}
              </li>
            ))}
          </ul>
        </section>
      )}

      <OrderThread mode="customer" orderNumber={order.orderNumber} />

      <ContactReturnsCta compact />
    </main>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', color: muted ? 'var(--muted)' : 'inherit' }}>
      <span>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}

export default function AccountOrderDetailPage() {
  return (
    <AuthGuard>
      <OrderDetailView />
    </AuthGuard>
  );
}
