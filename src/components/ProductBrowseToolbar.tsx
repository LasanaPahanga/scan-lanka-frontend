'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { CatalogFacets } from '@/lib/catalog';

export interface BrowseToolbarProps {
  facets: CatalogFacets;
  q?: string;
  category?: string;
  parentId?: number;
  sort?: string;
}

export function ProductBrowseToolbar({ facets, q, category, parentId, sort }: BrowseToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (changes: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (!value) next.delete(key);
        else next.set(key, value);
      });
      next.delete('page');
      router.push(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <div style={bar}>
      <input
        type="search"
        placeholder="Search products…"
        defaultValue={q ?? ''}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            update({ q: (e.target as HTMLInputElement).value.trim() || undefined });
          }
        }}
        style={searchInput}
        aria-label="Search products"
      />
      <select
        value={category ?? ''}
        onChange={(e) => update({ category: e.target.value || undefined })}
        style={select}
        aria-label="Category"
      >
        <option value="">All categories</option>
        {facets.categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {facets.parents.length > 0 && (
        <select
          value={parentId != null ? String(parentId) : ''}
          onChange={(e) => update({ parentId: e.target.value || undefined })}
          style={select}
          aria-label="Product line"
        >
          <option value="">All lines</option>
          {facets.parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      <select
        value={sort ?? 'newest'}
        onChange={(e) => update({ sort: e.target.value })}
        style={select}
        aria-label="Sort"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="name">Name A–Z</option>
      </select>
    </div>
  );
}

const bar = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  marginTop: '1.25rem',
  marginBottom: '1.25rem',
} as const;
const searchInput = {
  flex: '1 1 200px',
  padding: '0.55rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--bg)',
} as const;
const select = {
  padding: '0.55rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--bg)',
} as const;
