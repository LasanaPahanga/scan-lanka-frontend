import { api } from './api';

export interface Me {
  id: number;
  email: string;
  name: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  emailVerified: boolean;
}

// Auth is cookie-based (httpOnly) — the browser never holds the token (global/02 §2).
export const authApi = {
  me: () => api<Me>('/api/auth/me'),
  login: (email: string, password: string, totp?: string) =>
    api<Me>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, totp }) }),
  register: (email: string, password: string, name: string) =>
    api<void>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  logout: () => api<void>('/api/auth/logout', { method: 'POST' }),
};
