'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  adminReplySupport,
  closeSupportChat,
  getAdminSupportChat,
  SupportConversation,
} from '@/lib/support';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';

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
        <p className="admin-empty">Loading…</p>
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
  const desc = [
    chat.visitorName ?? 'Visitor',
    chat.visitorEmail,
    chat.pageContext ? `from ${chat.pageContext}` : null,
    chat.status,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <main style={adminMain}>
      <AdminPageHeader back={{ href: '/admin/support', label: 'Customer care' }} title={`Chat #${chat.id}`} description={desc} />

      <AdminSection title="Conversation">
        <ul className="admin-chat">
          {chat.messages.map((m) => (
            <li
              key={m.id}
              className={`admin-chat-bubble ${m.sender === 'ADMIN' ? 'admin-chat-bubble--staff' : 'admin-chat-bubble--visitor'}`}
            >
              <div className="admin-chat-meta">
                {m.sender === 'ADMIN' ? 'You' : 'Visitor'} · {new Date(m.at).toLocaleString()}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
            </li>
          ))}
        </ul>
        {!closed && (
          <form onSubmit={onReply} style={{ marginTop: '1rem' }}>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply to visitor…" required style={{ width: '100%', minHeight: 88 }} />
            <div className="admin-toolbar">
              <button type="submit" className="admin-btn admin-btn--primary admin-btn--sm">
                Send reply
              </button>
            </div>
          </form>
        )}
        {!closed && (
          <div className="admin-toolbar">
            <button
              type="button"
              className="admin-btn admin-btn--danger admin-btn--sm"
              onClick={async () => {
                await closeSupportChat(id);
                await reload();
              }}
            >
              Close conversation
            </button>
          </div>
        )}
      </AdminSection>
    </main>
  );
}
