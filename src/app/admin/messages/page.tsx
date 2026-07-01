'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listAdminOrderThreads, OrderThreadSummary } from '@/lib/order-messages';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

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
      <AdminPageHeader
        title="Order messages"
        description="Threads linked to orders — delivery timing, updates, and customer questions."
      />

      <div className="admin-filter-bar">
        {(['', 'OPEN', 'CLOSED'] as const).map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatus(s)}
            className={`admin-filter-chip${status === s ? ' admin-filter-chip--active' : ''}`}
          >
            {s === '' ? 'All' : s === 'OPEN' ? 'Open' : 'Closed'}
          </button>
        ))}
        <label className="admin-check-row" style={{ marginBottom: 0 }}>
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
          Unread only
        </label>
        <input
          type="search"
          className="admin-search"
          placeholder="Search order #"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {items.length === 0 ? (
        <p className="admin-empty">No threads match your filters.</p>
      ) : (
        <ul className="admin-inbox">
          {items.map((t) => (
            <li key={t.id} className="admin-inbox-item">
              <Link href={`/admin/messages/${t.id}`}>
                <div className="admin-inbox-meta">
                  <strong>{t.orderNumber}</strong>
                  {t.adminUnread > 0 && (
                    <span className="admin-badge admin-badge--primary">{t.adminUnread} new</span>
                  )}
                  <span className="admin-badge admin-badge--muted">{t.status}</span>
                  <span className="admin-inbox-time">{new Date(t.lastMessageAt).toLocaleString()}</span>
                </div>
                <p className="admin-inbox-preview">{t.preview || '—'}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
