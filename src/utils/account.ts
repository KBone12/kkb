/**
 * Account utilities
 */

import type { Account } from '../types';

/**
 * Get account name by ID
 * @param accounts - Array of accounts to search
 * @param accountId - ID of the account to find
 * @returns Account name or fallback message if not found
 */
export function getAccountName(accounts: Account[], accountId: string): string {
  const account = accounts.find((a) => a.id === accountId);
  return account ? account.name : '不明な勘定科目';
}
