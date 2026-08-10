'use client';

import { useState } from 'react';
import { formatLkr } from '@/lib/money';
import { BankAccount, SPORTS_BANK, TRADING_BANK } from '@/lib/bankTransferAccounts';

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button type="button" onClick={onCopy} style={copyBtn} aria-label={`Copy ${label}`}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function AccountCard({ account }: { account: BankAccount }) {
  const rows: { label: string; value: string; copy?: string }[] = [
    { label: 'Company name', value: account.companyName },
    { label: 'Bank name / code', value: `${account.bankName} (${account.bankCode})` },
    { label: 'Branch / code', value: `${account.branchName} (${account.branchCode})` },
    { label: 'Account number', value: account.accountNumber, copy: account.accountNumber },
    { label: 'Swift code', value: account.swiftCode, copy: account.swiftCode },
    { label: 'Account type', value: account.accountType },
  ];

  return (
    <article style={accountCard}>
      <header style={accountHeader}>
        <div>
          <p style={accountBadge}>{account.heading}</p>
          <h4 style={accountTitle}>{account.companyName}</h4>
          <p style={accountHint}>{account.itemHint}</p>
        </div>
      </header>

      <table style={detailTable}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th style={detailLabel}>{row.label}</th>
              <td style={detailValue}>
                <span>{row.value}</span>
                {row.copy && <CopyButton value={row.copy} label={row.label} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

/**
 * Always shows both company bank accounts. Customers choose based on what they ordered —
 * the site does not auto-detect sports vs other items.
 */
export function BankTransferDetails({
  totalCents,
  compactIntro = false,
}: {
  /** Full amount to transfer (shown once above both accounts). */
  totalCents?: number;
  compactIntro?: boolean;
}) {
  return (
    <div style={wrap}>
      {!compactIntro && (
        <p style={intro}>
          Transfer your payment to the <strong>correct account</strong> for the items you ordered. Both
          accounts are listed below — use <strong>Scan Lanka Sports</strong> for sports &amp; game boards, and{' '}
          <strong>Scan Lanka Trading Co.</strong> for all other products.
          {typeof totalCents === 'number' && totalCents > 0 && (
            <>
              {' '}
              Total to transfer: <strong>{formatLkr(totalCents)}</strong>.
            </>
          )}
        </p>
      )}

      {compactIntro && typeof totalCents === 'number' && totalCents > 0 && (
        <p style={intro}>
          Total to transfer: <strong>{formatLkr(totalCents)}</strong>. Choose the account that matches your
          items.
        </p>
      )}

      <AccountCard account={SPORTS_BANK} />
      <AccountCard account={TRADING_BANK} />

      <p style={mixedNote}>
        Use your order number as the payment reference when possible. If your order mixes sports and other
        items, transfer each portion to the matching account (or contact us if you need help).
      </p>
    </div>
  );
}

const wrap = {
  display: 'grid',
  gap: '1rem',
  marginTop: '0.75rem',
} as const;

const intro = {
  margin: 0,
  color: 'var(--text)',
  fontSize: '0.92rem',
  lineHeight: 1.55,
} as const;

const accountCard = {
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  overflow: 'hidden',
} as const;

const accountHeader = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  justifyContent: 'space-between',
  gap: '0.75rem',
  padding: '1rem 1.1rem',
  background: 'color-mix(in srgb, var(--primary) 6%, #fff)',
  borderBottom: '1px solid var(--border)',
} as const;

const accountBadge = {
  margin: 0,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  color: 'var(--primary)',
} as const;

const accountTitle = {
  margin: '0.2rem 0 0',
  fontSize: '1.05rem',
  fontWeight: 700,
  color: 'var(--text)',
} as const;

const accountHint = {
  margin: '0.35rem 0 0',
  fontSize: '0.82rem',
  color: 'var(--muted)',
  lineHeight: 1.45,
  maxWidth: '28rem',
} as const;

const detailTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  fontSize: '0.9rem',
} as const;

const detailLabel = {
  textAlign: 'left' as const,
  fontWeight: 500,
  color: 'var(--muted)',
  padding: '0.55rem 1.1rem',
  borderBottom: '1px solid var(--border)',
  width: '42%',
  verticalAlign: 'top' as const,
} as const;

const detailValue = {
  fontWeight: 600,
  color: 'var(--text)',
  padding: '0.55rem 1.1rem',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'top' as const,
} as const;

const copyBtn = {
  marginLeft: '0.5rem',
  padding: '0.15rem 0.45rem',
  fontSize: '0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm, 4px)',
  background: '#fff',
  cursor: 'pointer',
  color: 'var(--primary)',
} as const;

const mixedNote = {
  margin: 0,
  fontSize: '0.85rem',
  color: 'var(--muted)',
  lineHeight: 1.5,
} as const;
