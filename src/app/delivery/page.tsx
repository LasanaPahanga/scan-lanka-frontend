import Link from 'next/link';
import { fetchDeliveryLocations } from '@/lib/delivery';
import { EditableHtml } from '@/components/EditableHtml';

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
      <EditableHtml slug="delivery" className="prose">
        <p style={{ color: 'var(--muted)' }}>
          We deliver to the postal codes below via company lorry (prepaid online) or courier (pay on delivery).
          If yours isn&apos;t listed,{' '}
          <Link href="/contact" style={{ color: 'var(--primary)' }}>
            contact us
          </Link>{' '}
          or{' '}
          <Link href="/quote" style={{ color: 'var(--primary)' }}>
            request a quote
          </Link>
          .
        </p>
      </EditableHtml>

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
