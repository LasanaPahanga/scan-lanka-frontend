'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthProvider';
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

function Admin2faContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [totp, setTotp] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    void (async () => {
      try {
        const setup = await authApi.setup2fa();
        setSecret(setup.secret);
        setOtpauthUrl(setup.otpauthUrl);
      } catch (err) {
        if (err instanceof ApiError && err.message === 'TOTP_ALREADY_ENABLED') {
          setEnabled(true);
        }
      }
    })();
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <main style={pageWrap}>
        <p style={dangerText}>Admin access only.</p>
      </main>
    );
  }

  async function onEnable(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authApi.enable2fa(totp);
      setEnabled(true);
      router.push('/account');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid code.');
    } finally {
      setBusy(false);
    }
  }

  if (enabled) {
    return (
      <main style={pageWrap}>
        <h1 style={{ color: 'var(--primary)' }}>Two-factor authentication</h1>
        <p style={mutedText}>2FA is already enabled on your admin account.</p>
        <a href="/account" style={textLink}>
          Back to account
        </a>
      </main>
    );
  }

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Set up admin 2FA</h1>
      <p style={mutedText}>
        Scan the secret below in your authenticator app (Google Authenticator, Authy, etc.), then enter
        the 6-digit code to enable access to the admin dashboard.
      </p>
      {secret && (
        <p style={{ fontFamily: 'monospace', wordBreak: 'break-all', background: 'var(--bg-muted)', padding: '0.75rem' }}>
          {secret}
        </p>
      )}
      {otpauthUrl && (
        <p style={mutedText}>
          <a href={otpauthUrl} style={textLink}>
            Open in authenticator app
          </a>
        </p>
      )}
      <form onSubmit={onEnable} style={{ ...formStack, marginTop: '1rem' }}>
        <input
          style={fieldInput}
          inputMode="numeric"
          placeholder="6-digit code"
          value={totp}
          onChange={(e) => setTotp(e.target.value)}
          required
        />
        {error && <p style={dangerText}>{error}</p>}
        <button style={primaryButton} type="submit" disabled={busy || !secret}>
          {busy ? 'Enabling…' : 'Enable 2FA'}
        </button>
      </form>
    </main>
  );
}

export default function Admin2faPage() {
  return (
    <AuthGuard>
      <Admin2faContent />
    </AuthGuard>
  );
}
