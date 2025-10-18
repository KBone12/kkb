/**
 * Tests for AppContext and custom hooks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';
import { useAccounts, useTransactions } from './hooks';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AppContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('AppProvider', () => {
    it('should initialize with empty data when localStorage is empty', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.data.accounts).toEqual([]);
      expect(result.current.data.transactions).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should restore data from localStorage', () => {
      const mockData = {
        version: 1,
        lastModified: new Date().toISOString(),
        accounts: [
          {
            id: 'acc-1',
            name: 'Cash',
            type: 'asset' as const,
            parent_id: null,
            currency: 'JPY',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        transactions: [],
      };

      localStorageMock.setItem('kkb-data', JSON.stringify(mockData));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.data.accounts).toHaveLength(1);
      expect(result.current.data.accounts[0].name).toBe('Cash');
    });

    it('should handle localStorage errors gracefully', () => {
      // Set invalid JSON
      localStorageMock.setItem('kkb-data', 'invalid json');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AppProvider>{children}</AppProvider>
      );

      const { result } = renderHook(() => useAppContext(), { wrapper });

      // Should fall back to empty data
      expect(result.current.data.accounts).toEqual([]);
    });

    it('should throw error when useAppContext is used outside AppProvider', () => {
      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext must be used within AppProvider');
    });
  });

  describe('useAccounts hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    it('should get all accounts', () => {
      const { result } = renderHook(() => useAccounts(), { wrapper });

      expect(result.current.accounts).toEqual([]);
      expect(Array.isArray(result.current.getAllAccounts())).toBe(true);
    });

    it('should create a new account', () => {
      const { result } = renderHook(() => useAccounts(), { wrapper });

      act(() => {
        result.current.createAccount({
          name: 'Savings Account',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
      });

      expect(result.current.accounts).toHaveLength(1);
      expect(result.current.accounts[0].name).toBe('Savings Account');
    });

    it('should get account by ID', () => {
      const { result } = renderHook(() => useAccounts(), { wrapper });

      let accountId: string;

      act(() => {
        const account = result.current.createAccount({
          name: 'Cash',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
        accountId = account.id;
      });

      const account = result.current.getAccountById(accountId!);
      expect(account).not.toBeNull();
      expect(account?.name).toBe('Cash');
    });

    it('should update an account', () => {
      const { result } = renderHook(() => useAccounts(), { wrapper });

      let accountId: string;

      act(() => {
        const account = result.current.createAccount({
          name: 'Old Name',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
        accountId = account.id;
      });

      act(() => {
        result.current.updateAccount(accountId!, { name: 'New Name' });
      });

      const updatedAccount = result.current.getAccountById(accountId!);
      expect(updatedAccount?.name).toBe('New Name');
    });

    it('should delete an account (hard delete when no transactions)', () => {
      const { result } = renderHook(() => useAccounts(), { wrapper });

      let accountId: string;

      act(() => {
        const account = result.current.createAccount({
          name: 'To Delete',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
        accountId = account.id;
      });

      expect(result.current.accounts).toHaveLength(1);

      act(() => {
        result.current.deleteAccount(accountId!);
      });

      expect(result.current.accounts).toHaveLength(0);
    });

    it('should filter active accounts only', () => {
      const { result } = renderHook(() => useAccounts(), { wrapper });

      act(() => {
        result.current.createAccount({
          name: 'Active Account',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
        result.current.createAccount({
          name: 'Inactive Account',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: false,
        });
      });

      const activeAccounts = result.current.getAllAccounts(true);
      expect(activeAccounts).toHaveLength(1);
      expect(activeAccounts[0].name).toBe('Active Account');
    });
  });

  describe('useTransactions hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    it('should get all transactions', () => {
      const { result } = renderHook(() => useTransactions(), { wrapper });

      expect(result.current.transactions).toEqual([]);
      expect(Array.isArray(result.current.getAllTransactions())).toBe(true);
    });

    it('should create a new transaction', () => {
      const { result } = renderHook(
        () => ({
          accounts: useAccounts(),
          transactions: useTransactions(),
        }),
        { wrapper }
      );

      let cashId: string;
      let revenueId: string;

      // Create accounts first
      act(() => {
        const cash = result.current.accounts.createAccount({
          name: 'Cash',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
        const revenue = result.current.accounts.createAccount({
          name: 'Revenue',
          type: 'revenue',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
        cashId = cash.id;
        revenueId = revenue.id;
      });

      // Create transaction
      act(() => {
        result.current.transactions.createTransaction({
          date: '2025-01-01',
          description: 'Test transaction',
          entries: [
            { account_id: cashId!, debit: 1000, credit: 0 },
            { account_id: revenueId!, debit: 0, credit: 1000 },
          ],
        });
      });

      expect(result.current.transactions.transactions).toHaveLength(1);
      expect(result.current.transactions.transactions[0].description).toBe(
        'Test transaction'
      );
    });

    it('should get transaction by ID', () => {
      const { result } = renderHook(
        () => ({
          accounts: useAccounts(),
          transactions: useTransactions(),
        }),
        { wrapper }
      );

      let transactionId: string;

      act(() => {
        const cash = result.current.accounts.createAccount({
          name: 'Cash',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
        const revenue = result.current.accounts.createAccount({
          name: 'Revenue',
          type: 'revenue',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });

        const transaction = result.current.transactions.createTransaction({
          date: '2025-01-01',
          description: 'Test',
          entries: [
            { account_id: cash.id, debit: 100, credit: 0 },
            { account_id: revenue.id, debit: 0, credit: 100 },
          ],
        });
        transactionId = transaction.id;
      });

      const transaction =
        result.current.transactions.getTransactionById(transactionId!);
      expect(transaction).not.toBeNull();
      expect(transaction?.description).toBe('Test');
    });

    it('should update a transaction', () => {
      const { result } = renderHook(
        () => ({
          accounts: useAccounts(),
          transactions: useTransactions(),
        }),
        { wrapper }
      );

      let transactionId: string;

      act(() => {
        const cash = result.current.accounts.createAccount({
          name: 'Cash',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
        const revenue = result.current.accounts.createAccount({
          name: 'Revenue',
          type: 'revenue',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });

        const transaction = result.current.transactions.createTransaction({
          date: '2025-01-01',
          description: 'Old Description',
          entries: [
            { account_id: cash.id, debit: 100, credit: 0 },
            { account_id: revenue.id, debit: 0, credit: 100 },
          ],
        });
        transactionId = transaction.id;
      });

      act(() => {
        result.current.transactions.updateTransaction(transactionId!, {
          description: 'New Description',
        });
      });

      const updated =
        result.current.transactions.getTransactionById(transactionId!);
      expect(updated?.description).toBe('New Description');
    });

    it('should delete a transaction', () => {
      const { result } = renderHook(
        () => ({
          accounts: useAccounts(),
          transactions: useTransactions(),
        }),
        { wrapper }
      );

      let transactionId: string;

      act(() => {
        const cash = result.current.accounts.createAccount({
          name: 'Cash',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
        const revenue = result.current.accounts.createAccount({
          name: 'Revenue',
          type: 'revenue',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });

        const transaction = result.current.transactions.createTransaction({
          date: '2025-01-01',
          description: 'To Delete',
          entries: [
            { account_id: cash.id, debit: 100, credit: 0 },
            { account_id: revenue.id, debit: 0, credit: 100 },
          ],
        });
        transactionId = transaction.id;
      });

      expect(result.current.transactions.transactions).toHaveLength(1);

      act(() => {
        result.current.transactions.deleteTransaction(transactionId!);
      });

      expect(result.current.transactions.transactions).toHaveLength(0);
    });
  });

  describe('localStorage integration', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    );

    it('should persist data to localStorage after creating an account', async () => {
      const { result } = renderHook(() => useAccounts(), { wrapper });

      act(() => {
        result.current.createAccount({
          name: 'Test Account',
          type: 'asset',
          parent_id: null,
          currency: 'JPY',
          is_active: true,
        });
      });

      // Wait for localStorage to be updated
      await waitFor(() => {
        const stored = localStorageMock.getItem('kkb-data');
        expect(stored).not.toBeNull();

        const data = JSON.parse(stored!);
        expect(data.accounts).toHaveLength(1);
        expect(data.accounts[0].name).toBe('Test Account');
      });
    });
  });
});
