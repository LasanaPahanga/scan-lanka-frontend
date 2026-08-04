'use client';

import { DeliveryAttrs } from '@/lib/admin-catalog';
import { fieldInput, mutedText } from '@/components/formStyles';

type Props = {
  value: DeliveryAttrs;
  onChange: (v: DeliveryAttrs) => void;
  compact?: boolean;
};

function centsToRupees(cents: number | null): string {
  return cents == null ? '' : String(cents / 100);
}

function rupeesToCents(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

/** Blank ⇒ null (no weight recorded, courier falls back to 1 kg). Kept to 3 dp like the column. */
function parseWeight(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 1000) / 1000 : null;
}

type ZoneKey = 'Colombo' | 'Suburb' | 'Outer';

const ZONES: { key: ZoneKey; label: string }[] = [
  { key: 'Colombo', label: 'Colombo' },
  { key: 'Suburb', label: 'Suburb (Gampaha/Kalutara)' },
  { key: 'Outer', label: 'Outer (rest of the island)' },
];

/**
 * Fully admin-controlled lorry cells (owner 2026-07-05): per zone an ON/OFF switch, an optional price
 * and an optional minimum bill. Blank price + no min bill = offered, cost arranged manually after the
 * order. Min bill with no price = the flat gate-met charge from Delivery settings applies when met.
 */
export function ProductDeliveryFields({ value, onChange, compact }: Props) {
  const zoneField = (zone: ZoneKey) => {
    const enabledKey = `lorry${zone}Enabled` as const;
    const centsKey = `lorry${zone}Cents` as const;
    const gateKey = `lorry${zone}GateCents` as const;
    const enabled = value[enabledKey];
    return (
      <div
        key={zone}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(150px, 1.2fr) auto 1fr 1fr',
          gap: '0.5rem',
          alignItems: 'center',
          opacity: enabled ? 1 : 0.55,
        }}
      >
        <span style={{ fontSize: '0.85rem' }}>{ZONES.find((z) => z.key === zone)!.label}</span>
        <label style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', fontSize: '0.8rem' }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange({ ...value, [enabledKey]: e.target.checked })}
          />
          Lorry
        </label>
        <input
          style={fieldInput}
          type="number"
          step="0.01"
          min="0"
          disabled={!enabled}
          placeholder="Price (Rs)"
          value={centsToRupees(value[centsKey])}
          onChange={(e) => onChange({ ...value, [centsKey]: rupeesToCents(e.target.value) })}
        />
        <input
          style={fieldInput}
          type="number"
          step="0.01"
          min="0"
          disabled={!enabled}
          placeholder="Min bill (Rs)"
          value={centsToRupees(value[gateKey])}
          onChange={(e) => onChange({ ...value, [gateKey]: rupeesToCents(e.target.value) })}
        />
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gap: compact ? '0.5rem' : '0.75rem' }}>
      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
        <input
          type="checkbox"
          checked={value.whatsappOnly}
          onChange={(e) => onChange({ ...value, whatsappOnly: e.target.checked })}
        />
        WhatsApp / quote only (no online checkout)
      </label>

      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <span style={{ ...mutedText, fontSize: '0.8rem' }}>In-house lorry — per zone</span>
        {ZONES.map((z) => zoneField(z.key))}
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={value.lorryOuterWhatsapp}
            onChange={(e) => onChange({ ...value, lorryOuterWhatsapp: e.target.checked })}
          />
          Outer lorry needs contact (glass boards, key holders, 6×4 / 8×4 — customer contacts us)
        </label>
      </div>

      <div style={{ display: 'grid', gap: '0.4rem' }}>
        <span style={{ ...mutedText, fontSize: '0.8rem' }}>Courier (Domex)</span>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={value.courierEnabled}
            onChange={(e) => onChange({ ...value, courierEnabled: e.target.checked })}
          />
          Courier offered for this item (off = in-house lorry only)
        </label>
        <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.85rem' }}>
          Weight (kg)
          <input
            style={fieldInput}
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 2.5"
            value={value.weightKg ?? ''}
            onChange={(e) => onChange({ ...value, weightKg: parseWeight(e.target.value) })}
          />
        </label>
        {value.courierEnabled && value.weightKg == null && (
          <p style={{ color: 'var(--danger)', margin: 0, fontSize: '0.8rem' }}>
            No weight set — the courier will bill this as 1 kg, which undercharges anything heavier.
          </p>
        )}
        <select
          style={fieldInput}
          value={value.boardSizeTier ?? ''}
          onChange={(e) =>
            onChange({
              ...value,
              boardSizeTier:
                e.target.value === ''
                  ? null
                  : (e.target.value as 'UNDER_2FT' | 'BETWEEN_2FT_6FT'),
            })
          }
        >
          <option value="">Not couriable (lorry only — e.g. glass)</option>
          <option value="UNDER_2FT">Below 2 ft (weight rate only)</option>
          <option value="BETWEEN_2FT_6FT">Above 2 ft (weight rate + handling fee)</option>
        </select>
        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={value.courierOuterBlocked}
            onChange={(e) => onChange({ ...value, courierOuterBlocked: e.target.checked })}
          />
          Too big for courier to outstation/faraway (6×3 / 6×4 / 8×4 — city &amp; suburbs still OK)
        </label>
      </div>

      {!compact && (
        <p style={{ ...mutedText, margin: 0, fontSize: '0.8rem' }}>
          Courier (Domex) charges are weight-based per board (1st kg + additional kgs from the rate
          card); packages above 2 ft add the area&apos;s handling fee — set the item&apos;s weight so
          the estimate is right. Lorry per zone: untick to hide the lorry for that zone (customer uses
          the courier); leave the price blank to arrange the cost manually after the order; set a min
          bill to require the order to exceed it — with a price the price applies, without one the
          flat charge from Delivery settings applies.
        </p>
      )}
    </div>
  );
}
