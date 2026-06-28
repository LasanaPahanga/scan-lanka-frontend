import Link from 'next/link';
import { ContactForm } from '@/components/ContactForm';
import { EditableHtml } from '@/components/EditableHtml';
import { mutedText, pageWrap } from '@/components/formStyles';

export const revalidate = 300;

export const metadata = {
  title: 'Contact us - Scan Lanka',
  description: 'Questions about products, bulk orders or international shipping? Get in touch with Scan Lanka.',
};

export default function ContactPage() {
  return (
    <main style={pageWrap}>
      <h1 style={{ color: 'var(--primary)' }}>Contact us</h1>
      <EditableHtml slug="contact" className="prose">
        <p style={mutedText}>
          Questions about products, bulk orders, or international shipping? Send a message - we typically reply
          within one business day. You can also use the WhatsApp button on any page.
        </p>
      </EditableHtml>

      <ContactForm />

      <p style={{ ...mutedText, marginTop: '1.5rem' }}>
        <Link href="/quote">Request a formal quote</Link> for bulk or international orders.
      </p>
    </main>
  );
}
