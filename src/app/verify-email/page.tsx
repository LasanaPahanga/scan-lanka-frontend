'use client';

import { Suspense } from 'react';
import VerifyEmailForm from './VerifyEmailForm';
import { mutedText, pageWrap } from '@/components/formStyles';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main style={pageWrap}>
          <p style={mutedText}>Loading…</p>
        </main>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
