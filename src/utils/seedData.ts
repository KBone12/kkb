/**
 * Seed data for initial account setup
 * Based on GnuCash default accounts for Japanese household budget
 */

import type { Account } from '../types';
import { generateId } from './id';
import { getCurrentDate } from './date';

/**
 * Generate initial account data
 * This provides a basic chart of accounts for Japanese household budget
 */
export function generateInitialAccounts(): Omit<
  Account,
  'id' | 'created_at' | 'updated_at'
>[] {
  return [
    // 資産 (Assets)
    {
      name: '現金',
      type: 'asset',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
    },
    {
      name: '普通預金',
      type: 'asset',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
    },

    // 負債 (Liabilities)
    {
      name: 'クレジットカード',
      type: 'liability',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
    },

    // 純資産 (Equity)
    {
      name: '開始残高',
      type: 'equity',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
    },

    // 収益 (Revenue)
    {
      name: '給与',
      type: 'revenue',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
    },

    // 費用 (Expenses)
    {
      name: '食費',
      type: 'expense',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
    },
    {
      name: '交通費',
      type: 'expense',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
    },
    {
      name: '光熱費',
      type: 'expense',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
    },
  ];
}

/**
 * Create initial accounts with proper IDs and timestamps
 */
export function createInitialAccounts(): Account[] {
  const now = getCurrentDate();
  const initialAccounts = generateInitialAccounts();

  return initialAccounts.map((account) => ({
    ...account,
    id: generateId(),
    created_at: now,
    updated_at: now,
  }));
}
