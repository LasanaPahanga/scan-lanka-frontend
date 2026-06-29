'use client';

import Link from 'next/link';
import { HomeView } from '@/lib/home';
import { ProductChip } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import { ClientLogos } from '@/components/ClientLogos';
import { HeroVideoCrossfade } from '@/components/HeroVideoCrossfade';
import { Reveal } from '@/components/Reveal';

const CATEGORIES = [
  'Whiteboards',
  'Notice Boards',
  'Carrom Boards',
  'Glass Boards',
  'Easel Stands',
  'Menu Boards',
  'Cork Boards',
  'Accessories',
];

const TRUST = [
  { t: 'Since 1998', d: 'Two decades of trusted supply' },
  { t: 'Island-wide delivery', d: 'To homes, schools & offices' },
  { t: 'Quality guaranteed', d: 'Manufacturer-direct pricing' },
  { t: 'Bulk & institutional', d: 'Custom quotes for orders' },
];

export interface CategoryRow {
  category: string;
  products: ProductChip[];
}

export function HomePageView({ home, categoryRows = [] }: { home: HomeView; categoryRows?: CategoryRow[] }) {
  const hasRows = categoryRows.length > 0;

  return (
    <main>
      {/* Hero - full-width video background with crossfade */}
      <section className="home-hero" style={hero}>
        <HeroVideoCrossfade />
        <div className="container hero-inner" style={heroInner}>
          <div className="animate-up" style={heroContent}>
            <p style={heroEyebrow}>Scan Lanka</p>
            <h1 style={heroTitle}>
              White Boards, Notice Boards <br />&amp; Teaching Equipment
            </h1>
            <p style={heroText}>The biggest quality supplier of boards in Sri Lanka - since 1998.</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.75rem' }}>
              <Link href="/products" className="btn btn-primary">
                Shop all products
              </Link>
              <Link href="/quote" className="btn btn-outline">
                Request a quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={trustGrid}>
          {TRUST.map((x) => (
            <div key={x.t} style={trustItem}>
              <strong style={{ color: 'var(--primary)' }}>{x.t}</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{x.d}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        {hasRows ? (
          // Per-category product rows (matches scanlanka.com)
          categoryRows.map((row) => (
            <section key={row.category} style={{ marginBottom: '3rem' }}>
              <Reveal>
                <div style={sectionHead}>
                  <h2 className="section-title">{row.category}</h2>
                  <Link
                    href={`/products?category=${encodeURIComponent(row.category)}`}
                    className="icon-link"
                    style={{ color: 'var(--primary)' }}
                  >
                    View all →
                  </Link>
                </div>
              </Reveal>
              <div style={productGrid}>
                {row.products.map((p, i) => (
                  <Reveal key={p.id} delay={i * 50}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))
        ) : home.featured.length > 0 ? (
          <section style={{ marginBottom: '1rem' }}>
            <Reveal>
              <div style={sectionHead}>
                <h2 className="section-title">Featured Products</h2>
                <Link href="/products" className="icon-link" style={{ color: 'var(--primary)' }}>
                  Browse all →
                </Link>
              </div>
            </Reveal>
            <div style={productGrid}>
              {home.featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 50}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </section>
        ) : (
          // Fallback when the catalog has no products yet: category navigation tiles
          <section>
            <Reveal>
              <div style={sectionHead}>
                <h2 className="section-title">Shop by Category</h2>
                <Link href="/products" className="icon-link" style={{ color: 'var(--primary)' }}>
                  View all →
                </Link>
              </div>
            </Reveal>
            <div style={catGrid}>
              {CATEGORIES.map((c, i) => (
                <Reveal key={c} delay={i * 50}>
                  <Link href={`/products?category=${encodeURIComponent(c)}`} className="card-hover" style={catCard}>
                    <span style={catIcon}>▦</span>
                    <span style={{ fontWeight: 600 }}>{c}</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Trusted by / clientele */}
      <section style={{ background: 'var(--bg-muted)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '3rem 1.25rem' }}>
          <ClientLogos heading="Trusted by leading institutions" max={12} />
        </div>
      </section>

      {/* Quote CTA band */}
      <section style={ctaBand}>
        <div className="container" style={ctaInner}>
          <div>
            <h2 style={{ margin: 0, color: '#fff' }}>Need a bulk or custom order?</h2>
            <p style={{ margin: '0.35rem 0 0', color: '#d6e7f5' }}>
              Schools, offices and resellers - get an institutional quote tailored to you.
            </p>
          </div>
          <Link href="/quote" className="btn btn-accent" style={{ whiteSpace: 'nowrap' }}>
            Request a quote
          </Link>
        </div>
      </section>
    </main>
  );
}

const heroContent = {
  flex: '1 1 100%',
  maxWidth: 720,
  margin: '0 auto',
  textAlign: 'center' as const,
  position: 'relative' as const,
  zIndex: 1,
} as const;

const hero = {
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--bg-muted)',
  borderBottom: '1px solid var(--border)',
  minHeight: 'min(520px, 85vh)',
} as const;

const heroInner = {
  display: 'flex',
  alignItems: 'center',
  gap: '2.5rem',
  padding: '3.5rem 1.25rem',
  flexWrap: 'wrap' as const,
  position: 'relative' as const,
  zIndex: 1,
  minHeight: 'min(520px, 85vh)',
};
const heroEyebrow = {
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  fontSize: '0.82rem',
  color: 'var(--muted)',
  margin: 0,
  fontWeight: 700,
};
const heroTitle = {
  fontSize: 'clamp(2rem, 4.5vw, 3rem)',
  margin: '0.5rem 0 1rem',
  color: 'var(--text)',
  fontWeight: 800,
} as const;
const heroText = { fontSize: '1.05rem', color: 'var(--muted)', margin: 0, lineHeight: 1.7 } as const;

const trustGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  padding: '1.4rem 1.25rem',
} as const;
const trustItem = { display: 'flex', flexDirection: 'column' as const, gap: '0.15rem' };

const sectionHead = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '1.5rem',
  flexWrap: 'wrap' as const,
  gap: '0.5rem',
} as const;

const catGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '1rem',
} as const;
const catCard = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.6rem',
  padding: '1.75rem 1rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  textDecoration: 'none',
  color: 'var(--text)',
  textAlign: 'center' as const,
  boxShadow: 'var(--shadow)',
};
const catIcon = {
  fontSize: '1.5rem',
  color: 'var(--primary)',
  width: 54,
  height: 54,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--primary-light)',
  borderRadius: 999,
} as const;

const productGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '1.5rem',
} as const;

const ctaBand = { background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' } as const;
const ctaInner = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1.5rem',
  padding: '2.5rem 1.25rem',
  flexWrap: 'wrap' as const,
};
