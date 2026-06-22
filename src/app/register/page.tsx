'use client';

import { FormEvent, useState } from 'react';
import { authApi } from '@/lib/auth';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.register(email, password, name);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not register.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main style={wrap}>
        <h1 style={{ color: 'var(--primary)' }}>Check your email</h1>
        <p style={{ color: 'var(--muted)' }}>
          We&apos;ve sent a verification code to <strong>{email}</strong>. Verify it to unlock account
          features — you can still shop as a guest meanwhile.
        </p>
        <a href="/login" style={{ color: 'var(--primary)' }}>Back to sign in</a>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <h1 style={{ color: 'var(--primary)' }}>Create account</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
        Optional — you can check out as a guest without an account.
      </p>
      <form onSubmit={onSubmit} style={form}>
        <input style={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={input} type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input style={input} type="password" placeholder="Password (min 8 chars)" value={password}
          onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <button style={button} type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </main>
  );
}

const wrap = { maxWidth: 400, margin: '3rem auto', padding: '0 1.5rem' } as const;
const form = { display: 'flex', flexDirection: 'column', gap: '0.75rem' } as const;
const input = {
  padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '1rem',
} as const;
const button = {
  padding: '0.65rem', background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none',
  borderRadius: 'var(--radius)', fontSize: '1rem', cursor: 'pointer',
} as const;
