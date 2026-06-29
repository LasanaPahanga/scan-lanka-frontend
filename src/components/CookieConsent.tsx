'use client';

import { useEffect, useState } from 'react';

const KEY = 'sl_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="cookie-consent-bar" style={bar}>
      <p style={{ margin: 0, flex: 1, fontSize: '0.9rem' }}>
        We use essential cookies for sign-in and checkout. See our{' '}
        <a href="/privacy" style={{ color: 'var(--primary)' }}>
          privacy policy
        </a>
        .
      </p>
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem(KEY, '1');
          setVisible(false);
        }}
        style={btn}
      >
        Accept
      </button>
    </div>
  );
}

const bar = {
  position: 'fixed' as const,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 40,
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  padding: '0.85rem 1.25rem',
  background: 'var(--bg)',
  borderTop: '1px solid var(--border)',
  boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
};

const btn = {
  padding: '0.45rem 0.9rem',
  background: 'var(--primary)',
  color: 'var(--primary-contrast)',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 600,
};
