'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { adminConvertQuote, adminQuoteMessage, getAdminQuote, QuoteView } from '@/lib/quotes';
import { formatLkr } from '@/lib/money';
import { fieldInput, mutedText, pageWrap, primaryButton } from '@/components/formStyles';

export default function AdminQuoteDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [quote, setQuote] = useState<QuoteView | null>(null);
  const [body, setBody] = useState('');
  const [price, setPrice] = useState('');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const reload = () => getAdminQuote(id).then(setQuote).catch(() => setQuote(null));

  useEffect(() => {
    void reload();
  }, [id]);

  if (!quote) {
    return (
      <main style={pageWrap}>
        <p style={mutedText}>Loading…</p>
      </main>
    );
  }

  async function onReply(e: FormEvent) {
    e.preventDefault();
    await adminQuoteMessage(id, body, price ? Number(price) : undefined);
    setBody('');
    setPrice('');
    await reload();
  }

  return (
    <main style={pageWrap}>
      <p>
        <Link href="/admin/quotes">← Quotes</Link>
      </p>
      <h1>Quote #{quote.id}</h1>
      <p style={mutedText}>
        {quote.requesterName} — {quote.email} — {quote.phone} · {quote.status}
      </p>
      {quote.quotedTotalCents != null && <p>Quoted: {formatLkr(quote.quotedTotalCents)}</p>}
      <ul>
        {quote.items.map((i) => (
          <li key={i.id}>
            {i.name} × {i.quantity}
          </li>
        ))}
      </ul>
      <section style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1rem' }}>Thread</h2>
        <ul style={{ paddingLeft: '1rem', color: 'var(--muted)' }}>
          {quote.thread.map((m) => (
            <li key={m.id}>
              {m.sender}: {m.body}
            </li>
          ))}
        </ul>
        <form onSubmit={onReply} style={{ marginTop: '1rem' }}>
          <textarea style={{ ...fieldInput, width: '100%', minHeight: 80 }} value={body} onChange={(e) => setBody(e.target.value)} required />
          <input style={{ ...fieldInput, marginTop: '0.5rem' }} placeholder="Quoted price (cents, optional)" value={price} onChange={(e) => setPrice(e.target.value)} />
          <button type="submit" style={{ ...primaryButton, marginTop: '0.5rem' }}>
            Send admin reply
          </button>
        </form>
        {quote.status === 'ACCEPTED' && (
          <button
            type="button"
            style={{ marginTop: '0.75rem' }}
            onClick={async () => {
              const res = await adminConvertQuote(id);
              setOrderNumber(res.orderNumber);
            }}
          >
            Convert to order
          </button>
        )}
        {orderNumber && <p>Created order: {orderNumber}</p>}
      </section>
    </main>
  );
}
