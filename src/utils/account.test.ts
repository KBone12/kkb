import { describe, it, expect } from 'vitest';
import { getAccountName } from './account';
import type { Account } from '../types';

describe('getAccountName', () => {
  const mockAccounts: Account[] = [
    {
      id: 'acc-1',
      name: '現金',
      type: '資産',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'acc-2',
      name: '食費',
      type: '費用',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    },
  ];

  it('should return account name when account exists', () => {
    expect(getAccountName(mockAccounts, 'acc-1')).toBe('現金');
    expect(getAccountName(mockAccounts, 'acc-2')).toBe('食費');
  });

  it('should return fallback message when account does not exist', () => {
    expect(getAccountName(mockAccounts, 'non-existent')).toBe('不明な勘定科目');
  });

  it('should return fallback message when accounts array is empty', () => {
    expect(getAccountName([], 'acc-1')).toBe('不明な勘定科目');
  });
});
