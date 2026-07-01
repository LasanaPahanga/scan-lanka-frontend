/** @type {import('next').NextConfig} */

// Security headers: CSP is set per-request in src/middleware.ts (nonce + report-uri).
// Set CSP_ENFORCE=true in production after soak in report-only mode (global/02 §7).

const backend = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    // Proxy API through :3000 in dev so the browser avoids cross-origin CORS/cookie issues.
    return [{ source: '/api/:path*', destination: `${backend}/api/:path*` }];
  },
};

module.exports = nextConfig;
