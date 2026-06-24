import { Reveal } from '@/components/Reveal';

export const metadata = {
  title: 'About Us — Scan Lanka',
  description:
    'Scan Lanka Trading Co. — Sri Lanka’s leading manufacturer & supplier of boards and teaching equipment since 1998. ISO 9001:2015 certified.',
};

const SPECIALTIES = [
  {
    t: 'Proven Market Experience',
    d: 'Un-matched product excellence comes from the experience acquired throughout two decades.',
  },
  {
    t: 'Outstanding Product Quality',
    d: 'By using original raw materials, we fabricate high-quality products that will long last for years.',
  },
  {
    t: 'Maximum Production Volume',
    d: 'Our workshop is well resourced with modern equipment for bulk produces without any wastage.',
  },
  {
    t: 'Reasonable Product Value',
    d: 'With our cost-effective manufacturing practices, we are capable of distributing low-cost products to the market.',
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Vision & Mission */}
      <section style={{ background: 'var(--bg-muted)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={vmGrid}>
          <Reveal>
            <div style={{ textAlign: 'center' }}>
              <h2 style={vmTitle}>Our Vision</h2>
              <p style={vmText}>
                To be the first to introduce the latest trends in the international market to our
                clientele which will guarantee our continued development.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={vmTitle}>Our Mission</h2>
              <p style={vmText}>
                Being the market leader in Sri Lanka, we take on our responsibility of supplying top
                quality products at a competitive price range and friendly after sales service.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* About + image */}
      <div className="container" style={{ padding: '3.5rem 1.25rem' }}>
        <div style={aboutGrid}>
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/aboutusimg.jpg" alt="Scan Lanka products" style={aboutImg} />
          </Reveal>
          <Reveal delay={80}>
            <div>
              <h1 className="section-title">About Scan Lanka</h1>
              <p style={para}>
                With the initiative taken in 1998 Scan Lanka has grown to be the market leader through
                unique manufacturing and straightforward sales attitudes. At present, we are delivering
                a wide range of products including factory-made teaching equipment, smart boards,
                ultra-modern glass writing boards, carrom boards, Dam boards and shoe polish range.
              </p>
              <p style={para}>
                Our industry know-how, high product quality, on-time delivery and friendly customer
                services are the principal strengths of our continuous development. By maintaining our
                very own factory, stores, showroom and vehicle fleet, we can guarantee an uninterrupted
                and on-time delivery.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ISO */}
        <Reveal>
          <div style={{ textAlign: 'center', margin: '3.5rem 0' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/isocertification.jpg" alt="ISO 9001:2015 certified" style={{ height: 120, width: 'auto' }} />
            <h2 style={{ marginTop: '1rem' }}>ISO 9001 : 2015 Certified</h2>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
              &ldquo;Pioneers in Conventional and State of the Art Presentation Tools in Sri Lanka…&rdquo;
            </p>
          </div>
        </Reveal>

        {/* Specialties */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={eyebrow}>Words about our products</p>
            <h2 style={{ fontSize: '1.8rem', margin: '0.25rem 0 0.75rem' }}>Our Specialties</h2>
            <p style={{ color: 'var(--muted)', maxWidth: 640, margin: '0 auto' }}>
              Market leader in Sri Lanka manufactures owned products using top quality raw materials to
              bring you the best products at a very reasonable rate.
            </p>
          </div>
        </Reveal>
        <div style={specGrid}>
          {SPECIALTIES.map((s, i) => (
            <Reveal key={s.t} delay={i * 60}>
              <div style={specCard}>
                <span style={specNum}>{String(i + 1).padStart(2, '0')}</span>
                <h3 style={{ margin: '0.5rem 0 0.4rem', fontSize: '1.05rem' }}>{s.t}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.92rem', margin: 0 }}>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}

const vmGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '2rem',
  padding: '3rem 1.25rem',
} as const;
const vmTitle = { color: 'var(--primary)', fontSize: '1.5rem', margin: '0 0 0.75rem' } as const;
const vmText = { color: 'var(--muted)', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 } as const;

const aboutGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2.5rem',
  alignItems: 'center',
} as const;
const aboutImg = {
  width: '100%',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid var(--border)',
} as const;
const para = { color: 'var(--muted)', lineHeight: 1.8, marginBottom: '1rem' } as const;

const eyebrow = {
  textTransform: 'uppercase' as const,
  letterSpacing: '1.5px',
  fontSize: '0.78rem',
  color: 'var(--primary)',
  fontWeight: 700,
  margin: 0,
};
const specGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1.25rem',
} as const;
const specCard = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
  padding: '1.5rem',
  height: '100%',
} as const;
const specNum = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 10,
  background: 'var(--primary-light)',
  color: 'var(--primary)',
  fontWeight: 800,
} as const;
