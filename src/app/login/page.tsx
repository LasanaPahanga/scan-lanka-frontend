'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const me = await authApi.login(email, password, totp || undefined);
      setUser(me);
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError && err.message === 'TOTP_REQUIRED') {
        setNeedsTotp(true);
        setError('Enter your authenticator code.');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={wrap}>
      <h1 style={{ color: 'var(--primary)' }}>Sign in</h1>
      <form onSubmit={onSubmit} style={form}>
        <input style={input} type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input style={input} type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        {needsTotp && (
          <input style={input} inputMode="numeric" placeholder="Authenticator code" value={totp}
            onChange={(e) => setTotp(e.target.value)} />
        )}
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <button style={button} type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ color: 'var(--muted)' }}>
        No account? <a href="/register" style={{ color: 'var(--primary)' }}>Register</a>
      </p>
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
