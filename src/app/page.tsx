import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--primary)' }}>Scan Lanka</h1>
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
        Boards &amp; teaching equipment — since 1998.
      </p>
      <Link
        href="/products"
        style={{
          display: 'inline-block',
          marginTop: '1.5rem',
          padding: '0.7rem 1.6rem',
          background: 'var(--primary)',
          color: 'var(--primary-contrast)',
          borderRadius: 'var(--radius)',
          textDecoration: 'none',
        }}
      >
        Browse products
      </Link>
    </main>
  );
}
