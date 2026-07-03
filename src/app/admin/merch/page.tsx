'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  BannerInput,
  FeaturedEntry,
  HomeBanner,
  createBanner,
  deleteBanner,
  listBanners,
  listFeatured,
  saveFeatured,
  updateBanner,
  uploadBannerImage,
} from '@/lib/home';
import { mediaUrl } from '@/lib/catalog';
import { ApiError } from '@/lib/api';
import { mutedText, adminMain, primaryButton, fieldInput } from '@/components/formStyles';

const emptyBanner = {
  linkUrl: '',
  displayOrder: 0,
  startsAt: '',
  endsAt: '',
  active: true,
};

function toIso(local: string): string | null {
  if (!local.trim()) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function bannerInput(b: Pick<HomeBanner, 'linkUrl' | 'displayOrder' | 'startsAt' | 'endsAt' | 'active'>): BannerInput {
  return {
    linkUrl: b.linkUrl?.trim() || null,
    displayOrder: Number.isFinite(b.displayOrder) ? b.displayOrder : 0,
    startsAt: b.startsAt,
    endsAt: b.endsAt,
    active: b.active,
  };
}

export default function AdminMerchPage() {
  const [entries, setEntries] = useState<FeaturedEntry[]>([]);
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [productId, setProductId] = useState('');
  const [order, setOrder] = useState('0');
  const [draft, setDraft] = useState(emptyBanner);
  const [msg, setMsg] = useState<string | null>(null);
  const [bannerStatus, setBannerStatus] = useState<Record<number, { ok?: string; err?: string }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [pendingFile, setPendingFile] = useState<Record<number, File | null>>({});

  const reload = async () => {
    const [f, b] = await Promise.all([listFeatured(), listBanners()]);
    setEntries(f);
    setBanners(b);
  };

  useEffect(() => {
    reload().catch(() => setMsg('Could not load merchandising data. Is the backend running?'));
  }, []);

  async function addFeatured(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const next = [...entries, { productId: Number(productId), displayOrder: Number(order) }].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      await saveFeatured(next);
      setProductId('');
      await reload();
      setMsg('Featured list saved.');
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Could not save featured list.');
    }
  }

  async function removeFeatured(id: number) {
    try {
      await saveFeatured(entries.filter((e) => e.productId !== id));
      await reload();
      setMsg('Featured product removed.');
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Could not remove featured product.');
    }
  }

  async function addBanner(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await createBanner({
        linkUrl: draft.linkUrl.trim() || null,
        displayOrder: draft.displayOrder,
        startsAt: toIso(draft.startsAt),
        endsAt: toIso(draft.endsAt),
        active: draft.active,
      });
      setDraft(emptyBanner);
      await reload();
      setMsg('Banner created — scroll down to upload an image.');
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Could not create banner.');
    }
  }

  async function saveBanner(b: HomeBanner) {
    setBannerStatus((s) => ({ ...s, [b.id]: {} }));
    setSavingId(b.id);
    try {
      await updateBanner(b.id, bannerInput(b));
      const file = pendingFile[b.id];
      if (file) {
        await uploadBannerImage(b.id, file);
        setPendingFile((p) => ({ ...p, [b.id]: null }));
      }
      await reload();
      setBannerStatus((s) => ({
        ...s,
        [b.id]: { ok: file ? 'Banner and image saved.' : 'Banner saved.' },
      }));
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Could not save banner.';
      setBannerStatus((s) => ({ ...s, [b.id]: { err: message } }));
    } finally {
      setSavingId(null);
    }
  }

  async function removeBanner(id: number) {
    setBannerStatus((s) => ({ ...s, [id]: {} }));
    try {
      await deleteBanner(id);
      await reload();
      setMsg(`Banner ${id} deleted.`);
    } catch (e) {
      setBannerStatus((s) => ({
        ...s,
        [id]: { err: e instanceof ApiError ? e.message : 'Could not delete banner.' },
      }));
    }
  }

  return (
    <main style={{ ...adminMain, maxWidth: 720 }}>
      <h1>Homepage merchandising</h1>
      {msg && <p style={{ color: 'var(--primary)' }}>{msg}</p>}

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Featured products</h2>
        <p style={mutedText}>Products appear on the homepage in display order.</p>
        <form onSubmit={addFeatured} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          <label style={fieldLabel}>
            <span style={fieldTitle}>Product ID</span>
            <span style={fieldHint}>From Admin → Products (shown in the URL when editing, e.g. /admin/products/42 → 42).</span>
            <input
              style={fieldInput}
              placeholder="e.g. 42"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            />
          </label>
          <label style={fieldLabel}>
            <span style={fieldTitle}>Display order</span>
            <span style={fieldHint}>Lower numbers appear first on the homepage (0 = first).</span>
            <input
              style={fieldInput}
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </label>
          <button type="submit" style={{ ...primaryButton, width: 'auto' }}>
            Add
          </button>
        </form>
        <ul>
          {entries.map((e) => (
            <li key={e.productId} style={{ marginBottom: '0.35rem' }}>
              Product {e.productId} - order {e.displayOrder}{' '}
              <button type="button" onClick={() => removeFeatured(e.productId)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: '1.05rem' }}>Banners</h2>
        <p style={mutedText}>Scheduled banners rotate on the homepage carousel.</p>
        <form onSubmit={addBanner} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <label style={fieldLabel}>
            <span style={fieldTitle}>Link URL</span>
            <span style={fieldHint}>Where the banner goes when clicked (https://… or /products).</span>
            <input
              style={fieldInput}
              placeholder="https://… or /path"
              value={draft.linkUrl}
              onChange={(e) => setDraft((d) => ({ ...d, linkUrl: e.target.value }))}
            />
          </label>
          <label style={fieldLabel}>
            <span style={fieldTitle}>Display order</span>
            <span style={fieldHint}>Lower numbers show first in the carousel (0 = first slide).</span>
            <input
              style={fieldInput}
              type="number"
              min={0}
              value={draft.displayOrder}
              onChange={(e) => setDraft((d) => ({ ...d, displayOrder: Number(e.target.value) }))}
            />
          </label>
          <label style={fieldLabel}>
            <span style={fieldTitle}>Starts</span>
            <span style={fieldHint}>Leave blank to show immediately.</span>
            <input
              style={fieldInput}
              type="datetime-local"
              value={draft.startsAt}
              onChange={(e) => setDraft((d) => ({ ...d, startsAt: e.target.value }))}
            />
          </label>
          <label style={fieldLabel}>
            <span style={fieldTitle}>Ends</span>
            <span style={fieldHint}>Leave blank for no end date.</span>
            <input
              style={fieldInput}
              type="datetime-local"
              value={draft.endsAt}
              onChange={(e) => setDraft((d) => ({ ...d, endsAt: e.target.value }))}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
            />{' '}
            Active
          </label>
          <button type="submit" style={primaryButton}>
            Create banner
          </button>
        </form>

        {banners.map((b) => {
          const src = mediaUrl(b.imageUrl);
          const status = bannerStatus[b.id];
          return (
            <div
              key={b.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <strong>Banner #{b.id}</strong>
              {src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" style={{ display: 'block', maxWidth: '100%', margin: '0.5rem 0', borderRadius: 8 }} />
              )}
              <label style={{ ...fieldLabel, marginTop: '0.5rem' }}>
                <span style={fieldTitle}>Link URL</span>
                <input
                  style={fieldInput}
                  value={b.linkUrl ?? ''}
                  onChange={(e) =>
                    setBanners((prev) =>
                      prev.map((x) => (x.id === b.id ? { ...x, linkUrl: e.target.value || null } : x)),
                    )
                  }
                  placeholder="https://… or /path"
                />
              </label>
              <label style={fieldLabel}>
                <span style={fieldTitle}>Display order</span>
                <span style={fieldHint}>Lower numbers show first in the carousel (0 = first slide).</span>
                <input
                  style={fieldInput}
                  type="number"
                  min={0}
                  value={b.displayOrder}
                  onChange={(e) =>
                    setBanners((prev) =>
                      prev.map((x) => (x.id === b.id ? { ...x, displayOrder: Number(e.target.value) } : x)),
                    )
                  }
                />
              </label>
              <label style={fieldLabel}>
                <span style={fieldTitle}>Starts</span>
                <input
                  style={fieldInput}
                  type="datetime-local"
                  value={toLocalInput(b.startsAt)}
                  onChange={(e) =>
                    setBanners((prev) =>
                      prev.map((x) => (x.id === b.id ? { ...x, startsAt: toIso(e.target.value) } : x)),
                    )
                  }
                />
              </label>
              <label style={fieldLabel}>
                <span style={fieldTitle}>Ends</span>
                <input
                  style={fieldInput}
                  type="datetime-local"
                  value={toLocalInput(b.endsAt)}
                  onChange={(e) =>
                    setBanners((prev) =>
                      prev.map((x) => (x.id === b.id ? { ...x, endsAt: toIso(e.target.value) } : x)),
                    )
                  }
                />
              </label>
              <label style={{ display: 'block', margin: '0.35rem 0' }}>
                <input
                  type="checkbox"
                  checked={b.active}
                  onChange={(e) =>
                    setBanners((prev) => prev.map((x) => (x.id === b.id ? { ...x, active: e.target.checked } : x)))
                  }
                />{' '}
                Active
              </label>
              <label style={fieldLabel}>
                <span style={fieldTitle}>Banner image</span>
                <span style={fieldHint}>Pick a file, then click Save to upload and apply all changes.</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setPendingFile((p) => ({ ...p, [b.id]: file }));
                    setBannerStatus((s) => ({ ...s, [b.id]: {} }));
                  }}
                />
                {pendingFile[b.id] && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                    Ready to upload: {pendingFile[b.id]!.name}
                  </span>
                )}
              </label>
              {status?.ok && <p style={{ color: 'var(--success)', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>{status.ok}</p>}
              {status?.err && <p style={{ color: 'var(--danger)', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>{status.err}</p>}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{ ...primaryButton, width: 'auto', opacity: savingId === b.id ? 0.7 : 1 }}
                  disabled={savingId === b.id}
                  onClick={() => void saveBanner(b)}
                >
                  {savingId === b.id ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => void removeBanner(b.id)} disabled={savingId === b.id}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

const fieldLabel = { display: 'grid', gap: '0.3rem' } as const;
const fieldTitle = { fontWeight: 600, fontSize: '0.9rem' } as const;
const fieldHint = { ...mutedText, fontSize: '0.8rem', margin: 0 } as const;
