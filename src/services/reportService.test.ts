import { describe, it, expect, beforeEach } from 'vitest';
import { Account, Transaction } from '../types';
import {
  calculateAccountBalance,
  generateIncomeStatement,
  generateBalanceSheet
} from './reportService';

describe('reportService', () => {
  let accounts: Account[];
  let transactions: Transaction[];

  beforeEach(() => {
    // Setup test data
    accounts = [
      // Assets
      {
        id: 'cash',
        name: '現金',
        type: 'asset',
        parent_id: null,
        currency: 'JPY',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'bank',
        name: '普通預金',
        type: 'asset',
        parent_id: null,
        currency: 'JPY',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      // Liabilities
      {
        id: 'credit-card',
        name: 'クレジットカード',
        type: 'liability',
        parent_id: null,
        currency: 'JPY',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      // Equity
      {
        id: 'opening-balance',
        name: '期首残高',
        type: 'equity',
        parent_id: null,
        currency: 'JPY',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      // Revenue
      {
        id: 'salary',
        name: '給与',
        type: 'revenue',
        parent_id: null,
        currency: 'JPY',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      // Expense
      {
        id: 'food',
        name: '食費',
        type: 'expense',
        parent_id: null,
        currency: 'JPY',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ];

    transactions = [];
  });

  describe('calculateAccountBalance', () => {
    it('should calculate balance for single debit transaction', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Opening balance',
          entries: [
            { account_id: 'cash', debit: 10000, credit: 0 },
            { account_id: 'opening-balance', debit: 0, credit: 10000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
      ];

      const balance = calculateAccountBalance('cash', accounts, transactions);
      expect(balance).toBe(10000);
    });

    it('should calculate balance for single credit transaction', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Opening balance',
          entries: [
            { account_id: 'cash', debit: 10000, credit: 0 },
            { account_id: 'opening-balance', debit: 0, credit: 10000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
      ];

      const balance = calculateAccountBalance('opening-balance', accounts, transactions);
      expect(balance).toBe(10000);
    });

    it('should accumulate balance from multiple transactions', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Opening balance',
          entries: [
            { account_id: 'cash', debit: 10000, credit: 0 },
            { account_id: 'opening-balance', debit: 0, credit: 10000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
        {
          id: 'tx2',
          date: '2025-01-20',
          description: 'Receive salary',
          entries: [
            { account_id: 'bank', debit: 300000, credit: 0 },
            { account_id: 'salary', debit: 0, credit: 300000 },
          ],
          created_at: '2025-01-20T00:00:00Z',
          updated_at: '2025-01-20T00:00:00Z',
        },
        {
          id: 'tx3',
          date: '2025-01-25',
          description: 'Withdraw cash',
          entries: [
            { account_id: 'cash', debit: 50000, credit: 0 },
            { account_id: 'bank', debit: 0, credit: 50000 },
          ],
          created_at: '2025-01-25T00:00:00Z',
          updated_at: '2025-01-25T00:00:00Z',
        },
      ];

      const cashBalance = calculateAccountBalance('cash', accounts, transactions);
      expect(cashBalance).toBe(60000); // 10000 + 50000

      const bankBalance = calculateAccountBalance('bank', accounts, transactions);
      expect(bankBalance).toBe(250000); // 300000 - 50000
    });

    it('should filter transactions by end date', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Opening balance',
          entries: [
            { account_id: 'cash', debit: 10000, credit: 0 },
            { account_id: 'opening-balance', debit: 0, credit: 10000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
        {
          id: 'tx2',
          date: '2025-01-25',
          description: 'Buy groceries',
          entries: [
            { account_id: 'food', debit: 5000, credit: 0 },
            { account_id: 'cash', debit: 0, credit: 5000 },
          ],
          created_at: '2025-01-25T00:00:00Z',
          updated_at: '2025-01-25T00:00:00Z',
        },
      ];

      const balance = calculateAccountBalance('cash', accounts, transactions, '2025-01-20');
      expect(balance).toBe(10000); // tx2 should be excluded
    });

    it('should return 0 for account with no transactions', () => {
      const balance = calculateAccountBalance('cash', accounts, []);
      expect(balance).toBe(0);
    });

    it('should calculate asset account balance correctly (debit increases)', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Cash increase',
          entries: [
            { account_id: 'cash', debit: 10000, credit: 0 },
            { account_id: 'opening-balance', debit: 0, credit: 10000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
        {
          id: 'tx2',
          date: '2025-01-20',
          description: 'Cash decrease',
          entries: [
            { account_id: 'food', debit: 3000, credit: 0 },
            { account_id: 'cash', debit: 0, credit: 3000 },
          ],
          created_at: '2025-01-20T00:00:00Z',
          updated_at: '2025-01-20T00:00:00Z',
        },
      ];

      const balance = calculateAccountBalance('cash', accounts, transactions);
      expect(balance).toBe(7000); // 10000 - 3000
    });

    it('should calculate liability account balance correctly (credit increases)', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Credit card purchase',
          entries: [
            { account_id: 'food', debit: 5000, credit: 0 },
            { account_id: 'credit-card', debit: 0, credit: 5000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
        {
          id: 'tx2',
          date: '2025-01-20',
          description: 'Pay credit card',
          entries: [
            { account_id: 'credit-card', debit: 3000, credit: 0 },
            { account_id: 'bank', debit: 0, credit: 3000 },
          ],
          created_at: '2025-01-20T00:00:00Z',
          updated_at: '2025-01-20T00:00:00Z',
        },
      ];

      const balance = calculateAccountBalance('credit-card', accounts, transactions);
      expect(balance).toBe(2000); // 5000 - 3000 (credit - debit for liability)
    });

    it('should calculate equity account balance correctly (credit increases)', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Opening balance',
          entries: [
            { account_id: 'cash', debit: 10000, credit: 0 },
            { account_id: 'opening-balance', debit: 0, credit: 10000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
      ];

      const balance = calculateAccountBalance('opening-balance', accounts, transactions);
      expect(balance).toBe(10000);
    });

    it('should calculate revenue account balance correctly (credit increases)', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-20',
          description: 'Salary',
          entries: [
            { account_id: 'bank', debit: 300000, credit: 0 },
            { account_id: 'salary', debit: 0, credit: 300000 },
          ],
          created_at: '2025-01-20T00:00:00Z',
          updated_at: '2025-01-20T00:00:00Z',
        },
      ];

      const balance = calculateAccountBalance('salary', accounts, transactions);
      expect(balance).toBe(300000);
    });

    it('should calculate expense account balance correctly (debit increases)', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-25',
          description: 'Buy groceries',
          entries: [
            { account_id: 'food', debit: 5000, credit: 0 },
            { account_id: 'cash', debit: 0, credit: 5000 },
          ],
          created_at: '2025-01-25T00:00:00Z',
          updated_at: '2025-01-25T00:00:00Z',
        },
      ];

      const balance = calculateAccountBalance('food', accounts, transactions);
      expect(balance).toBe(5000);
    });
  });

  describe('generateIncomeStatement', () => {
    it('should calculate simple income statement with single revenue and expense', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-20',
          description: 'Salary',
          entries: [
            { account_id: 'bank', debit: 300000, credit: 0 },
            { account_id: 'salary', debit: 0, credit: 300000 },
          ],
          created_at: '2025-01-20T00:00:00Z',
          updated_at: '2025-01-20T00:00:00Z',
        },
        {
          id: 'tx2',
          date: '2025-01-25',
          description: 'Buy groceries',
          entries: [
            { account_id: 'food', debit: 50000, credit: 0 },
            { account_id: 'cash', debit: 0, credit: 50000 },
          ],
          created_at: '2025-01-25T00:00:00Z',
          updated_at: '2025-01-25T00:00:00Z',
        },
      ];

      const statement = generateIncomeStatement(
        accounts,
        transactions,
        '2025-01-01',
        '2025-01-31'
      );

      expect(statement.revenue).toHaveLength(1);
      expect(statement.revenue[0].account_id).toBe('salary');
      expect(statement.revenue[0].balance).toBe(300000);

      expect(statement.expense).toHaveLength(1);
      expect(statement.expense[0].account_id).toBe('food');
      expect(statement.expense[0].balance).toBe(50000);

      expect(statement.total_revenue).toBe(300000);
      expect(statement.total_expense).toBe(50000);
      expect(statement.net_income).toBe(250000);
    });

    it('should filter transactions by date range', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2024-12-20',
          description: 'Last year salary',
          entries: [
            { account_id: 'bank', debit: 300000, credit: 0 },
            { account_id: 'salary', debit: 0, credit: 300000 },
          ],
          created_at: '2024-12-20T00:00:00Z',
          updated_at: '2024-12-20T00:00:00Z',
        },
        {
          id: 'tx2',
          date: '2025-01-20',
          description: 'This year salary',
          entries: [
            { account_id: 'bank', debit: 300000, credit: 0 },
            { account_id: 'salary', debit: 0, credit: 300000 },
          ],
          created_at: '2025-01-20T00:00:00Z',
          updated_at: '2025-01-20T00:00:00Z',
        },
      ];

      const statement = generateIncomeStatement(
        accounts,
        transactions,
        '2025-01-01',
        '2025-01-31'
      );

      expect(statement.total_revenue).toBe(300000); // Only tx2
    });

    it('should return empty statement for empty period', () => {
      const statement = generateIncomeStatement(
        accounts,
        [],
        '2025-01-01',
        '2025-01-31'
      );

      expect(statement.revenue).toHaveLength(0);
      expect(statement.expense).toHaveLength(0);
      expect(statement.total_revenue).toBe(0);
      expect(statement.total_expense).toBe(0);
      expect(statement.net_income).toBe(0);
    });
  });

  describe('generateBalanceSheet', () => {
    it('should calculate simple balance sheet', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Opening balance',
          entries: [
            { account_id: 'cash', debit: 100000, credit: 0 },
            { account_id: 'bank', debit: 500000, credit: 0 },
            { account_id: 'credit-card', debit: 0, credit: 50000 },
            { account_id: 'opening-balance', debit: 0, credit: 550000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
      ];

      const balanceSheet = generateBalanceSheet(
        accounts,
        transactions,
        '2025-01-31'
      );

      // Assets: cash + bank = 600000
      expect(balanceSheet.assets.length).toBeGreaterThan(0);
      expect(balanceSheet.total_assets).toBe(600000);

      // Liabilities: credit-card = 50000
      expect(balanceSheet.liabilities.length).toBeGreaterThan(0);
      expect(balanceSheet.total_liabilities).toBe(50000);

      // Equity: opening-balance = 550000
      expect(balanceSheet.equity.length).toBeGreaterThan(0);
      expect(balanceSheet.total_equity).toBe(550000);
    });

    it('should verify balance sheet equation', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Opening balance',
          entries: [
            { account_id: 'cash', debit: 100000, credit: 0 },
            { account_id: 'bank', debit: 500000, credit: 0 },
            { account_id: 'credit-card', debit: 0, credit: 50000 },
            { account_id: 'opening-balance', debit: 0, credit: 550000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
      ];

      const balanceSheet = generateBalanceSheet(
        accounts,
        transactions,
        '2025-01-31'
      );

      // Assets = Liabilities + Equity
      expect(balanceSheet.total_assets).toBe(
        balanceSheet.total_liabilities + balanceSheet.total_equity
      );
    });

    it('should filter transactions by date', () => {
      transactions = [
        {
          id: 'tx1',
          date: '2025-01-15',
          description: 'Opening balance',
          entries: [
            { account_id: 'cash', debit: 100000, credit: 0 },
            { account_id: 'opening-balance', debit: 0, credit: 100000 },
          ],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
        {
          id: 'tx2',
          date: '2025-02-15',
          description: 'Future transaction',
          entries: [
            { account_id: 'cash', debit: 50000, credit: 0 },
            { account_id: 'opening-balance', debit: 0, credit: 50000 },
          ],
          created_at: '2025-02-15T00:00:00Z',
          updated_at: '2025-02-15T00:00:00Z',
        },
      ];

      const balanceSheet = generateBalanceSheet(
        accounts,
        transactions,
        '2025-01-31'
      );

      expect(balanceSheet.total_assets).toBe(100000); // Only tx1
    });

    it('should return empty balance sheet for no transactions', () => {
      const balanceSheet = generateBalanceSheet(
        accounts,
        [],
        '2025-01-31'
      );

      expect(balanceSheet.assets).toHaveLength(0);
      expect(balanceSheet.liabilities).toHaveLength(0);
      expect(balanceSheet.equity).toHaveLength(0);
      expect(balanceSheet.total_assets).toBe(0);
      expect(balanceSheet.total_liabilities).toBe(0);
      expect(balanceSheet.total_equity).toBe(0);
    });
  });
});
