import { api } from './api';
import { safeServerFetch } from './server-fetch';

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
export interface ProductImageRef {
  url: string;
  variantId: number | null; // null = product-level default image
}
export interface ProductDetail {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  details: string | null;
  category?: string | null;
  parentProductId?: number | null;
  priceMode: 'SINGLE' | 'VARIANT';
  singlePriceCents: number | null;
  priceMinCents: number | null;
  priceMaxCents: number | null;
  availability: string;
  whatsappOnly: boolean;
  boardSizeTier: 'UNDER_2FT' | 'BETWEEN_2FT_6FT' | null;
  couriable: boolean;
  imageUrls: ProductImageRef[];
  specGroups: SpecGroup[];
  variants: Variant[];
}
export interface ResolvedVariant {
  variantId: number;
  sku: string;
  priceCents: number;
  availability: string;
  whatsappOnly: boolean;
  boardSizeTier: 'UNDER_2FT' | 'BETWEEN_2FT_6FT' | null;
  couriable: boolean;
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

/**
 * Media URL for <img src>. Backend paths (/api/media/...) are left relative so the browser loads them
 * same-origin through the /api proxy (Next rewrite in dev, Vercel proxy in prod) — an absolute cross-
 * origin URL is blocked by the page CSP (img-src 'self'). External URLs pass through unchanged.
 */
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  return path;
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
  const res = await safeServerFetch(`/api/products${buildQuery({ size: 24, ...params })}`, 60);
  if (!res?.ok) return emptyPage();
  try {
    return await res.json();
  } catch {
    return emptyPage();
  }
}

export async function getFacets(): Promise<CatalogFacets> {
  const res = await safeServerFetch('/api/catalog/facets', 60);
  if (!res?.ok) return { parents: [], categories: [] };
  try {
    return await res.json();
  } catch {
    return { parents: [], categories: [] };
  }
}

export async function getCategoryCounts(): Promise<CategoryCount[]> {
  const res = await safeServerFetch('/api/catalog/categories', 60);
  if (!res?.ok) return [];
  try {
    return await res.json();
  } catch {
    return [];
  }
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const res = await safeServerFetch(`/api/products/${encodeURIComponent(slug)}`, 60);
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Same-category products for the PDP "Recommended" strip (home uses the same browse filter).
 * Falls back to sibling products under the same parent when category is empty.
 */
export async function getRelatedProducts(
  product: Pick<ProductDetail, 'id' | 'category' | 'parentProductId'>,
  limit = 4,
): Promise<ProductChip[]> {
  const fetchPool = async (params: ProductListParams) =>
    (await listProducts({ ...params, size: limit + 1 })).content.filter((p) => p.id !== product.id).slice(0, limit);

  if (product.category?.trim()) {
    const byCategory = await fetchPool({ category: product.category.trim() });
    if (byCategory.length > 0) return byCategory;
  }
  if (product.parentProductId != null) {
    return fetchPool({ parentId: product.parentProductId });
  }
  return [];
}

// Client-side, server-authoritative variant price.
export const resolveVariant = (productId: number, selectedOptionIds: number[]) =>
  api<ResolvedVariant>(`/api/products/${productId}/resolve-variant`, {
    method: 'POST',
    body: JSON.stringify({ selectedOptionIds }),
  });

/** Client-side product search (quote form, etc.). */
export const searchProducts = (q: string, size = 8) =>
  api<ProductPage>(`/api/products${buildQuery({ q, size })}`);
