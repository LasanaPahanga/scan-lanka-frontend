'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { lookupOrderDetail } from '@/lib/orders';
import { formatLkr } from '@/lib/money';
import { ApiError } from '@/lib/api';
import { ContactReturnsCta } from '@/components/ContactReturnsCta';
import { OrderThread } from '@/components/OrderThread';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { dangerText, fieldInput, formStack, mutedText, pageWrap, primaryButton } from '@/components/formStyles';

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof lookupOrderDetail>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDetail(null);
    try {
      setDetail(await lookupOrderDetail(orderNumber.trim(), email.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? 'Order not found. Check your order number and email.' : 'Lookup failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Track your order</h1>
      <p style={mutedText}>Enter the order number from your confirmation email and the email used at checkout.</p>

      <form onSubmit={onSubmit} style={formStack}>
        <input
          style={fieldInput}
          placeholder="Order number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
        />
        <input
          style={fieldInput}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p style={dangerText}>{error}</p>}
        <button style={primaryButton} type="submit" disabled={busy}>
          {busy ? 'Looking up…' : 'Look up order'}
        </button>
      </form>

      {detail && (
        <section style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>{detail.orderNumber}</h2>
          <p style={mutedText}>
            Status:{' '}
            <strong>
              <OrderStatusBadge status={detail.status} refundTotalCents={detail.refundTotalCents} />
            </strong>{' '}
            · Total: {formatLkr(detail.totalCents)}
          </p>
          {detail.trackingRef && (
            <p>
              Tracking: {detail.carrier ?? 'Carrier'} - <strong>{detail.trackingRef}</strong>
            </p>
          )}
          <ul style={{ paddingLeft: '1.2rem' }}>
            {detail.lines.map((l) => (
              <li key={`${l.sku}-${l.quantity}`}>
                {l.name} × {l.quantity} - {formatLkr(l.lineTotalCents)}
              </li>
            ))}
          </ul>
          {detail.timeline.length > 0 && (
            <>
              <h3 style={{ fontSize: '1rem', marginTop: '1rem' }}>Timeline</h3>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--muted)' }}>
                {detail.timeline.map((e) => (
                  <li key={e.at + e.toStatus}>
                    {new Date(e.at).toLocaleString()} - {e.toStatus}
                  </li>
                ))}
              </ul>
            </>
          )}
          <OrderThread mode="guest" orderNumber={detail.orderNumber} email={email.trim()} />
          <ContactReturnsCta compact />
        </section>
      )}

      <ContactReturnsCta />

      <p style={{ ...mutedText, marginTop: '1.5rem' }}>
        <Link href="/account">Signed in?</Link> View orders in your account.
      </p>
    </main>
  );
}
