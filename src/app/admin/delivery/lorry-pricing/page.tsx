'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  DeliveryAttrs,
  LorryPricingRow,
  adminListLorryPricing,
  adminUpdateProductDelivery,
  adminUpdateVariantDelivery,
} from '@/lib/admin-catalog';
import { adminMain, fieldInput, mutedText, primaryButton } from '@/components/formStyles';

function centsToRupees(cents: number | null): string {
  return cents == null ? '' : String(cents / 100);
}

function rupeesToCents(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

/**
 * Lorry-pricing overview (08/17, owner 2026-07-07): one row per size across the WHOLE catalog, so the
 * admin can see and edit every product's Colombo/Suburb/Outer lorry cell in one place instead of
 * opening each product individually. Row-level save (one PATCH per row) — same delivery attrs as the
 * per-product edit form, just laid out for scanning many sizes at once.
 */
export default function LorryPricingPage() {
  const [rows, setRows] = useState<LorryPricingRow[]>([]);
  const [edits, setEdits] = useState<Record<string, DeliveryAttrs>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const rowKey = (r: LorryPricingRow) => (r.variantId != null ? `v${r.variantId}` : `p${r.productId}`);

  useEffect(() => {
    void adminListLorryPricing().then(setRows).catch(() => {});
  }, []);

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(needle) ||
        (r.sizeLabel ?? '').toLowerCase().includes(needle),
    );
  }, [rows, filter]);

  function valueFor(r: LorryPricingRow): DeliveryAttrs {
    return edits[rowKey(r)] ?? r.delivery;
  }

  function patch(r: LorryPricingRow, partial: Partial<DeliveryAttrs>) {
    setEdits((e) => ({ ...e, [rowKey(r)]: { ...valueFor(r), ...partial } }));
  }

  async function save(r: LorryPricingRow) {
    const key = rowKey(r);
    setSaving(key);
    setMsg(null);
    try {
      const delivery = valueFor(r);
      if (r.variantId != null) {
        await adminUpdateVariantDelivery(r.productId, r.variantId, delivery);
      } else {
        await adminUpdateProductDelivery(r.productId, delivery);
      }
      setRows((rs) => rs.map((row) => (rowKey(row) === key ? { ...row, delivery } : row)));
      setEdits((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
      setMsg(`${r.productName}${r.sizeLabel ? ' — ' + r.sizeLabel : ''} saved.`);
    } catch {
      setMsg('Save failed — please try again.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <main style={adminMain}>
      <p>
        <Link href="/admin/delivery">← Delivery &amp; tax</Link>
      </p>
      <h1>Lorry pricing overview</h1>
      <p style={mutedText}>
        Every size&apos;s in-house lorry cell in one table — price, minimum bill, and on/off per zone.
        Changes save per row; nothing is submitted until you press Save on that row.
      </p>
      {msg && <p style={{ color: 'var(--primary)' }}>{msg}</p>}

      <input
        style={{ ...fieldInput, maxWidth: 320, marginBottom: '1rem' }}
        placeholder="Filter by product or size…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--primary-light)' }}>
              <th style={th}>Product</th>
              <th style={th}>Size</th>
              <th style={th} colSpan={3}>
                Colombo
              </th>
              <th style={th} colSpan={3}>
                Suburb
              </th>
              <th style={th} colSpan={3}>
                Outer
              </th>
              <th style={th}>Outer contact</th>
              <th style={th}>Courier blocked (outer)</th>
              <th style={th}></th>
            </tr>
            <tr style={{ background: 'var(--primary-light)', fontSize: '0.75rem', color: 'var(--muted)' }}>
              <th style={th} />
              <th style={th} />
              <th style={th}>On</th>
              <th style={th}>Price</th>
              <th style={th}>Min bill</th>
              <th style={th}>On</th>
              <th style={th}>Price</th>
              <th style={th}>Min bill</th>
              <th style={th}>On</th>
              <th style={th}>Price</th>
              <th style={th}>Min bill</th>
              <th style={th} />
              <th style={th} />
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const key = rowKey(r);
              const d = valueFor(r);
              const dirty = !!edits[key];
              return (
                <tr key={key} style={{ background: dirty ? 'var(--primary-light)' : undefined }}>
                  <td style={td}>{r.productName}</td>
                  <td style={td}>{r.sizeLabel ?? '—'}</td>

                  {(
                    [
                      ['lorryColomboEnabled', 'lorryColomboCents', 'lorryColomboGateCents'],
                      ['lorrySuburbEnabled', 'lorrySuburbCents', 'lorrySuburbGateCents'],
                      ['lorryOuterEnabled', 'lorryOuterCents', 'lorryOuterGateCents'],
                    ] as const
                  ).map(([enabledKey, centsKey, gateKey]) => (
                    <Fragment key={enabledKey}>
                      <td style={td}>
                        <input
                          type="checkbox"
                          checked={d[enabledKey]}
                          onChange={(e) => patch(r, { [enabledKey]: e.target.checked })}
                        />
                      </td>
                      <td style={td}>
                        <input
                          style={cellInput}
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!d[enabledKey]}
                          value={centsToRupees(d[centsKey])}
                          onChange={(e) => patch(r, { [centsKey]: rupeesToCents(e.target.value) })}
                        />
                      </td>
                      <td style={td}>
                        <input
                          style={cellInput}
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!d[enabledKey]}
                          value={centsToRupees(d[gateKey])}
                          onChange={(e) => patch(r, { [gateKey]: rupeesToCents(e.target.value) })}
                        />
                      </td>
                    </Fragment>
                  ))}

                  <td style={td}>
                    <input
                      type="checkbox"
                      checked={d.lorryOuterWhatsapp}
                      onChange={(e) => patch(r, { lorryOuterWhatsapp: e.target.checked })}
                    />
                  </td>
                  <td style={td}>
                    <input
                      type="checkbox"
                      checked={d.courierOuterBlocked}
                      onChange={(e) => patch(r, { courierOuterBlocked: e.target.checked })}
                    />
                  </td>
                  <td style={td}>
                    <button
                      type="button"
                      disabled={!dirty || saving === key}
                      style={{ ...primaryButton, width: 'auto', padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                      onClick={() => void save(r)}
                    >
                      {saving === key ? 'Saving…' : 'Save'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const th = {
  padding: '0.4rem 0.5rem',
  textAlign: 'left' as const,
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap' as const,
};

const td = {
  padding: '0.3rem 0.5rem',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap' as const,
};

const cellInput = { ...fieldInput, width: '80px', padding: '0.2rem 0.35rem', fontSize: '0.8rem' };
