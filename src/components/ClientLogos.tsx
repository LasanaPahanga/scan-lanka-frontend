import { Reveal } from '@/components/Reveal';

/** Client logo files in /public/clientele (provided brand assets). */
const CLIENTS = [
  'Arpico-150x50.jpg',
  'Cool-Planet-150x50.jpg',
  'DI-150x50.jpg',
  'MD-Gunasena-150x50.jpg',
  'Kells-150x50.jpg',
  'soft-logic-150x50.jpg',
  'Dinapala-150x50.jpg',
  'LadyJ-150x50.jpg',
  'Minsara-150x50.jpg',
  'STC-logo-150x50.jpg',
  'Ministry-of-Education-150x50.jpg',
  'Colombo_Int_School-150x50.jpg',
  'British_School_Colombo-150x50.jpg',
  'university-of-colombo-150x50.jpg',
  'University_of_Peradeniya-150x50.jpg',
  'university-of-kelaniya-150x50.jpg',
  'moratuwa-university-150x50.jpg',
  'university-of-japura-150x50.jpg',
  'university-of-wayaba-1-150x50.jpg',
];

function nameOf(file: string): string {
  return file
    .replace('-150x50.jpg', '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function ClientLogos({
  heading,
  subtitle,
  max,
}: {
  heading?: string;
  subtitle?: string;
  max?: number;
}) {
  const list = max ? CLIENTS.slice(0, max) : CLIENTS;
  return (
    <section>
      {heading && (
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h2 className="section-title" style={{ display: 'inline-block' }}>
              {heading}
            </h2>
            {subtitle && <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>{subtitle}</p>}
          </div>
        </Reveal>
      )}
      <div style={grid}>
        {list.map((file) => (
          <div key={file} className="card-hover" style={tile}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/clientele/${file}`} alt={nameOf(file)} style={img} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: '1rem',
} as const;
const tile = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
  padding: '1rem',
  height: 84,
} as const;
const img = { maxWidth: '100%', maxHeight: 52, objectFit: 'contain' as const, filter: 'none' };
