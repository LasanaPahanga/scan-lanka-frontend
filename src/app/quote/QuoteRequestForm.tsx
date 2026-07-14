'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGeo } from '@/components/GeoProvider';
import { fetchWhatsApp } from '@/lib/geo';
import ProductQuotePicker, { SelectedQuoteProduct } from '@/components/ProductQuotePicker';
import { submitQuote } from '@/lib/quotes';
import { ApiError } from '@/lib/api';
import { t } from '@/lib/i18n';
import { dangerText, fieldInput, formStack, mutedText, pageWrap, primaryButton } from '@/components/formStyles';

const CONTACT_EMAIL = 'scanlankagroup.info@gmail.com';

// A short, common set of dialing codes - Sri Lanka defaults first since most requesters are
// local institutions; the rest cover the international/foreign buyers this form also serves.
const COUNTRY_CODES = [
  { code: '+94', label: '🇱🇰 +94 (Sri Lanka)' },
  { code: '+91', label: '🇮🇳 +91 (India)' },
  { code: '+44', label: '🇬🇧 +44 (UK)' },
  { code: '+1', label: '🇺🇸/🇨🇦 +1 (US/Canada)' },
  { code: '+61', label: '🇦🇺 +61 (Australia)' },
  { code: '+971', label: '🇦🇪 +971 (UAE)' },
  { code: '+65', label: '🇸🇬 +65 (Singapore)' },
] as const;

export default function QuoteRequestForm() {
  const { geo } = useGeo();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    requesterName: '',
    email: '',
    countryCode: '+94',
    phone: '',
    message: '',
    quantity: '1',
  });
  const [selectedProduct, setSelectedProduct] = useState<SelectedQuoteProduct | null>(null);
  const [customProductName, setCustomProductName] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [whatsappHref, setWhatsappHref] = useState<string | null>(null);

  useEffect(() => {
    const productId = searchParams.get('productId');
    const name = searchParams.get('name');
    if (productId && name) {
      setSelectedProduct({ productId: Number(productId), name: decodeURIComponent(name) });
      setCustomProductName('');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchWhatsApp(geo.country, 'quote')
      .then((w) => {
        const num = w.number.replace(/\D/g, '');
        setWhatsappHref(`https://wa.me/94${num.replace(/^0/, '')}?text=${encodeURIComponent(w.prefill)}`);
      })
      .catch(() => setWhatsappHref(null));
  }, [geo.country]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const hasProduct = selectedProduct != null || customProductName.trim().length > 0;
    if (!hasProduct) {
      setError('Search for a product or describe what you need.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await submitQuote({
        requesterName: form.requesterName,
        email: form.email,
        phone: `${form.countryCode}${form.phone.replace(/\D/g, '')}`,
        countryCode: form.countryCode,
        country: geo.country,
        message: form.message || undefined,
        items: [
          selectedProduct
            ? { productId: selectedProduct.productId, quantity: Number(form.quantity) }
            : { name: customProductName.trim(), quantity: Number(form.quantity) },
        ],
      });
      setToken(res.accessToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Submit failed. Check your details and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (token) {
    return (
      <main style={pageWrap}>
        <h1>Quote submitted</h1>
        <p style={mutedText}>
          We&apos;ll respond by email or phone. You can follow the negotiation here:{' '}
          <Link href={`/quotes/${token}`}>view your quote thread</Link>.
        </p>
      </main>
    );
  }

  return (
    <main style={pageWrap}>
      <h1 className="quote-hero-title" style={{ color: 'var(--primary)' }}>
        Request a Bulk / Special Order
      </h1>
      <p style={mutedText}>
        {t('geo.noCheckout')} Use this form for bulk, wholesale, or custom orders - locally or from
        anywhere in the world. Visiting from outside Sri Lanka ({geo.country})? You&apos;re very welcome
        to request a quote here too.
      </p>

      <div className="quote-contact-row">
        {whatsappHref && (
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="quote-contact-icon" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
            <WhatsAppGlyph />
            <span>WhatsApp</span>
          </a>
        )}
        <a href={`mailto:${CONTACT_EMAIL}`} className="quote-contact-icon" aria-label="Email us" title="Email us">
          <MailGlyph />
          <span>Email</span>
        </a>
        <a href={`tel:${geo.whatsappNumber.replace(/\D/g, '')}`} className="quote-contact-icon" aria-label="Call us" title="Call us">
          <PhoneGlyph />
          <span>Call</span>
        </a>
      </div>

      <form onSubmit={onSubmit} style={formStack}>
        <input
          style={fieldInput}
          placeholder="Company / name"
          value={form.requesterName}
          onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
          required
        />
        <input
          style={fieldInput}
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            style={{ ...fieldInput, width: 'auto', flex: '0 0 auto' }}
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            aria-label="Country code"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            style={{ ...fieldInput, flex: '1 1 auto' }}
            placeholder="Phone / WhatsApp number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        <ProductQuotePicker
          selected={selectedProduct}
          customName={customProductName}
          onSelect={setSelectedProduct}
          onCustomNameChange={setCustomProductName}
        />
        <input
          style={fieldInput}
          type="number"
          min={1}
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          required
        />
        <textarea
          style={{ ...fieldInput, minHeight: 100 }}
          placeholder="Message (optional) — size, delivery country, deadline, etc."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        {error && <p style={dangerText}>{error}</p>}
        <button type="submit" style={primaryButton} disabled={busy}>
          {busy ? 'Submitting…' : 'Submit quote request'}
        </button>
      </form>
      <p style={{ ...mutedText, marginTop: '1rem' }}>
        <Link href="/products">Browse products</Link> · <Link href="/contact">Contact us</Link> for general questions.
      </p>
    </main>
  );
}

const glyphProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function WhatsAppGlyph() {
  return (
    <svg {...glyphProps} fill="currentColor" stroke="none">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z" />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg {...glyphProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg {...glyphProps}>
      <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2Z" />
    </svg>
  );
}
