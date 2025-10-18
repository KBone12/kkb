import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountList from './AccountList';
import type { Account } from '../../types';

const mockAccounts: Account[] = [
  {
    id: '1',
    name: '現金',
    type: 'asset',
    parent_id: null,
    currency: 'JPY',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '銀行預金',
    type: 'asset',
    parent_id: null,
    currency: 'JPY',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: '買掛金',
    type: 'liability',
    parent_id: null,
    currency: 'JPY',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: '売上',
    type: 'revenue',
    parent_id: null,
    currency: 'JPY',
    is_active: false, // Inactive
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

describe('AccountList', () => {
  it('renders empty state when no accounts', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<AccountList accounts={[]} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText(/勘定科目がまだ登録されていません/)).toBeInTheDocument();
  });

  it('renders accounts grouped by type', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<AccountList accounts={mockAccounts} onEdit={onEdit} onDelete={onDelete} />);

    // Check group titles
    expect(screen.getByText('資産')).toBeInTheDocument();
    expect(screen.getByText('負債')).toBeInTheDocument();
    expect(screen.getByText('収益')).toBeInTheDocument();

    // Check accounts
    expect(screen.getByText('現金')).toBeInTheDocument();
    expect(screen.getByText('銀行預金')).toBeInTheDocument();
    expect(screen.getByText('買掛金')).toBeInTheDocument();
    expect(screen.getByText('売上')).toBeInTheDocument();
  });

  it('displays inactive badge for inactive accounts', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<AccountList accounts={mockAccounts} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('無効')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<AccountList accounts={mockAccounts} onEdit={onEdit} onDelete={onDelete} />);

    // Get edit button for specific account using aria-label
    const editButton = screen.getByLabelText('銀行預金を編集');
    fireEvent.click(editButton);

    // Should call onEdit with the '銀行預金' account (id: 2)
    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: '2', name: '銀行預金' })
    );
  });

  it('calls onDelete when delete button is clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<AccountList accounts={mockAccounts} onEdit={onEdit} onDelete={onDelete} />);

    // Get delete button for specific account using aria-label
    const deleteButton = screen.getByLabelText('銀行預金を削除');
    fireEvent.click(deleteButton);

    // Should call onDelete with the '銀行預金' account (id: 2)
    expect(onDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: '2', name: '銀行預金' })
    );
  });

  it('renders hierarchical accounts with indentation', () => {
    const hierarchicalAccounts: Account[] = [
      {
        id: '1',
        name: '流動資産',
        type: 'asset',
        parent_id: null,
        currency: 'JPY',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: '現金',
        type: 'asset',
        parent_id: '1',
        currency: 'JPY',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ];

    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AccountList accounts={hierarchicalAccounts} onEdit={onEdit} onDelete={onDelete} />
    );

    expect(screen.getByText('流動資産')).toBeInTheDocument();
    expect(screen.getByText('現金')).toBeInTheDocument();

    // Child account should have indentation
    const childElement = screen.getByTestId('account-item-2');
    expect(childElement).toHaveStyle({ paddingLeft: '30px' }); // 20px indent + 10px base
  });
});
