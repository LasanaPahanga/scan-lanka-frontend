'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGeo } from '@/components/GeoProvider';
import ProductQuotePicker, { SelectedQuoteProduct } from '@/components/ProductQuotePicker';
import { submitQuote } from '@/lib/quotes';
import { ApiError } from '@/lib/api';
import { t } from '@/lib/i18n';
import { dangerText, fieldInput, formStack, mutedText, pageWrap, primaryButton } from '@/components/formStyles';

export default function QuoteRequestForm() {
  const { geo } = useGeo();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    requesterName: '',
    email: '',
    phone: '',
    message: '',
    quantity: '1',
  });
  const [selectedProduct, setSelectedProduct] = useState<SelectedQuoteProduct | null>(null);
  const [customProductName, setCustomProductName] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const productId = searchParams.get('productId');
    const name = searchParams.get('name');
    if (productId && name) {
      setSelectedProduct({ productId: Number(productId), name: decodeURIComponent(name) });
      setCustomProductName('');
    }
  }, [searchParams]);

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
        phone: form.phone,
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
      <h1 style={{ color: 'var(--primary)' }}>Request a quote</h1>
      <p style={mutedText}>
        {t('geo.noCheckout')} Use this form for bulk, wholesale, or international orders - especially if you
        are visiting from outside Sri Lanka ({geo.country}).
      </p>
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
        <input
          style={fieldInput}
          placeholder="Phone / WhatsApp"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
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
