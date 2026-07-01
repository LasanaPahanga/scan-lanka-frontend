'use client';

import { useEffect, useState } from 'react';
import { getSettings, putSettings, SettingsView } from '@/lib/admin';
import { adminMain } from '@/components/formStyles';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSection } from '@/components/admin/AdminSection';

export default function AdminSettingsPage() {
  const [s, setS] = useState<SettingsView | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then(setS).catch(() => setS(null));
  }, []);

  if (!s) {
    return (
      <main style={adminMain}>
        <p className="admin-empty">Loading…</p>
      </main>
    );
  }

  return (
    <main style={adminMain}>
      <AdminPageHeader
        title="Store settings"
        description="Payment methods, bank details, and WhatsApp numbers shown to customers."
      />
      {msg && <p className="admin-alert admin-alert--success">{msg}</p>}

      <AdminSection title="Payments">
        <label className="admin-check-row">
          <input type="checkbox" checked={s.codEnabled} onChange={(e) => setS({ ...s, codEnabled: e.target.checked })} />
          Cash on delivery (COD) enabled
        </label>
        <label className="admin-check-row">
          <input
            type="checkbox"
            checked={s.bankTransferEnabled}
            onChange={(e) => setS({ ...s, bankTransferEnabled: e.target.checked })}
          />
          Bank transfer enabled
        </label>
        <div className="admin-field">
          <label htmlFor="bank-details">Bank account details (shown to customers)</label>
          <textarea
            id="bank-details"
            value={s.bankAccountDetails}
            onChange={(e) => setS({ ...s, bankAccountDetails: e.target.value })}
          />
        </div>
      </AdminSection>

      <AdminSection title="WhatsApp">
        <div className="admin-grid-2">
          <div className="admin-field">
            <label htmlFor="wa-local">Local number (Sri Lanka)</label>
            <input
              id="wa-local"
              value={s.whatsappLocal}
              onChange={(e) => setS({ ...s, whatsappLocal: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="wa-intl">International number</label>
            <input
              id="wa-intl"
              value={s.whatsappIntl}
              onChange={(e) => setS({ ...s, whatsappIntl: e.target.value })}
            />
          </div>
        </div>
      </AdminSection>

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={async () => {
            await putSettings(s);
            setMsg('Settings saved.');
          }}
        >
          Save settings
        </button>
      </div>
    </main>
  );
}
