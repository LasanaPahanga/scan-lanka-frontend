'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CategoryCount } from '@/lib/catalog';

/**
 * "Our Products" nav entry with the grouped category menu (V46/V47 taxonomy): the owner sheet's
 * eight top-level groups ("Writing Boards" … "Portable Partition"), each holding its categories,
 * in sheet order (the API returns categories ordered by their best-selling product). Desktop shows
 * a hover/focus dropdown; the mobile drawer renders the same tree inline.
 */
export interface NavGroup {
  name: string;
  categories: CategoryCount[];
}

export function useCategoryGroups(): NavGroup[] {
  const [categories, setCategories] = useState<CategoryCount[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/catalog/categories')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: CategoryCount[]) => {
        if (!cancelled && Array.isArray(rows)) setCategories(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const groups: NavGroup[] = [];
    const byName = new Map<string, NavGroup>();
    for (const c of categories) {
      const key = c.group ?? c.name; // ungrouped category stands alone as its own top-level entry
      let g = byName.get(key);
      if (!g) {
        g = { name: key, categories: [] };
        byName.set(key, g);
        groups.push(g);
      }
      g.categories.push(c);
    }
    return groups;
  }, [categories]);
}

const categoryHref = (name: string) => `/products?category=${encodeURIComponent(name)}`;

/** A group whose only category IS the group (Key Holder, Portable Partition) links directly. */
function isDirectLink(g: NavGroup): boolean {
  return g.categories.length === 1;
}

export function ProductsNavMenu({ onNavigate }: { onNavigate: () => void }) {
  const groups = useCategoryGroups();

  return (
    <div className="nav-dropdown">
      <Link href="/products" className="nav-link" onClick={onNavigate}>
        Our Products <span className="nav-dropdown-caret" aria-hidden="true">▾</span>
      </Link>
      {groups.length > 0 && (
        <div className="nav-dropdown-panel" role="menu" aria-label="Product categories">
          {groups.map((g) => (
            <div key={g.name} className="nav-dropdown-group">
              {isDirectLink(g) ? (
                <Link href={categoryHref(g.categories[0].name)} className="nav-group-title" onClick={onNavigate}>
                  {g.name}
                </Link>
              ) : (
                <>
                  <span className="nav-group-title">{g.name}</span>
                  {g.categories.map((c) => (
                    <Link key={c.name} href={categoryHref(c.name)} className="nav-group-link" onClick={onNavigate}>
                      {c.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** The same tree, flattened for the mobile drawer (always expanded under "Our Products"). */
export function ProductsNavMobileList({ onNavigate }: { onNavigate: () => void }) {
  const groups = useCategoryGroups();
  if (groups.length === 0) return null;

  return (
    <div className="nav-mobile-categories">
      {groups.map((g) => (
        <div key={g.name}>
          {isDirectLink(g) ? (
            <Link href={categoryHref(g.categories[0].name)} className="nav-group-link" onClick={onNavigate}>
              {g.name}
            </Link>
          ) : (
            <>
              <span className="nav-group-title">{g.name}</span>
              {g.categories.map((c) => (
                <Link key={c.name} href={categoryHref(c.name)} className="nav-group-link" onClick={onNavigate}>
                  {c.name}
                </Link>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
