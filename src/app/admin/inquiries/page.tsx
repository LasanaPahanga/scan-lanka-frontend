'use client';

import { useEffect, useState } from 'react';
import { listInquiries, markInquiryHandled, InquiryView } from '@/lib/contact';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<InquiryView[]>([]);

  const reload = () => listInquiries('NEW').then(setItems).catch(() => setItems([]));

  useEffect(() => {
    void reload();
  }, []);

  return (
    <main style={adminMain}>
      <AdminPageHeader title="Contact inquiries" description="Messages submitted through the contact form." />

      {items.length === 0 ? (
        <p className="admin-empty">No new inquiries.</p>
      ) : (
        items.map((i) => (
          <AdminSection key={i.id} title={`${i.name} · ${i.email}`}>
            {i.phone && <p>{i.phone}</p>}
            <p className="admin-inbox-time">{new Date(i.createdAt).toLocaleString()}</p>
            <p>{i.message}</p>
            <div className="admin-toolbar">
              <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => markInquiryHandled(i.id).then(reload)}>
                Mark handled
              </button>
            </div>
          </AdminSection>
        ))
      )}
    </main>
  );
}
