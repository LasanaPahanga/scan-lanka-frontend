'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
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
import { mutedText, adminMain, primaryButton, fieldInput } from '@/components/formStyles';

const emptyBanner = {
  linkUrl: '',
  displayOrder: 0,
  startsAt: '',
  endsAt: '',
  active: true,
};

export default function AdminMerchPage() {
  const [entries, setEntries] = useState<FeaturedEntry[]>([]);
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [productId, setProductId] = useState('');
  const [order, setOrder] = useState('0');
  const [draft, setDraft] = useState(emptyBanner);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = async () => {
    const [f, b] = await Promise.all([listFeatured(), listBanners()]);
    setEntries(f);
    setBanners(b);
  };

  useEffect(() => {
    reload().catch(() => {});
  }, []);

  async function addFeatured(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const next = [...entries, { productId: Number(productId), displayOrder: Number(order) }].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
    await saveFeatured(next);
    setProductId('');
    await reload();
    setMsg('Featured list saved.');
  }

  async function removeFeatured(id: number) {
    await saveFeatured(entries.filter((e) => e.productId !== id));
    await reload();
  }

  async function addBanner(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    await createBanner({
      imageUrl: '',
      linkUrl: draft.linkUrl || null,
      displayOrder: draft.displayOrder,
      startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
      endsAt: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
      active: draft.active,
    });
    setDraft(emptyBanner);
    await reload();
    setMsg('Banner created - upload an image below.');
  }

  async function saveBanner(b: HomeBanner) {
    await updateBanner(b.id, {
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl,
      displayOrder: b.displayOrder,
      startsAt: b.startsAt,
      endsAt: b.endsAt,
      active: b.active,
    });
    await reload();
    setMsg(`Banner ${b.id} saved.`);
  }

  async function onUpload(id: number, file: File) {
    await uploadBannerImage(id, file);
    await reload();
    setMsg(`Image uploaded for banner ${id}.`);
  }

  return (
    <main style={{ ...adminMain, maxWidth: 720 }}>
      <h1>Homepage merchandising</h1>
      {msg && <p>{msg}</p>}

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Featured products</h2>
        <p style={mutedText}>Products appear on the homepage in display order.</p>
        <form onSubmit={addFeatured} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            style={fieldInput}
            placeholder="Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          />
          <input style={fieldInput} placeholder="Order" value={order} onChange={(e) => setOrder(e.target.value)} />
          <button type="submit" style={primaryButton}>
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
        <form onSubmit={addBanner} style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            style={fieldInput}
            placeholder="Link URL (https://… or /path)"
            value={draft.linkUrl}
            onChange={(e) => setDraft((d) => ({ ...d, linkUrl: e.target.value }))}
          />
          <input
            style={fieldInput}
            type="number"
            placeholder="Display order"
            value={draft.displayOrder}
            onChange={(e) => setDraft((d) => ({ ...d, displayOrder: Number(e.target.value) }))}
          />
          <label style={mutedText}>
            Starts{' '}
            <input
              type="datetime-local"
              value={draft.startsAt}
              onChange={(e) => setDraft((d) => ({ ...d, startsAt: e.target.value }))}
            />
          </label>
          <label style={mutedText}>
            Ends{' '}
            <input
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

        {banners.map((b) => (
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
            {b.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.imageUrl} alt="" style={{ display: 'block', maxWidth: '100%', margin: '0.5rem 0' }} />
            )}
            <input
              style={{ ...fieldInput, width: '100%', marginBottom: '0.35rem' }}
              value={b.linkUrl ?? ''}
              onChange={(e) =>
                setBanners((prev) => prev.map((x) => (x.id === b.id ? { ...x, linkUrl: e.target.value || null } : x)))
              }
              placeholder="Link URL"
            />
            <input
              style={fieldInput}
              type="number"
              value={b.displayOrder}
              onChange={(e) =>
                setBanners((prev) =>
                  prev.map((x) => (x.id === b.id ? { ...x, displayOrder: Number(e.target.value) } : x)),
                )
              }
            />
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(b.id, file);
              }}
            />
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <button type="button" style={primaryButton} onClick={() => saveBanner(b)}>
                Save
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteBanner(b.id);
                  await reload();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
