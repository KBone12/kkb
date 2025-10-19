import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TransactionDetail from './TransactionDetail';
import { AppProvider } from '../../store/AppContext';
import type { Account, Transaction } from '../../types';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TransactionDetail', () => {
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

  const mockTransaction: Transaction = {
    id: 'txn1',
    date: '2025-01-15',
    description: 'スーパーで買い物',
    entries: [
      { account_id: 'acc2', debit: 1000, credit: 0 },
      { account_id: 'acc1', debit: 0, credit: 1000 },
    ],
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-15T10:30:00Z',
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();

    // Setup initial data
    const initialData = {
      accounts: mockAccounts,
      transactions: [mockTransaction],
      version: 1,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem('kkb-data', JSON.stringify(initialData));
  });

  const renderWithProviders = (transactionId: string) => {
    // Set initial path
    window.history.pushState({}, '', `/transactions/${transactionId}`);

    return render(
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/transactions/:id" element={<TransactionDetail />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    );
  };

  it('displays transaction details correctly', async () => {
    renderWithProviders('txn1');

    // Wait for data to load
    await screen.findByText('取引詳細');

    expect(screen.getByText('スーパーで買い物')).toBeInTheDocument();
    expect(screen.getByText('2025年01月15日')).toBeInTheDocument();
    expect(screen.getByText('現金')).toBeInTheDocument();
    expect(screen.getByText('食費')).toBeInTheDocument();
  });

  it('displays entry amounts correctly', async () => {
    renderWithProviders('txn1');

    await screen.findByText('取引詳細');

    const amounts = screen.getAllByText('1,000円');
    expect(amounts.length).toBeGreaterThan(0);
  });

  it('displays total amounts', async () => {
    renderWithProviders('txn1');

    await screen.findByText('取引詳細');

    expect(screen.getByText('合計')).toBeInTheDocument();
  });

  it('shows edit button', async () => {
    renderWithProviders('txn1');

    await screen.findByText('取引詳細');

    const editButton = screen.getByText('編集');
    expect(editButton).toBeInTheDocument();
  });

  it('navigates to transactions list with edit state when edit button is clicked', async () => {
    renderWithProviders('txn1');

    await screen.findByText('取引詳細');

    const editButton = screen.getByText('編集');
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/transactions', {
      state: { editTransactionId: 'txn1' },
    });
  });

  it('shows delete button', async () => {
    renderWithProviders('txn1');

    await screen.findByText('取引詳細');

    const deleteButton = screen.getByText('削除');
    expect(deleteButton).toBeInTheDocument();
  });

  it('shows back button', async () => {
    renderWithProviders('txn1');

    await screen.findByText('取引詳細');

    const backButton = screen.getByText('戻る');
    expect(backButton).toBeInTheDocument();
  });

  it('navigates back when back button is clicked', async () => {
    renderWithProviders('txn1');

    await screen.findByText('取引詳細');

    const backButton = screen.getByText('戻る');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/transactions');
  });

  it('displays metadata timestamps', async () => {
    renderWithProviders('txn1');

    await screen.findByText('取引詳細');

    expect(screen.getByText(/作成日時:/)).toBeInTheDocument();
    expect(screen.getByText(/更新日時:/)).toBeInTheDocument();
  });

  it('displays warning for unbalanced transactions', async () => {
    const unbalancedTransaction: Transaction = {
      id: 'txn-unbalanced',
      date: '2025-01-20',
      description: '不正な取引',
      entries: [
        { account_id: 'acc2', debit: 1000, credit: 0 },
        { account_id: 'acc1', debit: 0, credit: 500 },
      ],
      created_at: '2025-01-20T00:00:00Z',
      updated_at: '2025-01-20T00:00:00Z',
    };

    const data = {
      accounts: mockAccounts,
      transactions: [unbalancedTransaction],
      version: 1,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem('kkb-data', JSON.stringify(data));

    renderWithProviders('txn-unbalanced');

    await screen.findByText('取引詳細');

    expect(
      screen.getByText('警告: 借方と貸方の合計が一致しません')
    ).toBeInTheDocument();
  });
});
