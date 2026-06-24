/* Shared styling for auth + simple form pages (login, register, forgot/reset password,
   verify-email, contact). Centralised so every form page stays visually consistent. */
export const pageWrap = {
  maxWidth: 460,
  margin: '3rem auto',
  padding: '2.25rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow-md)',
} as const;

export const formStack = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
  marginTop: '1.25rem',
} as const;

export const fieldInput = {
  padding: '0.7rem 0.85rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.95rem',
  width: '100%',
  background: '#fff',
} as const;

export const primaryButton = {
  padding: '0.75rem 1rem',
  background: 'var(--primary)',
  color: 'var(--primary-contrast)',
  border: 'none',
  borderRadius: 'var(--radius)',
  fontSize: '0.97rem',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
  transition: 'background 0.18s var(--ease)',
} as const;

export const secondaryButton = {
  padding: '0.75rem 1rem',
  background: 'transparent',
  color: 'var(--primary)',
  border: '1px solid var(--primary)',
  borderRadius: 'var(--radius)',
  fontSize: '0.97rem',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
} as const;

export const pageTitle = { fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', margin: 0 } as const;
export const mutedText = { color: 'var(--muted)', fontSize: '0.92rem' } as const;
export const dangerText = { color: 'var(--danger)', fontSize: '0.92rem' } as const;
export const textLink = { color: 'var(--primary)', fontWeight: 600 } as const;
