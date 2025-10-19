import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TransactionList from './TransactionList';
import { AppProvider } from '../../store/AppContext';
import type { Account, Transaction } from '../../types';

describe('TransactionList Page', () => {
  const mockAccounts: Account[] = [
    {
      id: 'acc1',
      name: '現金',
      type: '資産',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'acc2',
      name: '食費',
      type: '費用',
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
      date: '2025-02-10',
      description: 'レストランで食事',
      entries: [
        { account_id: 'acc2', debit: 2000, credit: 0 },
        { account_id: 'acc1', debit: 0, credit: 2000 },
      ],
      created_at: '2025-02-10T00:00:00Z',
      updated_at: '2025-02-10T00:00:00Z',
    },
  ];

  beforeEach(() => {
    localStorage.clear();

    const initialData = {
      accounts: mockAccounts,
      transactions: mockTransactions,
      version: 1,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem('kkb-data', JSON.stringify(initialData));
  });

  const renderWithProviders = () => {
    return render(
      <AppProvider>
        <BrowserRouter>
          <TransactionList />
        </BrowserRouter>
      </AppProvider>
    );
  };

  it('displays page title', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('取引一覧')).toBeInTheDocument();
    });
  });

  it('displays new transaction button', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('+ 新規取引')).toBeInTheDocument();
    });
  });

  it('displays transaction count', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/登録済み取引: 2件/)).toBeInTheDocument();
    });
  });

  it('displays all transactions', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('スーパーで買い物')).toBeInTheDocument();
      expect(screen.getByText('レストランで食事')).toBeInTheDocument();
    });
  });

  it('displays month filter dropdown', async () => {
    renderWithProviders();

    await waitFor(() => {
      const filterSelect = screen.getByLabelText('期間フィルタ:');
      expect(filterSelect).toBeInTheDocument();
    });
  });

  it('filters transactions by month', async () => {
    renderWithProviders();

    await waitFor(() => {
      const filterSelect = screen.getByLabelText('期間フィルタ:');

      // Select January 2025
      fireEvent.change(filterSelect, { target: { value: '2025-01' } });
    });

    await waitFor(() => {
      expect(screen.getByText('スーパーで買い物')).toBeInTheDocument();
      expect(screen.queryByText('レストランで食事')).not.toBeInTheDocument();
      expect(screen.getByText(/2025年01月の取引: 1件/)).toBeInTheDocument();
    });
  });

  it('shows edit form when edit button is clicked', async () => {
    renderWithProviders();

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/を編集/);
      fireEvent.click(editButtons[0]);
    });

    await waitFor(() => {
      // Check if form fields are present
      expect(screen.getByLabelText(/摘要/)).toBeInTheDocument();
    });
  });

  it('shows success message after deleting a transaction', async () => {
    // Mock window.confirm
    vi.stubGlobal('confirm', () => true);

    renderWithProviders();

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText(/を削除/);
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('取引を削除しました')).toBeInTheDocument();
    });

    // Cleanup
    vi.unstubAllGlobals();
  });

  it('does not delete transaction when cancel is clicked', async () => {
    // Mock window.confirm to return false
    vi.stubGlobal('confirm', () => false);

    renderWithProviders();

    let deleteButtons: HTMLElement[] = [];
    await waitFor(() => {
      deleteButtons = screen.getAllByLabelText(/を削除/);
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      // Transaction should still be visible
      expect(screen.getByText('スーパーで買い物')).toBeInTheDocument();
    });

    // Cleanup
    vi.unstubAllGlobals();
  });

  it('hides edit form when cancel button is clicked', async () => {
    renderWithProviders();

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/を編集/);
      fireEvent.click(editButtons[0]);
    });

    await waitFor(() => {
      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      // Form should be hidden
      expect(screen.queryByLabelText(/摘要/)).not.toBeInTheDocument();
    });
  });

  it('displays available months in filter dropdown', async () => {
    renderWithProviders();

    await waitFor(() => {
      const filterSelect = screen.getByLabelText('期間フィルタ:') as HTMLSelectElement;
      const options = Array.from(filterSelect.options).map(opt => opt.value);

      expect(options).toContain('');  // "すべて" option
      expect(options).toContain('2025-01');
      expect(options).toContain('2025-02');
    });
  });
});
