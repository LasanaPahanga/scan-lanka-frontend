'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CategoryCount, ProductChip } from '@/lib/catalog';

/**
 * "Our Products" nav entry with the grouped category menu (V46/V47 taxonomy): the owner sheet's
 * top-level groups ("Writing Boards" … "Portable Partition"), each holding its categories,
 * in sheet order. Groups with a single category (e.g. Pin Up Board) expand to individual
 * product links, matching how multi-category groups list their sub-categories.
 */
export interface NavGroup {
  name: string;
  categories: CategoryCount[];
}

interface NavProduct {
  slug: string;
  name: string;
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
      const key = c.group ?? c.name;
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

/** For groups with one category, load individual products (Pin Board, Cork Board, …). */
function useGroupProducts(groups: NavGroup[]): Map<string, NavProduct[]> {
  const [byGroup, setByGroup] = useState<Map<string, NavProduct[]>>(new Map());

  useEffect(() => {
    const singles = groups.filter((g) => g.categories.length === 1);
    if (singles.length === 0) {
      setByGroup(new Map());
      return;
    }

    let cancelled = false;
    Promise.all(
      singles.map(async (g) => {
        const category = g.categories[0].name;
        try {
          const r = await fetch(
            `/api/products?category=${encodeURIComponent(category)}&size=50&sort=name`,
          );
          if (!r.ok) return [g.name, []] as const;
          const page = await r.json();
          const items: NavProduct[] = (page.content ?? []).map((p: ProductChip) => ({
            slug: p.slug,
            name: p.name,
          }));
          return [g.name, items] as const;
        } catch {
          return [g.name, []] as const;
        }
      }),
    ).then((entries) => {
      if (!cancelled) setByGroup(new Map(entries));
    });

    return () => {
      cancelled = true;
    };
  }, [groups]);

  return byGroup;
}

const categoryHref = (name: string) => `/products?category=${encodeURIComponent(name)}`;
const productHref = (slug: string) => `/products/${encodeURIComponent(slug)}`;

function GroupBlock({
  g,
  products,
  onNavigate,
}: {
  g: NavGroup;
  products: NavProduct[];
  onNavigate: () => void;
}) {
  const expandProducts = g.categories.length === 1 && products.length > 0;
  const categoryLink = g.categories[0]?.name;

  return (
    <div className="nav-dropdown-group">
      {categoryLink ? (
        <Link href={categoryHref(categoryLink)} className="nav-group-title" onClick={onNavigate}>
          {g.name}
        </Link>
      ) : (
        <span className="nav-group-title">{g.name}</span>
      )}
      {expandProducts
        ? products.map((p) => (
            <Link key={p.slug} href={productHref(p.slug)} className="nav-group-link" onClick={onNavigate}>
              {p.name}
            </Link>
          ))
        : g.categories.map((c) => (
            <Link key={c.name} href={categoryHref(c.name)} className="nav-group-link" onClick={onNavigate}>
              {c.name}
            </Link>
          ))}
    </div>
  );
}

export function ProductsNavMenu({ onNavigate }: { onNavigate: () => void }) {
  const groups = useCategoryGroups();
  const productsByGroup = useGroupProducts(groups);

  return (
    <div className="nav-dropdown">
      <Link href="/products" className="nav-link" onClick={onNavigate}>
        Our Products <span className="nav-dropdown-caret" aria-hidden="true">▾</span>
      </Link>
      {groups.length > 0 && (
        <div className="nav-dropdown-panel" role="menu" aria-label="Product categories">
          {groups.map((g) => (
            <GroupBlock
              key={g.name}
              g={g}
              products={productsByGroup.get(g.name) ?? []}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** The same tree, flattened for the mobile drawer (always expanded under "Our Products"). */
export function ProductsNavMobileList({ onNavigate }: { onNavigate: () => void }) {
  const groups = useCategoryGroups();
  const productsByGroup = useGroupProducts(groups);
  if (groups.length === 0) return null;

  return (
    <div className="nav-mobile-categories">
      {groups.map((g) => (
        <GroupBlock
          key={g.name}
          g={g}
          products={productsByGroup.get(g.name) ?? []}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
