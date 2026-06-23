export const en = {
  'nav.products': 'Products',
  'nav.contact': 'Contact',
  'nav.quote': 'Get a quote',
  'geo.indicative': 'Indicative price — you will be charged in LKR at checkout.',
  'geo.noCheckout': 'Online checkout is available for Sri Lanka delivery only.',
  'geo.country': 'Your country',
} as const;

export type MessageKey = keyof typeof en;

export function t(key: MessageKey): string {
  return en[key];
}
