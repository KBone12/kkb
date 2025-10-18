/**
 * DataStore - Core data management and validation logic
 *
 * This is the most critical component of the application.
 * All business logic and data integrity rules are enforced here.
 */

import type { Account, Transaction, Entry, AppData, AccountType } from '../types';
import { DATA_VERSION, DEFAULT_CURRENCY } from '../types';
import { generateId } from '../utils/id';
import { getCurrentTimestamp } from '../utils/date';

/**
 * Error thrown when validation fails
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * DataStore class
 * Manages accounts and transactions with validation
 * Does NOT directly interact with localStorage - returns updated state
 */
export class DataStore {
  private data: AppData;

  constructor(initialData?: AppData) {
    this.data = initialData || this.createEmptyData();
  }

  /**
   * Create empty data structure
   */
  private createEmptyData(): AppData {
    return {
      version: DATA_VERSION,
      lastModified: getCurrentTimestamp(),
      accounts: [],
      transactions: [],
    };
  }

  /**
   * Update lastModified timestamp
   */
  private touch(): void {
    this.data = {
      ...this.data,
      lastModified: getCurrentTimestamp(),
    };
  }

  // ==================== Account Operations ====================

  /**
   * Create a new account
   * @throws ValidationError if validation fails
   */
  createAccount(
    input: Omit<Account, 'id' | 'created_at' | 'updated_at'>
  ): Account {
    const now = getCurrentTimestamp();
    const account: Account = {
      id: generateId(),
      name: input.name,
      type: input.type,
      parent_id: input.parent_id,
      currency: input.currency || DEFAULT_CURRENCY,
      is_active: input.is_active !== undefined ? input.is_active : true,
      created_at: now,
      updated_at: now,
    };

    this.validateAccount(account);

    this.data = {
      ...this.data,
      accounts: [...this.data.accounts, account],
    };
    this.touch();

    return account;
  }

  /**
   * Update an existing account
   * @throws ValidationError if account not found or validation fails
   */
  updateAccount(
    id: string,
    updates: Partial<Omit<Account, 'id' | 'created_at' | 'updated_at'>>
  ): Account {
    const index = this.data.accounts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new ValidationError(`Account not found: ${id}`);
    }

    const existingAccount = this.data.accounts[index];
    const updatedAccount: Account = {
      ...existingAccount,
      ...updates,
      id: existingAccount.id, // Ensure ID cannot be changed
      created_at: existingAccount.created_at, // Preserve creation time
      updated_at: getCurrentTimestamp(),
    };

    this.validateAccount(updatedAccount);

    const newAccounts = [...this.data.accounts];
    newAccounts[index] = updatedAccount;

    this.data = {
      ...this.data,
      accounts: newAccounts,
    };
    this.touch();

    return updatedAccount;
  }

  /**
   * Delete an account
   * - If account has transactions: soft delete (set is_active = false)
   * - If account has no transactions: hard delete (remove from array)
   * - Prevents deletion of accounts with active child accounts
   * @throws ValidationError if account has active children
   */
  deleteAccount(id: string): boolean {
    const account = this.data.accounts.find((a) => a.id === id);
    if (!account) {
      return false;
    }

    // Check for active child accounts
    const hasActiveChildren = this.data.accounts.some(
      (a) => a.parent_id === id && a.is_active
    );
    if (hasActiveChildren) {
      throw new ValidationError(
        'Cannot delete account with active child accounts. Deactivate children first.'
      );
    }

    // Check if account has transactions
    const hasTransactions = this.data.transactions.some((t) =>
      t.entries.some((e) => e.account_id === id)
    );

    if (hasTransactions) {
      // Soft delete: set is_active = false
      this.updateAccount(id, { is_active: false });
    } else {
      // Hard delete: remove from array
      this.data = {
        ...this.data,
        accounts: this.data.accounts.filter((a) => a.id !== id),
      };
      this.touch();
    }

    return true;
  }

  /**
   * Get a single account by ID
   */
  getAccount(id: string): Account | null {
    return this.data.accounts.find((a) => a.id === id) || null;
  }

  /**
   * Get all accounts
   * @param activeOnly - If true, return only active accounts
   */
  getAccounts(activeOnly: boolean = false): Account[] {
    if (activeOnly) {
      return this.data.accounts.filter((a) => a.is_active);
    }
    return [...this.data.accounts];
  }

  // ==================== Transaction Operations ====================

  /**
   * Create a new transaction
   * @throws ValidationError if validation fails
   */
  createTransaction(
    input: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
  ): Transaction {
    const now = getCurrentTimestamp();
    const transaction: Transaction = {
      id: generateId(),
      date: input.date,
      description: input.description,
      entries: input.entries,
      created_at: now,
      updated_at: now,
    };

    this.validateTransaction(transaction);

    this.data = {
      ...this.data,
      transactions: [...this.data.transactions, transaction],
    };
    this.touch();

    return transaction;
  }

  /**
   * Update an existing transaction
   * @throws ValidationError if transaction not found or validation fails
   */
  updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>
  ): Transaction {
    const index = this.data.transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new ValidationError(`Transaction not found: ${id}`);
    }

    const existingTransaction = this.data.transactions[index];
    const updatedTransaction: Transaction = {
      ...existingTransaction,
      ...updates,
      id: existingTransaction.id,
      created_at: existingTransaction.created_at,
      updated_at: getCurrentTimestamp(),
    };

    this.validateTransaction(updatedTransaction);

    const newTransactions = [...this.data.transactions];
    newTransactions[index] = updatedTransaction;

    this.data = {
      ...this.data,
      transactions: newTransactions,
    };
    this.touch();

    return updatedTransaction;
  }

  /**
   * Delete a transaction
   */
  deleteTransaction(id: string): boolean {
    const index = this.data.transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      return false;
    }

    this.data = {
      ...this.data,
      transactions: this.data.transactions.filter((t) => t.id !== id),
    };
    this.touch();

    return true;
  }

  /**
   * Get a single transaction by ID
   */
  getTransaction(id: string): Transaction | null {
    return this.data.transactions.find((t) => t.id === id) || null;
  }

  /**
   * Get all transactions
   */
  getTransactions(): Transaction[] {
    return [...this.data.transactions];
  }

  // ==================== Data Access ====================

  /**
   * Get the entire data structure
   */
  getData(): AppData {
    return JSON.parse(JSON.stringify(this.data)); // Deep copy
  }

  /**
   * Load data from external source
   * @throws ValidationError if data is invalid
   */
  loadData(data: AppData): void {
    // Validate all accounts
    for (const account of data.accounts) {
      this.validateAccount(account);
    }

    // Validate all transactions
    for (const transaction of data.transactions) {
      this.validateTransaction(transaction);
    }

    this.data = JSON.parse(JSON.stringify(data)); // Deep copy
  }

  // ==================== Validation ====================

  /**
   * Validate a transaction
   * @throws ValidationError if validation fails
   */
  private validateTransaction(transaction: Transaction): void {
    // Check required fields
    if (!transaction.id || !transaction.date || !transaction.description) {
      throw new ValidationError('Transaction missing required fields');
    }

    // Check entries
    if (!Array.isArray(transaction.entries) || transaction.entries.length < 2) {
      throw new ValidationError('Transaction must have at least 2 entries');
    }

    // Validate each entry
    for (const entry of transaction.entries) {
      this.validateEntry(entry);
    }

    // Check balance: sum(debits) must equal sum(credits)
    const totalDebit = transaction.entries.reduce(
      (sum, entry) => sum + entry.debit,
      0
    );
    const totalCredit = transaction.entries.reduce(
      (sum, entry) => sum + entry.credit,
      0
    );

    // Use small epsilon for floating-point comparison
    const epsilon = 0.01;
    if (Math.abs(totalDebit - totalCredit) > epsilon) {
      throw new ValidationError(
        `Transaction not balanced: debits (${totalDebit}) ≠ credits (${totalCredit})`
      );
    }

    // Verify all referenced accounts exist
    for (const entry of transaction.entries) {
      const account = this.getAccount(entry.account_id);
      if (!account) {
        throw new ValidationError(
          `Transaction references non-existent account: ${entry.account_id}`
        );
      }
    }
  }

  /**
   * Validate an entry
   * @throws ValidationError if validation fails
   */
  private validateEntry(entry: Entry): void {
    if (!entry.account_id) {
      throw new ValidationError('Entry missing account_id');
    }

    if (typeof entry.debit !== 'number' || typeof entry.credit !== 'number') {
      throw new ValidationError('Entry debit and credit must be numbers');
    }

    if (entry.debit < 0 || entry.credit < 0) {
      throw new ValidationError('Entry debit and credit must be non-negative');
    }

    // An entry should have either debit or credit, not both (except when both are 0)
    if (entry.debit > 0 && entry.credit > 0) {
      throw new ValidationError(
        'Entry cannot have both debit and credit (use separate entries)'
      );
    }

    if (entry.debit === 0 && entry.credit === 0) {
      throw new ValidationError('Entry must have either debit or credit > 0');
    }
  }

  /**
   * Validate an account
   * @throws ValidationError if validation fails
   */
  private validateAccount(account: Account): void {
    // Check required fields
    if (!account.id || !account.name || !account.type) {
      throw new ValidationError('Account missing required fields');
    }

    // Validate account type
    const validTypes: AccountType[] = [
      'asset',
      'liability',
      'equity',
      'revenue',
      'expense',
    ];
    if (!validTypes.includes(account.type)) {
      throw new ValidationError(`Invalid account type: ${account.type}`);
    }

    // If parent_id is set, validate parent-child relationship
    if (account.parent_id) {
      const parent = this.getAccount(account.parent_id);
      if (!parent) {
        throw new ValidationError(
          `Parent account not found: ${account.parent_id}`
        );
      }

      // Parent and child must have the same type
      if (parent.type !== account.type) {
        throw new ValidationError(
          `Child account type (${account.type}) must match parent type (${parent.type})`
        );
      }
    }
  }
}
