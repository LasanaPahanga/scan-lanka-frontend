import { api } from './api';

export interface InboxItem {
  id: number;
  type: 'ORDER_MESSAGE' | 'QUOTE_REPLY' | 'STOCK_RESTOCK' | 'NEW_PRODUCT';
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  at: string;
}

export interface InboxPage {
  items: InboxItem[];
  unreadCount: number;
  page: number;
  totalPages: number;
}

export const inboxSummary = () => api<{ unreadCount: number }>('/api/inbox/summary');

export const listInbox = (page = 0) => api<InboxPage>(`/api/inbox?page=${page}`);

export const markInboxRead = (id: number) =>
  api<void>(`/api/inbox/${id}/read`, { method: 'POST' });

export const markAllInboxRead = () => api<void>('/api/inbox/read-all', { method: 'POST' });

export function inboxTypeLabel(type: InboxItem['type']): string {
  switch (type) {
    case 'ORDER_MESSAGE':
      return 'Order message';
    case 'QUOTE_REPLY':
      return 'Quote update';
    case 'STOCK_RESTOCK':
      return 'Back in stock';
    case 'NEW_PRODUCT':
      return 'New product';
    default:
      return 'Notification';
  }
}
