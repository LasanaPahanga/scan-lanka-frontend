import type { MetadataRoute } from 'next';
import { siteBase } from '@/lib/site';

const base = siteBase();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/login',
        '/register',
        '/account',
        '/account/',
        '/cart',
        '/checkout',
        '/checkout/',
        '/wishlist',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/orders/lookup',
        '/quotes/',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
