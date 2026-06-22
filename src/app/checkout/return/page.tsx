'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clearPendingOrder, loadPendingOrder, lookupOrder } from '@/lib/orders';

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
        // PAID/CONFIRMED are terminal-good; stop polling
        if (o.status === 'PAID' || o.status === 'CONFIRMED' || o.status === 'PAYMENT_FAILED') {
          setChecking(false);
          clearPendingOrder();
          return;
        }
      } catch {
        /* keep trying */
      }
      if (attempts >= 5) {
        setChecking(false);
        return;
      }
      timer = setTimeout(poll, 2000); // webhook is async — poll a few times
    };
    void poll();
    return () => clearTimeout(timer);
  }, []);

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
      {!orderNumber ? (
        <>
          <h1>No order to show</h1>
          <Link href="/products" style={{ color: 'var(--primary)' }}>Browse products</Link>
        </>
      ) : status === 'PAID' || status === 'CONFIRMED' ? (
        <>
          <h1 style={{ color: 'var(--primary)' }}>Payment confirmed 🎉</h1>
          <p>Order <strong>{orderNumber}</strong> is confirmed. We&apos;ll email your receipt.</p>
          <Link href="/products" style={{ color: 'var(--primary)' }}>Continue shopping</Link>
        </>
      ) : status === 'PAYMENT_FAILED' ? (
        <>
          <h1 style={{ color: 'var(--danger)' }}>Payment not completed</h1>
          <p>Order <strong>{orderNumber}</strong> wasn&apos;t paid. You can try again from your cart.</p>
          <Link href="/cart" style={{ color: 'var(--primary)' }}>Back to cart</Link>
        </>
      ) : (
        <>
          <h1>Confirming your payment…</h1>
          <p style={{ color: 'var(--muted)' }}>
            Order <strong>{orderNumber}</strong> — we&apos;re confirming with the payment provider
            {checking ? '…' : '. This can take a moment; we&apos;ll email your receipt once confirmed.'}
          </p>
        </>
      )}
    </main>
  );
}
