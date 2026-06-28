'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AdminProductRow,
  adminListProducts,
  adminSetProductActive,
  adminDeleteProduct,
  adminMediaUrl,
} from '@/lib/admin-catalog';
import { formatLkr, formatRange } from '@/lib/money';
import { adminMain, mutedText, primaryButton } from '@/components/formStyles';

export default function AdminProductsPage() {
  const [rows, setRows] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  async function reload() {
    setLoading(true);
    try {
      setRows(await adminListProducts());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).sort() as string[],
    [rows],
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.sku.toLowerCase().includes(q.toLowerCase())) &&
          (!category || r.category === category),
      ),
    [rows, q, category],
  );

  async function toggleActive(r: AdminProductRow) {
    setBusyId(r.id);
    try {
      await adminSetProductActive(r.id, !r.active);
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(r: AdminProductRow) {
    if (!confirm(`Delete "${r.name}"? If it has past orders it will be archived instead.`)) return;
    setBusyId(r.id);
    try {
      const { outcome } = await adminDeleteProduct(r.id);
      if (outcome === 'ARCHIVED') alert('Product had orders - archived (hidden from the shop) instead of deleted.');
      await reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  }

  function price(r: AdminProductRow) {
    if (r.priceMode === 'SINGLE') return formatLkr(r.singlePriceCents);
    if (r.priceMinCents != null && r.priceMaxCents != null) return formatRange(r.priceMinCents, r.priceMaxCents);
    return '-';
  }

  return (
    <main style={adminMain}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          Products
        </h1>
        <Link href="/admin/products/new" style={{ ...primaryButton, width: 'auto', textDecoration: 'none' }}>
          + New product
        </Link>
      </div>
      <p style={mutedText}>Add, edit, hide or delete products. Inactive products are hidden from the shop.</p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        <input
          placeholder="Search name or SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={search}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={search}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={mutedText}>Loading…</p>
      ) : error ? (
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      ) : filtered.length === 0 ? (
        <p style={mutedText}>No products. Click “New product” to add your first one.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}></th>
                <th style={th}>Name</th>
                <th style={th}>Category</th>
                <th style={th}>Price</th>
                <th style={th}>Stock</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const img = adminMediaUrl(r.previewImageUrl);
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={td}>
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" style={thumb} />
                      ) : (
                        <div style={{ ...thumb, background: 'var(--bg-muted)' }} />
                      )}
                    </td>
                    <td style={td}>
                      <Link href={`/admin/products/${r.id}`} style={{ fontWeight: 600 }}>
                        {r.name}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.sku}</div>
                    </td>
                    <td style={td}>{r.category ?? '-'}</td>
                    <td style={td}>{price(r)}</td>
                    <td style={td}>{r.priceMode === 'VARIANT' ? '-' : r.stockQty ?? '∞'}</td>
                    <td style={td}>
                      {r.archived ? (
                        <span style={{ ...pill, background: '#fde8e8', color: '#9b1c1c' }}>Archived</span>
                      ) : r.active ? (
                        <span style={{ ...pill, background: '#e6f4ea', color: '#137333' }}>Active</span>
                      ) : (
                        <span style={{ ...pill, background: '#f1f3f4', color: '#5f6368' }}>Hidden</span>
                      )}
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <Link href={`/admin/products/${r.id}`} style={actionBtn}>
                          Edit
                        </Link>
                        {!r.archived && (
                          <button
                            type="button"
                            disabled={busyId === r.id}
                            onClick={() => toggleActive(r)}
                            style={actionBtn}
                          >
                            {r.active ? 'Hide' : 'Show'}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busyId === r.id}
                          onClick={() => remove(r)}
                          style={{ ...actionBtn, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const search = {
  padding: '0.55rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: '#fff',
  minWidth: 200,
} as const;
const table = { width: '100%', borderCollapse: 'collapse' as const, background: 'var(--surface)', fontSize: '0.9rem' };
const th = { textAlign: 'left' as const, padding: '0.6rem 0.7rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.8rem' };
const td = { padding: '0.6rem 0.7rem', verticalAlign: 'middle' as const };
const thumb = { width: 44, height: 44, objectFit: 'cover' as const, borderRadius: 6, border: '1px solid var(--border)' };
const pill = { padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 } as const;
const actionBtn = {
  padding: '0.3rem 0.6rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: '#fff',
  color: 'var(--text)',
  fontSize: '0.82rem',
  cursor: 'pointer',
  textDecoration: 'none',
} as const;
