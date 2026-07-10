'use client';

import { useState } from 'react';
import {
  BulkImportReport,
  BulkImportRowStatus,
  adminBulkImportImages,
} from '@/lib/admin-catalog';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

const STATUS_LABEL: Record<BulkImportRowStatus, { text: string; color: string }> = {
  OK_VARIANT: { text: 'Matched to size', color: 'var(--primary)' },
  OK_PRODUCT: { text: 'Product image', color: 'var(--primary)' },
  DUPLICATE: { text: 'Skipped — already on product', color: 'var(--muted)' },
  SIZE_NOT_MATCHED: { text: 'Skipped — size not recognised', color: 'var(--accent, #b45309)' },
  NO_PRODUCT: { text: 'Skipped — no matching product', color: 'var(--danger)' },
  BAD_IMAGE: { text: 'Not a valid image', color: 'var(--danger)' },
  NOT_AN_IMAGE: { text: 'Skipped', color: 'var(--muted)' },
};

export default function BulkImagesPage() {
  const [zip, setZip] = useState<File | null>(null);
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const [applied, setApplied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(dryRun: boolean) {
    if (!zip) return;
    setBusy(true);
    setError(null);
    try {
      const r = await adminBulkImportImages(zip, dryRun);
      setReport(r);
      setApplied(!dryRun);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  const willImport = report ? report.matchedVariant + report.matchedProduct : 0;

  return (
    <main style={adminMain}>
      <AdminPageHeader
        title="Bulk image import"
        description="Attach many product photos at once from a single zip file."
        back={{ href: '/admin/products', label: 'Products' }}
      />

      <section style={card}>
        <h2 style={h2}>How to name your files</h2>
        <p style={muted}>
          Name each photo after the product, then optionally the size, separated by a{' '}
          <strong>double underscore</strong> (<code>__</code>). Put them all in one <strong>.zip</strong> and
          upload it below. You&apos;ll see a preview of what matches before anything is saved.
        </p>
        <ul style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          <li>
            <code>scan-white-board__4x3.jpg</code> → attaches to <em>Scan White Board</em>, size <em>4 × 3</em>
          </li>
          <li>
            <code>scan-white-board__1.5x1.5.jpg</code> → size <em>1½ × 1½</em> (use <code>1.5</code> for halves)
          </li>
          <li>
            <code>pin-board.jpg</code> → a general product image (shown for every size)
          </li>
          <li>
            <code>scan-white-board__4x3__2.jpg</code> → a second photo for that size (any text after a third{' '}
            <code>__</code> is just a label)
          </li>
        </ul>
        <p style={muted}>
          The product name is its <strong>slug</strong> (the last part of its shop web address). Sizes match
          your product&apos;s size options — spaces, <code>x</code>/<code>×</code> and halves are handled
          automatically. Anything that doesn&apos;t match a size still attaches to the product, and you can
          fix it afterwards on the product page.
        </p>
      </section>

      <section style={card}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="file"
            accept=".zip,application/zip"
            onChange={(e) => {
              setZip(e.target.files?.[0] ?? null);
              setReport(null);
              setApplied(false);
            }}
          />
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            disabled={!zip || busy}
            onClick={() => void run(true)}
          >
            {busy ? 'Working…' : 'Preview matches'}
          </button>
          {report && !applied && willImport > 0 && (
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={busy}
              onClick={() => void run(false)}
            >
              {busy ? 'Importing…' : `Import ${willImport} image${willImport === 1 ? '' : 's'}`}
            </button>
          )}
        </div>
        {error && <p style={{ color: 'var(--danger)', marginTop: '0.75rem' }}>{error}</p>}
      </section>

      {report && (
        <section style={card}>
          <h2 style={h2}>
            {applied ? 'Import complete' : 'Preview'} — {report.imageEntries} image
            {report.imageEntries === 1 ? '' : 's'} in the zip
          </h2>
          <p style={muted}>
            {applied ? 'Imported' : 'Will import'}:{' '}
            <strong>{report.matchedVariant}</strong> matched to a size,{' '}
            <strong>{report.matchedProduct}</strong> as general product images.{' '}
            {report.duplicate > 0 && (
              <span>{report.duplicate} already on their product (skipped). </span>
            )}
            {report.unmatched > 0 && (
              <span style={{ color: 'var(--danger)' }}>
                {report.unmatched} need attention (see below).
              </span>
            )}
          </p>
          {applied && <p style={{ color: 'var(--primary)' }}>✓ Saved. You can re-check any product to see its new photos.</p>}

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ marginTop: '0.75rem', minWidth: 640 }}>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r, i) => {
                  const s = STATUS_LABEL[r.status];
                  return (
                    <tr key={`${r.filename}-${i}`}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{r.filename}</td>
                      <td>{r.productName ?? <span style={{ color: 'var(--danger)' }}>{r.productSlug}</span>}</td>
                      <td>{r.sizeLabel ?? r.sizeToken ?? '—'}</td>
                      <td style={{ color: s.color }}>
                        {s.text}
                        {r.message && <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{r.message}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

const card = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1.25rem',
  background: 'var(--surface)',
  marginTop: '1rem',
} as const;
const h2 = { fontSize: '1.05rem', margin: '0 0 0.5rem' } as const;
const muted = { color: 'var(--muted)', fontSize: '0.9rem' } as const;
