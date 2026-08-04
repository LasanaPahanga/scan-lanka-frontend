'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CourierZone,
  LorryZone,
  PostalZoneView,
  deletePostalZone,
  listPostalZones,
  upsertPostalZone,
} from '@/lib/admin-delivery';
import { adminMain, fieldInput, mutedText, primaryButton, secondaryButton } from '@/components/formStyles';

const LORRY_ZONES: LorryZone[] = ['COLOMBO', 'SUBURB', 'OUTER'];
const COURIER_ZONES: CourierZone[] = ['CITY_LIMITS', 'SUBURBS', 'OUTSTATION', 'FARAWAY'];

const COURIER_LABELS: Record<CourierZone, string> = {
  CITY_LIMITS: 'City Limits',
  SUBURBS: 'Suburbs',
  OUTSTATION: 'Outstation',
  FARAWAY: 'Far Away',
};

const LORRY_LABELS: Record<LorryZone, string> = {
  COLOMBO: 'Colombo',
  SUBURB: 'Suburb (Gampaha/Kalutara)',
  OUTER: 'Outer (rest of the island)',
};

const PAGE_SIZE = 50;

type Draft = {
  postalCode: string;
  lorryZone: LorryZone;
  courierZone: CourierZone;
  district: string;
  province: string;
};

const emptyDraft = (): Draft => ({
  postalCode: '',
  lorryZone: 'OUTER',
  courierZone: 'OUTSTATION',
  district: '',
  province: '',
});

/**
 * Postal-code coverage table (08, owner 2026-08-03). The mapping was seeded in bulk from LK.txt
 * (V28) and has gaps, so the admin needs to see the whole list, search it, and add or remove codes
 * by hand. A code that isn't mapped here is NOT serviceable at checkout — neither rail is offered —
 * so adding a missing one is what makes that area orderable.
 */
export default function AdminPostalCodesPage() {
  const [rows, setRows] = useState<PostalZoneView[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState(''); // the applied search, not the input's live value
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await listPostalZones(search, page, PAGE_SIZE);
      setRows(p.items);
      setTotal(p.total);
    } catch {
      setError('Could not load the postal codes.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function applySearch(e: FormEvent) {
    e.preventDefault();
    setPage(0); // a new search always starts at the first page
    setSearch(query);
  }

  function editRow(z: PostalZoneView) {
    setEditing(z.postalCode);
    setDraft({
      postalCode: z.postalCode,
      lorryZone: z.lorryZone,
      courierZone: z.courierZone,
      district: z.district ?? '',
      province: z.province ?? '',
    });
    setMsg(null);
    setError(null);
  }

  function newRow() {
    setEditing(null);
    setDraft(emptyDraft());
    setMsg(null);
    setError(null);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const code = draft.postalCode.trim();
    if (!code) {
      setError('Enter a postal code.');
      return;
    }
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      await upsertPostalZone(code, {
        lorryZone: draft.lorryZone,
        courierZone: draft.courierZone,
        district: draft.district.trim() || null,
        province: draft.province.trim() || null,
      });
      setMsg(`Postal code ${code} saved.`);
      setDraft(editing ? draft : emptyDraft());
      await load();
    } catch {
      setError('Could not save that postal code.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(code: string) {
    if (!window.confirm(`Remove ${code}? Customers in that area can no longer check out.`)) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      await deletePostalZone(code);
      if (editing === code) newRow();
      setMsg(`Postal code ${code} removed.`);
      await load();
    } catch {
      setError('Could not remove that postal code.');
    } finally {
      setBusy(false);
    }
  }

  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <main style={adminMain}>
      <p>
        <Link href="/admin/delivery">← Delivery &amp; tax</Link>
      </p>
      <h1>Postal codes</h1>
      <p style={mutedText}>
        Every postal code the shop delivers to, and the zones it maps to. A code that isn&apos;t listed
        here is not serviceable — checkout offers no delivery for it — so add any that are missing.
        Lorry zone sets the in-house lorry price band; courier zone sets the Domex rate band.
      </p>
      {msg && <p style={{ color: 'var(--primary)' }}>{msg}</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={h2}>{editing ? `Edit ${editing}` : 'Add a postal code'}</h2>
        <form onSubmit={save} style={{ display: 'grid', gap: '0.5rem', maxWidth: 420 }}>
          <label style={label}>
            Postal code
            <input
              style={fieldInput}
              placeholder="e.g. 11600"
              value={draft.postalCode}
              readOnly={!!editing}
              onChange={(e) => setDraft((d) => ({ ...d, postalCode: e.target.value }))}
            />
          </label>
          <label style={label}>
            Lorry zone
            <select
              style={fieldInput}
              value={draft.lorryZone}
              onChange={(e) => setDraft((d) => ({ ...d, lorryZone: e.target.value as LorryZone }))}
            >
              {LORRY_ZONES.map((z) => (
                <option key={z} value={z}>
                  {LORRY_LABELS[z]}
                </option>
              ))}
            </select>
          </label>
          <label style={label}>
            Courier zone (Domex)
            <select
              style={fieldInput}
              value={draft.courierZone}
              onChange={(e) => setDraft((d) => ({ ...d, courierZone: e.target.value as CourierZone }))}
            >
              {COURIER_ZONES.map((z) => (
                <option key={z} value={z}>
                  {COURIER_LABELS[z]}
                </option>
              ))}
            </select>
          </label>
          <label style={label}>
            District
            <input
              style={fieldInput}
              placeholder="e.g. Gampaha"
              value={draft.district}
              onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value }))}
            />
          </label>
          <label style={label}>
            Province
            <input
              style={fieldInput}
              placeholder="e.g. Western Province"
              value={draft.province}
              onChange={(e) => setDraft((d) => ({ ...d, province: e.target.value }))}
            />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button type="submit" style={{ ...primaryButton, width: 'auto' }} disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Add postal code'}
            </button>
            {editing && (
              <button type="button" style={{ ...secondaryButton, width: 'auto' }} onClick={newRow}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={h2}>Mapped codes</h2>
        <form onSubmit={applySearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: 480 }}>
          <input
            style={{ ...fieldInput, flex: 1 }}
            placeholder="Search by code, district or province…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" style={{ ...primaryButton, width: 'auto' }}>
            Search
          </button>
          {search && (
            <button
              type="button"
              style={{ ...secondaryButton, width: 'auto' }}
              onClick={() => {
                setQuery('');
                setSearch('');
                setPage(0);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <p style={{ ...mutedText, marginTop: '0.75rem' }}>
          {loading ? 'Loading…' : `${total.toLocaleString('en-LK')} code${total === 1 ? '' : 's'}`}
          {search && !loading ? ` matching “${search}”` : ''}
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--primary-light)' }}>
                <th style={th}>Code</th>
                <th style={th}>Lorry zone</th>
                <th style={th}>Courier zone</th>
                <th style={th}>District</th>
                <th style={th}>Province</th>
                <th style={th} />
              </tr>
            </thead>
            <tbody>
              {rows.map((z) => (
                <tr key={z.postalCode} style={{ background: editing === z.postalCode ? 'var(--primary-light)' : undefined }}>
                  <td style={td}>{z.postalCode}</td>
                  <td style={td}>{LORRY_LABELS[z.lorryZone]}</td>
                  <td style={td}>{COURIER_LABELS[z.courierZone]}</td>
                  <td style={td}>{z.district || '—'}</td>
                  <td style={td}>{z.province || '—'}</td>
                  <td style={{ ...td, display: 'flex', gap: '0.5rem' }}>
                    <button type="button" style={rowButton} onClick={() => editRow(z)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      style={{ ...rowButton, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      disabled={busy}
                      onClick={() => void remove(z.postalCode)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td style={td} colSpan={6}>
                    No codes match — add it above to make that area serviceable.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              style={{ ...secondaryButton, width: 'auto' }}
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ← Previous
            </button>
            <span style={mutedText}>
              Page {page + 1} of {lastPage + 1}
            </span>
            <button
              type="button"
              style={{ ...secondaryButton, width: 'auto' }}
              disabled={page >= lastPage}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

const h2 = { fontSize: '1.1rem', marginBottom: '0.75rem' } as const;
const label = { display: 'grid', gap: '0.35rem', fontSize: '0.9rem' } as const;

const th = {
  padding: '0.4rem 0.5rem',
  textAlign: 'left' as const,
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap' as const,
};

const td = {
  padding: '0.35rem 0.5rem',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap' as const,
};

const rowButton = {
  ...secondaryButton,
  width: 'auto',
  padding: '0.25rem 0.6rem',
  fontSize: '0.8rem',
} as const;
