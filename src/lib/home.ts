import { api, apiForm } from './api';
import type { ProductChip } from './catalog';
import { safeServerFetch } from './server-fetch';

export interface HomeBanner {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  displayOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
}

export interface HomeView {
  featured: ProductChip[];
  banners: HomeBanner[];
}

export async function fetchHome(): Promise<HomeView> {
  const res = await safeServerFetch('/api/home', 120);
  if (!res?.ok) return { featured: [], banners: [] };
  try {
    return await res.json();
  } catch {
    return { featured: [], banners: [] };
  }
}

export interface FeaturedEntry {
  productId: number;
  displayOrder: number;
}

/** Fields accepted by PUT/POST /api/admin/merch/banners */
export interface BannerInput {
  linkUrl: string | null;
  displayOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
}

export const listFeatured = () => api<FeaturedEntry[]>('/api/admin/merch/featured');

export const saveFeatured = (items: FeaturedEntry[]) =>
  api<FeaturedEntry[]>('/api/admin/merch/featured', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });

export const listBanners = () => api<HomeBanner[]>('/api/admin/merch/banners');

export const createBanner = (body: BannerInput) =>
  api<HomeBanner>('/api/admin/merch/banners', { method: 'POST', body: JSON.stringify(body) });

export const updateBanner = (id: number, body: BannerInput) =>
  api<HomeBanner>(`/api/admin/merch/banners/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteBanner = (id: number) =>
  api<void>(`/api/admin/merch/banners/${id}`, { method: 'DELETE' });

export async function uploadBannerImage(id: number, file: File): Promise<HomeBanner> {
  const form = new FormData();
  form.append('file', file);
  return apiForm<HomeBanner>(`/api/admin/merch/banners/${id}/image`, form);
}
