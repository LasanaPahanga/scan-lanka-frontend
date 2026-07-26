'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { formatLkr } from '@/lib/money';

/**
 * Slide-in mini-cart drawer (mobile + desktop). Opens from the right when an
 * item is added or the cart icon is tapped. "View Cart" / "Checkout" hand off
 * to the full /cart page, which carries delivery details and payment.
 */
export function MiniCart() {
  const { lines, priced, count, setQuantity, remove, drawerOpen, closeDrawer } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // Close on route change (e.g. after tapping View Cart / a product link).
  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen, closeDrawer]);

  const goToCart = () => {
    closeDrawer();
    router.push('/cart');
  };

  return (
    <>
      <div
        className={`mini-cart-backdrop${drawerOpen ? ' is-open' : ''}`}
        onClick={closeDrawer}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={`mini-cart${drawerOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!drawerOpen}
      >
        <header className="mini-cart-head">
          <div>
            <strong className="mini-cart-title">Shopping Cart</strong>
            <span className="mini-cart-count">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button type="button" className="mini-cart-close" aria-label="Close cart" onClick={closeDrawer}>
            ✕
          </button>
        </header>

        <div className="mini-cart-body">
          {lines.length === 0 ? (
            <div className="mini-cart-empty">
              <p>Your cart is empty.</p>
              <button type="button" className="btn btn-outline" onClick={() => { closeDrawer(); router.push('/products'); }}>
                Browse products
              </button>
            </div>
          ) : (
            <ul className="mini-cart-lines">
              {lines.map((line) => (
                <li key={line.key} className="mini-cart-line">
                  <div className="mini-cart-line-main">
                    <span className="mini-cart-line-name">{line.name}</span>
                    <span className="mini-cart-line-price">
                      {line.lineTotalCents != null ? formatLkr(line.lineTotalCents) : '—'}
                    </span>
                  </div>
                  <div className="mini-cart-line-controls">
                    <div className="mini-cart-qty">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => void setQuantity(line, line.quantity - 1)}
                        disabled={line.quantity <= 1}
                      >
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => void setQuantity(line, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="mini-cart-remove"
                      aria-label="Remove item"
                      onClick={() => void remove(line)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="mini-cart-foot">
            <div className="mini-cart-subtotal">
              <span>Subtotal</span>
              <strong>{priced ? formatLkr(priced.subtotalCents) : '…'}</strong>
            </div>
            <p className="mini-cart-note">Tax &amp; delivery calculated at checkout.</p>
            <button type="button" className="btn btn-primary mini-cart-checkout" onClick={goToCart}>
              Checkout
            </button>
            <button type="button" className="btn btn-outline mini-cart-viewcart" onClick={goToCart}>
              View Cart
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
