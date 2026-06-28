'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchSupportChat,
  getStoredSupportToken,
  sendSupportMessage,
  startSupportChat,
  storeSupportToken,
  SupportConversation,
} from '@/lib/support';
import { useAuth } from '@/components/AuthProvider';
import { fieldInput, primaryButton, mutedText } from '@/components/formStyles';

export function CustomerCareWidget() {
  const { user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [chat, setChat] = useState<SupportConversation | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(async (t: string) => {
    try {
      const c = await fetchSupportChat(t);
      setChat(c);
      setError(null);
    } catch {
      localStorage.removeItem('sl_support_token');
      setToken(null);
      setChat(null);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredSupportToken();
    if (stored) {
      setToken(stored);
      void reload(stored);
    }
  }, [reload]);

  useEffect(() => {
    if (!open || !token) return undefined;
    const id = window.setInterval(() => void reload(token), 4000);
    return () => window.clearInterval(id);
  }, [open, token, reload]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages.length, open]);

  async function onStart(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const pageContext = typeof window !== 'undefined' ? window.location.pathname : undefined;
      const res = await startSupportChat({
        name: user ? user.name ?? undefined : name || undefined,
        email: user ? user.email : email || undefined,
        message: draft,
        pageContext,
      });
      storeSupportToken(res.accessToken);
      setToken(res.accessToken);
      setChat(res.conversation);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start chat');
    } finally {
      setLoading(false);
    }
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!token || !draft.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await sendSupportMessage(token, draft.trim());
      setChat(updated);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const closed = chat?.status === 'CLOSED';

  if (!authLoading && user?.role === 'ADMIN') return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={fab}
        aria-label="Customer care chat"
        title="Customer care"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" aria-hidden="true">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z" />
        </svg>
      </button>

      {open && (
        <div style={panel} role="dialog" aria-modal="true" aria-label="Customer care chat">
          <header style={panelHeader}>
            <strong>Customer care</strong>
            <button type="button" onClick={() => setOpen(false)} style={closeBtn} aria-label="Close">
              ×
            </button>
          </header>

          <div style={messagesArea}>
            {!chat ? (
              <form onSubmit={onStart} style={{ display: 'grid', gap: '0.5rem' }}>
                <p style={{ ...mutedText, margin: 0 }}>Ask us anything — we typically reply within business hours.</p>
                {user ? (
                  <p style={{ ...mutedText, margin: 0 }}>
                    Chatting as <strong>{user.name?.trim() || user.email}</strong>
                  </p>
                ) : (
                  <>
                    <input style={fieldInput} placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
                    <input style={fieldInput} placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </>
                )}
                <textarea
                  style={{ ...fieldInput, minHeight: 72 }}
                  placeholder="How can we help?"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  required
                />
                <button type="submit" style={primaryButton} disabled={loading}>
                  {loading ? 'Sending…' : 'Start chat'}
                </button>
              </form>
            ) : (
              <>
                {chat.messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      ...bubble,
                      alignSelf: m.sender === 'VISITOR' ? 'flex-end' : 'flex-start',
                      background: m.sender === 'VISITOR' ? 'var(--primary-light)' : 'var(--bg-muted)',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 2 }}>
                      {m.sender === 'VISITOR' ? 'You' : 'Scan Lanka'}
                    </div>
                    {m.body}
                  </div>
                ))}
                <div ref={bottomRef} />
                {closed ? (
                  <p style={mutedText}>This conversation is closed. Start a new chat from the contact page if needed.</p>
                ) : (
                  <form onSubmit={onSend} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      style={{ ...fieldInput, flex: 1 }}
                      placeholder="Type a message…"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      required
                    />
                    <button type="submit" style={{ ...primaryButton, width: 'auto', padding: '0 1rem' }} disabled={loading}>
                      Send
                    </button>
                  </form>
                )}
              </>
            )}
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}

const fab = {
  position: 'fixed' as const,
  right: '1.25rem',
  bottom: '9.5rem',
  zIndex: 50,
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--primary)',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  cursor: 'pointer',
  boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
};

const panel = {
  position: 'fixed' as const,
  right: '1.25rem',
  bottom: '11.5rem',
  zIndex: 51,
  width: 'min(360px, calc(100vw - 2rem))',
  maxHeight: 'min(480px, 70vh)',
  display: 'flex',
  flexDirection: 'column' as const,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
  overflow: 'hidden',
};

const panelHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 1rem',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-muted)',
};

const closeBtn = {
  border: 'none',
  background: 'transparent',
  fontSize: '1.25rem',
  cursor: 'pointer',
  lineHeight: 1,
};

const messagesArea = {
  padding: '1rem',
  overflowY: 'auto' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.5rem',
  flex: 1,
};

const bubble = {
  maxWidth: '85%',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.9rem',
  whiteSpace: 'pre-wrap' as const,
};
