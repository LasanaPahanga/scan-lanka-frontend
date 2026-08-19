/** @type {import('next').NextConfig} */

// Security headers: CSP is set per-request in src/proxy.ts (nonce + report-uri).
// Set CSP_ENFORCE=true in production after soak in report-only mode (global/02 §7).

const devBackend = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';
const prodBackend = process.env.API_PROXY_TARGET;

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    // Serve modern formats and cache optimized product images aggressively so
    // repeat views + gallery switching paint instantly. Images are same-origin
    // (/api/media/... via the rewrite above), so no remotePatterns are needed.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000, // 30 days
    qualities: [50, 65, 75, 90], // Next 16 requires explicit qualities when non-default is used
  },
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

// vercel deploy trigger 

