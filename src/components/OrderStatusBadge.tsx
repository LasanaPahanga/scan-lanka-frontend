/** Read-only status badges for customer order history (16 FR-RETURN-5). */
export function OrderStatusBadge({ status, refundTotalCents }: { status: string; refundTotalCents?: number }) {
  if (status === 'CANCELLED') {
    return <span style={badge('#6b7280')}>Cancelled</span>;
  }
  if (refundTotalCents != null && refundTotalCents > 0) {
    return <span style={badge('#b45309')}>Refunded</span>;
  }
  return <span>{status.replace(/_/g, ' ')}</span>;
}

function badge(bg: string) {
  return {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: 4,
    background: bg,
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  };
}
