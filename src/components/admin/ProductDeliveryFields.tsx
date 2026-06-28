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

export function ProductDeliveryFields({ value, onChange, compact }: Props) {
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
      <input
        style={fieldInput}
        type="number"
        step="0.001"
        min="0"
        placeholder="Weight (kg) - required for courier"
        value={value.weightKg ?? ''}
        onChange={(e) =>
          onChange({
            ...value,
            weightKg: e.target.value.trim() === '' ? null : Number(e.target.value),
          })
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
        <input
          style={fieldInput}
          type="number"
          step="0.01"
          min="0"
          placeholder="Lorry Colombo (Rs)"
          value={centsToRupees(value.lorryColomboCents)}
          onChange={(e) => onChange({ ...value, lorryColomboCents: rupeesToCents(e.target.value) })}
        />
        <input
          style={fieldInput}
          type="number"
          step="0.01"
          min="0"
          placeholder="Lorry suburb (Rs)"
          value={centsToRupees(value.lorrySuburbCents)}
          onChange={(e) => onChange({ ...value, lorrySuburbCents: rupeesToCents(e.target.value) })}
        />
        <input
          style={fieldInput}
          type="number"
          step="0.01"
          min="0"
          placeholder="Lorry outer (Rs)"
          value={centsToRupees(value.lorryOuterCents)}
          onChange={(e) => onChange({ ...value, lorryOuterCents: rupeesToCents(e.target.value) })}
        />
      </div>
      {!compact && (
        <p style={{ ...mutedText, margin: 0, fontSize: '0.8rem' }}>
          Leave lorry price blank if admin arranges cost manually for that zone. Rs 6,000 minimum bill is global
          (Delivery settings).
        </p>
      )}
    </div>
  );
}
