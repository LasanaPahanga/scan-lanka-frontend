/** Bank accounts for online bank-transfer checkout (Peoples Bank, Borella YMBA). */

export type BankAccountKey = 'sports' | 'trading';

export interface BankAccount {
  key: BankAccountKey;
  companyName: string;
  bankName: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
  accountNumber: string;
  swiftCode: string;
  accountType: string;
  /** Short heading in checkout UI */
  heading: string;
  /** Which products use this account */
  itemHint: string;
}

export const SPORTS_BANK: BankAccount = {
  key: 'sports',
  companyName: 'Scan Lanka Sports',
  bankName: "People's Bank",
  bankCode: '7135',
  branchName: 'Borella YMBA',
  branchCode: '078',
  accountNumber: '078100150036975',
  swiftCode: 'PSBKLKLX',
  accountType: 'Current account',
  heading: 'Sports & game boards',
  itemHint: 'Carrom boards, dam boards, chess boards, strikers, boric, carrom stands, and related sports items',
};

export const TRADING_BANK: BankAccount = {
  key: 'trading',
  companyName: 'Scan Lanka Trading Co. (Pvt) Ltd',
  bankName: "People's Bank",
  bankCode: '7135',
  branchName: 'Borella YMBA',
  branchCode: '078',
  accountNumber: '078100190029379',
  swiftCode: 'PSBKLKLX',
  accountType: 'Current account',
  heading: 'All other products',
  itemHint: 'Whiteboards, easels, partitions, and all non-sports items',
};

export interface BankLine {
  name: string;
  lineTotalCents: number;
}

export interface BankTransferSplit {
  sports: { lines: BankLine[]; transferCents: number };
  trading: { lines: BankLine[]; transferCents: number };
  hasSports: boolean;
  hasTrading: boolean;
  mixed: boolean;
}

export interface BankQuoteExtras {
  subtotalCents: number;
  deliveryCents: number;
  taxCents: number;
  onlineTotalCents: number;
}

/** Sports / game-board products pay into the Scan Lanka Sports account. */
export function isSportsProductName(name: string): boolean {
  const n = name.toLowerCase();
  if (n.includes('boric') || n.includes('striker')) return true;
  if (n.includes('winning disk') || n.includes('carrom men') || n.includes('dam men')) return true;
  if (n.includes('dam board') || n.includes('chess board')) return true;
  if (n.includes('carrom board stand') || n.includes('carrom stand')) return true;
  if (n.includes('carrom board')) return true;
  if (n.includes('sport items')) return true;
  return false;
}

/** Split cart lines and online total across the two company accounts. */
export function splitBankTransfer(lines: BankLine[], quote: BankQuoteExtras | null): BankTransferSplit {
  const sportsLines: BankLine[] = [];
  const tradingLines: BankLine[] = [];

  for (const line of lines) {
    if (line.lineTotalCents <= 0) continue;
    if (isSportsProductName(line.name)) sportsLines.push(line);
    else tradingLines.push(line);
  }

  const sportsSub = sportsLines.reduce((s, l) => s + l.lineTotalCents, 0);
  const tradingSub = tradingLines.reduce((s, l) => s + l.lineTotalCents, 0);
  const productSub = sportsSub + tradingSub;

  let sportsTransfer = sportsSub;
  let tradingTransfer = tradingSub;

  if (quote && productSub > 0) {
    const extras = quote.deliveryCents + quote.taxCents;
    if (sportsSub > 0 && tradingSub > 0) {
      sportsTransfer = sportsSub + Math.round(extras * (sportsSub / productSub));
      tradingTransfer = quote.onlineTotalCents - sportsTransfer;
    } else if (sportsSub > 0) {
      sportsTransfer = quote.onlineTotalCents;
      tradingTransfer = 0;
    } else {
      tradingTransfer = quote.onlineTotalCents;
      sportsTransfer = 0;
    }
  } else if (quote) {
    if (sportsSub > 0) sportsTransfer = quote.onlineTotalCents;
    if (tradingSub > 0) tradingTransfer = quote.onlineTotalCents;
  }

  return {
    sports: { lines: sportsLines, transferCents: sportsTransfer },
    trading: { lines: tradingLines, transferCents: tradingTransfer },
    hasSports: sportsLines.length > 0,
    hasTrading: tradingLines.length > 0,
    mixed: sportsLines.length > 0 && tradingLines.length > 0,
  };
}

export function accountForKey(key: BankAccountKey): BankAccount {
  return key === 'sports' ? SPORTS_BANK : TRADING_BANK;
}
