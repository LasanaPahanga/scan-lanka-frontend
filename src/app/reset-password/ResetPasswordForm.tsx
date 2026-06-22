'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/auth';
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

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.resetPassword(email, code, password);
      router.push('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Reset password</h1>
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
          inputMode="numeric"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
        />
        <input
          style={fieldInput}
          type="password"
          placeholder="New password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        {error && <p style={dangerText}>{error}</p>}
        <button style={primaryButton} type="submit" disabled={busy}>
          {busy ? 'Resetting…' : 'Set new password'}
        </button>
      </form>
      <p style={{ ...mutedText, marginTop: '1rem' }}>
        <a href="/login" style={textLink}>
          Back to sign in
        </a>
      </p>
    </main>
  );
}
