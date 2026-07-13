'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatLkr } from '@/lib/money';

export default function CartPage() {
  const { lines, priced, loading, setQuantity, remove } = useCart();

  if (loading && lines.length === 0) {
    return (
      <main style={wrap}>
        <h1 className="page-title">Your cart</h1>
        <p style={{ color: 'var(--muted)' }}>Loading cart…</p>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main style={wrap}>
        <h1 className="page-title">Your cart</h1>
        <p style={{ color: 'var(--muted)' }}>Your cart is empty.</p>
        <Link href="/products" className="btn btn-primary">
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <h1 className="page-title">Your cart</h1>
      <ul className="cart-lines" style={{ listStyle: 'none', padding: 0 }}>
        {lines.map((line) => (
          <li key={line.key} className="cart-line">
            <div className="cart-line-info">
              <div className="cart-line-name">{line.name}</div>
              {line.status === 'CAPPED' && <div className="cart-line-warning">Limited to available stock</div>}
              {line.status === 'OUT_OF_STOCK' && <div className="cart-line-warning">Out of stock</div>}
              {line.status === 'UNAVAILABLE' && <div className="cart-line-warning">No longer available</div>}
            </div>
            <div className="cart-qty" role="group" aria-label={`Quantity for ${line.name}`}>
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={line.quantity <= 1}
                onClick={() => void setQuantity(line, line.quantity - 1)}
              >
                −
              </button>
              <span className="cart-qty-value" aria-live="polite">
                {line.quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => void setQuantity(line, line.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="cart-line-total">
              {line.lineTotalCents != null ? formatLkr(line.lineTotalCents) : '-'}
            </div>
            <button type="button" className="cart-remove" onClick={() => void remove(line)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <div className="cart-summary-total">
          <span>Subtotal</span>
          <strong>{priced ? formatLkr(priced.subtotalCents) : '…'}</strong>
        </div>
        <Link href="/checkout" className="cart-checkout-btn">
          Checkout →
        </Link>
      </div>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link href="/products" className="cart-continue-link">
          ← Continue shopping
        </Link>
      </p>
    </main>
  );
}

const wrap = { maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.25rem 3.5rem' } as const;
