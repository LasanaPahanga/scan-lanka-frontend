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

/** Prefix backend-served media paths with the API base for <img src>. */
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  return path.startsWith('/') ? `${API_BASE}${path}` : path;
}

// Server-side reads (SSG/ISR — revalidated; global/03 §3b, 13 SEO).
// Resilient to the backend being down at build time → empty page now, real data on revalidation.
export async function listProducts(): Promise<ProductChip[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const page = await res.json();
    return page.content ?? [];
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
