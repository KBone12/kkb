import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionForm from './TransactionForm';
import type { Account, Transaction } from '../../types';

describe('TransactionForm', () => {
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

  it('renders new transaction form', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    expect(screen.getByText('取引を登録')).toBeInTheDocument();
    expect(screen.getByLabelText(/日付/)).toBeInTheDocument();
    expect(screen.getByLabelText(/摘要/)).toBeInTheDocument();
  });

  it('renders edit transaction form', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const transaction: Transaction = {
      id: 'txn1',
      date: '2025-01-15',
      description: 'Test transaction',
      entries: [
        { account_id: 'acc1', debit: 1000, credit: 0 },
        { account_id: 'acc2', debit: 0, credit: 1000 },
      ],
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    };

    render(
      <TransactionForm
        transaction={transaction}
        accounts={mockAccounts}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('取引を編集')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test transaction')).toBeInTheDocument();
  });

  it('shows at least 2 entry rows by default', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const accountSelects = screen.getAllByLabelText(/仕訳\d+の勘定科目/);
    expect(accountSelects.length).toBeGreaterThanOrEqual(2);
  });

  it('allows adding new entry rows', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const addButton = screen.getByText('+ 仕訳を追加');
    const initialRows = screen.getAllByLabelText(/仕訳\d+の勘定科目/).length;

    fireEvent.click(addButton);

    const newRows = screen.getAllByLabelText(/仕訳\d+の勘定科目/).length;
    expect(newRows).toBe(initialRows + 1);
  });

  it('prevents removing entries when only 2 remain', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const removeButtons = screen.getAllByLabelText(/仕訳\d+を削除/);
    expect(removeButtons[0]).toBeDisabled();
    expect(removeButtons[1]).toBeDisabled();
  });

  it('calculates debit and credit totals correctly', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const debitInputs = screen.getAllByLabelText(/仕訳\d+の借方金額/);
    const creditInputs = screen.getAllByLabelText(/仕訳\d+の貸方金額/);

    fireEvent.change(debitInputs[0], { target: { value: '1000' } });
    fireEvent.change(creditInputs[1], { target: { value: '1000' } });

    expect(screen.getByText(/借方合計:/)).toBeInTheDocument();
    expect(screen.getAllByText(/1,000 円/).length).toBeGreaterThan(0);
    expect(screen.getByText(/貸方合計:/)).toBeInTheDocument();
  });

  it('shows balance status', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    // Initially unbalanced (both are 0)
    expect(screen.getByText('✗ 貸借不一致')).toBeInTheDocument();

    const debitInputs = screen.getAllByLabelText(/仕訳\d+の借方金額/);
    const creditInputs = screen.getAllByLabelText(/仕訳\d+の貸方金額/);

    fireEvent.change(debitInputs[0], { target: { value: '1000' } });
    fireEvent.change(creditInputs[1], { target: { value: '1000' } });

    expect(screen.getByText('✓ 貸借一致')).toBeInTheDocument();
  });

  it('disables submit button when not balanced', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const submitButton = screen.getByRole('button', { name: /登録/ });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when balanced', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const debitInputs = screen.getAllByLabelText(/仕訳\d+の借方金額/);
    const creditInputs = screen.getAllByLabelText(/仕訳\d+の貸方金額/);
    const accountSelects = screen.getAllByLabelText(/仕訳\d+の勘定科目/);

    // Fill in accounts
    fireEvent.change(accountSelects[0], { target: { value: 'acc1' } });
    fireEvent.change(accountSelects[1], { target: { value: 'acc2' } });

    // Balance the entries
    fireEvent.change(debitInputs[0], { target: { value: '1000' } });
    fireEvent.change(creditInputs[1], { target: { value: '1000' } });

    const submitButton = screen.getByRole('button', { name: /登録/ });
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSubmit with correct data when form is valid', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const dateInput = screen.getByLabelText(/日付/);
    const descriptionInput = screen.getByLabelText(/摘要/);
    const debitInputs = screen.getAllByLabelText(/仕訳\d+の借方金額/);
    const creditInputs = screen.getAllByLabelText(/仕訳\d+の貸方金額/);
    const accountSelects = screen.getAllByLabelText(/仕訳\d+の勘定科目/);

    fireEvent.change(dateInput, { target: { value: '2025-01-15' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test transaction' } });
    fireEvent.change(accountSelects[0], { target: { value: 'acc1' } });
    fireEvent.change(accountSelects[1], { target: { value: 'acc2' } });
    fireEvent.change(debitInputs[0], { target: { value: '1000' } });
    fireEvent.change(creditInputs[1], { target: { value: '1000' } });

    const submitButton = screen.getByRole('button', { name: /登録/ });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      date: '2025-01-15',
      description: 'Test transaction',
      entries: [
        { account_id: 'acc1', debit: 1000, credit: 0 },
        { account_id: 'acc2', debit: 0, credit: 1000 },
      ],
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const cancelButton = screen.getByRole('button', { name: /キャンセル/ });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('clears credit when debit is entered', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const debitInputs = screen.getAllByLabelText(/仕訳\d+の借方金額/);
    const creditInputs = screen.getAllByLabelText(/仕訳\d+の貸方金額/);

    // First set credit
    fireEvent.change(creditInputs[0], { target: { value: '500' } });
    expect(creditInputs[0]).toHaveValue(500);

    // Then set debit - should clear credit (to 0 or null/empty)
    fireEvent.change(debitInputs[0], { target: { value: '1000' } });
    expect(debitInputs[0]).toHaveValue(1000);
    // The value should be 0 or falsy (null/empty)
    const creditValue = (creditInputs[0] as HTMLInputElement).value;
    expect(creditValue === '' || creditValue === '0' || parseFloat(creditValue) === 0).toBe(true);
  });

  it('clears debit when credit is entered', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionForm accounts={mockAccounts} onSubmit={onSubmit} onCancel={onCancel} />
    );

    const debitInputs = screen.getAllByLabelText(/仕訳\d+の借方金額/);
    const creditInputs = screen.getAllByLabelText(/仕訳\d+の貸方金額/);

    // First set debit
    fireEvent.change(debitInputs[0], { target: { value: '1000' } });
    expect(debitInputs[0]).toHaveValue(1000);

    // Then set credit - should clear debit (to 0 or null/empty)
    fireEvent.change(creditInputs[0], { target: { value: '500' } });
    expect(creditInputs[0]).toHaveValue(500);
    // The value should be 0 or falsy (null/empty)
    const debitValue = (debitInputs[0] as HTMLInputElement).value;
    expect(debitValue === '' || debitValue === '0' || parseFloat(debitValue) === 0).toBe(true);
  });
});
