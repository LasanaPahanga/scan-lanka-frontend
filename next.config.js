/** @type {import('next').NextConfig} */

// Security headers: CSP is set per-request in src/middleware.ts (nonce + report-uri).
// Set CSP_ENFORCE=true in production after soak in report-only mode (global/02 §7).

const devBackend = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';
const prodBackend = process.env.API_PROXY_TARGET;

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [{ source: '/api/:path*', destination: `${devBackend}/api/:path*` }];
    }
    if (prodBackend) {
      return [{ source: '/api/:path*', destination: `${prodBackend}/api/:path*` }];
    }
    return [];
  },
};

module.exports = nextConfig;
