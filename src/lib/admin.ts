import { api } from './api';
import { getApiBase } from './api-base';

export interface DashboardView {
  pendingPayment: number;
  awaitingBank: number;
  paid: number;
  inFulfilment: number;
  delivered: number;
  cancelled: number;
  lowStock: { id: number; name: string; sku: string; stockQty: number }[];
}

export interface OrderSummary {
  orderNumber: string;
  status: string;
  totalCents: number;
  contactName: string;
  contactEmail: string;
  fulfilmentType: string;
  createdAt: string;
}

export interface OrderPage {
  content: OrderSummary[];
  totalElements: number;
  totalPages: number;
}

export interface OrderLine {
  id: number;
  sku: string;
  name: string;
  spec: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  status: string;
}

export interface OrderDetail {
  customerId: number | null;
  orderNumber: string;
  status: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  fulfilmentType: string;
  deliveryPayment: string;
  deliveryMethod: string; // "COMPANY_LORRY" | "COURIER" (17)
  courierEstimateCents: number; // Domex estimate, display-only - 0 for lorry orders
  subtotalCents: number;
  deliveryCents: number;
  taxCents: number;
  totalCents: number;
  deliveryCodCents: number;
  actualDeliveryCents: number | null;
  deliveryCourier: string | null;
  ship: { street: string; city: string; province: string; postalCode: string };
  lines: OrderLine[];
  timeline: { fromStatus: string | null; toStatus: string; at: string; note: string | null }[];
  payment: { method: string; status: string; slipUrl: string | null; slipReviewStatus: string | null } | null;
}

export interface ZoneView {
  id: number;
  name: string;
  baseChargeCents: number;
  perKgChargeCents: number;
  fuelPct: number;
  active: boolean;
  postalCodes: string[];
}

export interface DeliveryConfigView {
  pickFirstCents: number;
  pickNextCents: number;
  fragileSurchargeCents: number;
  oversizeSurchargeCents: number;
  dimDivisor: number;
}

export interface TaxConfigView {
  rateBps: number;
  label: string;
}

export interface SettingsView {
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  bankAccountDetails: string;
  whatsappLocal: string;
  whatsappIntl: string;
}

export const fetchDashboard = () => api<DashboardView>('/api/admin/dashboard');

export const listOrders = (view: string, q?: string, page = 0) => {
  const params = new URLSearchParams({ view, page: String(page), size: '25' });
  if (q) params.set('q', q);
  return api<OrderPage>(`/api/admin/orders?${params}`);
};

export const getOrder = (orderNumber: string) =>
  api<OrderDetail>(`/api/admin/orders/${encodeURIComponent(orderNumber)}`);

export const updateOrderStatus = (orderNumber: string, to: string, note?: string) =>
  api<void>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/status`, {
    method: 'POST',
    body: JSON.stringify({ to, note }),
  });

export const updateItemStatus = (orderNumber: string, itemId: number, to: string) =>
  api<void>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/items/${itemId}/status`, {
    method: 'POST',
    body: JSON.stringify({ to }),
  });

export const recordDeliveryActual = (orderNumber: string, actualCents: number, courier: string) =>
  api<void>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/delivery-actual`, {
    method: 'POST',
    body: JSON.stringify({ actualCents, courier }),
  });

export const resendReceipt = (orderNumber: string) =>
  api<void>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/resend-receipt`, { method: 'POST' });

export const bankConfirm = (orderNumber: string, note?: string) =>
  api<void>(`/api/admin/payments/${encodeURIComponent(orderNumber)}/bank-confirm`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });

export const bankReject = (orderNumber: string, note?: string) =>
  api<void>(`/api/admin/payments/${encodeURIComponent(orderNumber)}/bank-reject`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });

export const codReceived = (orderNumber: string) =>
  api<void>(`/api/admin/payments/${encodeURIComponent(orderNumber)}/cod-received`, { method: 'POST' });

export const listZones = () => api<ZoneView[]>('/api/admin/delivery-zones');

export const createZone = (body: Omit<ZoneView, 'id'>) =>
  api<ZoneView>('/api/admin/delivery-zones', { method: 'POST', body: JSON.stringify(body) });

export const updateZone = (id: number, body: Omit<ZoneView, 'id'>) =>
  api<ZoneView>(`/api/admin/delivery-zones/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteZone = (id: number) =>
  api<void>(`/api/admin/delivery-zones/${id}`, { method: 'DELETE' });

export interface DispatchSummary {
  orderNumber: string;
  fulfilmentType: string;
  deliveryPayment: string;
  ship: { street: string; city: string; province: string; postalCode: string };
  totalCents: number;
  deliveryCodCents: number;
  lines: { sku: string; name: string; quantity: number; handlingClass: string }[];
}

export const fetchDispatchSummary = (orderNumber: string) =>
  api<DispatchSummary>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/dispatch-summary`);

export const listCustomerOrders = (customerId: number) =>
  api<OrderSummary[]>(`/api/admin/orders/customers/${customerId}`);

export const getDeliveryConfig = () => api<DeliveryConfigView>('/api/admin/delivery-config');
export const putDeliveryConfig = (body: DeliveryConfigView) =>
  api<DeliveryConfigView>('/api/admin/delivery-config', { method: 'PUT', body: JSON.stringify(body) });

export const getTaxConfig = () => api<TaxConfigView>('/api/admin/tax-config');
export const putTaxConfig = (body: TaxConfigView) =>
  api<TaxConfigView>('/api/admin/tax-config', { method: 'PUT', body: JSON.stringify(body) });

export const getSettings = () => api<SettingsView>('/api/admin/settings');
export const putSettings = (body: Partial<SettingsView>) =>
  api<SettingsView>('/api/admin/settings', { method: 'PUT', body: JSON.stringify(body) });

export async function downloadAdminReceipt(orderNumber: string): Promise<Blob> {
  const res = await fetch(`${getApiBase()}/api/admin/orders/${encodeURIComponent(orderNumber)}/receipt.pdf`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Download failed');
  return res.blob();
}

export interface RefundView {
  id: number;
  amountCents: number;
  method: string;
  reason: string | null;
  gatewayRef: string | null;
  status: string;
  createdAt: string;
  lines: { itemId: number; quantity: number; disposition: string }[];
}

export interface StepUpBody {
  password?: string;
  totp?: string;
}

export const cancelOrder = (orderNumber: string, body: StepUpBody & { reason?: string; note?: string }) =>
  api<void>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/cancel`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const listRefunds = (orderNumber: string) =>
  api<RefundView[]>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/refunds`);

export const recordRefund = (
  orderNumber: string,
  body: StepUpBody & {
    amountCents: number;
    method: string;
    reason?: string;
    gatewayRef?: string;
    idempotencyKey?: string;
    items?: { itemId: number; quantity: number; disposition: string }[];
  },
) =>
  api<RefundView>(`/api/admin/orders/${encodeURIComponent(orderNumber)}/refunds`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
