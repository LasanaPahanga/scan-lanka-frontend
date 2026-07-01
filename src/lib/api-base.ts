function isLocalBrowserHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/** API origin for browser/server fetches. Local dev browser calls use Next rewrites (same origin). */
export function getApiBase(): string {
  if (typeof window !== 'undefined' && isLocalBrowserHost(window.location.hostname)) {
    return '';
  }
  return process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';
}
