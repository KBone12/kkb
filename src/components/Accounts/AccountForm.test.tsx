import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountForm from './AccountForm';
import type { Account } from '../../types';

const mockAccounts: Account[] = [
  {
    id: '1',
    name: '資産',
    type: 'asset',
    parent_id: null,
    currency: 'JPY',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '負債',
    type: 'liability',
    parent_id: null,
    currency: 'JPY',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

describe('AccountForm', () => {
  it('renders form in create mode', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <AccountForm
        accounts={mockAccounts}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('勘定科目を追加')).toBeInTheDocument();
    expect(screen.getByLabelText(/勘定科目名/)).toBeInTheDocument();
    expect(screen.getByText('作成')).toBeInTheDocument();
  });

  it('renders form in edit mode', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <AccountForm
        account={mockAccounts[0]}
        accounts={mockAccounts}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('勘定科目を編集')).toBeInTheDocument();
    // Check input field specifically
    const nameInput = screen.getByLabelText(/勘定科目名/) as HTMLInputElement;
    expect(nameInput.value).toBe('資産');
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('validates required fields', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <AccountForm
        accounts={mockAccounts}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    const submitButton = screen.getByText('作成');
    fireEvent.click(submitButton);

    expect(screen.getByText('勘定科目名を入力してください')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('validates duplicate account names', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <AccountForm
        accounts={mockAccounts}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    const nameInput = screen.getByLabelText(/勘定科目名/);
    fireEvent.change(nameInput, { target: { value: '資産' } });

    const submitButton = screen.getByText('作成');
    fireEvent.click(submitButton);

    expect(
      screen.getByText(/同じ親の下に同名の勘定科目が既に存在します/)
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <AccountForm
        accounts={mockAccounts}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    const nameInput = screen.getByLabelText(/勘定科目名/);
    fireEvent.change(nameInput, { target: { value: '現金' } });

    const submitButton = screen.getByText('作成');
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      name: '現金',
      type: 'asset',
      parent_id: null,
      currency: 'JPY',
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <AccountForm
        accounts={mockAccounts}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('disables type field in edit mode', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <AccountForm
        account={mockAccounts[0]}
        accounts={mockAccounts}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    const typeSelect = screen.getByLabelText(/タイプ/);
    expect(typeSelect).toBeDisabled();
  });

  it('filters parent accounts by type', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <AccountForm
        accounts={mockAccounts}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    // Select asset type (it's already default, but let's be explicit)
    const typeSelect = screen.getByLabelText(/タイプ/) as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'asset' } });

    const parentSelect = screen.getByLabelText(/親勘定科目/) as HTMLSelectElement;
    const options = Array.from(parentSelect.querySelectorAll('option'));
    const accountOptions = options.filter((opt) => (opt as HTMLOptionElement).value !== '');

    // Should only show asset accounts as potential parents
    expect(accountOptions.length).toBe(1);
    const optionText = accountOptions[0].textContent;
    expect(optionText).toContain('資産');
  });
});
