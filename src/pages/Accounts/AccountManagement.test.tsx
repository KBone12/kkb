import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountManagement from './AccountManagement';

// Mock the hooks
vi.mock('../../store/hooks', () => ({
  useAccounts: () => ({
    accounts: [],
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
  }),
  useTransactions: () => ({
    transactions: [],
  }),
}));

describe('AccountManagement', () => {
  it('renders account management page', () => {
    render(<AccountManagement />);
    expect(screen.getByText('勘定科目管理')).toBeInTheDocument();
  });

  it('renders initial data load button', () => {
    render(<AccountManagement />);
    expect(screen.getByText('初期データをロード')).toBeInTheDocument();
  });

  it('renders create button', () => {
    render(<AccountManagement />);
    expect(screen.getByText('新規作成')).toBeInTheDocument();
  });

  it('shows confirmation dialog when loading initial data', () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<AccountManagement />);

    const loadButton = screen.getByText('初期データをロード');
    fireEvent.click(loadButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(confirmSpy.mock.calls[0][0]).toContain('初期勘定科目をロードしますか？');

    confirmSpy.mockRestore();
  });
});
