'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { GuestCartItem } from '@/lib/cart';
import { formatLkr } from '@/lib/money';
import {
  DeliveryPayment,
  FulfilmentType,
  PlacedResult,
  QuoteResult,
  initiatePayment,
  placeOrder,
  quoteCheckout,
  submitToPayHere,
  uploadBankSlip,
} from '@/lib/checkout';
import { savePendingOrder } from '@/lib/orders';

type PaymentMethod = 'CARD' | 'BANK';

export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const items: GuestCartItem[] = useMemo(
    () =>
      lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
        name: l.name,
      })),
    [lines],
  );
  const [fulfilment, setFulfilment] = useState<FulfilmentType>('DELIVERY');
  const [payment, setPayment] = useState<DeliveryPayment>('PREPAID');
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [slipError, setSlipError] = useState<string | null>(null);
  const [form, setForm] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
  });
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [placed, setPlaced] = useState<PlacedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isDelivery = fulfilment === 'DELIVERY';

  useEffect(() => {
    if (items.length === 0 || placed) return;
    let cancelled = false;
    quoteCheckout(items, fulfilment, isDelivery ? form.postalCode || null : null, payment)
      .then((q) => !cancelled && setQuote(q))
      .catch(() => !cancelled && setQuote(null));
    return () => {
      cancelled = true;
    };
  }, [items, fulfilment, payment, form.postalCode, isDelivery, placed]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await placeOrder({
        items,
        fulfilmentType: fulfilment,
        deliveryPayment: payment,
        ship: isDelivery
          ? { street: form.street, city: form.city, province: form.province, postalCode: form.postalCode }
          : null,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
      });
      savePendingOrder(result.orderNumber, form.contactEmail);
      await clear();

      if (method === 'CARD') {
        // Hand off to PayHere when configured; otherwise show confirmation (dev / no creds).
        const init = await initiatePayment(result.orderNumber).catch(() => null);
        if (init && init.params.merchant_id) {
          submitToPayHere(init, {
            name: form.contactName,
            email: form.contactEmail,
            phone: form.contactPhone,
            address: form.street,
            city: form.city,
          });
          return; // redirecting away to PayHere
        }
      }
      setPlaced(result); // BANK (or card dev-fallback) → show confirmation / slip upload
    } catch {
      setError('We could not place your order. Please check your details and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onUploadSlip() {
    if (!slipFile || !placed) return;
    setSlipError(null);
    try {
      await uploadBankSlip(placed.orderNumber, slipFile);
      setSlipUploaded(true);
    } catch {
      setSlipError('Could not upload the slip. Please try again.');
    }
  }

  if (placed) {
    return (
      <main style={wrap}>
        <h1 style={{ color: 'var(--primary)' }}>Order placed 🎉</h1>
        <p>
          Your order number is <strong>{placed.orderNumber}</strong>.
        </p>

        {method === 'BANK' && !slipUploaded && (
          <section style={card}>
            <h3>Pay by bank transfer</h3>
            <p style={{ color: 'var(--muted)' }}>
              Transfer <strong>{formatLkr(placed.totalCents)}</strong> to our account, then upload your
              slip below. We&apos;ll confirm it and email your receipt.
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Bank: Scan Lanka Trading Co. · A/C: (admin-configured) · Ref: {placed.orderNumber}
            </p>
            <input type="file" accept="image/*" onChange={(e) => setSlipFile(e.target.files?.[0] ?? null)} />
            {slipError && <p style={{ color: 'var(--danger)' }}>{slipError}</p>}
            <button type="button" onClick={onUploadSlip} disabled={!slipFile} style={button}>
              Upload slip
            </button>
          </section>
        )}

        {method === 'BANK' && slipUploaded && (
          <p style={{ color: 'var(--muted)' }}>
            Thanks! Your slip is uploaded — we&apos;ll confirm your payment and email your receipt.
          </p>
        )}

        {method !== 'BANK' && (
          <p style={{ color: 'var(--muted)' }}>
            We&apos;ll email your receipt once payment is confirmed.
          </p>
        )}

        <Link href="/products" style={{ color: 'var(--primary)' }}>
          Continue shopping
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main style={wrap}>
        <h1>Checkout</h1>
        <p style={{ color: 'var(--muted)' }}>Your cart is empty.</p>
        <Link href="/products" style={{ color: 'var(--primary)' }}>
          Browse products
        </Link>
      </main>
    );
  }

  const notServiceable = isDelivery && quote != null && !quote.serviceable;

  return (
    <main style={wrap}>
      <h1>Checkout</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        <section style={card}>
          <h3>Contact</h3>
          <input style={input} placeholder="Full name" value={form.contactName}
            onChange={(e) => set('contactName', e.target.value)} required />
          <input style={input} placeholder="Phone" value={form.contactPhone}
            onChange={(e) => set('contactPhone', e.target.value)} required />
          <input style={input} type="email" placeholder="Email" value={form.contactEmail}
            onChange={(e) => set('contactEmail', e.target.value)} required />
        </section>

        <section style={card}>
          <h3>Fulfilment</h3>
          <select style={input} value={fulfilment} onChange={(e) => setFulfilment(e.target.value as FulfilmentType)}>
            <option value="DELIVERY">Delivery</option>
            <option value="PICKUP_SHOP">Pick up from shop</option>
            <option value="PICKUP_FACTORY">Pick up from factory</option>
          </select>
          {isDelivery && (
            <>
              <input style={input} placeholder="Street address" value={form.street}
                onChange={(e) => set('street', e.target.value)} required />
              <input style={input} placeholder="City" value={form.city}
                onChange={(e) => set('city', e.target.value)} required />
              <input style={input} placeholder="Province" value={form.province}
                onChange={(e) => set('province', e.target.value)} required />
              <input style={input} placeholder="Postal code" value={form.postalCode}
                onChange={(e) => set('postalCode', e.target.value)} required />
              {notServiceable && (
                <p style={{ color: 'var(--danger)' }}>
                  Sorry, we don&apos;t deliver to that postal code. Please choose pickup or contact us.
                </p>
              )}
            </>
          )}
        </section>

        <section style={card}>
          <h3>Delivery payment</h3>
          <label style={{ display: 'block' }}>
            <input type="radio" checked={payment === 'PREPAID'} onChange={() => setPayment('PREPAID')} /> Pay
            delivery now
          </label>
          <label style={{ display: 'block' }}>
            <input type="radio" checked={payment === 'COD'} onChange={() => setPayment('COD')} /> Pay delivery on
            delivery (cash)
          </label>
        </section>

        <section style={card}>
          <h3>Payment method</h3>
          <label style={{ display: 'block' }}>
            <input type="radio" checked={method === 'CARD'} onChange={() => setMethod('CARD')} /> Card (PayHere)
          </label>
          <label style={{ display: 'block' }}>
            <input type="radio" checked={method === 'BANK'} onChange={() => setMethod('BANK')} /> Bank transfer
            (upload slip)
          </label>
        </section>

        <section style={card}>
          <h3>Summary</h3>
          {quote ? (
            <>
              <Row label="Subtotal" value={formatLkr(quote.subtotalCents)} />
              {payment === 'COD' ? (
                <Row label="Delivery (paid on delivery)" value={formatLkr(quote.deliveryCodCents)} muted />
              ) : (
                <Row label="Delivery" value={formatLkr(quote.deliveryCents)} />
              )}
              <Row label="Tax" value={formatLkr(quote.taxCents)} />
              <Row label="Pay now" value={formatLkr(quote.totalCents)} bold />
            </>
          ) : (
            <p style={{ color: 'var(--muted)' }}>Enter details to see your total…</p>
          )}
        </section>

        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <button type="submit" disabled={busy || notServiceable} style={{ ...button, opacity: busy || notServiceable ? 0.5 : 1 }}>
          {busy ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </main>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', color: muted ? 'var(--muted)' : 'inherit' }}>
      <span>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}

const wrap = { maxWidth: 640, margin: '0 auto', padding: '2rem 1.5rem' } as const;
const card = { border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', display: 'grid', gap: '0.6rem' } as const;
const input = { padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '1rem' } as const;
const button = { padding: '0.8rem', background: 'var(--accent)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 'var(--radius)', fontSize: '1rem', cursor: 'pointer' } as const;
