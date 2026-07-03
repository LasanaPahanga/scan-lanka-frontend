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

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendInfo, setResendInfo] = useState<string | null>(null);

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

  async function onResend() {
    setResending(true);
    setResendInfo(null);
    try {
      const res = await authApi.resendVerification(email);
      if (res.alreadyVerified) {
        setResendInfo('This email is already verified. You can sign in now.');
      } else {
        setResendInfo('If that account needs verification, we sent a new code. Check spam too.');
      }
    } catch (err) {
      setResendInfo(err instanceof ApiError ? err.message : 'Could not resend code.');
    } finally {
      setResending(false);
    }
  }

  if (done) {
    const verifyHref = `/verify-email?email=${encodeURIComponent(email)}`;
    return (
      <main style={pageWrap}>
        <h1 style={{ color: 'var(--primary)' }}>Check your email</h1>
        <p style={mutedText}>
          We&apos;ve sent a verification code to <strong>{email}</strong>. Verify it to unlock account
          features - you can still shop as a guest meanwhile.
        </p>
        <a href={verifyHref} style={textLink}>
          Enter verification code
        </a>
        <p style={{ ...mutedText, marginTop: '1rem' }}>
          Didn&apos;t get a code?{' '}
          <button type="button" onClick={onResend} disabled={resending} style={textLink}>
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        </p>
        {resendInfo && <p style={mutedText}>{resendInfo}</p>}
        {resendInfo?.includes('already verified') && (
          <p style={{ ...mutedText, marginTop: '0.5rem' }}>
            <a href="/login" style={textLink}>
              Go to sign in
            </a>
          </p>
        )}
        <p style={{ ...mutedText, marginTop: '1rem' }}>
          <a href="/login" style={textLink}>
            Back to sign in
          </a>
        </p>
      </main>
    );
  }

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Create account</h1>
      <p style={mutedText}>Optional - you can check out as a guest without an account.</p>
      <form onSubmit={onSubmit} style={formStack}>
        <input
          style={fieldInput}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        {error && <p style={dangerText}>{error}</p>}
        <button style={primaryButton} type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </main>
  );
}
