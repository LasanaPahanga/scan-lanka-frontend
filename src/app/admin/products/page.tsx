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
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

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
      <AdminPageHeader
        title="Products"
        description="Add, edit, hide or delete products. Inactive products are hidden from the shop."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link href="/admin/products/bulk-images" className="admin-btn admin-btn--secondary admin-btn--sm">
              Bulk image import
            </Link>
            <Link href="/admin/products/new" className="admin-btn admin-btn--primary admin-btn--sm">
              + New product
            </Link>
          </div>
        }
      />

      <div className="admin-filter-bar">
        <input
          className="admin-search"
          placeholder="Search name or SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-search" style={{ maxWidth: 200 }}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="admin-empty">Loading…</p>
      ) : error ? (
        <p className="admin-alert admin-alert--error">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="admin-empty">No products. Click “New product” to add your first one.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const img = adminMediaUrl(r.previewImageUrl);
                return (
                  <tr key={r.id}>
                    <td>
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" style={thumb} />
                      ) : (
                        <div style={{ ...thumb, background: 'var(--bg-muted)' }} />
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/products/${r.id}`} style={{ fontWeight: 600 }}>
                        {r.name}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.sku}</div>
                    </td>
                    <td>{r.category ?? '-'}</td>
                    <td>{price(r)}</td>
                    <td>{r.priceMode === 'VARIANT' ? '-' : r.stockQty ?? '∞'}</td>
                    <td>
                      {r.archived ? (
                        <span className="admin-badge admin-badge--warn">Archived</span>
                      ) : r.active ? (
                        <span className="admin-badge admin-badge--success">Active</span>
                      ) : (
                        <span className="admin-badge admin-badge--muted">Hidden</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-toolbar" style={{ marginTop: 0 }}>
                        <Link href={`/admin/products/${r.id}`} className="admin-btn admin-btn--secondary admin-btn--sm">
                          Edit
                        </Link>
                        {!r.archived && (
                          <button
                            type="button"
                            className="admin-btn admin-btn--secondary admin-btn--sm"
                            disabled={busyId === r.id}
                            onClick={() => toggleActive(r)}
                          >
                            {r.active ? 'Hide' : 'Show'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger admin-btn--sm"
                          disabled={busyId === r.id}
                          onClick={() => remove(r)}
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

const thumb = { width: 44, height: 44, objectFit: 'cover' as const, borderRadius: 6, border: '1px solid var(--border)' };
