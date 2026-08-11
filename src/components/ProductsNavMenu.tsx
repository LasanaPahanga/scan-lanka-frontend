'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/** One top-level group in the Our Products nav (from /api/catalog/nav-menu). */
export interface NavMenuGroup {
  name: string;
  categories: { name: string; count: number }[];
  products: { slug: string; name: string }[];
}

function useNavMenu(): NavMenuGroup[] {
  const [groups, setGroups] = useState<NavMenuGroup[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/catalog/nav-menu')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: NavMenuGroup[]) => {
        if (!cancelled && Array.isArray(rows)) setGroups(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return groups;
}

const categoryHref = (name: string) => `/products?category=${encodeURIComponent(name)}`;
const productHref = (slug: string) => `/products/${encodeURIComponent(slug)}`;

/** Shorter labels for the nav only — keeps the 4-column layout readable. */
function navLinkLabel(name: string): string {
  const n = name.trim();
  if (n.startsWith('Mobile Partition Double Sided White and Notice Board'))
    return 'White + notice board 5×3ft (3 panels)';
  if (n.startsWith('Mobile Partition Double Sided Notice Board'))
    return 'Double sided notice board 5×3ft (3 panels)';
  if (n.startsWith('Mobile Partition Double Sided White Board'))
    return 'Double sided white board 5×3ft (3 panels)';
  if (n.startsWith('Partition board covered with Fabric'))
    return 'Fabric partition 5×3ft (3 panels)';
  if (n === n.toUpperCase() && /[A-Z]/.test(n))
    return n.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return n;
}

function GroupBlock({ g, onNavigate }: { g: NavMenuGroup; onNavigate: () => void }) {
  const categoryLink = g.categories[0]?.name;
  const showProducts = g.products.length > 0;

  return (
    <div className="nav-dropdown-group">
      {categoryLink ? (
        <Link href={categoryHref(categoryLink)} className="nav-group-title" onClick={onNavigate}>
          {g.name}
        </Link>
      ) : (
        <span className="nav-group-title">{g.name}</span>
      )}
      {showProducts
        ? g.products.map((p) => (
            <Link key={p.slug} href={productHref(p.slug)} className="nav-group-link" onClick={onNavigate}>
              {navLinkLabel(p.name)}
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
  const groups = useNavMenu();

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

export function ProductsNavMobileList({ onNavigate }: { onNavigate: () => void }) {
  const groups = useNavMenu();
  if (groups.length === 0) return null;

  return (
    <div className="nav-mobile-categories">
      {groups.map((g) => (
        <GroupBlock key={g.name} g={g} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

/** @deprecated Use NavMenuGroup from nav-menu API. Kept for any external imports. */
export interface NavGroup {
  name: string;
  categories: { name: string; count: number; group?: string | null }[];
}

export function useCategoryGroups(): NavGroup[] {
  const groups = useNavMenu();
  return groups.map((g) => ({
    name: g.name,
    categories: g.categories.map((c) => ({ ...c, group: g.name })),
  }));
}
