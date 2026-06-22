'use client';

import { FormEvent, useState } from 'react';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send reset code.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const resetHref = `/reset-password?email=${encodeURIComponent(email)}`;
    return (
      <main style={pageWrap}>
        <h1 style={{ color: 'var(--primary)' }}>Check your email</h1>
        <p style={mutedText}>
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a reset code.
        </p>
        <a href={resetHref} style={textLink}>
          Enter reset code
        </a>
      </main>
    );
  }

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Forgot password</h1>
      <p style={mutedText}>We&apos;ll email you a one-time code to reset your password.</p>
      <form onSubmit={onSubmit} style={formStack}>
        <input
          style={fieldInput}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p style={dangerText}>{error}</p>}
        <button style={primaryButton} type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset code'}
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
