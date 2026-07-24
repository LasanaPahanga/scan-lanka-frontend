'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { ProductChip, mediaUrl, searchProducts } from '@/lib/catalog';
import { formatDisplayPrice, formatDisplayRange } from '@/lib/displayMoney';
import { useGeo } from '@/components/GeoProvider';

const MAX_SUGGESTIONS = 6;

/**
 * Header search with a live typeahead dropdown. As the shopper types we hit the same
 * `name ILIKE %q%` browse endpoint the /products page uses (so partial words match), and
 * offer the top few products plus a "see all results" fallback. Submitting (Enter with no
 * highlight, or the Search button) still routes to /products?q=… so nothing is lost.
 */
export function HeaderSearch({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { geo } = useGeo();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ProductChip[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  // -1 = nothing highlighted (Enter runs the full search); 0..n-1 = a product row.
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const query = q.trim();
  const showDropdown = open && query.length > 0;

  // Debounced suggestion fetch. A stale flag guards against out-of-order responses.
  useEffect(() => {
    if (!query) {
      setResults([]);
      setSearching(false);
      return;
    }
    let stale = false;
    setSearching(true);
    const handle = window.setTimeout(() => {
      searchProducts(query, MAX_SUGGESTIONS)
        .then((page) => {
          if (!stale) setResults(page.content);
        })
        .catch(() => {
          if (!stale) setResults([]);
        })
        .finally(() => {
          if (!stale) setSearching(false);
        });
    }, 250);
    return () => {
      stale = true;
      window.clearTimeout(handle);
    };
  }, [query]);

  // Reset the highlight whenever the result set changes.
  useEffect(() => {
    setActive(-1);
  }, [results]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function runSearch() {
    setOpen(false);
    onNavigate?.();
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
  }

  function goToProduct(product: ProductChip) {
    setOpen(false);
    setQ('');
    setResults([]);
    onNavigate?.();
    router.push(`/products/${product.slug}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && active < results.length) goToProduct(results[active]);
    else runSearch();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="header-search" style={searchWrap}>
      <form onSubmit={onSubmit} style={searchForm} role="search">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products…"
          aria-label="Search products"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listboxId}-opt-${active}` : undefined}
          style={searchInput}
        />
        <button
          type="submit"
          className="btn btn-primary header-search-btn"
          style={{ borderRadius: '0 var(--radius) var(--radius) 0' }}
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="header-search-menu" style={menu}>
          <ul id={listboxId} role="listbox" aria-label="Product suggestions" style={list}>
            {searching && results.length === 0 && (
              <li style={menuStatus} role="presentation">
                Searching…
              </li>
            )}
            {!searching && results.length === 0 && (
              <li style={menuStatus} role="presentation">
                No products match “{query}”. Press Enter to browse all products.
              </li>
            )}
            {results.map((p, i) => {
              const img = mediaUrl(p.previewImageUrl);
              const price =
                p.priceMode === 'SINGLE'
                  ? formatDisplayPrice(p.priceCents, geo)
                  : formatDisplayRange(p.priceMinCents, p.priceMaxCents, geo);
              return (
                <li key={p.id} role="none">
                  <button
                    type="button"
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={active === i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => goToProduct(p)}
                    className="header-search-option"
                    style={{ ...option, background: active === i ? 'var(--surface-muted, #f1f5f9)' : 'transparent' }}
                  >
                    <span style={thumb}>
                      {img ? (
                        <Image src={img} alt="" fill sizes="40px" style={{ objectFit: 'cover' }} />
                      ) : (
                        <span style={thumbFallback} aria-hidden="true">
                          🖼
                        </span>
                      )}
                    </span>
                    <span style={optionText}>
                      <span style={optionName}>{p.name}</span>
                      {price && <span style={optionPrice}>{price}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {results.length > 0 && (
            <button type="button" onClick={runSearch} className="header-search-seeall" style={seeAll}>
              See all results for “{query}” →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const searchWrap = { position: 'relative', display: 'flex', flex: '1 1 320px', minWidth: 0, maxWidth: 560 } as const;
const searchForm = { display: 'flex', width: '100%', minWidth: 0 } as const;
const searchInput = {
  flex: 1,
  minWidth: 0,
  padding: '0.6rem 0.85rem',
  border: '1px solid var(--border)',
  borderRight: 'none',
  borderRadius: 'var(--radius) 0 0 var(--radius)',
  fontSize: '0.95rem',
  outline: 'none',
} as const;

const menu = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  zIndex: 40,
  background: 'var(--surface, #fff)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow-md, 0 12px 32px rgba(15,23,42,0.16))',
  overflow: 'hidden',
} as const;
const list = { listStyle: 'none', margin: 0, padding: '0.25rem', maxHeight: 360, overflowY: 'auto' } as const;
const menuStatus = { padding: '0.75rem 0.85rem', color: 'var(--muted)', fontSize: '0.9rem' } as const;
const option = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.7rem',
  width: '100%',
  textAlign: 'left',
  padding: '0.5rem 0.6rem',
  border: 'none',
  borderRadius: 'calc(var(--radius) - 4px)',
  cursor: 'pointer',
} as const;
const thumb = {
  position: 'relative',
  flex: '0 0 auto',
  width: 40,
  height: 40,
  borderRadius: 8,
  overflow: 'hidden',
  background: '#f1f5f9',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const;
const thumbFallback = { fontSize: '1.1rem', opacity: 0.6 } as const;
const optionText = { display: 'flex', flexDirection: 'column', minWidth: 0, gap: '0.1rem' } as const;
const optionName = {
  fontSize: '0.92rem',
  color: 'var(--text)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;
const optionPrice = { fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 } as const;
const seeAll = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '0.7rem 0.85rem',
  border: 'none',
  borderTop: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--primary)',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
} as const;
