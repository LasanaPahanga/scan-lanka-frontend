'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { submitContact } from '@/lib/contact';
import { ApiError } from '@/lib/api';
import { dangerText, fieldInput, formStack, mutedText, pageWrap, primaryButton } from '@/components/formStyles';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submitContact({ name, email, phone: phone || undefined, message });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? 'Please check your details and try again.' : 'Send failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Contact us</h1>
      <p style={mutedText}>
        Questions about products, bulk orders, or international shipping? Send a message — we typically reply
        within one business day. You can also use the WhatsApp button on any page.
      </p>

      {sent ? (
        <p style={{ marginTop: '1.5rem' }}>
          Thank you — we received your message and will get back to you soon.
        </p>
      ) : (
        <form onSubmit={onSubmit} style={formStack}>
          <input style={fieldInput} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input style={fieldInput} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={fieldInput} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea
            style={{ ...fieldInput, minHeight: 120 }}
            placeholder="How can we help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          {error && <p style={dangerText}>{error}</p>}
          <button type="submit" style={primaryButton} disabled={busy}>
            {busy ? 'Sending…' : 'Send message'}
          </button>
        </form>
      )}

      <p style={{ ...mutedText, marginTop: '1.5rem' }}>
        <Link href="/quote">Request a formal quote</Link> for bulk or international orders.
      </p>
    </main>
  );
}
