import Link from 'next/link';
import { fetchDeliveryLocations } from '@/lib/delivery';

export const revalidate = 300;

export const metadata = {
  title: 'Delivery locations — Scan Lanka',
  description: 'Postal codes and zones we deliver to across Sri Lanka.',
};

export default async function DeliveryLocationsPage() {
  const zones = await fetchDeliveryLocations();

  return (
    <main className="page page-narrow">
      <h1 className="page-title">Delivery locations</h1>
      <p style={{ color: 'var(--muted)' }}>
        We deliver to the postal codes below. If yours isn&apos;t listed, choose shop pickup at checkout or{' '}
        <Link href="/orders/lookup" style={{ color: 'var(--primary)' }}>
          contact us
        </Link>
        .
      </p>

      {zones.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Delivery zones are being configured. Please check back soon.</p>
      ) : (
        zones.map((z) => (
          <section key={z.zone} style={{ marginTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>{z.zone}</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{z.postalCodes.join(', ')}</p>
          </section>
        ))
      )}
    </main>
  );
}
