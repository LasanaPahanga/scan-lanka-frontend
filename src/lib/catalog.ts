import { api } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

export interface ProductChip {
  id: number;
  slug: string;
  name: string;
  previewImageUrl: string | null;
  priceMode: 'SINGLE' | 'VARIANT';
  priceCents: number | null;
  priceMinCents: number | null;
  priceMaxCents: number | null;
  availability: string;
}

export interface SpecOption {
  id: number;
  value: string;
}
export interface SpecGroup {
  id: number;
  name: string;
  priceAffecting: boolean;
  options: SpecOption[];
}
export interface Variant {
  id: number;
  sku: string;
  priceCents: number;
  optionsSignature: string;
  availability: string;
}
export interface ProductDetail {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  details: string | null;
  priceMode: 'SINGLE' | 'VARIANT';
  singlePriceCents: number | null;
  priceMinCents: number | null;
  priceMaxCents: number | null;
  availability: string;
  whatsappOnly: boolean;
  weightKg: number | null;
  couriable: boolean;
  imageUrls: string[];
  specGroups: SpecGroup[];
  variants: Variant[];
}
export interface ResolvedVariant {
  variantId: number;
  sku: string;
  priceCents: number;
  availability: string;
}

export interface ParentFacet {
  id: number;
  name: string;
  slug: string;
}

export interface CatalogFacets {
  parents: ParentFacet[];
  categories: string[];
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface ProductPage {
  content: ProductChip[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ProductListParams {
  q?: string;
  category?: string;
  parentId?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
  page?: number;
  size?: number;
}

/** Prefix backend-served media paths with the API base for <img src>. */
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  return path.startsWith('/') ? `${API_BASE}${path}` : path;
}

function buildQuery(params: ProductListParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.category) sp.set('category', params.category);
  if (params.parentId != null) sp.set('parentId', String(params.parentId));
  if (params.sort) sp.set('sort', params.sort);
  if (params.page != null) sp.set('page', String(params.page));
  if (params.size != null) sp.set('size', String(params.size));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

const emptyPage = (): ProductPage => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 24,
});

// Server-side reads (SSG/ISR — revalidated; global/03 §3b, 13 SEO).
export async function listProducts(params: ProductListParams = {}): Promise<ProductPage> {
  try {
    const res = await fetch(`${API_BASE}/api/products${buildQuery({ size: 24, ...params })}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return emptyPage();
    return res.json();
  } catch {
    return emptyPage();
  }
}

export async function getFacets(): Promise<CatalogFacets> {
  try {
    const res = await fetch(`${API_BASE}/api/catalog/facets`, { next: { revalidate: 60 } });
    if (!res.ok) return { parents: [], categories: [] };
    return res.json();
  } catch {
    return { parents: [], categories: [] };
  }
}

export async function getCategoryCounts(): Promise<CategoryCount[]> {
  try {
    const res = await fetch(`${API_BASE}/api/catalog/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Client-side, server-authoritative variant price.
export const resolveVariant = (productId: number, selectedOptionIds: number[]) =>
  api<ResolvedVariant>(`/api/products/${productId}/resolve-variant`, {
    method: 'POST',
    body: JSON.stringify({ selectedOptionIds }),
  });
