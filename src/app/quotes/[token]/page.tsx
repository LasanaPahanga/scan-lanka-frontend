'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { acceptQuote, getQuoteByToken, postQuoteMessage, QuoteView } from '@/lib/quotes';
import { formatLkr } from '@/lib/money';
import { mutedText, pageWrap, primaryButton, fieldInput } from '@/components/formStyles';

export default function QuoteThreadPage() {
  const params = useParams();
  const token = decodeURIComponent(String(params.token));
  const [quote, setQuote] = useState<QuoteView | null>(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState(false);

  const reload = () =>
    getQuoteByToken(token)
      .then(setQuote)
      .catch(() => setError(true));

  useEffect(() => {
    void reload();
  }, [token]);

  if (error) {
    return (
      <main style={pageWrap}>
        <p style={mutedText}>Quote not found or link expired.</p>
      </main>
    );
  }

  if (!quote) {
    return (
      <main style={pageWrap}>
        <p style={mutedText}>Loading…</p>
      </main>
    );
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    await postQuoteMessage(token, reply);
    setReply('');
    await reload();
  }

  return (
    <main style={pageWrap}>
      <h1>Quote #{quote.id}</h1>
      <p style={mutedText}>
        Status: <strong>{quote.status}</strong>
        {quote.quotedTotalCents != null && <> · Quoted: {formatLkr(quote.quotedTotalCents)}</>}
      </p>
      <ul>
        {quote.items.map((i) => (
          <li key={i.id}>
            {i.name} × {i.quantity}
          </li>
        ))}
      </ul>
      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Messages</h2>
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {quote.thread.map((m) => (
            <li key={m.id} style={{ marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid var(--border)' }}>
              <strong>{m.sender}</strong> · {new Date(m.at).toLocaleString()}
              <p style={{ margin: '0.35rem 0 0' }}>{m.body}</p>
            </li>
          ))}
        </ul>
        {quote.status !== 'ACCEPTED' && quote.status !== 'REJECTED' && (
          <form onSubmit={sendReply} style={{ marginTop: '1rem' }}>
            <textarea style={{ ...fieldInput, width: '100%', minHeight: 80 }} value={reply} onChange={(e) => setReply(e.target.value)} required />
            <button type="submit" style={{ ...primaryButton, marginTop: '0.5rem' }}>
              Send reply
            </button>
          </form>
        )}
        {quote.quotedTotalCents != null && quote.status === 'QUOTED' && (
          <button type="button" style={{ ...primaryButton, marginTop: '0.75rem' }} onClick={() => acceptQuote(token).then(reload)}>
            Accept quoted price
          </button>
        )}
      </section>
    </main>
  );
}
