'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  bankConfirm,
  bankReject,
  cancelOrder,
  codReceived,
  downloadAdminReceipt,
  getOrder,
  listRefunds,
  OrderDetail,
  recordRefund,
  recordDeliveryActual,
  RefundView,
  resendReceipt,
  updateItemStatus,
  updateOrderStatus,
} from '@/lib/admin';
import { saveBlob } from '@/lib/admin-notifications';
import { formatLkr } from '@/lib/money';
import { mutedText, pageWrap } from '@/components/formStyles';

const ITEM_STATUSES = ['PENDING', 'PREPARING', 'PREPARED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const ORDER_STATUSES = ['PACKED', 'SHIPPED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
const REFUND_METHODS = ['PAYHERE', 'BANK', 'STORE_CREDIT'];
const TERMINAL = new Set(['CANCELLED', 'COMPLETED']);

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderNumber = decodeURIComponent(String(params.orderNumber));
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [refunds, setRefunds] = useState<RefundView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('PACKED');
  const [actualCents, setActualCents] = useState('');
  const [courier, setCourier] = useState('');
  const [stepUpPassword, setStepUpPassword] = useState('');
  const [cancelReason, setCancelReason] = useState('CUSTOMER_REQUEST');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('BANK');
  const [refundReason, setRefundReason] = useState('');
  const [refundRef, setRefundRef] = useState('');
  const [lineDisposition, setLineDisposition] = useState<Record<number, string>>({});

  const reload = async () => {
    const [o, r] = await Promise.all([getOrder(orderNumber), listRefunds(orderNumber).catch(() => [])]);
    setOrder(o);
    setRefunds(r);
    const disp: Record<number, string> = {};
    o.lines.forEach((l) => {
      disp[l.id] = 'RESTOCK';
    });
    setLineDisposition(disp);
  };

  useEffect(() => {
    void reload().catch(() => setOrder(null));
  }, [orderNumber]);

  const refundedTotal = refunds.reduce((s, r) => s + r.amountCents, 0);
  const refundCap = order ? Math.max(0, order.totalCents - refundedTotal) : 0;

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
        <Link href="/admin/orders">← Orders</Link>
      </p>
      <h1>{order.orderNumber}</h1>
      <p style={mutedText}>
        {order.status} · {order.fulfilmentType} · {order.deliveryPayment}
      </p>
      <p>
        {order.contactName} — {order.contactEmail} — {order.contactPhone}
      </p>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Lines</h2>
        <ul>
          {order.lines.map((l) => (
            <li key={l.id} style={{ marginBottom: '0.5rem' }}>
              {l.name} ({l.sku}) × {l.quantity} — {formatLkr(l.lineTotalCents)}
              <select
                value={l.status}
                onChange={async (e) => {
                  await updateItemStatus(orderNumber, l.id, e.target.value);
                  await reload();
                }}
                style={{ marginLeft: '0.5rem' }}
              >
                {ITEM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Order status</h2>
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          style={{ marginLeft: '0.5rem' }}
          onClick={async () => {
            setError(null);
            try {
              await updateOrderStatus(orderNumber, newStatus);
              await reload();
            } catch {
              setError('Status update failed.');
            }
          }}
        >
          Update
        </button>
      </section>

      {order.payment?.method === 'BANK_TRANSFER' && order.payment.slipUrl && (
        <section style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>Bank slip</h2>
          <p>
            Status: {order.payment.status} / {order.payment.slipReviewStatus}
          </p>
          <a href={order.payment.slipUrl} target="_blank" rel="noreferrer">
            View slip
          </a>
          <div style={{ marginTop: '0.5rem' }}>
            <button type="button" onClick={() => bankConfirm(orderNumber).then(reload)}>
              Confirm payment
            </button>
            <button type="button" style={{ marginLeft: '0.5rem' }} onClick={() => bankReject(orderNumber).then(reload)}>
              Reject slip
            </button>
          </div>
        </section>
      )}

      {order.deliveryPayment === 'COD' && (
        <section style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>COD</h2>
          <p>Estimated delivery: {formatLkr(order.deliveryCodCents)}</p>
          <button type="button" onClick={() => codReceived(orderNumber).then(reload)}>
            Mark COD received
          </button>
        </section>
      )}

      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Actual delivery cost</h2>
        <input
          placeholder="Actual cents"
          value={actualCents}
          onChange={(e) => setActualCents(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input placeholder="Courier" value={courier} onChange={(e) => setCourier(e.target.value)} />
        <button
          type="button"
          style={{ marginLeft: '0.5rem' }}
          onClick={async () => {
            await recordDeliveryActual(orderNumber, Number(actualCents), courier);
            await reload();
          }}
        >
          Save
        </button>
        {order.actualDeliveryCents != null && (
          <p style={mutedText}>
            Recorded: {formatLkr(order.actualDeliveryCents)}
            {order.deliveryCourier ? ` via ${order.deliveryCourier}` : ''}
          </p>
        )}
      </section>

      <section style={{ marginTop: '1rem' }}>
        <button
          type="button"
          onClick={async () => {
            const blob = await downloadAdminReceipt(orderNumber);
            saveBlob(blob, `SL-${orderNumber}-receipt.pdf`);
          }}
        >
          Download receipt PDF
        </button>
        <button type="button" style={{ marginLeft: '0.5rem' }} onClick={() => resendReceipt(orderNumber)}>
          Resend receipt email
        </button>
      </section>

      <section style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.05rem' }}>After-sales (step-up required)</h2>
        <p style={mutedText}>
          Refunded so far: {formatLkr(refundedTotal)} · Cap remaining: {formatLkr(refundCap)}
        </p>
        <label style={{ display: 'block', marginTop: '0.5rem' }}>
          Admin password
          <input
            type="password"
            value={stepUpPassword}
            onChange={(e) => setStepUpPassword(e.target.value)}
            style={{ display: 'block', marginTop: '0.25rem', width: '100%', maxWidth: 280 }}
          />
        </label>

        {!TERMINAL.has(order.status) && order.status !== 'SHIPPED' && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Cancel order</h3>
            <input
              placeholder="Reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{ marginRight: '0.5rem' }}
            />
            <button
              type="button"
              onClick={async () => {
                setError(null);
                try {
                  await cancelOrder(orderNumber, { reason: cancelReason, password: stepUpPassword });
                  await reload();
                } catch {
                  setError('Cancel failed — check step-up or order status.');
                }
              }}
            >
              Cancel order
            </button>
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem' }}>Record refund</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              placeholder="Amount (cents)"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
            <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)}>
              {REFUND_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input placeholder="Reason" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
            <input placeholder="Gateway / bank ref" value={refundRef} onChange={(e) => setRefundRef(e.target.value)} />
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {order.lines.map((l) => (
              <li key={l.id} style={{ marginBottom: '0.35rem' }}>
                {l.name} × {l.quantity}
                <select
                  value={lineDisposition[l.id] ?? 'RESTOCK'}
                  onChange={(e) => setLineDisposition((d) => ({ ...d, [l.id]: e.target.value }))}
                  style={{ marginLeft: '0.5rem' }}
                >
                  <option value="RESTOCK">Restock</option>
                  <option value="WRITE_OFF">Write-off</option>
                </select>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={async () => {
              setError(null);
              const amountCents = Number(refundAmount);
              if (!amountCents || amountCents > refundCap) {
                setError(`Refund must be 1–${refundCap} cents.`);
                return;
              }
              try {
                await recordRefund(orderNumber, {
                  amountCents,
                  method: refundMethod,
                  reason: refundReason || undefined,
                  gatewayRef: refundRef || undefined,
                  idempotencyKey: `fe-${orderNumber}-${Date.now()}`,
                  password: stepUpPassword,
                  items: order.lines.map((l) => ({
                    itemId: l.id,
                    quantity: l.quantity,
                    disposition: lineDisposition[l.id] ?? 'RESTOCK',
                  })),
                });
                setRefundAmount('');
                await reload();
              } catch {
                setError('Refund failed — check cap and step-up.');
              }
            }}
          >
            Record refund
          </button>
        </div>

        {refunds.length > 0 && (
          <ul style={{ marginTop: '1rem', color: 'var(--muted)', paddingLeft: '1.2rem' }}>
            {refunds.map((r) => (
              <li key={r.id}>
                {formatLkr(r.amountCents)} via {r.method} — {new Date(r.createdAt).toLocaleString()}
                {r.gatewayRef ? ` (${r.gatewayRef})` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      {order.timeline.length > 0 && (
        <section style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>Timeline</h2>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.2rem' }}>
            {order.timeline.map((e) => (
              <li key={e.at + e.toStatus}>
                {new Date(e.at).toLocaleString()} — {e.toStatus}
                {e.note ? ` (${e.note})` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
    </main>
  );
}
