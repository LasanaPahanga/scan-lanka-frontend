'use client';

import { useEffect, useState } from 'react';
import { listInquiries, markInquiryHandled, InquiryView } from '@/lib/contact';
import { mutedText, adminMain } from '@/components/formStyles';

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<InquiryView[]>([]);

  const reload = () => listInquiries('NEW').then(setItems).catch(() => setItems([]));

  useEffect(() => {
    void reload();
  }, []);

  return (
    <main style={adminMain}>
      <h1>Contact inquiries</h1>
      {items.length === 0 ? (
        <p style={mutedText}>No new inquiries.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((i) => (
            <li key={i.id} style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0' }}>
              <strong>{i.name}</strong> - {i.email} {i.phone ? `· ${i.phone}` : ''}
              <p style={mutedText}>{new Date(i.createdAt).toLocaleString()}</p>
              <p>{i.message}</p>
              <button type="button" onClick={() => markInquiryHandled(i.id).then(reload)}>
                Mark handled
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
