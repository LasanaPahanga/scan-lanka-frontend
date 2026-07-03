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

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await authApi.verifyEmail(email, code);
      await refresh();
      router.push('/account');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    if (!email) return;
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await authApi.resendVerification(email);
      if (res.alreadyVerified) {
        setInfo('This email is already verified. You can sign in now.');
      } else {
        setInfo('If that account needs verification, we sent a new code. Check spam too.');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend code.');
    } finally {
      setResending(false);
    }
  }

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Verify your email</h1>
      <p style={mutedText}>Enter the 6-digit code we sent to your inbox.</p>
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
        {error && <p style={dangerText}>{error}</p>}
        {info && <p style={mutedText}>{info}</p>}
        <button style={primaryButton} type="submit" disabled={busy}>
          {busy ? 'Verifying…' : 'Verify email'}
        </button>
      </form>
      <p style={{ ...mutedText, marginTop: '1rem' }}>
        Didn&apos;t get a code?{' '}
        <button type="button" onClick={onResend} disabled={resending || !email} style={textLink}>
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </p>
      <p style={{ ...mutedText, marginTop: '0.5rem' }}>
        <a href="/login" style={textLink}>
          Back to sign in
        </a>
      </p>
    </main>
  );
}
