import { getApiBase } from './api-base';

export interface ContentPage {
  slug: string;
  title: string;
  bodyHtml: string;
  updatedAt: string;
}

export async function fetchContent(slug: string): Promise<ContentPage | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/content/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const listContentPages = () =>
  fetch(`${getApiBase()}/api/admin/content`, {
    credentials: 'include',
  }).then((r) => (r.ok ? r.json() : []));

export const saveContentPage = (slug: string, title: string, bodyHtml: string) =>
  fetch(`${getApiBase()}/api/admin/content/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, bodyHtml }),
  }).then((r) => {
    if (!r.ok) throw new Error('Save failed');
    return r.json();
  });
