import { useGeo } from '@/components/GeoProvider';
import { formatLkr } from '@/lib/money';

export function formatDisplayPrice(lkrCents: number | null | undefined, geo: ReturnType<typeof useGeo>['geo']) {
  if (lkrCents == null) return '';
  if (!geo.indicativePricing || geo.currency === 'LKR') {
    return formatLkr(lkrCents);
  }
  const foreign = Math.round(lkrCents / (geo.usdRate || 300));
  const dollars = (foreign / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return `${dollars} (indicative)`;
}
