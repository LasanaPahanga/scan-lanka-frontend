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
import { adminMain, fieldInput, mutedText, primaryButton } from '@/components/formStyles';

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
        <p style={mutedText}>Loading…</p>
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
      <p>
        <Link href="/admin/messages">← Order messages</Link>
        {' · '}
        <Link href={`/admin/orders/${encodeURIComponent(thread.order.orderNumber)}`}>View order</Link>
      </p>
      <h1>{thread.orderNumber}</h1>
      <p style={mutedText}>
        {thread.order.contactName} - {thread.order.contactEmail} · {thread.order.status} · {thread.status}
      </p>

      <section className="responsive-stack" style={sideBySide}>
        <div>
          <h2 style={{ fontSize: '1rem' }}>Messages</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem' }}>
            {thread.messages.map((m) => (
              <li
                key={m.id}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: m.role === 'ADMIN' ? 'var(--primary-light)' : 'var(--bg-muted)',
                  maxWidth: '85%',
                  marginLeft: m.role === 'ADMIN' ? 'auto' : 0,
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {m.label} · {new Date(m.at).toLocaleString()}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
              </li>
            ))}
          </ul>
          {!closed && (
            <form onSubmit={onReply} style={{ marginTop: '1rem' }}>
              <textarea
                style={{ ...fieldInput, width: '100%', minHeight: 80 }}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Reply to customer…"
                required
              />
              <button type="submit" style={{ ...primaryButton, marginTop: '0.5rem', width: 'auto' }}>
                Send reply
              </button>
            </form>
          )}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
            {!closed ? (
              <button
                type="button"
                style={{ color: 'var(--danger)' }}
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
                onClick={async () => {
                  await reopenOrderThread(id);
                  await reload();
                }}
              >
                Reopen thread
              </button>
            )}
          </div>
        </div>

        <aside style={orderPane}>
          <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Linked order</h2>
          <ul style={{ paddingLeft: '1.1rem', margin: '0.5rem 0' }}>
            {thread.order.lines.map((l) => (
              <li key={l.sku}>
                {l.name} × {l.quantity} - {formatLkr(l.lineTotalCents)}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}

const sideBySide = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 280px)',
  gap: '1.5rem',
  marginTop: '1rem',
} as const;

const orderPane = {
  padding: '0.75rem 1rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  height: 'fit-content',
} as const;
