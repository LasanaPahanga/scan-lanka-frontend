import Link from 'next/link';
import { fetchDeliveryLocations } from '@/lib/delivery';
import { EditableHtml } from '@/components/EditableHtml';
import { PostalCodeSearch } from '@/components/PostalCodeSearch';

export const revalidate = 300;

export const metadata = {
  title: 'Delivery locations - Scan Lanka',
  description: 'Postal codes and zones we deliver to across Sri Lanka.',
};

const ZONE_LABEL: Record<string, string> = {
  COLOMBO: 'Colombo',
  SUBURB: 'Suburbs (Gampaha, Kalutara)',
  OUTER: 'Rest of Sri Lanka',
};

export default async function DeliveryLocationsPage() {
  const zones = await fetchDeliveryLocations();
  const zoneOrder = ['COLOMBO', 'SUBURB', 'OUTER'];
  const sorted = [...zones].sort((a, b) => zoneOrder.indexOf(a.zone) - zoneOrder.indexOf(b.zone));
  const grandTotal = zones.reduce((sum, z) => sum + z.totalCodes, 0);

  return (
    <main className="page page-narrow">
      <h1 className="page-title">Delivery locations</h1>
      <EditableHtml slug="delivery" className="prose">
        <p style={{ color: 'var(--muted)' }}>
          Every order is delivered to your door - we don&apos;t offer in-store or shop pickup. Our
          courier partner (Domex) delivers across Sri Lanka; our own in-house lorry additionally serves
          the areas below, with per-product pricing and availability shown at checkout. If your postal
          code isn&apos;t mapped yet,{' '}
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

      <PostalCodeSearch />

      {zones.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Delivery zones are being configured. Please check back soon.</p>
      ) : (
        <>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {grandTotal.toLocaleString('en-LK')} postal codes mapped for in-house lorry delivery, grouped
            by zone and district below.
          </p>
          {sorted.map((z) => (
            <section key={z.zone} style={{ marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem' }}>
                {ZONE_LABEL[z.zone] ?? z.zone}{' '}
                <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.85rem' }}>
                  ({z.totalCodes.toLocaleString('en-LK')} codes)
                </span>
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem 0.6rem',
                  marginTop: '0.5rem',
                }}
              >
                {z.districts.map((d) => (
                  <span
                    key={d.district}
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--muted)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.2rem 0.55rem',
                    }}
                  >
                    {d.district} ({d.count})
                  </span>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </main>
  );
}
