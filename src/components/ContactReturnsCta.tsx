import Link from 'next/link';

const PHONE = '0706307685';
const WHATSAPP_URL = 'https://wa.me/94706307685';

/** Prominent offline contact CTA for returns/cancellations (16 FR-RETURN-1). */
export function ContactReturnsCta({ compact }: { compact?: boolean }) {
  return (
    <section
      style={{
        marginTop: compact ? '1rem' : '1.5rem',
        padding: '1rem 1.1rem',
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: 'var(--surface, #fafafa)',
      }}
    >
      <h2 style={{ fontSize: compact ? '1rem' : '1.05rem', margin: '0 0 0.5rem' }}>
        Need to return, cancel, or get a refund?
      </h2>
      <p style={{ color: 'var(--muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
        Returns and refunds are handled offline. Please contact us — we&apos;ll guide you through the process.
        See our{' '}
        <Link href="/returns" style={{ color: 'var(--primary)' }}>
          returns policy
        </Link>
        .
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <a href={`tel:${PHONE}`} style={btn}>
          Call {PHONE}
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={btn}>
          WhatsApp us
        </a>
      </div>
    </section>
  );
}

const btn = {
  display: 'inline-block',
  padding: '0.45rem 0.85rem',
  borderRadius: 6,
  border: '1px solid var(--primary)',
  color: 'var(--primary)',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
} as const;
