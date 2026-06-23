'use client';

import { useGeo } from '@/components/GeoProvider';
import { t } from '@/lib/i18n';

const COUNTRIES = [
  { code: 'LK', label: 'Sri Lanka' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'IN', label: 'India' },
];

export function CountrySelector() {
  const { geo, setCountry } = useGeo();
  return (
    <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
      {t('geo.country')}:{' '}
      <select
        value={geo.country}
        onChange={(e) => setCountry(e.target.value)}
        style={{ marginLeft: '0.25rem' }}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}
