'use client';

import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';
import { mutedText, pageWrap } from '@/components/formStyles';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main style={pageWrap}>
          <p style={mutedText}>Loading…</p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
