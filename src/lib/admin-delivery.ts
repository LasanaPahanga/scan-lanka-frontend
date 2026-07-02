import { api } from './api';

export type DeliveryMethod = 'COMPANY_LORRY' | 'COURIER';
export type CourierZone = 'CITY_LIMITS' | 'SUBURBS' | 'OUTSTATION' | 'FARAWAY';
export type BoardSizeTier = 'UNDER_2FT' | 'BETWEEN_2FT_6FT';
export type LorryZone = 'COLOMBO' | 'SUBURB' | 'OUTER';

export interface CourierRateView {
  zone: CourierZone;
  sizeTier: BoardSizeTier;
  flatCents: number;
}

export interface DeliverySettingsView {
  lorryMinBillCents: number;
}

export interface DeliveryMethodView {
  method: DeliveryMethod;
  enabled: boolean;
}

export interface PostalZoneView {
  postalCode: string;
  lorryZone: LorryZone;
  courierZone: CourierZone;
  district: string | null;
  province: string | null;
}

export const listCourierRates = () => api<CourierRateView[]>('/api/admin/courier-rate-card');

export const upsertCourierRate = (
  zone: CourierZone,
  sizeTier: BoardSizeTier,
  body: { flatCents: number },
) =>
  api<CourierRateView>(`/api/admin/courier-rate-card/${zone}/${sizeTier}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const getDeliverySettings = () => api<DeliverySettingsView>('/api/admin/delivery-settings');

export const putDeliverySettings = (body: DeliverySettingsView) =>
  api<DeliverySettingsView>('/api/admin/delivery-settings', {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const listDeliveryMethods = () => api<DeliveryMethodView[]>('/api/admin/delivery-methods');

export const setDeliveryMethod = (method: DeliveryMethod, enabled: boolean) =>
  api<DeliveryMethodView>(`/api/admin/delivery-methods/${method}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });

export const getPostalZone = (postalCode: string) =>
  api<PostalZoneView>(`/api/admin/postal-zones/${encodeURIComponent(postalCode)}`);

export const upsertPostalZone = (postalCode: string, body: Omit<PostalZoneView, 'postalCode'>) =>
  api<PostalZoneView>(`/api/admin/postal-zones/${encodeURIComponent(postalCode)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deletePostalZone = (postalCode: string) =>
  api<void>(`/api/admin/postal-zones/${encodeURIComponent(postalCode)}`, { method: 'DELETE' });

export { getTaxConfig, putTaxConfig } from './admin';
