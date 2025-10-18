import { useState } from 'react';
import { useAccounts, useTransactions } from '../../store/hooks';
import type { Account } from '../../types';
import AccountList from '../../components/Accounts/AccountList';
import AccountForm, { type AccountFormData } from '../../components/Accounts/AccountForm';

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
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  return (
    <div className="account-management">
      <div className="account-management__header">
        <h1 className="account-management__title">勘定科目管理</h1>
        <button
          onClick={handleCreate}
          className="account-management__create-btn"
          disabled={isFormOpen}
        >
          新規作成
        </button>
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
