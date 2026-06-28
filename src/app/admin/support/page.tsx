'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listSupportChats, SupportSummary } from '@/lib/support';
import { adminMain, mutedText } from '@/components/formStyles';

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
      <h1>Customer care</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['OPEN', 'CLOSED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: status === s ? 'var(--primary-light)' : 'var(--surface)',
              fontWeight: status === s ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            {s === 'OPEN' ? 'Open' : 'Closed'}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p style={mutedText}>No {status.toLowerCase()} conversations.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((c) => (
            <li key={c.id} style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0' }}>
              <Link href={`/admin/support/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <strong>{c.visitorName ?? 'Visitor'}</strong>
                {c.visitorEmail ? ` - ${c.visitorEmail}` : ''}
                <p style={{ ...mutedText, margin: '0.25rem 0' }}>{new Date(c.updatedAt).toLocaleString()}</p>
                <p style={{ margin: 0 }}>{c.preview}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
