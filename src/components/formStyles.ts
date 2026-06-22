export const pageWrap = { maxWidth: 440, margin: '3rem auto', padding: '0 1.5rem' } as const;
export const formStack = { display: 'flex', flexDirection: 'column', gap: '0.75rem' } as const;
export const fieldInput = {
  padding: '0.6rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '1rem',
} as const;
export const primaryButton = {
  padding: '0.65rem',
  background: 'var(--primary)',
  color: 'var(--primary-contrast)',
  border: 'none',
  borderRadius: 'var(--radius)',
  fontSize: '1rem',
  cursor: 'pointer',
} as const;
export const mutedText = { color: 'var(--muted)', fontSize: '0.9rem' } as const;
export const dangerText = { color: 'var(--danger)' } as const;
export const textLink = { color: 'var(--primary)' } as const;
