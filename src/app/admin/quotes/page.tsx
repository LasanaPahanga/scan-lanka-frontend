'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { listAdminQuotes, QuoteView } from '@/lib/quotes';
import { formatLkr } from '@/lib/money';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

const STATUS_FILTERS = [
  { id: '', label: 'All' },
  { id: 'NEW', label: 'New' },
  { id: 'NEGOTIATING', label: 'Negotiating' },
  { id: 'QUOTED', label: 'Quoted' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'EXPIRED', label: 'Expired' },
] as const;

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'NEW':
    case 'QUOTED':
      return 'admin-badge admin-badge--primary';
    case 'NEGOTIATING':
      return 'admin-badge admin-badge--warn';
    case 'ACCEPTED':
      return 'admin-badge admin-badge--success';
    default:
      return 'admin-badge admin-badge--muted';
  }
}

function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function itemsSummary(items: QuoteView['items']): string {
  if (items.length === 0) return '—';
  const text = items.map((i) => `${i.name} ×${i.quantity}`).join(', ');
  return text.length > 72 ? `${text.slice(0, 69)}…` : text;
}

export default function AdminQuotesPage() {
  const [status, setStatus] = useState('');
  const [quotes, setQuotes] = useState<QuoteView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listAdminQuotes(status || undefined)
      .then((p) => setQuotes(p.content))
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  }, [status]);

  const counts = useMemo(() => {
    const open = quotes.filter((q) => ['NEW', 'NEGOTIATING', 'QUOTED'].includes(q.status)).length;
    return { total: quotes.length, open };
  }, [quotes]);

  return (
    <main style={adminMain}>
      <AdminPageHeader
        title="Quote requests"
        description="Bulk, wholesale, and international quote negotiations from the storefront."
      />

      <div className="admin-stat-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{counts.total}</div>
          <div className="admin-stat-label">{status ? 'In this view' : 'Total shown'}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{counts.open}</div>
          <div className="admin-stat-label">Awaiting action</div>
        </div>
      </div>

      <div className="admin-filter-bar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id || 'all'}
            type="button"
            onClick={() => setStatus(f.id)}
            className={`admin-filter-chip${status === f.id ? ' admin-filter-chip--active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-empty">Loading quotes…</p>
      ) : quotes.length === 0 ? (
        <p className="admin-empty">No quote requests in this view.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quote</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Status</th>
                <th>Country</th>
                <th style={{ textAlign: 'right' }}>Quoted</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id}>
                  <td>
                    <Link href={`/admin/quotes/${q.id}`}>#{q.id}</Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{q.requesterName}</div>
                    <div className="admin-inbox-time">{q.email}</div>
                  </td>
                  <td style={{ maxWidth: 280, color: 'var(--muted)' }}>{itemsSummary(q.items)}</td>
                  <td>
                    <span className={statusBadgeClass(q.status)}>{formatStatus(q.status)}</span>
                  </td>
                  <td>{q.country ?? '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {q.quotedTotalCents != null ? formatLkr(q.quotedTotalCents) : '—'}
                  </td>
                  <td className="admin-inbox-time">{new Date(q.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
