import { api } from './api';
import { GuestCartItem } from './cart';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

/** Uploads a bank-transfer slip (multipart) for an order (06 FR-PAY-6). */
export async function uploadBankSlip(orderNumber: string, file: File): Promise<void> {
  const fd = new FormData();
  fd.append('orderNumber', orderNumber);
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/api/payments/bank-transfer/slip`, {
    method: 'POST',
    credentials: 'include',
    body: fd, // no Content-Type — browser sets the multipart boundary
  });
  if (!res.ok) throw new Error('upload failed');
}

export interface QuoteResult {
  subtotalCents: number;
  deliveryCents: number;
  taxCents: number;
  totalCents: number;
  deliveryCodCents: number;
  serviceable: boolean;
  lineCount: number;
}

export interface PlacedResult {
  orderNumber: string;
  totalCents: number;
}

export type FulfilmentType = 'DELIVERY' | 'PICKUP_SHOP' | 'PICKUP_FACTORY';
export type DeliveryPayment = 'PREPAID' | 'COD';

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

const toItems = (items: GuestCartItem[]) =>
  items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }));

export const quoteCheckout = (
  items: GuestCartItem[],
  fulfilmentType: FulfilmentType,
  postalCode: string | null,
  deliveryPayment: DeliveryPayment,
) =>
  api<QuoteResult>('/api/checkout/quote', {
    method: 'POST',
    body: JSON.stringify({ items: toItems(items), fulfilmentType, postalCode, deliveryPayment }),
  });

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

/** Builds + auto-submits a form to PayHere's hosted checkout (redirect). Secret stays server-side. */
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
  fulfilmentType: FulfilmentType;
  deliveryPayment: DeliveryPayment;
  ship: Address | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}) =>
  api<PlacedResult>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ ...body, items: toItems(body.items) }),
  });
