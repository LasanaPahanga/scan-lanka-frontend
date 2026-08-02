import type { MetadataRoute } from 'next';
import { listProducts } from '@/lib/catalog';
import { siteBase } from '@/lib/site';

const base = siteBase();

async function allProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 0;
  let totalPages = 1;
  // Cap pages so a misbehaving API cannot hang the sitemap build.
  while (page < totalPages && page < 50) {
    const result = await listProducts({ page, size: 100, sort: 'name' });
    totalPages = Math.max(1, result.totalPages || 1);
    for (const p of result.content) {
      if (p.slug) slugs.push(p.slug);
    }
    if (!result.content.length) break;
    page += 1;
  }
  return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: { path: string; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/products', changeFrequency: 'daily', priority: 0.9 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/clientele', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/delivery', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/returns', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/quote', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  try {
    const slugs = await allProductSlugs();
    for (const slug of slugs) {
      entries.push({
        url: `${base}/products/${encodeURIComponent(slug)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch {
    /* API offline at build/request time — static routes still publish */
  }

  return entries;
}
