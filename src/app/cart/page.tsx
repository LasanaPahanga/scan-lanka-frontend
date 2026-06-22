'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { formatLkr } from '@/lib/money';

export default function CartPage() {
  const { items, priced, setQuantity, remove } = useCart();

  if (items.length === 0) {
    return (
      <main style={wrap}>
        <h1>Your cart</h1>
        <p style={{ color: 'var(--muted)' }}>Your cart is empty.</p>
        <Link href="/products" style={{ color: 'var(--primary)' }}>
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <h1>Your cart</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <tbody>
          {items.map((item) => {
            const line = priced?.lines.find(
              (l) => l.productId === item.productId && (l.variantId ?? null) === (item.variantId ?? null),
            );
            return (
              <tr key={`${item.productId}-${item.variantId}`} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{line?.name ?? item.name}</div>
                  {line?.status === 'CAPPED' && (
                    <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>Limited to available stock</div>
                  )}
                  {line?.status === 'OUT_OF_STOCK' && (
                    <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>Out of stock</div>
                  )}
                  {line?.status === 'UNAVAILABLE' && (
                    <div style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>No longer available</div>
                  )}
                </td>
                <td style={td}>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.productId, item.variantId, Number(e.target.value))}
                    style={{ width: 60, padding: '0.3rem' }}
                  />
                </td>
                <td style={{ ...td, textAlign: 'right' }}>{line ? formatLkr(line.lineTotalCents) : '—'}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => remove(item.productId, item.variantId)}
                    style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ textAlign: 'right', marginTop: '1.25rem', fontSize: '1.2rem' }}>
        Subtotal: <strong>{priced ? formatLkr(priced.subtotalCents) : '…'}</strong>
      </div>
      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <button type="button" onClick={() => alert('Checkout is coming in the next build phase.')} style={checkout}>
          Checkout
        </button>
      </div>
    </main>
  );
}

const wrap = { maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' } as const;
const td = { padding: '0.75rem 0.5rem', verticalAlign: 'middle' } as const;
const checkout = {
  padding: '0.7rem 1.6rem',
  background: 'var(--accent)',
  color: 'var(--primary-contrast)',
  border: 'none',
  borderRadius: 'var(--radius)',
  fontSize: '1rem',
  cursor: 'pointer',
} as const;
