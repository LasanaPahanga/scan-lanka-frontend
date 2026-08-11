/** Canonical public site URL + brand constants for SEO / Open Graph / JSON-LD. */

/** Company brand (UI, JSON-LD, legal). Not the Google search title. */
export const SITE_NAME = 'Scan Lanka';
export const SITE_LEGAL_NAME = 'Scan Lanka Trading Co. (Pvt) Ltd';
export const SITE_TAGLINE = 'Boards & Teaching Equipment';

/** Shown in browser tabs / Google search result titles (not the on-page logo/header). */
export const SITE_SEO_NAME = 'Whiteboard Online Store';
export const SITE_DEFAULT_TITLE = `${SITE_SEO_NAME} | ${SITE_TAGLINE}`;

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
