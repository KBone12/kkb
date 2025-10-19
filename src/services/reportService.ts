import { Account, Transaction } from '../types';

/**
 * Account balance information
 */
export interface AccountBalance {
  account_id: string;
  account_name: string;
  balance: number;
}

/**
 * Income Statement (損益計算書)
 */
export interface IncomeStatement {
  revenue: AccountBalance[];
  expense: AccountBalance[];
  total_revenue: number;
  total_expense: number;
  net_income: number;
}

/**
 * Balance Sheet (貸借対照表)
 */
export interface BalanceSheet {
  assets: AccountBalance[];
  liabilities: AccountBalance[];
  equity: AccountBalance[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
}

/**
 * Calculate the balance of a specific account up to a given date
 *
 * @param accountId - Account ID to calculate balance for
 * @param accounts - All accounts
 * @param transactions - All transactions
 * @param endDate - Optional end date (inclusive). If not provided, includes all transactions
 * @returns Account balance (positive for normal balance, based on account type)
 */
export function calculateAccountBalance(
  accountId: string,
  accounts: Account[],
  transactions: Transaction[],
  endDate?: string
): number {
  const account = accounts.find(a => a.id === accountId);
  if (!account) {
    return 0;
  }

  // Filter transactions by date if endDate is provided
  const filteredTransactions = endDate
    ? transactions.filter(tx => tx.date <= endDate)
    : transactions;

  let totalDebit = 0;
  let totalCredit = 0;

  // Sum up all debits and credits for this account
  for (const transaction of filteredTransactions) {
    for (const entry of transaction.entries) {
      if (entry.account_id === accountId) {
        totalDebit += entry.debit;
        totalCredit += entry.credit;
      }
    }
  }

  // Calculate balance based on account type
  // Asset and Expense accounts: Debit increases balance (normal balance is debit)
  // Liability, Equity, and Revenue accounts: Credit increases balance (normal balance is credit)
  switch (account.type) {
    case 'asset':
    case 'expense':
      return totalDebit - totalCredit;
    case 'liability':
    case 'equity':
    case 'revenue':
      return totalCredit - totalDebit;
    default:
      return 0;
  }
}

/**
 * Generate Income Statement (損益計算書) for a given period
 *
 * @param accounts - All accounts
 * @param transactions - All transactions
 * @param startDate - Start date of the period (inclusive)
 * @param endDate - End date of the period (inclusive)
 * @returns Income statement with revenue, expense, and net income
 */
export function generateIncomeStatement(
  accounts: Account[],
  transactions: Transaction[],
  startDate: string,
  endDate: string
): IncomeStatement {
  // Filter transactions within the date range
  const periodTransactions = transactions.filter(
    tx => tx.date >= startDate && tx.date <= endDate
  );

  // Get all revenue accounts
  const revenueAccounts = accounts.filter(a => a.type === 'revenue' && a.is_active);
  const revenue: AccountBalance[] = [];
  let totalRevenue = 0;

  for (const account of revenueAccounts) {
    const balance = calculateAccountBalance(account.id, accounts, periodTransactions);
    if (balance !== 0) {
      revenue.push({
        account_id: account.id,
        account_name: account.name,
        balance,
      });
      totalRevenue += balance;
    }
  }

  // Get all expense accounts
  const expenseAccounts = accounts.filter(a => a.type === 'expense' && a.is_active);
  const expense: AccountBalance[] = [];
  let totalExpense = 0;

  for (const account of expenseAccounts) {
    const balance = calculateAccountBalance(account.id, accounts, periodTransactions);
    if (balance !== 0) {
      expense.push({
        account_id: account.id,
        account_name: account.name,
        balance,
      });
      totalExpense += balance;
    }
  }

  return {
    revenue,
    expense,
    total_revenue: totalRevenue,
    total_expense: totalExpense,
    net_income: totalRevenue - totalExpense,
  };
}

/**
 * Generate Balance Sheet (貸借対照表) as of a given date
 *
 * @param accounts - All accounts
 * @param transactions - All transactions
 * @param asOfDate - As-of date for the balance sheet (inclusive)
 * @returns Balance sheet with assets, liabilities, equity, and totals
 */
export function generateBalanceSheet(
  accounts: Account[],
  transactions: Transaction[],
  asOfDate: string
): BalanceSheet {
  // Get all asset accounts
  const assetAccounts = accounts.filter(a => a.type === 'asset' && a.is_active);
  const assets: AccountBalance[] = [];
  let totalAssets = 0;

  for (const account of assetAccounts) {
    const balance = calculateAccountBalance(account.id, accounts, transactions, asOfDate);
    if (balance !== 0) {
      assets.push({
        account_id: account.id,
        account_name: account.name,
        balance,
      });
      totalAssets += balance;
    }
  }

  // Get all liability accounts
  const liabilityAccounts = accounts.filter(a => a.type === 'liability' && a.is_active);
  const liabilities: AccountBalance[] = [];
  let totalLiabilities = 0;

  for (const account of liabilityAccounts) {
    const balance = calculateAccountBalance(account.id, accounts, transactions, asOfDate);
    if (balance !== 0) {
      liabilities.push({
        account_id: account.id,
        account_name: account.name,
        balance,
      });
      totalLiabilities += balance;
    }
  }

  // Get all equity accounts
  const equityAccounts = accounts.filter(a => a.type === 'equity' && a.is_active);
  const equity: AccountBalance[] = [];
  let totalEquity = 0;

  for (const account of equityAccounts) {
    const balance = calculateAccountBalance(account.id, accounts, transactions, asOfDate);
    if (balance !== 0) {
      equity.push({
        account_id: account.id,
        account_name: account.name,
        balance,
      });
      totalEquity += balance;
    }
  }

  return {
    assets,
    liabilities,
    equity,
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
    total_equity: totalEquity,
  };
}
