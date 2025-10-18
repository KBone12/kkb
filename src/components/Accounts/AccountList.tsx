import type { Account, AccountType } from '../../types';
import { ACCOUNT_TYPE_LABELS } from '../../types';

interface AccountListProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export default function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  // Group accounts by type
  const accountsByType = accounts.reduce(
    (acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
      return acc;
    },
    {} as Record<AccountType, Account[]>
  );

  // Sort account types in standard order
  const typeOrder: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense'];

  // Build hierarchical structure
  const buildHierarchy = (accs: Account[]): Account[] => {
    // Root accounts (no parent)
    const roots = accs.filter((a) => a.parent_id === null);

    // Sort by name
    roots.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

    return roots;
  };

  // Get child accounts
  const getChildren = (parentId: string, accs: Account[]): Account[] => {
    const children = accs.filter((a) => a.parent_id === parentId);
    children.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    return children;
  };

  // Render account item with children recursively
  const renderAccount = (account: Account, allAccounts: Account[], level: number = 0) => {
    const children = getChildren(account.id, allAccounts);
    const indent = level * 20;

    return (
      <div key={account.id}>
        <div
          className="account-item"
          style={{ paddingLeft: `${indent + 10}px` }}
          data-testid={`account-item-${account.id}`}
        >
          <div className="account-item__info">
            <span className="account-item__name">{account.name}</span>
            <span className="account-item__currency">({account.currency})</span>
            {!account.is_active && (
              <span className="account-item__inactive">無効</span>
            )}
          </div>
          <div className="account-item__actions">
            <button
              onClick={() => onEdit(account)}
              className="account-item__btn account-item__btn--edit"
              aria-label={`${account.name}を編集`}
            >
              編集
            </button>
            <button
              onClick={() => onDelete(account)}
              className="account-item__btn account-item__btn--delete"
              aria-label={`${account.name}を削除`}
            >
              削除
            </button>
          </div>
        </div>
        {children.map((child) => renderAccount(child, allAccounts, level + 1))}
      </div>
    );
  };

  if (accounts.length === 0) {
    return (
      <div className="account-list account-list--empty">
        <p>勘定科目がまだ登録されていません。</p>
        <p>「新規作成」ボタンから勘定科目を追加してください。</p>
      </div>
    );
  }

  return (
    <div className="account-list">
      {typeOrder.map((type) => {
        const typeAccounts = accountsByType[type] || [];
        if (typeAccounts.length === 0) return null;

        const rootAccounts = buildHierarchy(typeAccounts);

        return (
          <div key={type} className="account-group">
            <h3 className="account-group__title">{ACCOUNT_TYPE_LABELS[type]}</h3>
            <div className="account-group__items">
              {rootAccounts.map((account) =>
                renderAccount(account, typeAccounts)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
