'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listSupportChats, SupportSummary } from '@/lib/support';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function AdminSupportPage() {
  const [items, setItems] = useState<SupportSummary[]>([]);
  const [status, setStatus] = useState('OPEN');

  const reload = () => listSupportChats(status).then(setItems).catch(() => setItems([]));

  useEffect(() => {
    void reload();
    const id = window.setInterval(() => void reload(), 8000);
    return () => window.clearInterval(id);
  }, [status]);

  return (
    <main style={adminMain}>
      <AdminPageHeader title="Customer care" description="Live chat conversations from the storefront widget." />

      <div className="admin-filter-bar">
        {(['OPEN', 'CLOSED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`admin-filter-chip${status === s ? ' admin-filter-chip--active' : ''}`}
          >
            {s === 'OPEN' ? 'Open' : 'Closed'}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="admin-empty">No {status.toLowerCase()} conversations.</p>
      ) : (
        <ul className="admin-inbox">
          {items.map((c) => (
            <li key={c.id} className="admin-inbox-item">
              <Link href={`/admin/support/${c.id}`}>
                <div className="admin-inbox-meta">
                  <strong>{c.visitorName ?? 'Visitor'}</strong>
                  {c.visitorEmail && <span className="admin-inbox-time">{c.visitorEmail}</span>}
                  <span className="admin-inbox-time">{new Date(c.updatedAt).toLocaleString()}</span>
                </div>
                <p className="admin-inbox-preview">{c.preview}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
