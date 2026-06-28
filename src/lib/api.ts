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

let refreshInFlight: Promise<boolean> | null = null;

function shouldAttemptRefresh(path: string, retried: boolean): boolean {
  if (retried) return false;
  return !path.startsWith('/api/auth/login')
    && !path.startsWith('/api/auth/register')
    && !path.startsWith('/api/auth/refresh')
    && !path.startsWith('/api/auth/password/');
}

async function silentRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.ok)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function api<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Could not reach the server. Is the backend running?');
  }

  if (res.status === 401 && shouldAttemptRefresh(path, retried)) {
    const refreshed = await silentRefresh();
    if (refreshed) return api<T>(path, init, true);
  }

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
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/** Multipart upload (bank slip, etc.) — no JSON Content-Type. */
export async function apiForm<T>(path: string, form: FormData, retried = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  if (res.status === 401 && shouldAttemptRefresh(path, retried)) {
    const refreshed = await silentRefresh();
    if (refreshed) return apiForm<T>(path, form, true);
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, 'ERROR', message);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
