function isLocalBrowserHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * API origin for fetches.
 * - Local dev browser: empty string → same-origin /api (Next rewrite).
 * - Production browser: empty when NEXT_PUBLIC_API_BASE is unset → Vercel /api proxy.
 * - Server / explicit base: SERVER_API_BASE or NEXT_PUBLIC_API_BASE.
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    if (isLocalBrowserHost(window.location.hostname)) return '';
    const publicBase = process.env.NEXT_PUBLIC_API_BASE;
    if (!publicBase) return '';
    return publicBase;
  }
  return (
    process.env.SERVER_API_BASE ??
    process.env.NEXT_PUBLIC_API_BASE ??
    'http://localhost:8080'
  );
}
