import { api } from './api';
import { GuestCartItem } from './cart';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

export type DeliveryMethod = 'COMPANY_LORRY' | 'COURIER';

export interface DeliveryOption {
  method: DeliveryMethod;
  available: boolean;
  reason: string | null;
  prepaidCents: number;
  courierEstimateCents: number;
  someArranged: boolean;
}

export interface DeliveryOptionsResult {
  whatsappOnly: boolean;
  postalServiceable: boolean;
  options: DeliveryOption[];
}

export interface QuoteResult {
  subtotalCents: number;
  deliveryCents: number;
  taxCents: number;
  onlineTotalCents: number;
  courierEstimateCents: number;
  approxTotalCents: number;
  someArranged: boolean;
  deliveryMethod: DeliveryMethod;
  available: boolean;
  reason: string | null;
  lineCount: number;
}

export interface PlacedResult {
  orderNumber: string;
  onlineTotalCents: number;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface Billing {
  name?: string;
  taxId?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

const toItems = (items: GuestCartItem[]) =>
  items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }));

export const fetchDeliveryOptions = (items: GuestCartItem[], postalCode: string) =>
  api<DeliveryOptionsResult>('/api/checkout/delivery-options', {
    method: 'POST',
    body: JSON.stringify({ items: toItems(items), postalCode }),
  });

export const quoteCheckout = (items: GuestCartItem[], deliveryMethod: DeliveryMethod, postalCode: string) =>
  api<QuoteResult>('/api/checkout/quote', {
    method: 'POST',
    body: JSON.stringify({ items: toItems(items), deliveryMethod, postalCode }),
  });

export async function uploadBankSlip(orderNumber: string, file: File): Promise<void> {
  const fd = new FormData();
  fd.append('orderNumber', orderNumber);
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/api/payments/bank-transfer/slip`, {
    method: 'POST',
    credentials: 'include',
    body: fd,
  });
  if (!res.ok) throw new Error('upload failed');
}

export interface InitiateResult {
  checkoutUrl: string;
  params: Record<string, string>;
}

export const initiatePayment = (orderNumber: string) =>
  api<InitiateResult>('/api/payments/payhere/initiate', {
    method: 'POST',
    body: JSON.stringify({ orderNumber }),
  });

export interface PayHereCustomer {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
}

export function submitToPayHere(result: InitiateResult, customer: PayHereCustomer) {
  const [firstName, ...rest] = customer.name.trim().split(' ');
  const fields: Record<string, string> = {
    ...result.params,
    first_name: firstName || customer.name,
    last_name: rest.join(' ') || '-',
    email: customer.email,
    phone: customer.phone,
    address: customer.address || '-',
    city: customer.city || '-',
    country: 'Sri Lanka',
  };
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = result.checkoutUrl;
  for (const [key, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value ?? '';
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export const placeOrder = (body: {
  items: GuestCartItem[];
  deliveryMethod: DeliveryMethod;
  ship: Address;
  billing?: Billing | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}) =>
  api<PlacedResult>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ ...body, items: toItems(body.items) }),
  });

export function railLabel(method: DeliveryMethod): string {
  return method === 'COMPANY_LORRY' ? 'Company lorry' : 'Courier (Citrek)';
}

export function railReason(code: string | null | undefined): string {
  switch (code) {
    case 'MIN_BILL_NOT_MET':
      return 'Order must exceed Rs 6,000 for company lorry. Add items, use courier, or contact us.';
    case 'MISSING_WEIGHT':
      return 'One or more items cannot be sent by courier (missing weight).';
    case 'NOT_SERVICEABLE_POSTAL':
      return 'We do not deliver to this postal code.';
    case 'METHOD_DISABLED':
      return 'This delivery option is currently unavailable.';
    case 'WHATSAPP_ONLY':
      return 'These items are sold via WhatsApp or quote only.';
    default:
      return code ?? 'Unavailable';
  }
}
