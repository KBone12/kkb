import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../store/AppContext';
import IncomeStatement from './IncomeStatement';
import type { Account, Transaction } from '../../types';

// Mock initial data
const mockAccounts: Account[] = [
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
];

const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    date: '2025-01-15',
    description: 'Salary',
    entries: [
      { account_id: 'bank', debit: 300000, credit: 0 },
      { account_id: 'salary', debit: 0, credit: 300000 },
    ],
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'tx2',
    date: '2025-01-20',
    description: 'Buy groceries',
    entries: [
      { account_id: 'food', debit: 50000, credit: 0 },
      { account_id: 'cash', debit: 0, credit: 50000 },
    ],
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
];

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('IncomeStatement', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem(
      'kkb-data',
      JSON.stringify({
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        accounts: mockAccounts,
        transactions: mockTransactions,
      })
    );
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AppProvider>
          <IncomeStatement />
        </AppProvider>
      </BrowserRouter>
    );
  };

  it('should render income statement page', () => {
    renderComponent();
    expect(screen.getByText('損益計算書 (P&L)')).toBeInTheDocument();
  });

  it('should display date range inputs', () => {
    renderComponent();
    expect(screen.getByLabelText('開始日')).toBeInTheDocument();
    expect(screen.getByLabelText('終了日')).toBeInTheDocument();
  });

  it('should display revenue section', () => {
    renderComponent();
    expect(screen.getByText('収益')).toBeInTheDocument();
  });

  it('should display expense section', () => {
    renderComponent();
    expect(screen.getByText('費用')).toBeInTheDocument();
  });

  it('should display revenue accounts with balances', () => {
    const { container } = renderComponent();

    // Change date range to include test data (January 2025)
    const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
    const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement;

    fireEvent.change(startDateInput, { target: { value: '2025-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-01-31' } });

    expect(screen.getByText('給与')).toBeInTheDocument();
    expect(screen.getAllByText('￥300,000').length).toBeGreaterThan(0);
  });

  it('should display expense accounts with balances', () => {
    const { container } = renderComponent();

    // Change date range to include test data (January 2025)
    const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
    const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement;

    fireEvent.change(startDateInput, { target: { value: '2025-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-01-31' } });

    expect(screen.getByText('食費')).toBeInTheDocument();
    expect(screen.getAllByText('￥50,000').length).toBeGreaterThan(0);
  });

  it('should calculate and display totals', () => {
    const { container } = renderComponent();

    // Change date range to include test data (January 2025)
    const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
    const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement;

    fireEvent.change(startDateInput, { target: { value: '2025-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-01-31' } });

    expect(screen.getByText('収益合計')).toBeInTheDocument();
    expect(screen.getByText('費用合計')).toBeInTheDocument();
  });

  it('should calculate and display net income', () => {
    const { container } = renderComponent();

    // Change date range to include test data (January 2025)
    const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
    const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement;

    fireEvent.change(startDateInput, { target: { value: '2025-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-01-31' } });

    expect(screen.getByText('純利益 (損失):')).toBeInTheDocument();
    expect(screen.getAllByText('￥250,000').length).toBeGreaterThan(0);
  });

  it('should display empty message when no revenue', () => {
    localStorageMock.setItem(
      'kkb-data',
      JSON.stringify({
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        accounts: mockAccounts,
        transactions: [],
      })
    );

    renderComponent();
    expect(screen.getByText('収益の取引がありません')).toBeInTheDocument();
  });

  it('should display empty message when no expense', () => {
    localStorageMock.setItem(
      'kkb-data',
      JSON.stringify({
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        accounts: mockAccounts,
        transactions: [],
      })
    );

    renderComponent();
    expect(screen.getByText('費用の取引がありません')).toBeInTheDocument();
  });
});
