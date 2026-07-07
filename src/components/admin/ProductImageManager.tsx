'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  StoredImageView,
  adminDeleteProductImage,
  adminListProductImages,
  adminMediaUrl,
  adminSetProductImagePreview,
  adminSetProductImageVariant,
  adminUploadProductImage,
} from '@/lib/admin-catalog';
import { mutedText, secondaryButton } from '@/components/formStyles';

export interface ImageManagerVariant {
  id: number;
  sku: string;
}

export function ProductImageManager({ productId, variants }: { productId: number; variants?: ImageManagerVariant[] }) {
  const [images, setImages] = useState<StoredImageView[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isPreview, setIsPreview] = useState(true);
  const [uploadVariantId, setUploadVariantId] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasVariants = Boolean(variants && variants.length > 0);

  const reload = useCallback(async () => {
    const rows = await adminListProductImages(productId);
    setImages(rows);
    setIsPreview(rows.length === 0);
  }, [productId]);

  useEffect(() => {
    void reload().catch(() => setImages([]));
  }, [reload]);

  async function upload() {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    const variantId = uploadVariantId === '' ? null : uploadVariantId;
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        // Only the first file can claim the preview slot; the rest are gallery images.
        await adminUploadProductImage(productId, files[i], isPreview && i === 0, variantId);
      }
      setFiles([]);
      setUploadVariantId('');
      const input = document.getElementById('img-input') as HTMLInputElement | null;
      if (input) input.value = '';
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setProgress(null);
      setBusy(false);
    }
  }

  async function changeVariant(imageId: number, variantId: number | '') {
    setBusy(true);
    setError(null);
    try {
      await adminSetProductImageVariant(productId, imageId, variantId === '' ? null : variantId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(imageId: number) {
    setBusy(true);
    setError(null);
    try {
      await adminDeleteProductImage(productId, imageId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  async function makePreview(imageId: number) {
    setBusy(true);
    setError(null);
    try {
      await adminSetProductImagePreview(productId, imageId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={box}>
      <strong>Product gallery</strong>
      <p style={mutedText}>
        Upload <strong>multiple photos</strong>. Customers can swipe or pick thumbnails on the product page.
        Mark one image as the <strong>preview</strong> — that thumbnail appears on product cards in the shop.
        {hasVariants && (
          <>
            {' '}Tag a photo to a specific size and it replaces the gallery when a customer picks that size on
            the product page — untagged photos ("All sizes") show by default.
          </>
        )}
      </p>

      {images.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.75rem', margin: '0.75rem 0' }}>
          {images.map((img, idx) => (
            <div key={img.id} style={row}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={adminMediaUrl(img.url) ?? ''}
                alt=""
                style={thumb}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  Image {idx + 1}
                  {img.preview && <span style={badge}>Preview (shop card)</span>}
                </div>
                {hasVariants && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <select
                      value={img.variantId ?? ''}
                      disabled={busy}
                      onChange={(e) => void changeVariant(img.id, e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ fontSize: '0.82rem', padding: '0.2rem 0.4rem' }}
                    >
                      <option value="">All sizes (default)</option>
                      {variants!.map((v) => (
                        <option key={v.id} value={v.id}>{v.sku}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  {!img.preview && (
                    <button
                      type="button"
                      style={{ ...secondaryButton, width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                      disabled={busy}
                      onClick={() => void makePreview(img.id)}
                    >
                      Set as preview
                    </button>
                  )}
                  <button
                    type="button"
                    style={{ ...secondaryButton, width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.82rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    disabled={busy}
                    onClick={() => void remove(img.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ ...mutedText, margin: '0.5rem 0' }}>No images yet — upload at least one photo below.</p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <input
          id="img-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
        />
        {hasVariants && (
          <select
            value={uploadVariantId}
            onChange={(e) => setUploadVariantId(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ fontSize: '0.88rem', padding: '0.3rem 0.4rem' }}
          >
            <option value="">All sizes (default)</option>
            {variants!.map((v) => (
              <option key={v.id} value={v.id}>{v.sku}</option>
            ))}
          </select>
        )}
        <label style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.88rem' }}>
          <input
            type="checkbox"
            checked={isPreview}
            disabled={uploadVariantId !== ''}
            onChange={(e) => setIsPreview(e.target.checked)}
          />
          Set as preview
        </label>
        <button type="button" style={{ ...secondaryButton, width: 'auto' }} onClick={() => void upload()} disabled={files.length === 0 || busy}>
          {busy ? (progress ?? 'Uploading…') : files.length > 1 ? `Upload ${files.length} images` : images.length === 0 ? 'Upload image' : 'Add another image'}
        </button>
      </div>
      <p style={{ ...mutedText, margin: '0.35rem 0 0' }}>
        Tip: you can select several photos at once. To attach many images across the whole catalog in one
        go, use the <Link href="/admin/products/bulk-images" style={{ color: 'var(--primary)' }}>bulk image import</Link>.
      </p>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
}

const box = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1rem',
  background: 'var(--surface)',
} as const;
const row = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'flex-start',
  padding: '0.5rem',
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'var(--bg, #fff)',
} as const;
const thumb = {
  width: 90,
  height: 90,
  objectFit: 'cover' as const,
  borderRadius: 8,
  border: '1px solid var(--border)',
  flexShrink: 0,
};
const badge = {
  marginLeft: '0.5rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--primary)',
} as const;
