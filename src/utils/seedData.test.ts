import { describe, it, expect } from 'vitest';
import { generateInitialAccounts, createInitialAccounts } from './seedData';

describe('seedData', () => {
  describe('generateInitialAccounts', () => {
    it('returns 8 initial accounts', () => {
      const accounts = generateInitialAccounts();
      expect(accounts).toHaveLength(8);
    });

    it('includes all account types', () => {
      const accounts = generateInitialAccounts();
      const types = accounts.map((a) => a.type);

      expect(types).toContain('asset');
      expect(types).toContain('liability');
      expect(types).toContain('equity');
      expect(types).toContain('revenue');
      expect(types).toContain('expense');
    });

    it('includes expected account names', () => {
      const accounts = generateInitialAccounts();
      const names = accounts.map((a) => a.name);

      // 資産
      expect(names).toContain('現金');
      expect(names).toContain('普通預金');

      // 負債
      expect(names).toContain('クレジットカード');

      // 純資産
      expect(names).toContain('開始残高');

      // 収益
      expect(names).toContain('給与');

      // 費用
      expect(names).toContain('食費');
      expect(names).toContain('交通費');
      expect(names).toContain('光熱費');
    });

    it('all accounts have currency JPY', () => {
      const accounts = generateInitialAccounts();
      accounts.forEach((account) => {
        expect(account.currency).toBe('JPY');
      });
    });

    it('all accounts are active', () => {
      const accounts = generateInitialAccounts();
      accounts.forEach((account) => {
        expect(account.is_active).toBe(true);
      });
    });

    it('all accounts have no parent', () => {
      const accounts = generateInitialAccounts();
      accounts.forEach((account) => {
        expect(account.parent_id).toBeNull();
      });
    });
  });

  describe('createInitialAccounts', () => {
    it('returns accounts with IDs and timestamps', () => {
      const accounts = createInitialAccounts();

      expect(accounts).toHaveLength(8);

      accounts.forEach((account) => {
        expect(account.id).toBeDefined();
        expect(account.id).not.toBe('');
        expect(account.created_at).toBeDefined();
        expect(account.updated_at).toBeDefined();
        expect(account.created_at).toBe(account.updated_at);
      });
    });

    it('each account has unique ID', () => {
      const accounts = createInitialAccounts();
      const ids = accounts.map((a) => a.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(accounts.length);
    });

    it('preserves account properties from generateInitialAccounts', () => {
      const accounts = createInitialAccounts();
      const names = accounts.map((a) => a.name);

      expect(names).toContain('現金');
      expect(names).toContain('普通預金');
      expect(names).toContain('クレジットカード');
    });
  });
});
