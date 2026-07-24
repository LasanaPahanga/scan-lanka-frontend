'use client';

import { useState } from 'react';
import { uploadBankSlip } from '@/lib/checkout';
import { dangerText, mutedText, primaryButton } from '@/components/formStyles';

/**
 * Lets a customer (re)upload a bank-transfer slip after leaving the immediate post-checkout screen —
 * e.g. they need to fetch their bank app, or the first slip was rejected (T-1b review flow).
 */
export function BankSlipUpload({
  orderNumber,
  status,
  deliveryMethod,
  deliveryPayment,
  email,
}: {
  orderNumber: string;
  status: string;
  deliveryMethod: string;
  deliveryPayment: string;
  email?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const eligible =
    deliveryMethod === 'COMPANY_LORRY' &&
    deliveryPayment !== 'COD' &&
    (status === 'PENDING_PAYMENT' || status === 'BANK_SLIP_REJECTED');

  if (!eligible || uploaded) return null;

  async function onUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await uploadBankSlip(orderNumber, file, email);
      setUploaded(true);
    } catch {
      setError('Could not upload the slip. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
      <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>
        {status === 'BANK_SLIP_REJECTED' ? 'Upload a new bank transfer slip' : 'Upload your bank transfer slip'}
      </h3>
      {status === 'BANK_SLIP_REJECTED' && (
        <p style={dangerText}>Your previous slip was rejected — please upload a clearer photo of the receipt.</p>
      )}
      <p style={mutedText}>Paid by bank transfer? Upload your slip (PDF or image) here so we can confirm your order.</p>
      <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      {error && <p style={dangerText}>{error}</p>}
      <p>
        <button type="button" onClick={onUpload} disabled={!file || busy} style={primaryButton}>
          {busy ? 'Uploading…' : 'Upload slip'}
        </button>
      </p>
    </section>
  );
}
