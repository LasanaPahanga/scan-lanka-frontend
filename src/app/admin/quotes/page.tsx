'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listAdminQuotes, QuoteView } from '@/lib/quotes';
import { mutedText, adminMain } from '@/components/formStyles';

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteView[]>([]);

  useEffect(() => {
    listAdminQuotes()
      .then((p) => setQuotes(p.content))
      .catch(() => setQuotes([]));
  }, []);

  return (
    <main style={adminMain}>
      <h1>Quote requests</h1>
      {quotes.length === 0 ? (
        <p style={mutedText}>No quotes yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {quotes.map((q) => (
            <li key={q.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <Link href={`/admin/quotes/${q.id}`} style={{ fontWeight: 600 }}>
                #{q.id} - {q.requesterName}
              </Link>
              <span style={mutedText}> · {q.status} · {q.country ?? '-'}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
