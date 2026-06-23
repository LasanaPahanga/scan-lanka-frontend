import { CAPTCHA_TOKEN } from '@/lib/geo';
import { api } from './api';

export interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const submitContact = (body: ContactBody) =>
  api<void>('/api/contact', {
    method: 'POST',
    headers: { 'X-Captcha-Token': CAPTCHA_TOKEN },
    body: JSON.stringify(body),
  });

export interface InquiryView {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export const listInquiries = (status = 'NEW') =>
  api<InquiryView[]>(`/api/admin/inquiries?status=${encodeURIComponent(status)}`);

export const markInquiryHandled = (id: number) =>
  api<void>(`/api/admin/inquiries/${id}/handled`, { method: 'POST' });
