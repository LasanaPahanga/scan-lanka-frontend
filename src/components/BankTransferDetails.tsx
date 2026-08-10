'use client';

import { useState } from 'react';
import { formatLkr } from '@/lib/money';
import {
  accountForKey,
  BankAccount,
  BankTransferSplit,
  SPORTS_BANK,
  TRADING_BANK,
} from '@/lib/bankTransferAccounts';

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

function AccountCard({
  account,
  transferCents,
  lines,
  showItems,
}: {
  account: BankAccount;
  transferCents: number;
  lines: { name: string; lineTotalCents: number }[];
  showItems: boolean;
}) {
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
        <div style={amountBox}>
          <span style={amountLabel}>Transfer amount</span>
          <strong style={amountValue}>{formatLkr(transferCents)}</strong>
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

      {showItems && lines.length > 0 && (
        <div style={itemsBox}>
          <p style={itemsHeading}>Items in your cart for this account</p>
          <ul style={itemsList}>
            {lines.map((line) => (
              <li key={line.name}>
                {line.name} — {formatLkr(line.lineTotalCents)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function BankTransferDetails({
  split,
  showItemLists = true,
  compactIntro = false,
}: {
  split: BankTransferSplit;
  showItemLists?: boolean;
  compactIntro?: boolean;
}) {
  if (!split.hasSports && !split.hasTrading) return null;

  return (
    <div style={wrap}>
      {!compactIntro && (
        <p style={intro}>
          {split.mixed ? (
            <>
              Your order includes <strong>sports items</strong> and <strong>other products</strong>. Transfer to{' '}
              <strong>both accounts below</strong> using the amounts shown — delivery and tax are split proportionally.
            </>
          ) : split.hasSports ? (
            <>
              Your cart contains sports &amp; game-board items. Transfer the full amount to the{' '}
              <strong>Scan Lanka Sports</strong> account below.
            </>
          ) : (
            <>
              Transfer the full amount to the <strong>Scan Lanka Trading Co.</strong> account below.
            </>
          )}
        </p>
      )}

      {split.hasSports && (
        <AccountCard
          account={SPORTS_BANK}
          transferCents={split.sports.transferCents}
          lines={split.sports.lines}
          showItems={showItemLists}
        />
      )}

      {split.hasTrading && (
        <AccountCard
          account={TRADING_BANK}
          transferCents={split.trading.transferCents}
          lines={split.trading.lines}
          showItems={showItemLists}
        />
      )}

      {split.mixed && (
        <p style={mixedNote}>
          Total to transfer:{' '}
          <strong>{formatLkr(split.sports.transferCents + split.trading.transferCents)}</strong> (split across both
          accounts). Use your order number as the payment reference when possible.
        </p>
      )}
    </div>
  );
}

/** Convenience when only amounts are known (e.g. post-checkout snapshot). */
export function BankTransferDetailsFromAmounts({
  sportsCents,
  tradingCents,
}: {
  sportsCents: number;
  tradingCents: number;
}) {
  const split: BankTransferSplit = {
    sports: { lines: [], transferCents: sportsCents },
    trading: { lines: [], transferCents: tradingCents },
    hasSports: sportsCents > 0,
    hasTrading: tradingCents > 0,
    mixed: sportsCents > 0 && tradingCents > 0,
  };
  return <BankTransferDetails split={split} showItemLists={false} />;
}

export { accountForKey, SPORTS_BANK, TRADING_BANK };

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

const amountBox = {
  textAlign: 'right' as const,
  alignSelf: 'flex-start',
} as const;

const amountLabel = {
  display: 'block',
  fontSize: '0.78rem',
  color: 'var(--muted)',
  marginBottom: '0.15rem',
} as const;

const amountValue = {
  fontSize: '1.2rem',
  color: 'var(--primary)',
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

const itemsBox = {
  padding: '0.75rem 1.1rem 1rem',
  background: 'color-mix(in srgb, var(--border) 25%, #fff)',
} as const;

const itemsHeading = {
  margin: '0 0 0.35rem',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: 'var(--muted)',
} as const;

const itemsList = {
  margin: 0,
  paddingLeft: '1.1rem',
  fontSize: '0.85rem',
  lineHeight: 1.5,
  color: 'var(--text)',
} as const;

const mixedNote = {
  margin: 0,
  fontSize: '0.85rem',
  color: 'var(--muted)',
  lineHeight: 1.5,
} as const;
