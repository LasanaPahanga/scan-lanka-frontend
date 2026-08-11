'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CategoryCount } from '@/lib/catalog';

/**
 * "Our Products" nav entry with the grouped category menu (V46/V47 taxonomy): the owner sheet's
 * top-level groups ("Writing Boards" … "Portable Partition"), each holding its categories,
 * in sheet order. Desktop shows a hover/focus dropdown; the mobile drawer renders the same tree.
 */
export interface NavGroup {
  name: string;
  categories: CategoryCount[];
}

/** Preferred display order for storefront groups (owner sheet numbering). */
const GROUP_ORDER = [
  'Writing Boards',
  'Pin Up Board / Notice Board',
  'Art Supplies',
  'Menu Board And Other Restaurant Items',
  'Sport / Game Boards',
  'Kids Corner',
  'Key Holder',
  'Portable Partition',
];

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
    return groups.sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a.name);
      const bi = GROUP_ORDER.indexOf(b.name);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [categories]);
}

const categoryHref = (name: string) => `/products?category=${encodeURIComponent(name)}`;

function GroupBlock({ g, onNavigate }: { g: NavGroup; onNavigate: () => void }) {
  // Always show the group title + every category link (even when there is only one).
  // Collapsing single-category groups to a bare title made Pin Up / Menu Board look blank.
  return (
    <div className="nav-dropdown-group">
      <Link href={categoryHref(g.categories[0].name)} className="nav-group-title" onClick={onNavigate}>
        {g.name}
      </Link>
      {g.categories.map((c) => (
        <Link key={c.name} href={categoryHref(c.name)} className="nav-group-link" onClick={onNavigate}>
          {c.name}
        </Link>
      ))}
    </div>
  );
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
            <GroupBlock key={g.name} g={g} onNavigate={onNavigate} />
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
          <Link href={categoryHref(g.categories[0].name)} className="nav-group-title" onClick={onNavigate}>
            {g.name}
          </Link>
          {g.categories.map((c) => (
            <Link key={c.name} href={categoryHref(c.name)} className="nav-group-link" onClick={onNavigate}>
              {c.name}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
