import { api } from './api';
import { getApiBase } from './api-base';
import { GuestCartItem } from './cart';

export type DeliveryMethod = 'COMPANY_LORRY' | 'COURIER';
export type PaymentChoice = 'ONLINE' | 'COD';

export interface DeliveryOption {
  method: DeliveryMethod;
  available: boolean;
  reason: string | null;
  prepaidCents: number;
  courierEstimateCents: number;
  someArranged: boolean;
  addMoreCents: number; // MIN_BILL_NOT_MET: how much more unlocks the lorry
  blockingItems: string[]; // OVERSIZE_OUTER / UNAVAILABLE_ITEMS: the item names in the way
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

export const fetchDeliveryOptions = (items: GuestCartItem[], postalCode: string, city?: string) =>
  api<DeliveryOptionsResult>('/api/checkout/delivery-options', {
    method: 'POST',
    body: JSON.stringify({ items: toItems(items), postalCode, city: city?.trim() || undefined }),
  });

export const quoteCheckout = (
  items: GuestCartItem[],
  deliveryMethod: DeliveryMethod,
  postalCode: string,
  city?: string,
) =>
  api<QuoteResult>('/api/checkout/quote', {
    method: 'POST',
    body: JSON.stringify({ items: toItems(items), deliveryMethod, postalCode, city: city?.trim() || undefined }),
  });

export async function uploadBankSlip(orderNumber: string, file: File, email?: string): Promise<void> {
  const fd = new FormData();
  fd.append('orderNumber', orderNumber);
  fd.append('file', file);
  if (email) fd.append('email', email);
  const res = await fetch(`${getApiBase()}/api/payments/bank-transfer/slip`, {
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
  paymentChoice?: PaymentChoice; // lorry only: ONLINE (default) or COD; courier is always COD
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
  return method === 'COMPANY_LORRY' ? 'Company lorry' : 'Courier (Domex)';
}

const rupees = (cents: number) => `Rs ${(cents / 100).toLocaleString('en-LK')}`;

export function railReason(code: string | null | undefined, option?: DeliveryOption): string {
  switch (code) {
    case 'MIN_BILL_NOT_MET':
      return option && option.addMoreCents > 0
        ? `Add ${rupees(option.addMoreCents)} more to unlock company lorry delivery, or use the courier.`
        : 'Order is below the minimum bill for company lorry. Add items or use the courier.';
    case 'UNAVAILABLE_ITEMS':
      return `Company lorry is not available to your area for: ${
        option?.blockingItems.join(', ') ?? 'some items'
      }. Use the courier instead.`;
    case 'WHATSAPP_OUTER':
      return 'Lorry delivery to your area for these items is arranged separately - please contact us.';
    case 'OVERSIZE_OUTER':
      return `Too large for courier to your area: ${
        option?.blockingItems.join(', ') ?? 'some items'
      }. Remove them, use the company lorry, or contact us.`;
    case 'MISSING_SIZE_TIER':
      return 'One or more items cannot be sent by courier (lorry delivery only).';
    case 'NOT_SERVICEABLE_POSTAL':
      return 'We do not deliver to this postal code.';
    case 'METHOD_DISABLED':
      return 'This delivery option is currently unavailable.';
    case 'WHATSAPP_ONLY':
      return 'These items are sold via WhatsApp or quote only.';
    case 'COURIER_IS_COD_ONLY':
      return 'Courier orders are paid on delivery - online payment is not available.';
    default:
      return code ?? 'Unavailable';
  }
}
