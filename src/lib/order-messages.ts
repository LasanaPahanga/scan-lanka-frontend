import { api } from './api';

export interface OrderMessage {
  id: number;
  role: string;
  label: string;
  body: string;
  at: string;
}

export interface OrderThread {
  id: number;
  orderNumber: string;
  status: string;
  unread: number;
  messages: OrderMessage[];
}

export interface OrderThreadSummary {
  id: number;
  orderNumber: string;
  status: string;
  adminUnread: number;
  preview: string;
  lastMessageAt: string;
}

export interface OrderThreadPage {
  content: OrderThreadSummary[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface LinkedOrder {
  orderNumber: string;
  status: string;
  contactName: string;
  contactEmail: string;
  lines: { name: string; sku: string; quantity: number; lineTotalCents: number }[];
}

export interface AdminOrderThread extends OrderThread {
  adminUnread: number;
  order: LinkedOrder;
}

const guestTokenKey = (orderNumber: string) => `sl_order_msg_${orderNumber}`;

export const getStoredGuestThreadToken = (orderNumber: string): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(guestTokenKey(orderNumber));
};

export const storeGuestThreadToken = (orderNumber: string, token: string) => {
  sessionStorage.setItem(guestTokenKey(orderNumber), token);
};

export const issueGuestThreadToken = (orderNumber: string, email: string) =>
  api<{ accessToken: string; thread: OrderThread }>('/api/orders/lookup/thread-token', {
    method: 'POST',
    body: JSON.stringify({ orderNumber, email }),
  });

export const fetchCustomerOrderThread = (orderNumber: string) =>
  api<OrderThread>(`/api/orders/${encodeURIComponent(orderNumber)}/thread`);

export const postCustomerOrderMessage = (orderNumber: string, body: string) =>
  api<OrderThread>(`/api/orders/${encodeURIComponent(orderNumber)}/thread/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const fetchGuestOrderThread = (token: string) =>
  api<OrderThread>(`/api/orders/messages/${encodeURIComponent(token)}`);

export const postGuestOrderMessage = (token: string, body: string) =>
  api<OrderThread>(`/api/orders/messages/${encodeURIComponent(token)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const listAdminOrderThreads = (params: {
  status?: string;
  unread?: boolean;
  q?: string;
  page?: number;
}) => {
  const sp = new URLSearchParams();
  if (params.status) sp.set('status', params.status);
  if (params.unread) sp.set('unread', 'true');
  if (params.q) sp.set('q', params.q);
  if (params.page != null) sp.set('page', String(params.page));
  const qs = sp.toString();
  return api<OrderThreadPage>(`/api/admin/messages/threads${qs ? `?${qs}` : ''}`);
};

export const getAdminOrderThread = (id: number) =>
  api<AdminOrderThread>(`/api/admin/messages/threads/${id}`);

export const adminReplyOrderThread = (id: number, body: string) =>
  api<AdminOrderThread>(`/api/admin/messages/threads/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const closeOrderThread = (id: number) =>
  api<AdminOrderThread>(`/api/admin/messages/threads/${id}/close`, { method: 'POST' });

export const reopenOrderThread = (id: number) =>
  api<AdminOrderThread>(`/api/admin/messages/threads/${id}/reopen`, { method: 'POST' });
