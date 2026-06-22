'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function ProductPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const next = new URLSearchParams(searchParams.toString());
    if (p <= 0) next.delete('page');
    else next.set('page', String(p));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav style={nav} aria-label="Product pages">
      {page > 0 && (
        <Link href={href(page - 1)} style={link}>
          ← Previous
        </Link>
      )}
      <span style={{ color: 'var(--muted)' }}>
        Page {page + 1} of {totalPages}
      </span>
      {page + 1 < totalPages && (
        <Link href={href(page + 1)} style={link}>
          Next →
        </Link>
      )}
    </nav>
  );
}

const nav = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1.5rem',
  marginTop: '2rem',
} as const;
const link = { color: 'var(--primary)', textDecoration: 'none' } as const;
