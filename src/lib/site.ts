/** Canonical public site URL + brand constants for SEO / Open Graph / JSON-LD. */

export const SITE_NAME = 'Scan Lanka';
export const SITE_LEGAL_NAME = 'Scan Lanka Trading Co. (Pvt) Ltd';
export const SITE_TAGLINE = 'Boards & Teaching Equipment';

export function siteBase(): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.canvasboards.lk').trim();
  return base.replace(/\/$/, '');
}

/** Absolute URL for schema.org / Open Graph (Google requires absolute image URLs). */
export function absoluteUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = siteBase();
  return pathOrUrl.startsWith('/') ? `${base}${pathOrUrl}` : `${base}/${pathOrUrl}`;
}
