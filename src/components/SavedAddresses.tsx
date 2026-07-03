'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  SavedAddress,
} from '@/lib/addresses';
import { dangerText, mutedText, primaryButton } from '@/components/formStyles';

export function SavedAddresses() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    isDefault: false,
  });

  function refresh() {
    return listAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createAddress(form);
      setForm({
        label: '',
        street: '',
        city: '',
        province: '',
        postalCode: '',
        phone: '',
        email: '',
        isDefault: false,
      });
      await refresh();
    } catch {
      setError('Could not save address. Verify your email is confirmed.');
    }
  }

  return (
    <>
      <h2>Saved addresses</h2>

      {loading ? (
        <p style={mutedText}>Loading…</p>
      ) : addresses.length === 0 ? (
        <p className="account-empty">No saved addresses yet. Add one below for faster checkout.</p>
      ) : (
        <ul className="account-address-list">
          {addresses.map((a) => (
            <li key={a.id} className="account-address-card">
              <div>
                <strong>
                  {a.label ?? 'Address'}
                  {a.isDefault && <span className="account-badge">Default</span>}
                </strong>
                <p>
                  {a.street}
                  <br />
                  {a.city}, {a.province} {a.postalCode}
                  <br />
                  {a.phone} · {a.email}
                </p>
              </div>
              <button
                type="button"
                className="account-remove-btn"
                onClick={() => void deleteAddress(a.id).then(refresh)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="account-form-title">Add new address</h3>
      <form onSubmit={onAdd} className="account-form-grid">
        <div className="account-field">
          <label htmlFor="addr-label">Label</label>
          <input
            id="addr-label"
            placeholder="e.g. Home, Office"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          />
        </div>

        <div className="account-field">
          <label htmlFor="addr-street">Street address</label>
          <input
            id="addr-street"
            placeholder="House no., street name"
            value={form.street}
            required
            onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
          />
        </div>

        <div className="account-form-row-3">
          <div className="account-field">
            <label htmlFor="addr-city">City</label>
            <input
              id="addr-city"
              placeholder="City"
              value={form.city}
              required
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div className="account-field">
            <label htmlFor="addr-province">Province</label>
            <input
              id="addr-province"
              placeholder="Province"
              value={form.province}
              required
              onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
            />
          </div>
          <div className="account-field">
            <label htmlFor="addr-postal">Postal code</label>
            <input
              id="addr-postal"
              placeholder="e.g. 10100"
              value={form.postalCode}
              required
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
            />
          </div>
        </div>

        <div className="account-form-row-2">
          <div className="account-field">
            <label htmlFor="addr-phone">Phone</label>
            <input
              id="addr-phone"
              placeholder="Phone / WhatsApp"
              value={form.phone}
              required
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="account-field">
            <label htmlFor="addr-email">Email</label>
            <input
              id="addr-email"
              type="email"
              placeholder="Email"
              value={form.email}
              required
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
        </div>

        <label className="account-checkbox">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          />
          Set as default delivery address
        </label>

        {error && <p style={dangerText}>{error}</p>}

        <button style={{ ...primaryButton, maxWidth: 220 }} type="submit">
          Save address
        </button>
      </form>
    </>
  );
}
