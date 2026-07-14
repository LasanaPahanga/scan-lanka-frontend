const KEY = 'sl_guest_checkout_details';

// Non-sensitive fields only - never payment data (PayHere is redirect-based, so no card
// data ever touches the client anyway). Guest convenience autofill (05 FR-CHECKOUT-23).
export interface GuestCheckoutDetails {
  contact: { contactName: string; contactPhone: string; contactEmail: string };
  address: { street: string; city: string; province: string; postalCode: string };
  billing?: {
    name: string;
    taxId: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
}

export function loadGuestCheckoutDetails(): GuestCheckoutDetails | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestCheckoutDetails;
  } catch {
    return null;
  }
}

export function saveGuestCheckoutDetails(details: GuestCheckoutDetails) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(details));
  } catch {
    /* storage unavailable (private mode / quota) - autofill is a convenience only */
  }
}

export function clearGuestCheckoutDetails() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
