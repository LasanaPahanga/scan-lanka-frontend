'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  adminAcceptQuote,
  adminConvertQuote,
  adminQuoteMessage,
  adminUpdateQuoteCountry,
  formatQuotePhone,
  getAdminQuote,
  QuoteView,
} from '@/lib/quotes';
import { formatLkr } from '@/lib/money';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'NEW':
    case 'QUOTED':
      return 'admin-badge admin-badge--primary';
    case 'NEGOTIATING':
      return 'admin-badge admin-badge--warn';
    case 'ACCEPTED':
      return 'admin-badge admin-badge--success';
    default:
      return 'admin-badge admin-badge--muted';
  }
}

export default function AdminQuoteDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [quote, setQuote] = useState<QuoteView | null>(null);
  const [body, setBody] = useState('');
  const [price, setPrice] = useState('');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [countryDraft, setCountryDraft] = useState('');
  const [savingCountry, setSavingCountry] = useState(false);

  const reload = () => getAdminQuote(id).then((q) => {
    setQuote(q);
    setCountryDraft(q.country ?? '');
  }).catch(() => setQuote(null));

  useEffect(() => {
    void reload();
  }, [id]);

  if (!quote) {
    return (
      <main style={adminMain}>
        <p className="admin-empty">Loading…</p>
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

  async function onSaveCountry() {
    setSavingCountry(true);
    try {
      await adminUpdateQuoteCountry(id, countryDraft.trim().toUpperCase());
      await reload();
    } finally {
      setSavingCountry(false);
    }
  }

  return (
    <main style={adminMain}>
      <AdminPageHeader
        back={{ href: '/admin/quotes', label: 'Quote requests' }}
        title={`Quote #${quote.id}`}
        description={`${quote.requesterName} · ${quote.email}`}
        actions={<span className={statusBadgeClass(quote.status)}>{quote.status}</span>}
      />

      <div className="admin-stat-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-value" style={{ fontSize: '1.15rem' }}>
            {formatQuotePhone(quote)}
          </div>
          <div className="admin-stat-label">Phone</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value" style={{ fontSize: '1.15rem' }}>
            {quote.country === 'LK' ? 'Local (LK)' : quote.country ? `International (${quote.country})` : '—'}
          </div>
          <div className="admin-stat-label">Country</div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            <input
              className="admin-field"
              value={countryDraft}
              onChange={(e) => setCountryDraft(e.target.value)}
              placeholder="ISO code, e.g. LK"
              maxLength={2}
              style={{ width: 90, fontSize: '0.85rem' }}
            />
            <button
              type="button"
              className="admin-btn admin-btn--secondary admin-btn--sm"
              disabled={savingCountry || countryDraft.trim().toUpperCase() === (quote.country ?? '')}
              onClick={onSaveCountry}
            >
              {savingCountry ? 'Saving…' : 'Correct'}
            </button>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value" style={{ fontSize: '1.15rem' }}>
            {quote.quotedTotalCents != null ? formatLkr(quote.quotedTotalCents) : '—'}
          </div>
          <div className="admin-stat-label">Quoted total</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value" style={{ fontSize: '1.15rem' }}>
            {new Date(quote.createdAt).toLocaleDateString()}
          </div>
          <div className="admin-stat-label">Submitted</div>
        </div>
      </div>

      <div className="admin-chat-layout">
        <AdminSection title="Requested items">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((i) => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 600 }}>{i.name}</td>
                    <td style={{ textAlign: 'right' }}>{i.quantity}</td>
                    <td style={{ color: 'var(--muted)' }}>{i.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminSection>

        <AdminSection title="Conversation">
          {quote.thread.length === 0 ? (
            <p className="admin-empty" style={{ margin: 0 }}>No messages yet.</p>
          ) : (
            <ul className="admin-chat">
              {quote.thread.map((m) => (
                <li
                  key={m.id}
                  className={`admin-chat-bubble ${m.sender === 'ADMIN' ? 'admin-chat-bubble--staff' : 'admin-chat-bubble--visitor'}`}
                >
                  <div className="admin-chat-meta">
                    {m.sender === 'ADMIN' ? 'You' : quote.requesterName} · {new Date(m.at).toLocaleString()}
                    {m.quotedPriceCents != null && ` · ${formatLkr(m.quotedPriceCents)}`}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={onReply} style={{ marginTop: '1rem' }}>
            <textarea
              className="admin-field"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Reply to customer…"
              required
              style={{ width: '100%', minHeight: 88 }}
            />
            <div className="admin-toolbar" style={{ marginTop: '0.65rem' }}>
              <input
                className="admin-field"
                placeholder="Quoted price (cents, optional)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ maxWidth: 220 }}
              />
              <button type="submit" className="admin-btn admin-btn--primary admin-btn--sm">
                Send reply
              </button>
            </div>
          </form>

          <div className="admin-toolbar" style={{ marginTop: '1rem' }}>
            {quote.status !== 'ACCEPTED' && quote.status !== 'CONVERTED' && (
              <button
                type="button"
                className="admin-btn admin-btn--secondary admin-btn--sm"
                onClick={async () => {
                  await adminAcceptQuote(id);
                  await reload();
                }}
              >
                Mark accepted
              </button>
            )}
            {quote.status === 'ACCEPTED' && (
              <button
                type="button"
                className="admin-btn admin-btn--primary admin-btn--sm"
                onClick={async () => {
                  const res = await adminConvertQuote(id);
                  setOrderNumber(res.orderNumber);
                  await reload();
                }}
              >
                Convert to order
              </button>
            )}
          </div>
          {orderNumber && (
            <p className="admin-alert admin-alert--success" style={{ marginTop: '0.75rem' }}>
              Created order:{' '}
              <Link href={`/admin/orders/${encodeURIComponent(orderNumber)}`}>{orderNumber}</Link>
            </p>
          )}
        </AdminSection>
      </div>
    </main>
  );
}
