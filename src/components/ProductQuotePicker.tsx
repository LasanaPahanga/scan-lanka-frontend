'use client';

import { useEffect, useRef, useState } from 'react';
import { ProductChip, searchProducts } from '@/lib/catalog';
import { fieldInput, mutedText } from '@/components/formStyles';

export interface SelectedQuoteProduct {
  productId: number;
  name: string;
}

interface ProductQuotePickerProps {
  selected: SelectedQuoteProduct | null;
  customName: string;
  onSelect: (product: SelectedQuoteProduct | null) => void;
  onCustomNameChange: (name: string) => void;
}

export default function ProductQuotePicker({
  selected,
  customName,
  onSelect,
  onCustomNameChange,
}: ProductQuotePickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductChip[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || selected) {
      setResults([]);
      return;
    }
    const handle = window.setTimeout(() => {
      setSearching(true);
      searchProducts(query.trim())
        .then((page) => setResults(page.content))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 280);
    return () => window.clearTimeout(handle);
  }, [query, selected]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function pick(product: ProductChip) {
    onSelect({ productId: product.id, name: product.name });
    onCustomNameChange('');
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  function clearSelection() {
    onSelect(null);
    setQuery('');
    setResults([]);
  }

  return (
    <div ref={wrapRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Product</label>

      {selected ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.7rem 0.85rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: '#f8fafc',
          }}
        >
          <span>{selected.name}</span>
          <button type="button" onClick={clearSelection} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Change
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            style={fieldInput}
            placeholder="Search by product name"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
          />
          {open && query.trim() && (
            <ul
              style={{
                position: 'absolute',
                zIndex: 20,
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                margin: 0,
                padding: 0,
                listStyle: 'none',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)',
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {searching && (
                <li style={{ padding: '0.65rem 0.85rem', color: 'var(--muted)' }}>Searching…</li>
              )}
              {!searching && results.length === 0 && (
                <li style={{ padding: '0.65rem 0.85rem', color: 'var(--muted)' }}>No products found</li>
              )}
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pick(p)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.65rem 0.85rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!selected && (
        <>
          <p style={{ ...mutedText, margin: 0, fontSize: '0.85rem' }}>
            Can&apos;t find it in the list? Describe what you need below.
          </p>
          <input
            style={fieldInput}
            placeholder="Product name or description"
            value={customName}
            onChange={(e) => onCustomNameChange(e.target.value)}
          />
        </>
      )}
    </div>
  );
}
