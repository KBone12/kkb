/**
 * Core type definitions for KKB (K's Kakeibo) - Double-entry bookkeeping application
 */

/**
 * Account types following Japanese accounting standards
 * 資産 (Asset), 負債 (Liability), 純資産 (Equity), 収益 (Revenue), 費用 (Expense)
 */
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

/**
 * Currency code (ISO 4217)
 */
export type CurrencyCode = string;

/**
 * Account in the chart of accounts
 * Supports hierarchical structure through parent_id
 */
export interface Account {
  /** Unique identifier (UUID) */
  id: string;

  /** Account name (e.g., "現金", "普通預金") */
  name: string;

  /** Account type */
  type: AccountType;

  /** Parent account ID for hierarchical structure (null for root accounts) */
  parent_id: string | null;

  /** Currency code (default: "JPY") */
  currency: CurrencyCode;

  /** Whether the account is active (false = archived/deleted) */
  is_active: boolean;

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Last update timestamp (ISO 8601) */
  updated_at: string;
}

/**
 * Journal entry line item
 * Each transaction consists of multiple entries
 * Constraint: Sum of debits must equal sum of credits in a transaction
 */
export interface Entry {
  /** Account ID this entry belongs to */
  account_id: string;

  /** Debit amount (0 if credit entry) */
  debit: number;

  /** Credit amount (0 if debit entry) */
  credit: number;
}

/**
 * Financial transaction (double-entry bookkeeping)
 * Contains multiple entries that must balance
 */
export interface Transaction {
  /** Unique identifier (UUID) */
  id: string;

  /** Transaction date (ISO 8601 date string: YYYY-MM-DD) */
  date: string;

  /** Description/memo for the transaction */
  description: string;

  /** Journal entries (minimum 2, must balance) */
  entries: Entry[];

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Last update timestamp (ISO 8601) */
  updated_at: string;
}

/**
 * Root data structure for the application
 * This structure is persisted to localStorage/IndexedDB and JSON files
 */
export interface AppData {
  /** Data format version (for future migration compatibility) */
  version: string;

  /** Last modification timestamp (ISO 8601) */
  lastModified: string;

  /** All accounts in the chart of accounts */
  accounts: Account[];

  /** All financial transactions */
  transactions: Transaction[];
}

/**
 * Account type labels for UI display
 */
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: '資産',
  liability: '負債',
  equity: '純資産',
  revenue: '収益',
  expense: '費用',
};

/**
 * Default currency code
 */
export const DEFAULT_CURRENCY: CurrencyCode = 'JPY';

/**
 * Current data format version
 */
export const DATA_VERSION = '1.0.0';
