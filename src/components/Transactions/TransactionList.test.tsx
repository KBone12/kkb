import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionList from './TransactionList';
import type { Account, Transaction } from '../../types';

describe('TransactionList', () => {
  const mockAccounts: Account[] = [
    {
      id: 'acc1',
      name: '現金',
      type: 'asset',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'acc2',
      name: '食費',
      type: 'expense',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 'txn1',
      date: '2025-01-15',
      description: 'スーパーで買い物',
      entries: [
        { account_id: 'acc2', debit: 1000, credit: 0 },
        { account_id: 'acc1', debit: 0, credit: 1000 },
      ],
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    },
    {
      id: 'txn2',
      date: '2025-01-10',
      description: 'コンビニで買い物',
      entries: [
        { account_id: 'acc2', debit: 500, credit: 0 },
        { account_id: 'acc1', debit: 0, credit: 500 },
      ],
      created_at: '2025-01-10T00:00:00Z',
      updated_at: '2025-01-10T00:00:00Z',
    },
  ];

  it('shows empty message when no transactions', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={[]}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('取引がまだ登録されていません')).toBeInTheDocument();
  });

  it('renders transaction list', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('スーパーで買い物')).toBeInTheDocument();
    expect(screen.getByText('コンビニで買い物')).toBeInTheDocument();
  });

  it('displays transaction dates in correct format', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('2025/01/15')).toBeInTheDocument();
    expect(screen.getByText('2025/01/10')).toBeInTheDocument();
  });

  it('displays account names in entries', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const accountNames = screen.getAllByText('現金');
    expect(accountNames.length).toBeGreaterThan(0);

    const expenseNames = screen.getAllByText('食費');
    expect(expenseNames.length).toBeGreaterThan(0);
  });

  it('displays transaction amounts', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('1,000 円')).toBeInTheDocument();
    expect(screen.getByText('500 円')).toBeInTheDocument();
  });

  it('sorts transactions by date (newest first)', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const items = screen.getAllByText(/スーパーで買い物|コンビニで買い物/);
    // First item should be the newer transaction (Jan 15)
    expect(items[0]).toHaveTextContent('スーパーで買い物');
    // Second item should be the older transaction (Jan 10)
    expect(items[1]).toHaveTextContent('コンビニで買い物');
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const editButtons = screen.getAllByLabelText(/を編集/);
    fireEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const deleteButtons = screen.getAllByLabelText(/を削除/);
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it('displays debit and credit labels correctly', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TransactionList
        transactions={mockTransactions}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getAllByText(/借方:/)).toHaveLength(2);
    expect(screen.getAllByText(/貸方:/)).toHaveLength(2);
  });

  it('handles unknown account gracefully', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const transactionWithUnknownAccount: Transaction = {
      id: 'txn3',
      date: '2025-01-20',
      description: 'Unknown account test',
      entries: [
        { account_id: 'unknown-id', debit: 1000, credit: 0 },
        { account_id: 'acc1', debit: 0, credit: 1000 },
      ],
      created_at: '2025-01-20T00:00:00Z',
      updated_at: '2025-01-20T00:00:00Z',
    };

    render(
      <TransactionList
        transactions={[transactionWithUnknownAccount]}
        accounts={mockAccounts}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('不明な勘定科目')).toBeInTheDocument();
  });
});
