import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../store/AppContext';
import BalanceSheet from './BalanceSheet';
import type { Account, Transaction } from '../../types';

// Mock initial data
const mockAccounts: Account[] = [
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
];

const mockTransactions: Transaction[] = [
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

describe('BalanceSheet', () => {
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
          <BalanceSheet />
        </AppProvider>
      </BrowserRouter>
    );
  };

  it('should render balance sheet page', () => {
    renderComponent();
    expect(screen.getByText('貸借対照表 (B/S)')).toBeInTheDocument();
  });

  it('should display date input', () => {
    renderComponent();
    expect(screen.getByLabelText('基準日')).toBeInTheDocument();
  });

  it('should display assets section', () => {
    renderComponent();
    expect(screen.getByText('資産')).toBeInTheDocument();
  });

  it('should display liabilities section', () => {
    renderComponent();
    expect(screen.getByText('負債')).toBeInTheDocument();
  });

  it('should display equity section', () => {
    renderComponent();
    expect(screen.getByText('純資産')).toBeInTheDocument();
  });

  it('should display asset accounts with balances', () => {
    renderComponent();
    expect(screen.getByText('現金')).toBeInTheDocument();
    expect(screen.getByText('普通預金')).toBeInTheDocument();
    expect(screen.getAllByText('￥100,000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('￥500,000').length).toBeGreaterThan(0);
  });

  it('should display liability accounts with balances', () => {
    renderComponent();
    expect(screen.getByText('クレジットカード')).toBeInTheDocument();
    expect(screen.getAllByText('￥50,000').length).toBeGreaterThan(0);
  });

  it('should display equity accounts with balances', () => {
    renderComponent();
    expect(screen.getByText('期首残高')).toBeInTheDocument();
    expect(screen.getAllByText('￥550,000').length).toBeGreaterThan(0);
  });

  it('should calculate and display totals', () => {
    renderComponent();
    expect(screen.getByText('資産合計')).toBeInTheDocument();
    expect(screen.getByText('負債合計')).toBeInTheDocument();
    expect(screen.getByText('純資産合計')).toBeInTheDocument();
  });

  it('should verify balance sheet equation', () => {
    renderComponent();
    // Check for the equation label
    expect(screen.getByText(/資産 = 負債 \+ 純資産:/)).toBeInTheDocument();
  });

  it('should show balanced indicator when equation is correct', () => {
    renderComponent();
    // The checkmark should be present
    expect(screen.getByText(/✓/)).toBeInTheDocument();
  });

  it('should display empty message when no assets', () => {
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
    expect(screen.getByText('資産の取引がありません')).toBeInTheDocument();
  });

  it('should display empty message when no liabilities', () => {
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
    expect(screen.getByText('負債の取引がありません')).toBeInTheDocument();
  });

  it('should display empty message when no equity', () => {
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
    expect(screen.getByText('純資産の取引がありません')).toBeInTheDocument();
  });
});
