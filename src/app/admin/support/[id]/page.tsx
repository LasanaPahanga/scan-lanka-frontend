'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  adminReplySupport,
  closeSupportChat,
  getAdminSupportChat,
  SupportConversation,
} from '@/lib/support';
import { adminMain, fieldInput, mutedText, primaryButton } from '@/components/formStyles';

export default function AdminSupportDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [chat, setChat] = useState<SupportConversation | null>(null);
  const [body, setBody] = useState('');

  const reload = () => getAdminSupportChat(id).then(setChat).catch(() => setChat(null));

  useEffect(() => {
    void reload();
    const timer = window.setInterval(() => void reload(), 4000);
    return () => window.clearInterval(timer);
  }, [id]);

  if (!chat) {
    return (
      <main style={adminMain}>
        <p style={mutedText}>Loading…</p>
      </main>
    );
  }

  async function onReply(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    await adminReplySupport(id, body.trim());
    setBody('');
    await reload();
  }

  const closed = chat.status === 'CLOSED';

  return (
    <main style={adminMain}>
      <p>
        <Link href="/admin/support">← Customer care</Link>
      </p>
      <h1>Chat #{chat.id}</h1>
      <p style={mutedText}>
        {chat.visitorName ?? 'Visitor'}
        {chat.visitorEmail ? ` — ${chat.visitorEmail}` : ''}
        {chat.pageContext ? ` · from ${chat.pageContext}` : ''} · {chat.status}
      </p>
      <section style={{ marginTop: '1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem' }}>
          {chat.messages.map((m) => (
            <li
              key={m.id}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: m.sender === 'ADMIN' ? 'var(--primary-light)' : 'var(--bg-muted)',
                maxWidth: '85%',
                marginLeft: m.sender === 'ADMIN' ? 'auto' : 0,
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                {m.sender === 'ADMIN' ? 'You' : 'Visitor'} · {new Date(m.at).toLocaleString()}
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
              placeholder="Reply to visitor…"
              required
            />
            <button type="submit" style={{ ...primaryButton, marginTop: '0.5rem', width: 'auto' }}>
              Send reply
            </button>
          </form>
        )}
        {!closed && (
          <button
            type="button"
            style={{ marginTop: '0.75rem', color: 'var(--danger)' }}
            onClick={async () => {
              await closeSupportChat(id);
              await reload();
            }}
          >
            Close conversation
          </button>
        )}
      </section>
    </main>
  );
}
