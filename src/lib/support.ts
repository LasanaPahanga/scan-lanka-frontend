import { CAPTCHA_TOKEN } from '@/lib/geo';
import { api } from './api';

export interface SupportMessage {
  id: number;
  sender: string;
  body: string;
  at: string;
}

export interface SupportConversation {
  id: number;
  status: string;
  visitorName: string | null;
  visitorEmail: string | null;
  customerId: number | null;
  pageContext: string | null;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SupportSummary {
  id: number;
  status: string;
  visitorName: string | null;
  visitorEmail: string | null;
  customerId: number | null;
  preview: string;
  updatedAt: string;
}

export interface StartSupportResult {
  accessToken: string;
  conversation: SupportConversation;
}

const TOKEN_KEY = 'sl_support_token';

export const getStoredSupportToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const storeSupportToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const startSupportChat = (body: {
  name?: string;
  email?: string;
  message: string;
  pageContext?: string;
}) =>
  api<StartSupportResult>('/api/support/conversations', {
    method: 'POST',
    headers: { 'X-Captcha-Token': CAPTCHA_TOKEN },
    body: JSON.stringify(body),
  });

export const fetchSupportChat = (token: string) =>
  api<SupportConversation>(`/api/support/chat/${encodeURIComponent(token)}`);

export const sendSupportMessage = (token: string, body: string) =>
  api<SupportConversation>(`/api/support/chat/${encodeURIComponent(token)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const listSupportChats = (status = 'OPEN') =>
  api<SupportSummary[]>(`/api/admin/support/conversations?status=${encodeURIComponent(status)}`);

export const getAdminSupportChat = (id: number) =>
  api<SupportConversation>(`/api/admin/support/conversations/${id}`);

export const adminReplySupport = (id: number, body: string) =>
  api<SupportConversation>(`/api/admin/support/conversations/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const closeSupportChat = (id: number) =>
  api<void>(`/api/admin/support/conversations/${id}/close`, { method: 'POST' });
