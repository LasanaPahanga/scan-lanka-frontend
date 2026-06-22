// Central API client (global/09 §5: one client). Sends cookies (httpOnly auth — global/02 §2);
// never stores tokens in JS. Secrets are server-only (NEXT_PUBLIC_* is public).

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include', // send httpOnly auth cookie
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });

  if (!res.ok) {
    let code = 'ERROR';
    let message = res.statusText;
    try {
      const body = await res.json();
      code = body.code ?? code;
      message = body.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, code, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
