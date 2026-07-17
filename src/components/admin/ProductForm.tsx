'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminProductDetail,
  AdminSpecGroup,
  AdminVariant,
  CreateProductBody,
  DeliveryAttrs,
  GroupInput,
  VariantInput,
  adminAddVariant,
  adminCreateProduct,
  adminDeleteVariant,
  adminUpdateProduct,
  adminUpdateVariantDelivery,
} from '@/lib/admin-catalog';
import { fieldInput, primaryButton, secondaryButton, mutedText } from '@/components/formStyles';
import { ProductImageManager } from './ProductImageManager';
import { ProductDeliveryFields } from './ProductDeliveryFields';

const emptyDelivery = (): DeliveryAttrs => ({
  boardSizeTier: null,
  lorryColomboCents: null,
  lorrySuburbCents: null,
  lorryOuterCents: null,
  lorryColomboGateCents: null,
  lorrySuburbGateCents: null,
  lorryOuterGateCents: null,
  lorryColomboEnabled: true,
  lorrySuburbEnabled: true,
  lorryOuterEnabled: true,
  lorryOuterWhatsapp: false,
  courierOuterBlocked: false,
  courierEnabled: true,
  whatsappOnly: false,
});

const HANDLING = ['STANDARD', 'FRAGILE_GLASS', 'OVERSIZE'];

type Props = {
  existing?: AdminProductDetail;
  categories: string[];
};

type GroupDraft = { name: string; options: string };
type ComboRow = { values: string[]; priceRupees: string; stock: string };

/** rupees string → integer cents; '' → null. */
function rupeesToCents(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

function cartesian(lists: string[][]): string[][] {
  return lists.reduce<string[][]>((acc, list) => acc.flatMap((row) => list.map((v) => [...row, v])), [[]]);
}

export function ProductForm({ existing, categories }: Props) {
  const router = useRouter();
  const isEdit = Boolean(existing);
  const isVariant = existing?.priceMode === 'VARIANT';

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState(existing?.category ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [details, setDetails] = useState(existing?.details ?? '');
  const [handlingClass, setHandlingClass] = useState(existing?.handlingClass ?? 'STANDARD');
  const [active, setActive] = useState(existing?.active ?? true);
  const [displayOrder, setDisplayOrder] = useState(
    existing?.displayOrder != null ? String(existing.displayOrder) : '',
  );

  // SINGLE-price fields
  const [priceRupees, setPriceRupees] = useState(
    existing?.singlePriceCents != null ? String(existing.singlePriceCents / 100) : '',
  );
  const [stock, setStock] = useState(existing?.stockQty != null ? String(existing.stockQty) : '');

  // create-only: price mode + variant builder
  const [mode, setMode] = useState<'SINGLE' | 'VARIANT'>('SINGLE');
  const [groups, setGroups] = useState<GroupDraft[]>([{ name: '', options: '' }]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryAttrs>(existing?.delivery ?? emptyDelivery());

  // Build the option matrix for the variant builder (create mode only).
  const optionLists = useMemo(
    () =>
      groups
        .map((g) => ({ name: g.name.trim(), opts: g.options.split(',').map((o) => o.trim()).filter(Boolean) }))
        .filter((g) => g.name && g.opts.length > 0),
    [groups],
  );
  const combos = useMemo(
    () => (optionLists.length ? cartesian(optionLists.map((g) => g.opts)) : []),
    [optionLists],
  );
  const [comboPrices, setComboPrices] = useState<Record<string, string>>({});
  const [comboStock, setComboStock] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && existing) {
        await adminUpdateProduct(existing.id, {
          name: name.trim(),
          description: description || null,
          details: details || null,
          category: category.trim() || null,
          handlingClass,
          active,
          displayOrder: displayOrder.trim() === '' ? undefined : Number(displayOrder),
          delivery: isVariant ? undefined : delivery,
          stockQty: isVariant ? undefined : stock.trim() === '' ? null : Number(stock),
          singlePriceCents: isVariant ? undefined : rupeesToCents(priceRupees),
        });
        router.push(`/admin/products/${existing.id}`);
        router.refresh();
        return;
      }

      // create
      const body: CreateProductBody = {
        name: name.trim(),
        description: description || null,
        details: details || null,
        category: category.trim() || null,
        handlingClass,
      };
      if (mode === 'SINGLE') {
        const cents = rupeesToCents(priceRupees);
        if (cents == null) {
          setError('Enter a price (in rupees) for a single-price product.');
          setSaving(false);
          return;
        }
        body.singlePriceCents = cents;
        body.stockQty = stock.trim() === '' ? null : Number(stock);
      } else {
        if (optionLists.length === 0) {
          setError('Add at least one option group with options for a variant product.');
          setSaving(false);
          return;
        }
        const groupInputs: GroupInput[] = optionLists.map((g) => ({
          name: g.name,
          priceAffecting: true,
          options: g.opts,
        }));
        const variantInputs: VariantInput[] = combos.map((values) => {
          const key = values.join('|');
          return {
            optionValues: values,
            priceCents: rupeesToCents(comboPrices[key] ?? '') ?? 0,
            stockQty: comboStock[key]?.trim() ? Number(comboStock[key]) : null,
          };
        });
        if (variantInputs.some((v) => v.priceCents <= 0)) {
          setError('Enter a price for every variant combination.');
          setSaving(false);
          return;
        }
        body.groups = groupInputs;
        body.variants = variantInputs;
      }
      const { id } = await adminCreateProduct(body);
      // go to edit page so the admin can add images next
      router.push(`/admin/products/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: 720 }}>
      {error && <div style={errorBox}>{error}</div>}

      <Field label="Name *">
        <input style={fieldInput} value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>

      <Field label="Category" hint="Type a new name to create a category, or reuse an existing one.">
        <input
          style={fieldInput}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="category-options"
          placeholder="e.g. Carrom Board"
        />
        <datalist id="category-options">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      <Field label="Short description">
        <textarea
          style={{ ...fieldInput, minHeight: 70 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>

      <Field label="Details">
        <textarea
          style={{ ...fieldInput, minHeight: 90 }}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </Field>

      <Field label="Handling class" hint="Affects delivery surcharge (glass = fragile, large items = oversize).">
        <select style={fieldInput} value={handlingClass} onChange={(e) => setHandlingClass(e.target.value)}>
          {HANDLING.map((h) => (
            <option key={h} value={h}>
              {h.replace('_', ' ')}
            </option>
          ))}
        </select>
      </Field>

      {/* Pricing */}
      {!isEdit && (
        <Field label="Pricing">
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <label style={radio}>
              <input type="radio" checked={mode === 'SINGLE'} onChange={() => setMode('SINGLE')} /> Single price
            </label>
            <label style={radio}>
              <input type="radio" checked={mode === 'VARIANT'} onChange={() => setMode('VARIANT')} /> Variants
              (e.g. sizes)
            </label>
          </div>
        </Field>
      )}

      {(isEdit ? !isVariant : mode === 'SINGLE') && (
        <div className="admin-grid-2cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Price (Rs) *">
            <input
              style={fieldInput}
              type="number"
              min="0"
              step="0.01"
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
            />
          </Field>
          <Field label="Stock" hint="Leave blank for unlimited.">
            <input
              style={fieldInput}
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </Field>
        </div>
      )}

      {/* Variant builder (create only) */}
      {!isEdit && mode === 'VARIANT' && (
        <div style={builderBox}>
          <strong>Option groups</strong>
          <p style={mutedText}>
            Each group is a choice (e.g. “Size”) with comma-separated options (e.g. “2x3, 3x4, 4x6”). Every
            combination becomes a priced variant below.
          </p>
          {groups.map((g, i) => (
            <div key={i} className="admin-grid-3cols" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                style={fieldInput}
                placeholder="Group name (Size)"
                value={g.name}
                onChange={(e) => setGroups((p) => p.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              />
              <input
                style={fieldInput}
                placeholder="Options, comma-separated"
                value={g.options}
                onChange={(e) => setGroups((p) => p.map((x, j) => (j === i ? { ...x, options: e.target.value } : x)))}
              />
              <button
                type="button"
                style={secondaryButton}
                onClick={() => setGroups((p) => p.filter((_, j) => j !== i))}
                disabled={groups.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" style={{ ...secondaryButton, width: 'auto' }} onClick={() => setGroups((p) => [...p, { name: '', options: '' }])}>
            + Add group
          </button>

          {combos.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong>Variant prices ({combos.length})</strong>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    {optionLists.map((g) => (
                      <th key={g.name} style={cellHead}>{g.name}</th>
                    ))}
                    <th style={cellHead}>Price (Rs)</th>
                    <th style={cellHead}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {combos.map((values) => {
                    const key = values.join('|');
                    return (
                      <tr key={key}>
                        {values.map((v, idx) => (
                          <td key={idx} style={cell}>{v}</td>
                        ))}
                        <td style={cell}>
                          <input
                            style={{ ...fieldInput, padding: '0.4rem' }}
                            type="number"
                            min="0"
                            step="0.01"
                            value={comboPrices[key] ?? ''}
                            onChange={(e) => setComboPrices((p) => ({ ...p, [key]: e.target.value }))}
                          />
                        </td>
                        <td style={cell}>
                          <input
                            style={{ ...fieldInput, padding: '0.4rem' }}
                            type="number"
                            min="0"
                            placeholder="∞"
                            value={comboStock[key] ?? ''}
                            onChange={(e) => setComboStock((p) => ({ ...p, [key]: e.target.value }))}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Variant add / delete + per-size delivery */}
      {isEdit && isVariant && (
        <VariantManager
          productId={existing!.id}
          specGroups={existing!.specGroups}
          initialVariants={existing!.variants}
        />
      )}

      {isEdit && !isVariant && (
        <div style={builderBox}>
          <strong>Shipping</strong>
          <ProductDeliveryFields value={delivery} onChange={setDelivery} />
        </div>
      )}

      {isEdit && (
        <Field label="Visibility">
          <label style={radio}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active (visible
            in the shop)
          </label>
        </Field>
      )}

      {isEdit && (
        <Field label="Storefront position">
          <input
            style={fieldInput}
            type="number"
            min="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
          <p style={{ ...mutedText, margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
            Lower shows earlier on the home page and shop listing (seeded from the owner sheet order;
            new products default to the end).
          </p>
        </Field>
      )}

      {isEdit && existing && (
        <ProductImageManager productId={existing.id} variants={isVariant ? existing.variants : undefined} />
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" style={{ ...primaryButton, width: 'auto' }} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
        <button type="button" style={{ ...secondaryButton, width: 'auto' }} onClick={() => router.push('/admin/products')}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '0.3rem' }}>
      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
      {children}
      {hint && <span style={{ ...mutedText, fontSize: '0.8rem' }}>{hint}</span>}
    </label>
  );
}

const errorBox = {
  background: '#fde8e8',
  color: '#9b1c1c',
  padding: '0.6rem 0.85rem',
  borderRadius: 'var(--radius)',
  fontSize: '0.9rem',
} as const;
const radio = { display: 'inline-flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.9rem' } as const;
const builderBox = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '1rem',
  background: 'var(--surface)',
} as const;
const cellHead = { textAlign: 'left' as const, padding: '0.35rem 0.5rem', color: 'var(--muted)', fontSize: '0.78rem' };
const cell = { padding: '0.25rem 0.5rem', borderTop: '1px solid var(--border)' } as const;

/** Add / delete sizes on an existing variant product, plus per-size shipping. Manages its own list. */
function VariantManager({
  productId,
  specGroups,
  initialVariants,
}: {
  productId: number;
  specGroups: AdminSpecGroup[];
  initialVariants: AdminVariant[];
}) {
  const priceGroups = useMemo(() => specGroups.filter((g) => g.priceAffecting), [specGroups]);
  // option id -> value, to turn a variant's signature into a readable size label
  const optionValueById = useMemo(() => {
    const m = new Map<number, string>();
    priceGroups.forEach((g) => g.options.forEach((o) => m.set(o.id, o.value)));
    return m;
  }, [priceGroups]);
  const sizeLabel = (signature: string) =>
    signature
      .split('-')
      .map((tok) => optionValueById.get(Number(tok)) ?? tok)
      .join(' · ');

  const [variants, setVariants] = useState<AdminVariant[]>(initialVariants);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // add-size form
  const [newValues, setNewValues] = useState<string[]>(priceGroups.map(() => ''));
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [adding, setAdding] = useState(false);

  async function add() {
    const values = newValues.map((v) => v.trim());
    if (values.some((v) => v === '')) {
      setError('Enter a value for every option.');
      return;
    }
    const price = Math.round(Number(newPrice) * 100);
    if (!price || price <= 0) {
      setError('Enter a valid price.');
      return;
    }
    setAdding(true);
    setError(null);
    setMsg(null);
    try {
      const v = await adminAddVariant(productId, values, price, newStock.trim() === '' ? null : Number(newStock));
      setVariants((prev) => [
        ...prev,
        { id: v.id, sku: v.sku, priceCents: v.priceCents, optionsSignature: v.signature, availability: 'IN_STOCK', delivery: emptyDelivery() },
      ]);
      setNewValues(priceGroups.map(() => ''));
      setNewPrice('');
      setNewStock('');
      setMsg(`Added size ${values.join(' · ')}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add the size.');
    } finally {
      setAdding(false);
    }
  }

  async function remove(v: AdminVariant) {
    if (!window.confirm(`Delete size "${sizeLabel(v.optionsSignature)}"? This can't be undone.`)) return;
    setBusyId(v.id);
    setError(null);
    setMsg(null);
    try {
      await adminDeleteVariant(productId, v.id);
      setVariants((prev) => prev.filter((x) => x.id !== v.id));
      setMsg('Size deleted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete the size.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={builderBox}>
      <strong>Sizes &amp; shipping</strong>
      <p style={mutedText}>
        Add a size that was missed, or delete a wrong one. Set the board size tier and lorry charges per size below.
        A size that has already been ordered can&apos;t be deleted.
      </p>
      {msg && <p style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{msg}</p>}
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
        {variants.map((v) => (
          <li key={v.id} style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.9rem' }}>
                {sizeLabel(v.optionsSignature)} — Rs {Math.round(v.priceCents / 100).toLocaleString('en-LK')}
              </strong>
              <button
                type="button"
                style={{ ...secondaryButton, width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                disabled={busyId === v.id || variants.length <= 1}
                title={variants.length <= 1 ? 'A product must keep at least one size' : undefined}
                onClick={() => void remove(v)}
              >
                {busyId === v.id ? 'Deleting…' : 'Delete size'}
              </button>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <VariantDeliveryEditor
                productId={productId}
                variantId={v.id}
                initial={v.delivery}
                onSaved={() => setMsg(`Saved shipping for ${sizeLabel(v.optionsSignature)}.`)}
              />
            </div>
          </li>
        ))}
      </ul>

      <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '0.75rem' }}>
        <strong style={{ fontSize: '0.9rem' }}>Add a size</strong>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '0.5rem' }}>
          {priceGroups.map((g, i) => (
            <label key={g.id} style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              {g.name}
              <input
                style={{ ...fieldInput, display: 'block', width: 120 }}
                value={newValues[i] ?? ''}
                placeholder={g.name.toLowerCase().includes('size') ? 'e.g. 2 x 3' : ''}
                onChange={(e) => setNewValues((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
              />
            </label>
          ))}
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            Price (Rs)
            <input style={{ ...fieldInput, display: 'block', width: 120 }} type="number" min="0" step="0.01"
              value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
          </label>
          <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            Stock (optional)
            <input style={{ ...fieldInput, display: 'block', width: 120 }} type="number" min="0"
              value={newStock} onChange={(e) => setNewStock(e.target.value)} />
          </label>
          <button type="button" style={{ ...primaryButton, width: 'auto' }} disabled={adding} onClick={() => void add()}>
            {adding ? 'Adding…' : 'Add size'}
          </button>
        </div>
        <p style={{ ...mutedText, marginTop: '0.4rem' }}>
          New sizes start with no lorry charges — set their shipping in the list above after adding.
        </p>
      </div>
    </div>
  );
}

function VariantDeliveryEditor({
  productId,
  variantId,
  initial,
  onSaved,
}: {
  productId: number;
  variantId: number;
  initial: DeliveryAttrs;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <ProductDeliveryFields value={draft} onChange={setDraft} compact />
      <button
        type="button"
        style={{ ...secondaryButton, width: 'auto', marginTop: '0.5rem' }}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await adminUpdateVariantDelivery(productId, variantId, draft);
            onSaved();
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'Saving…' : 'Save shipping for this size'}
      </button>
    </div>
  );
}
