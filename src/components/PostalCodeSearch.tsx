'use client';

import { useState } from 'react';
import { fetchPostalCodes, PostalCode } from '@/lib/delivery';

/**
 * Type-ahead "is my postal code covered?" lookup for the Delivery Locations page (17). The result
 * shows the district (or, for unmapped-district codes, the raw lorry zone) - see the page's intro
 * copy for what each rail (lorry vs courier) means for that area.
 */
export function PostalCodeSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<PostalCode[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(value: string) {
    setQ(value);
    if (value.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const r = await fetchPostalCodes(value.trim());
      setResults(r.slice(0, 15));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ margin: '1.25rem 0', maxWidth: 420 }}>
      <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
        Check your postal code
      </label>
      <input
        type="text"
        value={q}
        onChange={(e) => void search(e.target.value)}
        placeholder="e.g. 00100"
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '1rem',
        }}
      />
      {loading && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Searching…</p>}
      {results && !loading && (
        <div style={{ marginTop: '0.5rem' }}>
          {results.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>
              No match yet — courier still delivers almost everywhere in Sri Lanka; in-house lorry
              coverage depends on your area. Contact us to confirm.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {results.map((r) => (
                <li
                  key={r.postalCode}
                  style={{ padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}
                >
                  <strong>{r.postalCode}</strong> — {r.zoneName}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
