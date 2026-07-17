import { api } from './api';
import { getApiBase } from './api-base';

export interface AdminNotification {
  id: number;
  type: string;
  recipient: string;
  subject: string;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface AdminNotificationPage {
  content: AdminNotification[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const listAdminNotifications = (status?: string, page = 0) => {
  const q = new URLSearchParams({ page: String(page), size: '25' });
  if (status && status !== 'all') q.set('status', status);
  return api<AdminNotificationPage>(`/api/admin/notifications?${q}`);
};

export const resendNotification = (id: number) =>
  api<void>(`/api/admin/notifications/${id}/resend`, { method: 'POST' });

export async function downloadMyReceiptPdf(orderNumber: string): Promise<Blob> {
  const res = await fetch(`${getApiBase()}/api/orders/${encodeURIComponent(orderNumber)}/receipt.pdf`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Receipt download failed');
  return res.blob();
}

export async function downloadGuestReceiptPdf(orderNumber: string, email: string): Promise<Blob> {
  const res = await fetch(`${getApiBase()}/api/orders/lookup/receipt.pdf`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber, email }),
  });
  if (!res.ok) throw new Error('Receipt download failed');
  return res.blob();
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
