// LKR display — whole rupees (stored as integer cents; global/03 §3, catalog Q-5).
export function formatLkr(cents: number | null | undefined): string {
  if (cents == null) return '';
  const rupees = Math.round(cents / 100);
  return 'Rs ' + rupees.toLocaleString('en-LK');
}

export function formatRange(minCents: number | null, maxCents: number | null): string {
  if (minCents == null || maxCents == null) return '';
  if (minCents === maxCents) return formatLkr(minCents);
  return `${formatLkr(minCents)} – ${formatLkr(maxCents)}`;
}
