import { api } from './api';

export interface Me {
  id: number;
  email: string;
  name: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  emailVerified: boolean;
  totpEnabled?: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  otpauthUrl: string;
}

// Auth is cookie-based (httpOnly) — the browser never holds the token (global/02 §2).
export const authApi = {
  me: () => api<Me>('/api/auth/me'),
  refresh: () => api<void>('/api/auth/refresh', { method: 'POST' }),
  login: (email: string, password: string, totp?: string) =>
    api<Me>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, totp }) }),
  register: (email: string, password: string, name: string) =>
    api<void>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  verifyEmail: (email: string, code: string) =>
    api<void>('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, code }) }),
  forgotPassword: (email: string) =>
    api<{ ok: boolean }>('/api/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email: string, code: string, newPassword: string) =>
    api<void>('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }),
  logout: () => api<void>('/api/auth/logout', { method: 'POST' }),
  logoutAll: () => api<void>('/api/auth/logout-all', { method: 'POST' }),
  setup2fa: () => api<TwoFactorSetup>('/api/auth/2fa/setup', { method: 'POST' }),
  enable2fa: (totp: string) =>
    api<void>('/api/auth/2fa/enable', { method: 'POST', body: JSON.stringify({ totp }) }),
};
