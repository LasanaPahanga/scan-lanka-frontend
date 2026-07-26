import Link from 'next/link';
import { HOTLINE, EMAIL, SUPPORT_HOURS, telHref, mailtoHref } from '@/lib/contactInfo';

/**
 * Friendly "Contact us" hero shown above the contact form: an illustration,
 * a short intro pointing to self-serve help, and a call/email block.
 * Original inline SVG art (brand colors) — no external image needed.
 */
export function ContactHero() {
  return (
    <section className="contact-hero">
      <ContactIllustration />

      <h1 className="contact-hero-title">Contact us</h1>
      <p className="contact-hero-lead">
        Check out our <Link href="/returns">Help Center</Link> and{' '}
        <Link href="/delivery">Delivery</Link> pages to see if your question has already been
        answered. If not, please get in touch and we&apos;ll get back to you as soon as possible.
      </p>

      <div className="contact-hero-reach">
        <h2 className="contact-hero-reach-title">You can also call or email us</h2>
        <ul className="contact-hero-hours">
          {SUPPORT_HOURS.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>

        <div className="contact-hero-channels">
          <div className="contact-channel">
            <span className="contact-channel-icon" aria-hidden="true">
              <PhoneIcon />
            </span>
            <span className="contact-channel-body">
              <span className="contact-channel-label">Call us</span>
              <a href={telHref(HOTLINE)} className="contact-channel-value">
                {HOTLINE}
              </a>
            </span>
          </div>
          <div className="contact-channel-divider" aria-hidden="true" />
          <div className="contact-channel">
            <span className="contact-channel-icon" aria-hidden="true">
              <MailIcon />
            </span>
            <span className="contact-channel-body">
              <span className="contact-channel-label">Email us</span>
              <a href={mailtoHref(EMAIL)} className="contact-channel-value">
                {EMAIL}
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactIllustration() {
  return (
    <svg
      className="contact-hero-art"
      viewBox="0 0 320 180"
      role="img"
      aria-label="Illustration of a message envelope"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* soft backdrop blobs */}
      <circle cx="160" cy="92" r="70" fill="var(--primary-light)" />
      <circle cx="235" cy="60" r="10" fill="var(--primary)" opacity="0.18" />
      <circle cx="86" cy="52" r="7" fill="var(--primary)" opacity="0.16" />
      <circle cx="250" cy="120" r="5" fill="var(--primary)" opacity="0.2" />

      {/* envelope */}
      <g transform="translate(108 58)">
        <rect x="0" y="6" width="104" height="72" rx="10" fill="var(--primary)" />
        <path d="M6 14 L52 48 L98 14" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 74 L40 44" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.65" />
        <path d="M98 74 L64 44" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.65" />
      </g>

      {/* baseline */}
      <line x1="70" y1="150" x2="250" y2="150" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5c0-.6.4-1 1-1h2.4c.5 0 .9.3 1 .8l.8 3c.1.4 0 .8-.3 1L7.9 10.5a12 12 0 0 0 5.6 5.6l1.7-1.8c.3-.3.7-.4 1-.3l3 .8c.5.1.8.5.8 1V18c0 .6-.4 1-1 1A15 15 0 0 1 4 5Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
