import { NextRequest, NextResponse } from 'next/server';

// Checkout now lives inline on /cart (04 FR-CART-10, 05-checkout-delivery UI delta,
// owner 2026-07-14) - this route stays only so old links/bookmarks don't 404. A plain
// route handler (rather than a page calling next/navigation's redirect()) guarantees a
// real HTTP 307 + Location header for every client, not just one running Next's router JS.
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/cart', request.url), 307);
}
