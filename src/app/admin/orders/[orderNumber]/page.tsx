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
  fetchDispatchSummary,
  getOrder,
  listRefunds,
  OrderDetail,
  DispatchSummary,
  recordRefund,
  recordDeliveryActual,
  RefundView,
  resendReceipt,
  updateItemStatus,
  updateOrderStatus,
} from '@/lib/admin';
import { saveBlob } from '@/lib/admin-notifications';
import { formatLkr } from '@/lib/money';
import { mutedText, adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';

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
  const [dispatch, setDispatch] = useState<DispatchSummary | null>(null);

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
      <main style={adminMain}>
        <p className="admin-empty">Loading…</p>
      </main>
    );
  }

  return (
    <main style={adminMain}>
      <AdminPageHeader
        back={{ href: '/admin/orders', label: 'Orders' }}
        title={order.orderNumber}
        description={`${order.status} · ${order.fulfilmentType} · ${order.deliveryPayment}`}
      />

      <AdminSection title="Customer">
        <p>
          {order.contactName} · {order.contactEmail} · {order.contactPhone}
        </p>
        {order.customerId != null && (
          <p style={mutedText}>
            Registered customer ·{' '}
            <Link href={`/admin/customers/${order.customerId}`}>View all orders</Link>
          </p>
        )}
      </AdminSection>

      <AdminSection title="Dispatch summary">
        <div className="admin-toolbar" style={{ marginTop: 0 }}>
          <button
            type="button"
            className="admin-btn admin-btn--secondary admin-btn--sm"
            onClick={async () => {
              try {
                setDispatch(await fetchDispatchSummary(orderNumber));
              } catch {
                setError('Could not load dispatch summary.');
              }
            }}
          >
            Load dispatch summary
          </button>
        </div>
        {dispatch && <pre className="admin-pre">{JSON.stringify(dispatch, null, 2)}</pre>}
      </AdminSection>

      <AdminSection title="Line items">
        <ul className="admin-line-list">
          {order.lines.map((l) => (
            <li key={l.id}>
              <span>
                {l.name} ({l.sku}) × {l.quantity} @ {formatLkr(l.unitPriceCents)} = {formatLkr(l.lineTotalCents)}
                {l.spec && l.spec !== 'STANDARD' && l.spec !== '—' && (
                  <span className="admin-badge admin-badge--warn" style={{ marginLeft: '0.5rem' }}>
                    {l.spec.replace('_', ' ')}
                  </span>
                )}
              </span>
              <select
                value={l.status}
                onChange={async (e) => {
                  await updateItemStatus(orderNumber, l.id, e.target.value);
                  await reload();
                }}
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
      </AdminSection>

      <AdminSection title="Totals">
        <p>Subtotal: {formatLkr(order.subtotalCents)}</p>
        {order.deliveryMethod === 'COURIER' ? (
          <p>Courier fee (approx., pay on delivery): {formatLkr(order.courierEstimateCents)}</p>
        ) : (
          <p>Lorry delivery: {formatLkr(order.deliveryCents)}</p>
        )}
        <p>Tax: {formatLkr(order.taxCents)}</p>
        <p>
          <strong>Paid online: {formatLkr(order.totalCents)}</strong>
        </p>
      </AdminSection>

      <AdminSection title="Order status">
        <div className="admin-toolbar" style={{ marginTop: 0 }}>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--sm"
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
            Update status
          </button>
        </div>
      </AdminSection>

      {order.payment?.method === 'BANK_TRANSFER' && order.payment.slipUrl && (
        <AdminSection title="Bank slip">
          <p>
            Status: {order.payment.status} / {order.payment.slipReviewStatus}
          </p>
          <div className="admin-toolbar" style={{ marginTop: 0 }}>
            <a href={order.payment.slipUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn--secondary admin-btn--sm">
              View slip
            </a>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => bankConfirm(orderNumber).then(reload)}>
              Confirm payment
            </button>
            <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => bankReject(orderNumber).then(reload)}>
              Reject slip
            </button>
          </div>
        </AdminSection>
      )}

      {order.deliveryPayment === 'COD' && (
        <AdminSection title="Cash on delivery">
          <p>
            {order.deliveryMethod === 'COURIER'
              ? `Approx. total to collect (courier): ${formatLkr(order.subtotalCents + order.taxCents + order.courierEstimateCents)}`
              : `Cash to collect: ${formatLkr(order.deliveryCodCents)}`}
          </p>
          <div className="admin-toolbar" style={{ marginTop: 0 }}>
            <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => codReceived(orderNumber).then(reload)}>
              Mark COD received
            </button>
          </div>
        </AdminSection>
      )}

      <AdminSection title="Actual delivery cost">
        <div className="admin-grid-2">
          <div className="admin-field">
            <label htmlFor="actual-cents">Actual cost (cents)</label>
            <input id="actual-cents" placeholder="e.g. 45000" value={actualCents} onChange={(e) => setActualCents(e.target.value)} />
          </div>
          <div className="admin-field">
            <label htmlFor="courier">Courier</label>
            <input id="courier" placeholder="Courier name" value={courier} onChange={(e) => setCourier(e.target.value)} />
          </div>
        </div>
        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--sm"
            onClick={async () => {
              await recordDeliveryActual(orderNumber, Number(actualCents), courier);
              await reload();
            }}
          >
            Save delivery cost
          </button>
        </div>
        {order.actualDeliveryCents != null && (
          <p style={mutedText}>
            Recorded: {formatLkr(order.actualDeliveryCents)}
            {order.deliveryCourier ? ` via ${order.deliveryCourier}` : ''}
          </p>
        )}
      </AdminSection>

      <AdminSection title="Receipt">
        <div className="admin-toolbar" style={{ marginTop: 0 }}>
          <button
            type="button"
            className="admin-btn admin-btn--secondary admin-btn--sm"
            onClick={async () => {
              const blob = await downloadAdminReceipt(orderNumber);
              saveBlob(blob, `SL-${orderNumber}-receipt.pdf`);
            }}
          >
            Download PDF
          </button>
          <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => resendReceipt(orderNumber)}>
            Resend email
          </button>
        </div>
      </AdminSection>

      <AdminSection title="After-sales (step-up required)">
        <p style={mutedText}>
          Refunded so far: {formatLkr(refundedTotal)} · Cap remaining: {formatLkr(refundCap)}
        </p>
        <div className="admin-field">
          <label htmlFor="step-up">Admin password</label>
          <input
            id="step-up"
            type="password"
            value={stepUpPassword}
            onChange={(e) => setStepUpPassword(e.target.value)}
            style={{ maxWidth: 320 }}
          />
        </div>

        {!TERMINAL.has(order.status) && order.status !== 'SHIPPED' && (
          <>
            <h3>Cancel order</h3>
            <div className="admin-toolbar" style={{ marginTop: 0 }}>
              <input placeholder="Reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} style={{ maxWidth: 240 }} />
              <button
                type="button"
                className="admin-btn admin-btn--danger admin-btn--sm"
                onClick={async () => {
                  setError(null);
                  try {
                    await cancelOrder(orderNumber, { reason: cancelReason, password: stepUpPassword });
                    await reload();
                  } catch {
                    setError('Cancel failed - check step-up or order status.');
                  }
                }}
              >
                Cancel order
              </button>
            </div>
          </>
        )}

        <h3>Record refund</h3>
        <div className="admin-grid-2">
          <input placeholder="Amount (cents)" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
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
        <ul className="admin-line-list">
          {order.lines.map((l) => (
            <li key={l.id}>
              <span>
                {l.name} × {l.quantity}
              </span>
              <select
                value={lineDisposition[l.id] ?? 'RESTOCK'}
                onChange={(e) => setLineDisposition((d) => ({ ...d, [l.id]: e.target.value }))}
              >
                <option value="RESTOCK">Restock</option>
                <option value="WRITE_OFF">Write-off</option>
              </select>
            </li>
          ))}
        </ul>
        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--sm"
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
                setError('Refund failed - check cap and step-up.');
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
      </AdminSection>

      {order.timeline.length > 0 && (
        <AdminSection title="Timeline">
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.2rem', margin: 0 }}>
            {order.timeline.map((e) => (
              <li key={e.at + e.toStatus}>
                {new Date(e.at).toLocaleString()} — {e.toStatus}
                {e.note ? ` (${e.note})` : ''}
              </li>
            ))}
          </ul>
        </AdminSection>
      )}

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
    </main>
  );
}
