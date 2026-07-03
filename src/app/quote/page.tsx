import { Suspense } from 'react';
import QuoteRequestForm from './QuoteRequestForm';
import { mutedText, pageWrap } from '@/components/formStyles';

export default function QuoteRequestPage() {
  return (
    <Suspense
      fallback={
        <main style={pageWrap}>
          <p style={mutedText}>Loading…</p>
        </main>
      }
    >
      <QuoteRequestForm />
    </Suspense>
  );
}
