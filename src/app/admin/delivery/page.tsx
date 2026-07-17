'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  CourierRateView,
  CourierZone,
  DeliveryMethodView,
  DeliverySettingsView,
  LorryZone,
  PostalZoneView,
  deletePostalZone,
  getDeliverySettings,
  getPostalZone,
  listCourierRates,
  listDeliveryMethods,
  putDeliverySettings,
  setDeliveryMethod,
  upsertCourierRate,
  upsertPostalZone,
} from '@/lib/admin-delivery';
import Link from 'next/link';
import { getTaxConfig, putTaxConfig, TaxConfigView } from '@/lib/admin';
import { adminMain, fieldInput, mutedText, primaryButton } from '@/components/formStyles';

const LORRY_ZONES: LorryZone[] = ['COLOMBO', 'SUBURB', 'OUTER'];
const COURIER_ZONES: CourierZone[] = ['CITY_LIMITS', 'SUBURBS', 'OUTSTATION', 'FARAWAY'];

const ZONE_LABELS: Record<CourierZone, string> = {
  CITY_LIMITS: 'City Limits',
  SUBURBS: 'Suburbs',
  OUTSTATION: 'Outstation',
  FARAWAY: 'Far Away',
};


export default function AdminDeliveryPage() {
  const [rates, setRates] = useState<CourierRateView[]>([]);
  const [settings, setSettings] = useState<DeliverySettingsView | null>(null);
  const [methods, setMethods] = useState<DeliveryMethodView[]>([]);
  const [tax, setTax] = useState<TaxConfigView | null>(null);
  const [postalLookup, setPostalLookup] = useState('');
  const [postalZone, setPostalZone] = useState<PostalZoneView | null>(null);
  const [postalDraft, setPostalDraft] = useState({
    lorryZone: 'COLOMBO' as LorryZone,
    courierZone: 'CITY_LIMITS' as CourierZone,
    district: '',
    province: '',
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function reload() {
    setRates(await listCourierRates());
    setSettings(await getDeliverySettings());
    setMethods(await listDeliveryMethods());
    setTax(await getTaxConfig());
  }

  useEffect(() => {
    void reload().catch(() => {});
  }, []);

  async function saveRate(zone: CourierZone, firstKg: string, addlKg: string, handling: string) {
    setMsg(null);
    await upsertCourierRate(zone, {
      firstKgCents: Math.round(Number(firstKg) * 100),
      addlKgCents: Math.round(Number(addlKg) * 100),
      handlingOver2ftCents: Math.round(Number(handling) * 100),
    });
    setMsg(`Courier rate for ${ZONE_LABELS[zone]} saved.`);
    await reload();
  }

  async function lookupPostal(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const z = await getPostalZone(postalLookup.trim());
      setPostalZone(z);
      setPostalDraft({
        lorryZone: z.lorryZone,
        courierZone: z.courierZone,
        district: z.district ?? '',
        province: z.province ?? '',
      });
    } catch {
      setPostalZone(null);
      setMsg('Postal code not mapped yet - fill the form below to add it.');
    }
  }

  async function savePostal(e: FormEvent) {
    e.preventDefault();
    if (!postalLookup.trim()) return;
    setMsg(null);
    await upsertPostalZone(postalLookup.trim(), {
      lorryZone: postalDraft.lorryZone,
      courierZone: postalDraft.courierZone,
      district: postalDraft.district || null,
      province: postalDraft.province || null,
    });
    setMsg(`Postal zone ${postalLookup.trim()} saved.`);
    const z = await getPostalZone(postalLookup.trim());
    setPostalZone(z);
  }

  return (
    <main style={adminMain}>
      <h1>Delivery &amp; tax</h1>
      <p style={mutedText}>
        Two-rail delivery: company lorry (card / bank transfer / cash on delivery) and courier Domex
        (full COD). Per-product lorry prices, min bills and on/off switches live on the product form —
        or see them all at once in the{' '}
        <Link href="/admin/delivery/lorry-pricing" style={{ color: 'var(--primary)' }}>
          lorry pricing overview
        </Link>
        .
      </p>
      {msg && <p style={{ color: 'var(--primary)' }}>{msg}</p>}

      <section style={section}>
        <h2 style={h2}>Lorry delivery cap</h2>
        <p style={mutedText}>
          The whole Colombo/Suburb lorry delivery charge is always capped at these amounts — no matter
          how many items, which per-product prices would otherwise sum higher, or how small the order
          is. The same amount also doubles as the flat charge for a small/gated item (no own price)
          whose own minimum bill is met. Outer has no cap — its flat charge is separate.
        </p>
        {settings && (
          <form
            style={{ display: 'grid', gap: '0.5rem', maxWidth: 420 }}
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await putDeliverySettings({
                ...settings,
                lorryCapColomboCents: Math.round(Number(fd.get('capColombo')) * 100),
                lorryCapSuburbCents: Math.round(Number(fd.get('capSuburb')) * 100),
                gateMetOuterCents: Math.round(Number(fd.get('gmOuter')) * 100),
              });
              setMsg('Lorry delivery cap updated.');
              await reload();
            }}
          >
            <label style={label}>
              Colombo cap (Rs)
              <input style={fieldInput} name="capColombo" type="number" step="0.01" min="0"
                defaultValue={settings.lorryCapColomboCents / 100} />
            </label>
            <label style={label}>
              Suburb cap — Gampaha/Kalutara (Rs)
              <input style={fieldInput} name="capSuburb" type="number" step="0.01" min="0"
                defaultValue={settings.lorryCapSuburbCents / 100} />
            </label>
            <label style={label}>
              Outer flat charge (Rs, no cap)
              <input style={fieldInput} name="gmOuter" type="number" step="0.01" min="0"
                defaultValue={settings.gateMetOuterCents / 100} />
            </label>
            <button type="submit" style={{ ...primaryButton, width: 'auto', marginTop: '0.5rem' }}>
              Save
            </button>
          </form>
        )}
      </section>

      <section style={section}>
        <h2 style={h2}>Delivery rails</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {methods.map((m) => (
            <li key={m.method} style={{ marginBottom: '0.5rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={m.enabled}
                  onChange={async (e) => {
                    await setDeliveryMethod(m.method, e.target.checked);
                    await reload();
                  }}
                />{' '}
                {m.method === 'COMPANY_LORRY' ? 'Company lorry' : 'Courier (Domex)'}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section style={section}>
        <h2 style={h2}>Courier rate card (Domex, per board by weight)</h2>
        <p style={mutedText}>
          Per board: 1st kg + additional kgs. Packages above 2 ft add the area&apos;s handling fee on
          top (per package). Weight comes from each product size.
        </p>
        {COURIER_ZONES.map((zone) => {
          const row = rates.find((r) => r.zone === zone) ?? {
            zone,
            firstKgCents: 0,
            addlKgCents: 0,
            handlingOver2ftCents: 0,
          };
          return (
            <form
              // Remount once the real rate loads: `defaultValue` on an uncontrolled input only
              // applies at mount, so a key of just the zone never picks up the async-fetched rates
              // and the fields would be stuck showing their initial (pre-fetch) values forever.
              key={`${zone}-${row.firstKgCents}-${row.addlKgCents}-${row.handlingOver2ftCents}`}
              style={rateTierForm}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void saveRate(zone, String(fd.get('first')), String(fd.get('addl')), String(fd.get('handling')));
              }}
            >
              <strong style={{ fontSize: '0.9rem', minWidth: 110 }}>{ZONE_LABELS[zone]}</strong>
              <input style={fieldInput} name="first" type="number" step="0.01"
                placeholder="1st kg (Rs)" defaultValue={row.firstKgCents / 100} />
              <input style={fieldInput} name="addl" type="number" step="0.01"
                placeholder="Add kg (Rs)" defaultValue={row.addlKgCents / 100} />
              <input style={fieldInput} name="handling" type="number" step="0.01"
                placeholder="Above 2 ft handling (Rs)" defaultValue={row.handlingOver2ftCents / 100} />
              <button type="submit" style={{ ...primaryButton, width: 'auto' }}>
                Save
              </button>
            </form>
          );
        })}
      </section>

      <section style={section}>
        <h2 style={h2}>Postal code → zones</h2>
        <form onSubmit={lookupPostal} style={{ display: 'flex', gap: '0.5rem', maxWidth: 420 }}>
          <input
            style={{ ...fieldInput, flex: 1 }}
            placeholder="Postal code"
            value={postalLookup}
            onChange={(e) => setPostalLookup(e.target.value)}
          />
          <button type="submit" style={{ ...primaryButton, width: 'auto' }}>
            Look up
          </button>
        </form>
        <form onSubmit={savePostal} style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem', maxWidth: 420 }}>
          <select
            style={fieldInput}
            value={postalDraft.lorryZone}
            onChange={(e) => setPostalDraft((d) => ({ ...d, lorryZone: e.target.value as LorryZone }))}
          >
            {LORRY_ZONES.map((z) => (
              <option key={z} value={z}>
                Lorry: {z}
              </option>
            ))}
          </select>
          <select
            style={fieldInput}
            value={postalDraft.courierZone}
            onChange={(e) => setPostalDraft((d) => ({ ...d, courierZone: e.target.value as CourierZone }))}
          >
            {COURIER_ZONES.map((z) => (
              <option key={z} value={z}>
                Courier: {ZONE_LABELS[z]}
              </option>
            ))}
          </select>
          <input style={fieldInput} placeholder="District" value={postalDraft.district}
            onChange={(e) => setPostalDraft((d) => ({ ...d, district: e.target.value }))} />
          <input style={fieldInput} placeholder="Province" value={postalDraft.province}
            onChange={(e) => setPostalDraft((d) => ({ ...d, province: e.target.value }))} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={{ ...primaryButton, width: 'auto' }}>
              Save mapping
            </button>
            {postalZone && (
              <button
                type="button"
                style={{ color: 'var(--danger)' }}
                onClick={async () => {
                  await deletePostalZone(postalLookup.trim());
                  setPostalZone(null);
                  setMsg('Postal mapping removed.');
                }}
              >
                Delete
              </button>
            )}
          </div>
          {postalZone && (
            <p style={mutedText}>
              Current: lorry {postalZone.lorryZone}, courier {ZONE_LABELS[postalZone.courierZone]}
              {postalZone.district ? ` · ${postalZone.district}` : ''}
            </p>
          )}
        </form>
      </section>

      <section style={section}>
        <h2 style={h2}>Tax</h2>
        {tax && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await putTaxConfig({
                rateBps: Number(fd.get('rateBps')),
                label: String(fd.get('label')),
              });
              setMsg('Tax config saved.');
              await reload();
            }}
            style={{ display: 'grid', gap: '0.5rem', maxWidth: 420 }}
          >
            <input style={fieldInput} name="label" defaultValue={tax.label} placeholder="Tax label" />
            <input style={fieldInput} name="rateBps" type="number" defaultValue={tax.rateBps} placeholder="Rate (bps)" />
            <button type="submit" style={{ ...primaryButton, width: 'auto' }}>
              Save tax
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

const section = { marginTop: '2rem' } as const;
const h2 = { fontSize: '1.1rem', marginBottom: '0.75rem' } as const;
const label = { display: 'grid', gap: '0.35rem', fontSize: '0.9rem' } as const;
const rateTierForm = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.5rem',
  padding: '0.75rem',
  marginBottom: '0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)',
  maxWidth: 780,
} as const;
