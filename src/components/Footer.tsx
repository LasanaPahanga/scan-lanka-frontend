import Link from 'next/link';

export function Footer() {
  return (
    <footer style={footer}>
      <div style={footerOverlay}>
        <div className="container" style={grid}>
        <div>
          <div style={brandRow}>
            <span style={logoChip}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Scan Lanka" style={{ height: 34, width: 'auto', display: 'block' }} />
            </span>
            <strong style={{ fontSize: '1.05rem' }}>Scan Lanka Trading Co. (Pvt) Ltd</strong>
          </div>
          <p style={blurb}>
            Sri Lanka&apos;s leading manufacturer and supplier of boards and teaching equipment since
            1998 - whiteboards, notice boards, carrom boards, easels and more, delivered island-wide.
          </p>
          <div style={socialRow}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={social} aria-label="Facebook">f</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={social} aria-label="Instagram">◎</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" style={social} aria-label="YouTube">▶</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" style={social} aria-label="X">𝕏</a>
          </div>
        </div>

        <div>
          <h4 style={colTitle}>Quick Links</h4>
          <ul style={list}>
            <li><Link href="/products" className="footer-link">Our Products</Link></li>
            <li><Link href="/quote" className="footer-link">Request a Quote</Link></li>
            <li><Link href="/about" className="footer-link">About Us</Link></li>
            <li><Link href="/clientele" className="footer-link">Clientele</Link></li>
            <li><Link href="/contact" className="footer-link">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={colTitle}>Customer Care</h4>
          <ul style={list}>
            <li><Link href="/delivery" className="footer-link">Delivery</Link></li>
            <li><Link href="/returns" className="footer-link">Returns &amp; Refunds</Link></li>
            <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
            <li><Link href="/terms" className="footer-link">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={colTitle}>Get in Touch</h4>
          <address style={contact}>
            No 385, Kaduwela Road,<br />
            Malabe, Sri Lanka.
            <br />
            <br />
            <a href="tel:0705307685" className="footer-link">Hotline: 070 5 307 685</a>
            <br />
            <a href="tel:0714307685" className="footer-link">071 4 307 685</a>
            <br />
            <a href="tel:0114209115" className="footer-link">011 4 209 115</a>
            <br />
            <a href="mailto:scanlk@sltnet.lk" className="footer-link">scanlk@sltnet.lk</a>
          </address>
        </div>
        </div>
      </div>

      <div style={bottomBar}>
        <div className="container" style={bottomInner}>
          <span>© {new Date().getFullYear()} Scan Lanka Trading Co. (Pvt) Ltd. All rights reserved.</span>
          <span style={{ opacity: 0.7 }}>Secure checkout · PayHere · Bank transfer · Cash on delivery</span>
        </div>
      </div>
    </footer>
  );
}

const footer = {
  backgroundColor: '#0c1c27',
  backgroundImage: 'url(/footer.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center bottom',
  backgroundRepeat: 'no-repeat',
  color: '#c8d4dd',
  flexShrink: 0,
} as const;

const footerOverlay = {
  background:
    'linear-gradient(180deg, rgba(12, 28, 39, 0.72) 0%, rgba(12, 28, 39, 0.58) 50%, rgba(12, 28, 39, 0.48) 100%)',
} as const;

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '2rem',
  padding: '3rem 0 2rem',
} as const;
const brandRow = { display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff', marginBottom: '0.75rem' } as const;
const logoChip = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  borderRadius: 8,
  padding: '6px 10px',
} as const;
const blurb = { fontSize: '0.9rem', lineHeight: 1.7, color: '#9fb1bd', maxWidth: 340 } as const;
const socialRow = { display: 'flex', gap: '0.6rem', marginTop: '1rem' } as const;
const social = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 34,
  height: 34,
  borderRadius: 8,
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  textDecoration: 'none',
  fontSize: '0.95rem',
} as const;
const colTitle = { color: '#fff', fontSize: '0.95rem', margin: '0 0 1rem', letterSpacing: '0.3px' } as const;
const list = { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.6rem' } as const;
const contact = { fontStyle: 'normal', fontSize: '0.9rem', lineHeight: 1.6, color: '#9fb1bd' } as const;
const bottomBar = {
  borderTop: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(12, 28, 39, 0.72)',
} as const;
const bottomInner = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap' as const,
  gap: '0.5rem',
  padding: '1.1rem 0',
  fontSize: '0.82rem',
  color: '#8aa0ad',
};
