'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listAdminOrderThreads, OrderThreadSummary } from '@/lib/order-messages';
import { adminMain, mutedText } from '@/components/formStyles';

export default function AdminOrderMessagesPage() {
  const [items, setItems] = useState<OrderThreadSummary[]>([]);
  const [status, setStatus] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [q, setQ] = useState('');

  const reload = () =>
    listAdminOrderThreads({ status: status || undefined, unread: unreadOnly, q: q || undefined })
      .then((p) => setItems(p.content))
      .catch(() => setItems([]));

  useEffect(() => {
    void reload();
    const id = window.setInterval(() => void reload(), 8000);
    return () => window.clearInterval(id);
  }, [status, unreadOnly, q]);

  return (
    <main style={adminMain}>
      <h1>Order messages</h1>
      <p style={mutedText}>Threads linked to orders - delivery timing, updates, and customer questions.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0' }}>
        {(['', 'OPEN', 'CLOSED'] as const).map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatus(s)}
            style={filterBtn(status === s)}
          >
            {s === '' ? 'All' : s === 'OPEN' ? 'Open' : 'Closed'}
          </button>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
          Unread only
        </label>
        <input
          type="search"
          placeholder="Search order #"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginLeft: 'auto', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
        />
      </div>

      {items.length === 0 ? (
        <p style={mutedText}>No threads match your filters.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((t) => (
            <li key={t.id} style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0' }}>
              <Link href={`/admin/messages/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <strong>{t.orderNumber}</strong>
                {t.adminUnread > 0 && (
                  <span style={badge}>{t.adminUnread} new</span>
                )}
                <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>{t.status}</span>
                <p style={{ ...mutedText, margin: '0.25rem 0' }}>
                  {new Date(t.lastMessageAt).toLocaleString()}
                </p>
                <p style={{ margin: 0 }}>{t.preview || '-'}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function filterBtn(active: boolean) {
  return {
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: active ? 'var(--primary-light)' : 'var(--surface)',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
  } as const;
}

const badge = {
  marginLeft: '0.5rem',
  padding: '0.1rem 0.45rem',
  borderRadius: 999,
  background: 'var(--primary)',
  color: '#fff',
  fontSize: '0.72rem',
  fontWeight: 700,
} as const;
