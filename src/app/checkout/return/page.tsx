'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clearPendingOrder, loadPendingOrder, lookupOrder } from '@/lib/orders';
import { PAYMENT_FAILED, PAYMENT_PENDING, PAYMENT_SUCCESS } from '@/lib/payments';

export default function PaymentReturnPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const pending = loadPendingOrder();
    if (!pending) {
      setChecking(false);
      return;
    }
    setOrderNumber(pending.orderNumber);

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      attempts += 1;
      try {
        const o = await lookupOrder(pending.orderNumber, pending.email);
        setStatus(o.status);
        if (PAYMENT_SUCCESS.has(o.status) || PAYMENT_FAILED.has(o.status)) {
          setChecking(false);
          clearPendingOrder();
          return;
        }
        if (o.status === 'AWAITING_BANK_CONFIRMATION') {
          setChecking(false);
          return;
        }
      } catch {
        /* keep trying */
      }
      if (attempts >= 8) {
        setChecking(false);
        return;
      }
      timer = setTimeout(poll, 2000);
    };
    void poll();
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      style={{
        maxWidth: 520,
        margin: '3rem auto',
        padding: '2.5rem',
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {!orderNumber ? (
        <>
          <h1>No order to show</h1>
          <Link href="/products" style={{ color: 'var(--primary)' }}>
            Browse products
          </Link>
        </>
      ) : status && PAYMENT_SUCCESS.has(status) ? (
        <>
          <h1 style={{ color: 'var(--primary)' }}>Payment confirmed</h1>
          <p>
            Order <strong>{orderNumber}</strong> is confirmed. We&apos;ll email your receipt.
          </p>
          <Link href="/products" style={{ color: 'var(--primary)' }}>
            Continue shopping
          </Link>
        </>
      ) : status === 'AWAITING_BANK_CONFIRMATION' ? (
        <>
          <h1>Awaiting bank confirmation</h1>
          <p style={{ color: 'var(--muted)' }}>
            Order <strong>{orderNumber}</strong> — we received your slip and will confirm your payment soon.
            We&apos;ll email your receipt once approved.
          </p>
          <Link href={`/orders/lookup`} style={{ color: 'var(--primary)' }}>
            Track this order
          </Link>
        </>
      ) : status && PAYMENT_FAILED.has(status) ? (
        <>
          <h1 style={{ color: 'var(--danger)' }}>Payment not completed</h1>
          <p>
            Order <strong>{orderNumber}</strong> wasn&apos;t paid.
            {status === 'BANK_SLIP_REJECTED'
              ? ' Your bank slip was rejected — please upload a new slip from order lookup.'
              : ' You can try again from your cart.'}
          </p>
          <Link href={status === 'BANK_SLIP_REJECTED' ? '/orders/lookup' : '/cart'} style={{ color: 'var(--primary)' }}>
            {status === 'BANK_SLIP_REJECTED' ? 'Track order' : 'Back to cart'}
          </Link>
        </>
      ) : (
        <>
          <h1>Confirming your payment…</h1>
          <p style={{ color: 'var(--muted)' }}>
            Order <strong>{orderNumber}</strong> — we&apos;re confirming with the payment provider
            {checking ? '…' : '.'}
          </p>
          {!checking && status && PAYMENT_PENDING.has(status) && (
            <p style={{ fontSize: '0.95rem' }}>
              This can take a moment. Check{' '}
              <Link href="/orders/lookup" style={{ color: 'var(--primary)' }}>
                order status
              </Link>{' '}
              or wait for our confirmation email.
            </p>
          )}
        </>
      )}
    </main>
  );
}
