import { useState } from 'react';
import { useAccounts, useTransactions } from '../../store/hooks';
import type { Account } from '../../types';
import AccountList from '../../components/Accounts/AccountList';
import AccountForm, { type AccountFormData } from '../../components/Accounts/AccountForm';
import { createInitialAccounts } from '../../utils/seedData';

export default function AccountManagement() {
  const { accounts, createAccount, updateAccount, deleteAccount } = useAccounts();
  const { transactions } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleCreate = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = (account: Account) => {
    // Check if account has transactions
    const hasTransactions = transactions.some((t) =>
      t.entries.some((e) => e.account_id === account.id)
    );

    if (hasTransactions) {
      const confirmed = window.confirm(
        `「${account.name}」には取引が存在します。\n削除すると、この勘定科目は無効化されます。\n本当に削除しますか？`
      );

      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        `「${account.name}」を削除してもよろしいですか？`
      );

      if (!confirmed) return;
    }

    deleteAccount(account.id);
  };

  const handleSubmit = (data: AccountFormData) => {
    try {
      if (editingAccount) {
        // Update existing account
        updateAccount(editingAccount.id, {
          name: data.name,
          parent_id: data.parent_id,
          currency: data.currency,
          // Note: type cannot be changed
        });
      } else {
        // Create new account
        createAccount({
          name: data.name,
          type: data.type,
          parent_id: data.parent_id,
          currency: data.currency,
        });
      }

      setIsFormOpen(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Failed to save account:', error);
      alert(`保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  const handleLoadInitialData = () => {
    const confirmed = window.confirm(
      '初期勘定科目をロードしますか？\n\n以下の勘定科目が追加されます：\n' +
        '• 現金、普通預金（資産）\n' +
        '• クレジットカード（負債）\n' +
        '• 開始残高（純資産）\n' +
        '• 給与（収益）\n' +
        '• 食費、交通費、光熱費（費用）'
    );

    if (!confirmed) return;

    const initialAccounts = createInitialAccounts();
    initialAccounts.forEach((account) => {
      createAccount({
        name: account.name,
        type: account.type,
        parent_id: account.parent_id,
        currency: account.currency,
      });
    });
  };

  return (
    <div className="account-management">
      <div className="account-management__header">
        <h1 className="account-management__title">勘定科目管理</h1>
        <div className="account-management__actions">
          <button
            onClick={handleLoadInitialData}
            className="account-management__secondary-btn"
            disabled={isFormOpen}
          >
            初期データをロード
          </button>
          <button
            onClick={handleCreate}
            className="account-management__create-btn"
            disabled={isFormOpen}
          >
            新規作成
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="account-management__form">
          <AccountForm
            account={editingAccount}
            accounts={accounts}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="account-management__list">
        <AccountList accounts={accounts} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
