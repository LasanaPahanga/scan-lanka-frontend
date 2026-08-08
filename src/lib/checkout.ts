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
  paymentMethod?: 'CARD' | 'BANK'; // only when paying online
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
  return method === 'COMPANY_LORRY' ? 'Company lorry (in-house delivery)' : 'Courier (Domex)';
}

const rupees = (cents: number) => `Rs ${(cents / 100).toLocaleString('en-LK')}`;

export function railReason(code: string | null | undefined, option?: DeliveryOption): string {
  const blockers = option?.blockingItems?.join(', ') ?? 'some items';
  switch (code) {
    case 'MIN_BILL_NOT_MET':
      return option && option.addMoreCents > 0
        ? `Your order is below the minimum for company lorry. Add ${rupees(option.addMoreCents)} more, or choose courier.`
        : 'Your order is below the minimum for company lorry. Add more items, or choose courier.';
    case 'UNAVAILABLE_ITEMS':
      if (option?.method === 'COURIER') {
        return `Courier cannot deliver: ${blockers}. These items need company lorry (or contact us).`;
      }
      return `Company lorry cannot deliver to this area for: ${blockers}. Try courier, or contact us.`;
    case 'WHATSAPP_OUTER':
      return 'These large items cannot be ordered online to this outer area. Please contact us on WhatsApp to arrange company lorry delivery.';
    case 'OVERSIZE_OUTER':
      return `These items are too large for courier to this area: ${blockers}. Use company lorry if available, or contact us.`;
    case 'MISSING_SIZE_TIER':
      return 'One or more items can only go by company lorry (not courier).';
    case 'NOT_SERVICEABLE_POSTAL':
      return 'We do not deliver to this postal code. Check the code, or contact us.';
    case 'METHOD_DISABLED':
      return 'This delivery option is temporarily unavailable.';
    case 'WHATSAPP_ONLY':
      return 'These items must be ordered via WhatsApp or a quote — online checkout is not available.';
    case 'COURIER_IS_COD_ONLY':
      return 'Courier orders are paid on delivery — online card payment is not used for courier.';
    default:
      return code ?? 'This delivery option is unavailable.';
  }
}

/** Short English explanation of why Place order is still locked. */
export function checkoutBlockedReason(input: {
  postalCode: string;
  deliveryMethod: DeliveryMethod | null;
  options: DeliveryOptionsResult | null;
  quote: QuoteResult | null;
  bankSlipRequired?: boolean;
  hasSlipFile?: boolean;
}): string | null {
  const postal = input.postalCode.trim();
  if (!postal) {
    return 'Enter a valid postal code to see delivery options.';
  }
  if (!input.options) {
    return 'Checking delivery options for this postal code…';
  }
  if (input.options.whatsappOnly) {
    return 'Online checkout is not available for items in this cart. Please order on WhatsApp or request a quote.';
  }
  if (!input.options.postalServiceable) {
    return `Postal code ${postal} is not in our delivery list. Double-check the code matches your city (for example Malabe is usually 10115, not 70100).`;
  }
  const available = input.options.options.filter((o) => o.available);
  if (available.length === 0) {
    const parts = input.options.options
      .filter((o) => o.reason)
      .map((o) => `${railLabel(o.method)}: ${railReason(o.reason, o)}`);
    if (parts.length) {
      return `You cannot place this order online yet.\n\n${parts.join('\n\n')}\n\nTip: make sure the postal code matches the city. Outer-area codes block large boards from online company-lorry checkout — contact us on WhatsApp to arrange delivery.`;
    }
    return 'No delivery method is available for this cart and postal code. Check the postal code, or contact us on WhatsApp.';
  }
  if (!input.deliveryMethod) {
    return 'Select a delivery method above to continue.';
  }
  if (input.quote && !input.quote.available) {
    return railReason(input.quote.reason);
  }
  if (!input.quote) {
    return 'Calculating delivery total…';
  }
  if (input.bankSlipRequired && !input.hasSlipFile) {
    return 'Attach your bank transfer receipt (PDF or image) before placing the order.';
  }
  return null;
}
