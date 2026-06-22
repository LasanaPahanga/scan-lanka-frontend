'use client';

import { FormEvent, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthProvider';
import { authApi } from '@/lib/auth';
import { lookupOrder } from '@/lib/orders';
import { formatLkr } from '@/lib/money';
import { ApiError } from '@/lib/api';
import {
  dangerText,
  fieldInput,
  formStack,
  mutedText,
  pageWrap,
  primaryButton,
  textLink,
} from '@/components/formStyles';

function AccountContent() {
  const { user, logout } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [orderEmail, setOrderEmail] = useState(user?.email ?? '');
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  async function logoutEverywhere() {
    await authApi.logoutAll();
    await logout();
  }

  async function lookup(e: FormEvent) {
    e.preventDefault();
    setOrderError(null);
    setOrderStatus(null);
    setBusy(true);
    try {
      const o = await lookupOrder(orderNumber, orderEmail);
      setOrderStatus(`${o.orderNumber}: ${o.status} — ${formatLkr(o.totalCents)}`);
    } catch (err) {
      setOrderError(err instanceof ApiError ? 'Order not found.' : 'Lookup failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Your account</h1>

      {!user.emailVerified && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-muted)',
            borderRadius: 'var(--radius)',
            marginBottom: '1.25rem',
          }}
        >
          <p style={{ margin: 0, ...mutedText }}>
            Verify your email to save your cart and unlock account features.{' '}
            <a href={`/verify-email?email=${encodeURIComponent(user.email)}`} style={textLink}>
              Verify now
            </a>
          </p>
        </div>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Profile</h2>
        <p style={mutedText}>
          <strong>{user.name ?? 'Customer'}</strong>
          <br />
          {user.email}
          <br />
          Role: {user.role}
        </p>
        <button type="button" onClick={() => void logout()} style={{ ...primaryButton, marginTop: '0.5rem' }}>
          Sign out
        </button>
        <button
          type="button"
          onClick={() => void logoutEverywhere()}
          style={{
            ...primaryButton,
            marginTop: '0.5rem',
            marginLeft: '0.5rem',
            background: 'transparent',
            color: 'var(--primary)',
            border: '1px solid var(--primary)',
          }}
        >
          Sign out everywhere
        </button>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Track an order</h2>
        <p style={mutedText}>Look up a guest order with your order number and email.</p>
        <form onSubmit={lookup} style={formStack}>
          <input
            style={fieldInput}
            placeholder="Order number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />
          <input
            style={fieldInput}
            type="email"
            placeholder="Email used at checkout"
            value={orderEmail}
            onChange={(e) => setOrderEmail(e.target.value)}
            required
          />
          {orderStatus && <p style={{ color: 'var(--accent)' }}>{orderStatus}</p>}
          {orderError && <p style={dangerText}>{orderError}</p>}
          <button style={primaryButton} type="submit" disabled={busy}>
            {busy ? 'Looking up…' : 'Look up order'}
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: '1.1rem' }}>Saved addresses</h2>
        <p style={mutedText}>Address management will appear here once checkout addresses are wired.</p>
      </section>
    </main>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}
