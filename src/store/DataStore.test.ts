/**
 * DataStore tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataStore, ValidationError } from './DataStore';
import type { Account } from '../types';

describe('DataStore', () => {
  let store: DataStore;

  beforeEach(() => {
    store = new DataStore();
  });

  describe('Account Operations', () => {
    it('should create an account with all required fields', () => {
      const account = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
        currency: 'JPY',
        is_active: true,
      });

      expect(account.id).toBeDefined();
      expect(account.name).toBe('現金');
      expect(account.type).toBe('asset');
      expect(account.is_active).toBe(true);
      expect(account.created_at).toBeDefined();
      expect(account.updated_at).toBeDefined();
    });

    it('should use default currency if not provided', () => {
      const account = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      expect(account.currency).toBe('JPY');
    });

    it('should retrieve an account by ID', () => {
      const created = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      const retrieved = store.getAccount(created.id);
      expect(retrieved).toEqual(created);
    });

    it('should update an account', () => {
      const account = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      const updated = store.updateAccount(account.id, {
        name: 'Cash',
      });

      expect(updated.name).toBe('Cash');
      expect(updated.id).toBe(account.id);
      expect(updated.created_at).toBe(account.created_at);
      // updated_at should be >= original (may be same if update is very fast)
      expect(new Date(updated.updated_at).getTime()).toBeGreaterThanOrEqual(
        new Date(account.updated_at).getTime()
      );
    });

    it('should throw error when updating non-existent account', () => {
      expect(() => {
        store.updateAccount('non-existent-id', { name: 'Test' });
      }).toThrow(ValidationError);
    });

    it('should hard delete account with no transactions', () => {
      const account = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      const deleted = store.deleteAccount(account.id);
      expect(deleted).toBe(true);

      const retrieved = store.getAccount(account.id);
      expect(retrieved).toBeNull();
    });

    it('should soft delete account with transactions', () => {
      // Create accounts
      const cash = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      const revenue = store.createAccount({
        name: '売上',
        type: 'revenue',
        parent_id: null,
      });

      // Create transaction
      store.createTransaction({
        date: '2025-10-18',
        description: 'Test transaction',
        entries: [
          { account_id: cash.id, debit: 1000, credit: 0 },
          { account_id: revenue.id, debit: 0, credit: 1000 },
        ],
      });

      // Delete account with transaction
      store.deleteAccount(cash.id);

      const retrieved = store.getAccount(cash.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.is_active).toBe(false);
    });

    it('should prevent deletion of account with active children', () => {
      const parent = store.createAccount({
        name: '資産',
        type: 'asset',
        parent_id: null,
      });

      store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: parent.id,
      });

      expect(() => {
        store.deleteAccount(parent.id);
      }).toThrow(ValidationError);
    });

    it('should validate parent-child account type matching', () => {
      const parent = store.createAccount({
        name: '資産',
        type: 'asset',
        parent_id: null,
      });

      expect(() => {
        store.createAccount({
          name: '売上',
          type: 'revenue', // Different type from parent
          parent_id: parent.id,
        });
      }).toThrow(ValidationError);
    });

    it('should throw error when parent account does not exist', () => {
      expect(() => {
        store.createAccount({
          name: '現金',
          type: 'asset',
          parent_id: 'non-existent-parent',
        });
      }).toThrow(ValidationError);
    });

    it('should get all accounts', () => {
      store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      store.createAccount({
        name: '売上',
        type: 'revenue',
        parent_id: null,
      });

      const accounts = store.getAccounts();
      expect(accounts).toHaveLength(2);
    });

    it('should filter active accounts only', () => {
      const account1 = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      store.createAccount({
        name: '売上',
        type: 'revenue',
        parent_id: null,
      });

      // Deactivate one account
      store.updateAccount(account1.id, { is_active: false });

      const activeAccounts = store.getAccounts(true);
      expect(activeAccounts).toHaveLength(1);
      expect(activeAccounts[0].is_active).toBe(true);
    });
  });

  describe('Transaction Operations', () => {
    let cashAccount: Account;
    let revenueAccount: Account;

    beforeEach(() => {
      cashAccount = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      revenueAccount = store.createAccount({
        name: '売上',
        type: 'revenue',
        parent_id: null,
      });
    });

    it('should create a balanced transaction', () => {
      const transaction = store.createTransaction({
        date: '2025-10-18',
        description: '商品売上',
        entries: [
          { account_id: cashAccount.id, debit: 1000, credit: 0 },
          { account_id: revenueAccount.id, debit: 0, credit: 1000 },
        ],
      });

      expect(transaction.id).toBeDefined();
      expect(transaction.entries).toHaveLength(2);
      expect(transaction.created_at).toBeDefined();
    });

    it('should reject unbalanced transaction', () => {
      expect(() => {
        store.createTransaction({
          date: '2025-10-18',
          description: 'Unbalanced',
          entries: [
            { account_id: cashAccount.id, debit: 1000, credit: 0 },
            { account_id: revenueAccount.id, debit: 0, credit: 500 }, // Not balanced!
          ],
        });
      }).toThrow(ValidationError);
    });

    it('should reject transaction with less than 2 entries', () => {
      expect(() => {
        store.createTransaction({
          date: '2025-10-18',
          description: 'Single entry',
          entries: [{ account_id: cashAccount.id, debit: 1000, credit: 0 }],
        });
      }).toThrow(ValidationError);
    });

    it('should reject entry with both debit and credit', () => {
      expect(() => {
        store.createTransaction({
          date: '2025-10-18',
          description: 'Invalid entry',
          entries: [
            { account_id: cashAccount.id, debit: 1000, credit: 1000 }, // Both!
            { account_id: revenueAccount.id, debit: 0, credit: 0 },
          ],
        });
      }).toThrow(ValidationError);
    });

    it('should reject entry with negative amounts', () => {
      expect(() => {
        store.createTransaction({
          date: '2025-10-18',
          description: 'Negative amount',
          entries: [
            { account_id: cashAccount.id, debit: -1000, credit: 0 },
            { account_id: revenueAccount.id, debit: 0, credit: 1000 },
          ],
        });
      }).toThrow(ValidationError);
    });

    it('should reject entry with zero debit and credit', () => {
      expect(() => {
        store.createTransaction({
          date: '2025-10-18',
          description: 'Zero entry',
          entries: [
            { account_id: cashAccount.id, debit: 0, credit: 0 },
            { account_id: revenueAccount.id, debit: 1000, credit: 1000 },
          ],
        });
      }).toThrow(ValidationError);
    });

    it('should reject transaction with non-existent account', () => {
      expect(() => {
        store.createTransaction({
          date: '2025-10-18',
          description: 'Non-existent account',
          entries: [
            { account_id: 'non-existent', debit: 1000, credit: 0 },
            { account_id: revenueAccount.id, debit: 0, credit: 1000 },
          ],
        });
      }).toThrow(ValidationError);
    });

    it('should retrieve a transaction by ID', () => {
      const created = store.createTransaction({
        date: '2025-10-18',
        description: 'Test',
        entries: [
          { account_id: cashAccount.id, debit: 1000, credit: 0 },
          { account_id: revenueAccount.id, debit: 0, credit: 1000 },
        ],
      });

      const retrieved = store.getTransaction(created.id);
      expect(retrieved).toEqual(created);
    });

    it('should update a transaction', () => {
      const transaction = store.createTransaction({
        date: '2025-10-18',
        description: 'Original',
        entries: [
          { account_id: cashAccount.id, debit: 1000, credit: 0 },
          { account_id: revenueAccount.id, debit: 0, credit: 1000 },
        ],
      });

      const updated = store.updateTransaction(transaction.id, {
        description: 'Updated',
      });

      expect(updated.description).toBe('Updated');
      expect(updated.id).toBe(transaction.id);
      expect(updated.created_at).toBe(transaction.created_at);
      // updated_at should be >= original (may be same if update is very fast)
      expect(new Date(updated.updated_at).getTime()).toBeGreaterThanOrEqual(
        new Date(transaction.updated_at).getTime()
      );
    });

    it('should delete a transaction', () => {
      const transaction = store.createTransaction({
        date: '2025-10-18',
        description: 'Test',
        entries: [
          { account_id: cashAccount.id, debit: 1000, credit: 0 },
          { account_id: revenueAccount.id, debit: 0, credit: 1000 },
        ],
      });

      const deleted = store.deleteTransaction(transaction.id);
      expect(deleted).toBe(true);

      const retrieved = store.getTransaction(transaction.id);
      expect(retrieved).toBeNull();
    });

    it('should get all transactions', () => {
      store.createTransaction({
        date: '2025-10-18',
        description: 'Transaction 1',
        entries: [
          { account_id: cashAccount.id, debit: 1000, credit: 0 },
          { account_id: revenueAccount.id, debit: 0, credit: 1000 },
        ],
      });

      store.createTransaction({
        date: '2025-10-18',
        description: 'Transaction 2',
        entries: [
          { account_id: cashAccount.id, debit: 500, credit: 0 },
          { account_id: revenueAccount.id, debit: 0, credit: 500 },
        ],
      });

      const transactions = store.getTransactions();
      expect(transactions).toHaveLength(2);
    });
  });

  describe('Data Operations', () => {
    it('should return deep copy of data', () => {
      store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      const data1 = store.getData();
      const data2 = store.getData();

      expect(data1).toEqual(data2);
      expect(data1).not.toBe(data2); // Different objects
      expect(data1.accounts).not.toBe(data2.accounts); // Deep copy
    });

    it('should load valid data', () => {
      const account = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      const data = store.getData();

      const newStore = new DataStore();
      newStore.loadData(data);

      const loadedAccount = newStore.getAccount(account.id);
      expect(loadedAccount).toEqual(account);
    });

    it('should reject invalid data on load', () => {
      const invalidData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        accounts: [
          {
            id: 'test',
            name: 'Test',
            type: 'invalid_type', // Invalid type!
            parent_id: null,
            currency: 'JPY',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        transactions: [],
      };

      const newStore = new DataStore();
      expect(() => {
        newStore.loadData(invalidData as any);
      }).toThrow(ValidationError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      const accounts = store.getAccounts();
      const transactions = store.getTransactions();

      expect(accounts).toHaveLength(0);
      expect(transactions).toHaveLength(0);
    });

    it('should handle large number of transactions', () => {
      const cash = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      const revenue = store.createAccount({
        name: '売上',
        type: 'revenue',
        parent_id: null,
      });

      // Create 100 transactions
      for (let i = 0; i < 100; i++) {
        store.createTransaction({
          date: '2025-10-18',
          description: `Transaction ${i}`,
          entries: [
            { account_id: cash.id, debit: 1000, credit: 0 },
            { account_id: revenue.id, debit: 0, credit: 1000 },
          ],
        });
      }

      const transactions = store.getTransactions();
      expect(transactions).toHaveLength(100);
    });

    it('should handle floating-point precision in balance check', () => {
      const cash = store.createAccount({
        name: '現金',
        type: 'asset',
        parent_id: null,
      });

      const revenue = store.createAccount({
        name: '売上',
        type: 'revenue',
        parent_id: null,
      });

      // This should pass (within epsilon tolerance)
      const transaction = store.createTransaction({
        date: '2025-10-18',
        description: 'Floating point test',
        entries: [
          { account_id: cash.id, debit: 100.1, credit: 0 },
          { account_id: revenue.id, debit: 0, credit: 100.1 },
        ],
      });

      expect(transaction).toBeDefined();
    });
  });
});
