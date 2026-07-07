// Admin product management client (01-product-catalog §3). All calls hit /api/admin/** which is
// ADMIN-gated server-side; cookies are sent by the shared api() client.
import { api, apiForm } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

export type PriceMode = 'SINGLE' | 'VARIANT';

export interface AdminProductRow {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: string | null;
  priceMode: PriceMode;
  active: boolean;
  archived: boolean;
  stockQty: number | null;
  singlePriceCents: number | null;
  priceMinCents: number | null;
  priceMaxCents: number | null;
  previewImageUrl: string | null;
}

export interface AdminSpecOption {
  id: number;
  value: string;
}
export interface AdminSpecGroup {
  id: number;
  name: string;
  priceAffecting: boolean;
  options: AdminSpecOption[];
}
export interface AdminVariant {
  id: number;
  sku: string;
  priceCents: number;
  optionsSignature: string;
  availability: string;
  delivery: DeliveryAttrs;
}

export interface DeliveryAttrs {
  boardSizeTier: 'UNDER_2FT' | 'BETWEEN_2FT_6FT' | null; // null = not couriable (lorry only)
  lorryColomboCents: number | null;
  lorrySuburbCents: number | null;
  lorryOuterCents: number | null;
  lorryColomboGateCents: number | null; // min bill per zone (null = no gate)
  lorrySuburbGateCents: number | null;
  lorryOuterGateCents: number | null;
  lorryColomboEnabled: boolean; // per-zone lorry switch (off = lorry hidden for that zone)
  lorrySuburbEnabled: boolean;
  lorryOuterEnabled: boolean;
  lorryOuterWhatsapp: boolean; // outer lorry = contact us (glass, key holders, 6x4/8x4)
  courierOuterBlocked: boolean; // no courier to outstation/faraway (6x3/6x4/8x4)
  whatsappOnly: boolean;
}

export interface AdminProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  details: string | null;
  category: string | null;
  handlingClass: string;
  parentProductId: number | null;
  active: boolean;
  archived: boolean;
  priceMode: PriceMode;
  singlePriceCents: number | null;
  stockQty: number | null;
  delivery: DeliveryAttrs;
  imageUrls: string[];
  specGroups: AdminSpecGroup[];
  variants: AdminVariant[];
}

export interface GroupInput {
  name: string;
  priceAffecting: boolean;
  options: string[];
}
export interface VariantInput {
  optionValues: string[];
  priceCents: number;
  sku?: string | null;
  stockQty?: number | null;
}
export interface CreateProductBody {
  name: string;
  sku?: string | null;
  description?: string | null;
  details?: string | null;
  category?: string | null;
  handlingClass?: string | null;
  stockQty?: number | null;
  singlePriceCents?: number | null;
  groups?: GroupInput[];
  variants?: VariantInput[];
}
export interface UpdateProductBody {
  name?: string;
  description?: string | null;
  details?: string | null;
  category?: string | null;
  handlingClass?: string | null;
  active?: boolean;
  stockQty?: number | null;
  singlePriceCents?: number | null;
  delivery?: DeliveryAttrs;
}

export const adminListProducts = () => api<AdminProductRow[]>('/api/admin/products');

export const adminGetProduct = (id: number) => api<AdminProductDetail>(`/api/admin/products/${id}`);

export interface AdminCategoryRow {
  name: string;
  productCount: number;
}

export const adminListCategories = () => api<AdminCategoryRow[]>('/api/admin/categories');

export const adminRenameCategory = (from: string, to: string) =>
  api<{ updated: number }>('/api/admin/categories/rename', {
    method: 'PUT',
    body: JSON.stringify({ from, to }),
  });

export const previewVariants = (groups: GroupInput[]) =>
  api<{ rows: { optionValues: string[]; index: number }[] }>('/api/admin/products/variants/preview', {
    method: 'POST',
    body: JSON.stringify(groups),
  });

export const adminCreateProduct = (body: CreateProductBody) =>
  api<{ id: number }>('/api/admin/products', { method: 'POST', body: JSON.stringify(body) });

export const adminUpdateProduct = (id: number, body: UpdateProductBody) =>
  api<void>(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const adminUpdateVariantDelivery = (productId: number, variantId: number, delivery: DeliveryAttrs) =>
  api<void>(`/api/admin/products/${productId}/variants/${variantId}/delivery`, {
    method: 'PATCH',
    body: JSON.stringify({ delivery }),
  });

export const adminUpdateProductDelivery = (productId: number, delivery: DeliveryAttrs) =>
  api<void>(`/api/admin/products/${productId}/delivery`, {
    method: 'PATCH',
    body: JSON.stringify({ delivery }),
  });

/** One row per size across the whole catalog (08/17, owner 2026-07-07) — the lorry-pricing overview. */
export interface LorryPricingRow {
  productId: number;
  productName: string;
  variantId: number | null;
  sizeLabel: string | null;
  delivery: DeliveryAttrs;
}

export const adminListLorryPricing = () => api<LorryPricingRow[]>('/api/admin/products/lorry-pricing');

export const adminSetProductActive = (id: number, active: boolean) =>
  api<void>(`/api/admin/products/${id}/active`, { method: 'PATCH', body: JSON.stringify({ active }) });

export const adminDeleteProduct = (id: number) =>
  api<{ outcome: string }>(`/api/admin/products/${id}`, { method: 'DELETE' });

export interface StoredImageView {
  id: number;
  url: string;
  preview: boolean;
  variantId: number | null;
}

export const adminListProductImages = (id: number) =>
  api<StoredImageView[]>(`/api/admin/products/${id}/images`);

export function adminUploadProductImage(id: number, file: File, isPreview: boolean, variantId?: number | null) {
  const form = new FormData();
  form.append('file', file);
  const variantParam = variantId != null ? `&variantId=${variantId}` : '';
  return apiForm<StoredImageView>(`/api/admin/products/${id}/images?isPreview=${isPreview}${variantParam}`, form);
}

export const adminSetProductImagePreview = (productId: number, imageId: number) =>
  api<StoredImageView>(`/api/admin/products/${productId}/images/${imageId}/preview`, { method: 'PATCH' });

export const adminSetProductImageVariant = (productId: number, imageId: number, variantId: number | null) =>
  api<StoredImageView>(`/api/admin/products/${productId}/images/${imageId}/variant`, {
    method: 'PATCH',
    body: JSON.stringify({ variantId }),
  });

export const adminDeleteProductImage = (productId: number, imageId: number) =>
  api<void>(`/api/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' });

export type BulkImportRowStatus =
  | 'OK_VARIANT'
  | 'OK_PRODUCT'
  | 'NO_PRODUCT'
  | 'SIZE_NOT_MATCHED'
  | 'BAD_IMAGE'
  | 'NOT_AN_IMAGE';

export interface BulkImportRow {
  filename: string;
  productSlug: string;
  sizeToken: string | null;
  productId: number | null;
  productName: string | null;
  variantId: number | null;
  sizeLabel: string | null;
  status: BulkImportRowStatus;
  message: string | null;
}

export interface BulkImportReport {
  totalEntries: number;
  imageEntries: number;
  matchedVariant: number;
  matchedProduct: number;
  unmatched: number;
  rows: BulkImportRow[];
}

/** dryRun=true → preview mapping only; false → actually store the mappable images. */
export function adminBulkImportImages(zip: File, dryRun: boolean) {
  const form = new FormData();
  form.append('file', zip);
  return apiForm<BulkImportReport>(`/api/admin/products/images/bulk-import?dryRun=${dryRun}`, form);
}

/** Prefix backend-served media paths with the API base for <img src>. */
export function adminMediaUrl(path: string | null): string | null {
  if (!path) return null;
  return path.startsWith('/') ? `${API_BASE}${path}` : path;
}
