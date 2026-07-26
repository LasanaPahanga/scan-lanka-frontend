// Shared storefront contact details (header, contact page, footer copy).
export const HOTLINE = '071 781 7447';
export const EMAIL = 'scanlankagroup.info@gmail.com';

// Support hours shown on the contact page. Owner can adjust.
export const SUPPORT_HOURS = [
  '9am – 6pm on weekdays',
  '8am – 5pm on weekends & mercantile holidays',
];

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`;
export const mailtoHref = (email: string) => `mailto:${email}`;
