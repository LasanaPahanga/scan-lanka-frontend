'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchCustomerOrderThread,
  fetchGuestOrderThread,
  issueGuestThreadToken,
  type OrderThread as OrderThreadData,
  postCustomerOrderMessage,
  postGuestOrderMessage,
  storeGuestThreadToken,
} from '@/lib/order-messages';
import { dangerText, fieldInput, mutedText, primaryButton } from '@/components/formStyles';

const MAX_LEN = 4000;

type Props =
  | { mode: 'customer'; orderNumber: string }
  | { mode: 'guest'; orderNumber: string; email: string; token?: string | null };

export function OrderThread(props: Props) {
  const orderNumber = props.orderNumber;
  const [thread, setThread] = useState<OrderThreadData | null>(null);
  const [token, setToken] = useState<string | null>(props.mode === 'guest' ? props.token ?? null : null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(async () => {
    try {
      if (props.mode === 'customer') {
        setThread(await fetchCustomerOrderThread(orderNumber));
      } else if (token) {
        setThread(await fetchGuestOrderThread(token));
      }
      setError(null);
    } catch {
      setError('Could not load messages.');
    }
  }, [props.mode, orderNumber, token]);

  useEffect(() => {
    if (props.mode === 'guest' && !token) {
      void issueGuestThreadToken(orderNumber, props.email)
        .then((res) => {
          storeGuestThreadToken(orderNumber, res.accessToken);
          setToken(res.accessToken);
          setThread(res.thread);
        })
        .catch(() => setError('Could not open order messages.'));
      return undefined;
    }
    void reload();
    const id = window.setInterval(() => void reload(), 5000);
    return () => window.clearInterval(id);
  }, [props.mode, orderNumber, props.mode === 'guest' ? props.email : null, token, reload]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || busy) return;
    if (body.length > MAX_LEN) {
      setError(`Message must be ${MAX_LEN} characters or fewer.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (props.mode === 'customer') {
        setThread(await postCustomerOrderMessage(orderNumber, body));
      } else if (token) {
        setThread(await postGuestOrderMessage(token, body));
      }
      setDraft('');
      liveRef.current?.focus();
    } catch (err) {
      const msg = err instanceof Error && err.message.includes('429')
        ? 'You are sending messages too quickly. Please wait a moment.'
        : 'Could not send message.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const closed = thread?.status === 'CLOSED';

  return (
    <section
      style={box}
      aria-label="Order messages"
    >
      <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem' }}>Order messages</h2>
      <p style={{ ...mutedText, marginTop: 0 }}>
        Ask about delivery timing or anything related to this order. We&apos;ll reply here and by email.
      </p>

      {!thread && !error && <p style={mutedText}>Loading messages…</p>}
      {error && <p style={dangerText}>{error}</p>}

      {thread && (
        <>
          <div
            ref={liveRef}
            tabIndex={-1}
            aria-live="polite"
            aria-relevant="additions"
            style={{ display: 'grid', gap: '0.5rem', margin: '0.75rem 0' }}
          >
            {thread.messages.length === 0 ? (
              <p style={mutedText}>No messages yet - send the first one below.</p>
            ) : (
              thread.messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: m.role === 'ADMIN' ? 'var(--primary-light)' : 'var(--bg-muted)',
                    maxWidth: '90%',
                    marginLeft: m.role === 'ADMIN' ? 'auto' : 0,
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    {m.label} · {new Date(m.at).toLocaleString()}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                </div>
              ))
            )}
          </div>

          {closed ? (
            <p style={mutedText}>
              This thread is closed. If you need more help,{' '}
              <a href="/contact" style={{ color: 'var(--primary)' }}>
                contact us
              </a>
              .
            </p>
          ) : (
            <form onSubmit={onSend}>
              <label htmlFor="order-msg-body" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                Your message
              </label>
              <textarea
                id="order-msg-body"
                style={{ ...fieldInput, width: '100%', minHeight: 72 }}
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MAX_LEN))}
                placeholder="e.g. When will my order be delivered?"
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{draft.length}/{MAX_LEN}</span>
                <button type="submit" style={{ ...primaryButton, width: 'auto' }} disabled={busy || !draft.trim()}>
                  {busy ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}

const box = {
  marginTop: '1.5rem',
  padding: '1rem 1.1rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
} as const;
