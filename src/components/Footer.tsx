import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer" style={footer}>
      <div className="footer-overlay" style={footerOverlay}>
        <div className="container footer-grid" style={grid}>
          <div className="footer-brand">
            <div className="footer-brand-row" style={brandRow}>
              <span style={logoChip}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Scan Lanka" className="footer-logo" style={{ height: 34, width: 'auto', display: 'block' }} />
              </span>
              <strong className="footer-company-name">Scan Lanka Trading Co. (Pvt) Ltd</strong>
            </div>
            <p className="footer-blurb" style={blurb}>
              Sri Lanka&apos;s leading manufacturer and supplier of boards and teaching equipment since
              1998 - whiteboards, notice boards, carrom boards, easels and more, delivered island-wide.
            </p>
            <div style={socialRow}>
              <a href="https://www.facebook.com/scanwhiteboards/" target="_blank" rel="noreferrer" style={social} aria-label="Facebook">
                f
              </a>
              <a href="https://www.instagram.com/scanlanka_official1/" target="_blank" rel="noreferrer" style={social} aria-label="Instagram">
                ◎
              </a>
              <a href="https://www.tiktok.com/@scan_lankaofficial" target="_blank" rel="noreferrer" style={social} aria-label="TikTok">
                ♪
              </a>
            </div>
          </div>

          <div className="footer-links-row">
            <div className="footer-col">
              <h4 style={colTitle}>Quick Links</h4>
              <ul style={list}>
                <li>
                  <Link href="/products" className="footer-link">
                    Our Products
                  </Link>
                </li>
                <li>
                  <Link href="/quote" className="footer-link">
                    Request a Quote
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="footer-link">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/clientele" className="footer-link">
                    Clientele
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="footer-link">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 style={colTitle}>Customer Care</h4>
              <ul style={list}>
                <li>
                  <Link href="/delivery" className="footer-link">
                    Delivery
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="footer-link">
                    Returns &amp; Refunds
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="footer-link">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="footer-link">
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-col footer-contact">
            <h4 style={colTitle}>Get in Touch</h4>
            <address style={contact}>
              No 385, Kaduwela Road,
              <br />
              Malabe, Sri Lanka.
              <br />
              <br />
              <a href="tel:0717817447" className="footer-link">
                Hotline: 071 781 7447
              </a>
              <br />
              <a href="https://wa.me/94717817447" className="footer-link" target="_blank" rel="noreferrer">
                WhatsApp: 071 781 7447
              </a>
              <br />
              <a href="tel:0714307685" className="footer-link">
                Phone: 071 430 7685
              </a>
              <br />
              <a href="mailto:scanlankagroup.info@gmail.com" className="footer-link">
                scanlankagroup.info@gmail.com
              </a>
            </address>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar" style={bottomBar}>
        <div className="container footer-bottom-inner" style={bottomInner}>
          <span>© {new Date().getFullYear()} Scan Lanka Trading Co. (Pvt) Ltd. All rights reserved.</span>
          <span className="footer-payments" style={{ opacity: 0.7 }}>
            Secure checkout · PayHere · Bank transfer · Cash on delivery
          </span>
        </div>
      </div>
    </footer>
  );
}

const footer = {
  backgroundColor: '#161616',
  backgroundImage: 'url(/footer.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center bottom',
  backgroundRepeat: 'no-repeat',
  color: '#d0d0d0',
  flexShrink: 0,
} as const;

// Neutral dark overlay (owner 2026-07-26: remove the blue cast). Slightly stronger
// so any blue in the footer.png photo underneath reads neutral too.
const footerOverlay = {
  background:
    'linear-gradient(180deg, rgba(18, 18, 18, 0.82) 0%, rgba(18, 18, 18, 0.72) 50%, rgba(18, 18, 18, 0.66) 100%)',
} as const;

const grid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.15fr)',
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
  flexShrink: 0,
} as const;
const blurb = { fontSize: '0.9rem', lineHeight: 1.7, color: '#a6a6a6', maxWidth: 340, margin: 0 } as const;
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
const contact = { fontStyle: 'normal', fontSize: '0.9rem', lineHeight: 1.6, color: '#a6a6a6' } as const;
const bottomBar = {
  borderTop: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(18, 18, 18, 0.82)',
} as const;
const bottomInner = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap' as const,
  gap: '0.5rem',
  padding: '1.1rem 0',
  fontSize: '0.82rem',
  color: '#9a9a9a',
};
