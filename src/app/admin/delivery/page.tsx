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
import { getTaxConfig, putTaxConfig, TaxConfigView } from '@/lib/admin';
import { adminMain, fieldInput, mutedText, primaryButton } from '@/components/formStyles';

const LORRY_ZONES: LorryZone[] = ['COLOMBO', 'SUBURB', 'OUTER'];
const COURIER_ZONES: CourierZone[] = ['COLOMBO_1_15', 'OTHER', 'JAFFNA_NORTH'];

export default function AdminDeliveryPage() {
  const [rates, setRates] = useState<CourierRateView[]>([]);
  const [settings, setSettings] = useState<DeliverySettingsView | null>(null);
  const [methods, setMethods] = useState<DeliveryMethodView[]>([]);
  const [tax, setTax] = useState<TaxConfigView | null>(null);
  const [postalLookup, setPostalLookup] = useState('');
  const [postalZone, setPostalZone] = useState<PostalZoneView | null>(null);
  const [postalDraft, setPostalDraft] = useState({
    lorryZone: 'COLOMBO' as LorryZone,
    courierZone: 'OTHER' as CourierZone,
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

  async function saveRate(zone: CourierZone, baseRupees: string, perKgRupees: string) {
    setMsg(null);
    await upsertCourierRate(zone, {
      baseCents: Math.round(Number(baseRupees) * 100),
      perKgCents: Math.round(Number(perKgRupees) * 100),
    });
    setMsg(`Courier rate for ${zone} saved.`);
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
      setMsg('Postal code not mapped yet — fill the form below to add it.');
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
      <p style={mutedText}>Two-rail delivery: company lorry (prepaid online) and courier Citrek (full COD).</p>
      {msg && <p style={{ color: 'var(--primary)' }}>{msg}</p>}

      <section style={section}>
        <h2 style={h2}>Global lorry settings</h2>
        {settings && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const rupees = (e.currentTarget.elements.namedItem('minBill') as HTMLInputElement).value;
              await putDeliverySettings({ lorryMinBillCents: Math.round(Number(rupees) * 100) });
              setMsg('Lorry minimum bill updated.');
              await reload();
            }}
          >
            <label style={label}>
              Minimum product subtotal for lorry (Rs, must exceed this amount)
              <input
                style={fieldInput}
                name="minBill"
                type="number"
                step="0.01"
                defaultValue={settings.lorryMinBillCents / 100}
              />
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
                {m.method === 'COMPANY_LORRY' ? 'Company lorry' : 'Courier (Citrek)'}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section style={section}>
        <h2 style={h2}>Courier rate card (Citrek estimate)</h2>
        {COURIER_ZONES.map((zone) => {
          const row = rates.find((r) => r.zone === zone) ?? { zone, baseCents: 0, perKgCents: 0 };
          return (
            <form
              key={zone}
              style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem', maxWidth: 420 }}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void saveRate(zone, String(fd.get('base')), String(fd.get('perKg')));
              }}
            >
              <strong>{zone}</strong>
              <input style={fieldInput} name="base" type="number" step="0.01" placeholder="Base (Rs)"
                defaultValue={row.baseCents / 100} />
              <input style={fieldInput} name="perKg" type="number" step="0.01" placeholder="Per kg (Rs)"
                defaultValue={row.perKgCents / 100} />
              <button type="submit" style={{ ...primaryButton, width: 'auto' }}>
                Save {zone}
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
                Courier: {z}
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
              Current: lorry {postalZone.lorryZone}, courier {postalZone.courierZone}
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
