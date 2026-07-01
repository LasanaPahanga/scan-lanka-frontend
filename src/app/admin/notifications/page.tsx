'use client';

import { useEffect, useState } from 'react';
import {
  AdminNotification,
  listAdminNotifications,
  resendNotification,
} from '@/lib/admin-notifications';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<AdminNotification[]>([]);
  const [status, setStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    listAdminNotifications(status)
      .then((p) => setRows(p.content))
      .catch(() => setError('Could not load notifications.'));
  }, [status]);

  async function onResend(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await resendNotification(id);
      const p = await listAdminNotifications(status);
      setRows(p.content);
    } catch {
      setError('Resend failed.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main style={adminMain}>
      <AdminPageHeader title="Email notifications" description="Outbox status — sent, retrying, or failed messages." />

      <div className="admin-filter-bar">
        {[
          { id: 'all', label: 'All' },
          { id: 'PENDING', label: 'Pending' },
          { id: 'RETRYING', label: 'Retrying' },
          { id: 'SENT', label: 'Sent' },
          { id: 'FAILED', label: 'Failed' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatus(f.id)}
            className={`admin-filter-chip${status === f.id ? ' admin-filter-chip--active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      {rows.length === 0 ? (
        <p className="admin-empty">No notifications yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>To</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => (
                <tr key={n.id}>
                  <td>{n.type}</td>
                  <td>{n.recipient}</td>
                  <td>{n.subject}</td>
                  <td>
                    <span className="admin-badge admin-badge--muted">{n.status}</span>
                    {n.lastError && <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>{n.lastError}</span>}
                  </td>
                  <td>
                    {n.status === 'FAILED' && (
                      <button
                        type="button"
                        className="admin-btn admin-btn--secondary admin-btn--sm"
                        disabled={busyId === n.id}
                        onClick={() => onResend(n.id)}
                      >
                        {busyId === n.id ? '…' : 'Resend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
