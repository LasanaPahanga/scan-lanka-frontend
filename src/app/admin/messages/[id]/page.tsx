'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatLkr } from '@/lib/money';
import {
  adminReplyOrderThread,
  AdminOrderThread,
  closeOrderThread,
  getAdminOrderThread,
  reopenOrderThread,
} from '@/lib/order-messages';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';

export default function AdminOrderMessageDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [thread, setThread] = useState<AdminOrderThread | null>(null);
  const [body, setBody] = useState('');

  const reload = () => getAdminOrderThread(id).then(setThread).catch(() => setThread(null));

  useEffect(() => {
    void reload();
    const timer = window.setInterval(() => void reload(), 4000);
    return () => window.clearInterval(timer);
  }, [id]);

  if (!thread) {
    return (
      <main style={adminMain}>
        <p className="admin-empty">Loading…</p>
      </main>
    );
  }

  const closed = thread.status === 'CLOSED';

  async function onReply(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    await adminReplyOrderThread(id, body.trim());
    setBody('');
    await reload();
  }

  return (
    <main style={adminMain}>
      <AdminPageHeader
        back={{ href: '/admin/messages', label: 'Order messages' }}
        title={thread.orderNumber}
        description={`${thread.order.contactName} · ${thread.order.contactEmail} · ${thread.order.status} · ${thread.status}`}
        actions={
          <Link href={`/admin/orders/${encodeURIComponent(thread.order.orderNumber)}`} className="admin-btn admin-btn--secondary admin-btn--sm">
            View order
          </Link>
        }
      />

      <div className="admin-chat-layout">
        <AdminSection title="Messages">
          <ul className="admin-chat">
            {thread.messages.map((m) => (
              <li
                key={m.id}
                className={`admin-chat-bubble ${m.role === 'ADMIN' ? 'admin-chat-bubble--staff' : 'admin-chat-bubble--visitor'}`}
              >
                <div className="admin-chat-meta">
                  {m.label} · {new Date(m.at).toLocaleString()}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
              </li>
            ))}
          </ul>
          {!closed && (
            <form onSubmit={onReply} style={{ marginTop: '1rem' }}>
              <textarea className="admin-field" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply to customer…" required style={{ width: '100%', minHeight: 88 }} />
              <div className="admin-toolbar">
                <button type="submit" className="admin-btn admin-btn--primary admin-btn--sm">
                  Send reply
                </button>
              </div>
            </form>
          )}
          <div className="admin-toolbar">
            {!closed ? (
              <button
                type="button"
                className="admin-btn admin-btn--danger admin-btn--sm"
                onClick={async () => {
                  await closeOrderThread(id);
                  await reload();
                }}
              >
                Close thread
              </button>
            ) : (
              <button
                type="button"
                className="admin-btn admin-btn--secondary admin-btn--sm"
                onClick={async () => {
                  await reopenOrderThread(id);
                  await reload();
                }}
              >
                Reopen thread
              </button>
            )}
          </div>
        </AdminSection>

        <aside className="admin-aside-panel">
          <h2 style={{ fontSize: '1rem', margin: '0 0 0.65rem' }}>Linked order</h2>
          <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
            {thread.order.lines.map((l) => (
              <li key={l.sku}>
                {l.name} × {l.quantity} — {formatLkr(l.lineTotalCents)}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
