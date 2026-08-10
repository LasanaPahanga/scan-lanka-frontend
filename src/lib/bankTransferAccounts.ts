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

export function accountForKey(key: BankAccountKey): BankAccount {
  return key === 'sports' ? SPORTS_BANK : TRADING_BANK;
}
