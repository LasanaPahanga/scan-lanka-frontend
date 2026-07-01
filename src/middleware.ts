import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Per-request CSP with optional enforce mode (global/02 §7 — report-only → enforce). */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';
  const enforce = process.env.CSP_ENFORCE === 'true';
  const isDev = process.env.NODE_ENV !== 'production';
  // 'unsafe-eval' is only needed for the local dev server (HMR/React refresh). Gate it on the actual
  // hostname so a staging box accidentally running with NODE_ENV!=production never ships it (P1-2).
  const hostname = request.nextUrl.hostname;
  const isLocalDev =
    isDev && (hostname === 'localhost' || hostname === '127.0.0.1');

  const scriptSrc = isLocalDev
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    isLocalDev ? "connect-src 'self'" : `connect-src 'self' ${apiBase}`,
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    "form-action 'self'",
    `report-uri ${apiBase}/api/csp-report`,
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(
    enforce ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
    csp,
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
