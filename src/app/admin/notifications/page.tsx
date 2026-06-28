'use client';

import { useEffect, useState } from 'react';
import {
  AdminNotification,
  listAdminNotifications,
  resendNotification,
} from '@/lib/admin-notifications';
import { mutedText, adminMain } from '@/components/formStyles';

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
      <h1>Email notifications</h1>
      <p style={mutedText}>Outbox status - sent, retrying, or failed messages.</p>
      <label style={{ display: 'block', margin: '1rem 0' }}>
        Filter:{' '}
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="PENDING">Pending</option>
          <option value="RETRYING">Retrying</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
        </select>
      </label>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
        <thead>
          <tr>
            <th align="left">Type</th>
            <th align="left">To</th>
            <th align="left">Subject</th>
            <th align="left">Status</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n.id} style={{ borderTop: '1px solid var(--border)' }}>
              <td>{n.type}</td>
              <td>{n.recipient}</td>
              <td>{n.subject}</td>
              <td>
                {n.status}
                {n.lastError && (
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {n.lastError}
                  </span>
                )}
              </td>
              <td>
                {n.status === 'FAILED' && (
                  <button type="button" disabled={busyId === n.id} onClick={() => onResend(n.id)}>
                    {busyId === n.id ? '…' : 'Resend'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p style={mutedText}>No notifications yet.</p>}
    </main>
  );
}
