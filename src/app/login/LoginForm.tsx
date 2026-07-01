'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import {
  dangerText,
  fieldInput,
  formStack,
  mutedText,
  pageWrap,
  primaryButton,
  textLink,
} from '@/components/formStyles';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
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
      if (me.role === 'ADMIN') {
        router.push(me.adminTotpRequired && !me.totpEnabled ? '/admin/2fa' : '/admin');
      } else {
        router.push(next);
      }
    } catch (err) {
      if (err instanceof ApiError && err.message === 'TOTP_REQUIRED') {
        setNeedsTotp(true);
        setError('Enter your authenticator code.');
      } else if (err instanceof ApiError && err.status === 0) {
        setError('Could not reach the server. Is the backend running?');
      } else if (err instanceof ApiError && err.status === 400) {
        setError('Request failed. Clear cookies for localhost (DevTools → Application → Cookies) and try again.');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Sign in</h1>
      <form onSubmit={onSubmit} style={formStack}>
        <input
          style={fieldInput}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={fieldInput}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {needsTotp && (
          <input
            style={fieldInput}
            inputMode="numeric"
            placeholder="Authenticator code"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
          />
        )}
        {error && <p style={dangerText}>{error}</p>}
        <button style={primaryButton} type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={mutedText}>
        <a href="/forgot-password" style={textLink}>
          Forgot password?
        </a>
      </p>
      <p style={mutedText}>
        No account?{' '}
        <a href="/register" style={textLink}>
          Register
        </a>
      </p>
    </main>
  );
}
