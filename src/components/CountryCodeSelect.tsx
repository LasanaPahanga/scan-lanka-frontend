'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRY_CODES, flagEmoji } from '@/lib/countryCodes';

/**
 * Compact country-code picker. A native <select> with ~195 options either dumps every
 * row into one long browser popup or (styled) overflows small screens - this shows a
 * search box + a list capped to ~10 visible rows (the rest scrolls), so it never
 * overflows the viewport on mobile or desktop.
 */
export function CountryCodeSelect({
  iso,
  onChange,
}: {
  iso: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => COUNTRY_CODES.find((c) => c.iso === iso) ?? COUNTRY_CODES[0],
    [iso],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="country-code-select">
      <button
        type="button"
        className="country-code-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{flagEmoji(selected.iso)}</span>
        <span>{selected.dial}</span>
        <span className="country-code-caret" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="country-code-panel" role="listbox">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country or code…"
            className="country-code-search"
            aria-label="Search country"
          />
          <div className="country-code-list">
            {filtered.length === 0 ? (
              <div className="country-code-empty">No matches</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.iso}
                  type="button"
                  role="option"
                  aria-selected={c.iso === selected.iso}
                  className={`country-code-option${c.iso === selected.iso ? ' is-selected' : ''}`}
                  onClick={() => {
                    onChange(c.iso);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <span aria-hidden="true">{flagEmoji(c.iso)}</span>
                  <span className="country-code-option-dial">{c.dial}</span>
                  <span className="country-code-option-name">{c.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
