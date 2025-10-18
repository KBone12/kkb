/**
 * Custom hooks for accessing and manipulating data
 */

import { useCallback, useMemo } from 'react';
import { useAppContext } from './AppContext';
import type { Account, Transaction } from '../types';

/**
 * Hook for managing accounts
 */
export function useAccounts() {
  const { dataStore, refresh, data } = useAppContext();

  // Memoize accounts list to prevent unnecessary recalculations
  const accounts = useMemo(() => dataStore.getAccounts(), [data.accounts]);

  const getAllAccounts = useCallback(
    (activeOnly: boolean = false): Account[] => {
      return dataStore.getAccounts(activeOnly);
    },
    [dataStore]
  );

  const getAccountById = useCallback(
    (id: string): Account | null => {
      return dataStore.getAccount(id);
    },
    [dataStore]
  );

  const createAccount = useCallback(
    (
      input: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'currency' | 'is_active'> & {
        currency?: string;
        is_active?: boolean;
      }
    ): Account => {
      const account = dataStore.createAccount(input);
      refresh();
      return account;
    },
    [dataStore, refresh]
  );

  const updateAccount = useCallback(
    (
      id: string,
      updates: Partial<Omit<Account, 'id' | 'created_at' | 'updated_at'>>
    ): Account => {
      const account = dataStore.updateAccount(id, updates);
      refresh();
      return account;
    },
    [dataStore, refresh]
  );

  const deleteAccount = useCallback(
    (id: string): boolean => {
      const result = dataStore.deleteAccount(id);
      refresh();
      return result;
    },
    [dataStore, refresh]
  );

  return {
    accounts,
    getAllAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}

/**
 * Hook for managing transactions
 */
export function useTransactions() {
  const { dataStore, refresh, data } = useAppContext();

  // Memoize transactions list to prevent unnecessary recalculations
  const transactions = useMemo(() => dataStore.getTransactions(), [data.transactions]);

  const getAllTransactions = useCallback((): Transaction[] => {
    return dataStore.getTransactions();
  }, [dataStore]);

  const getTransactionById = useCallback(
    (id: string): Transaction | null => {
      return dataStore.getTransaction(id);
    },
    [dataStore]
  );

  const createTransaction = useCallback(
    (
      input: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
    ): Transaction => {
      const transaction = dataStore.createTransaction(input);
      refresh();
      return transaction;
    },
    [dataStore, refresh]
  );

  const updateTransaction = useCallback(
    (
      id: string,
      updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>
    ): Transaction => {
      const transaction = dataStore.updateTransaction(id, updates);
      refresh();
      return transaction;
    },
    [dataStore, refresh]
  );

  const deleteTransaction = useCallback(
    (id: string): boolean => {
      const result = dataStore.deleteTransaction(id);
      refresh();
      return result;
    },
    [dataStore, refresh]
  );

  return {
    transactions,
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
