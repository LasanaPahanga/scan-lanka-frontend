import Link from 'next/link';
import { ContactReturnsCta } from '@/components/ContactReturnsCta';

export const metadata = {
  title: 'Returns & refunds — Scan Lanka',
  description: 'How to request a return, cancellation, or refund at Scan Lanka.',
};

export default function ReturnsPolicyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ color: 'var(--primary)' }}>Returns, cancellations &amp; refunds</h1>
      <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
        Scan Lanka handles returns, order cancellations, and refunds <strong>offline</strong> after you
        contact us. There is no self-service cancel or refund button in the app — this keeps your order
        and payment records accurate and secure.
      </p>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>How it works</h2>
        <ol style={{ color: 'var(--text)', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
          <li>Contact us by phone or WhatsApp with your order number.</li>
          <li>We agree the outcome (cancel, return, partial/full refund) with you.</li>
          <li>We process any refund through the original payment method or bank transfer.</li>
          <li>Your order history will show cancelled or refunded status for your records.</li>
        </ol>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Eligibility</h2>
        <ul style={{ color: 'var(--text)', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
          <li>Unopened, resellable items may qualify for return and restock.</li>
          <li>Damaged or customised items (e.g. glass boards) may be written off — not resold.</li>
          <li>Refunds cover amounts paid online; cash-on-delivery delivery fees are collected separately.</li>
          <li>Orders already shipped may need a return/refund rather than a simple cancellation.</li>
        </ul>
      </section>

      <ContactReturnsCta />

      <p style={{ marginTop: '2rem' }}>
        <Link href="/account/orders" style={{ color: 'var(--primary)' }}>
          View your orders
        </Link>
        {' · '}
        <Link href="/orders/lookup" style={{ color: 'var(--primary)' }}>
          Look up a guest order
        </Link>
      </p>
    </main>
  );
}
