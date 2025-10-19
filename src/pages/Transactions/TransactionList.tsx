import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccounts, useTransactions } from '../../store/hooks';
import TransactionListComponent from '../../components/Transactions/TransactionList';
import TransactionForm, {
  type TransactionFormData,
} from '../../components/Transactions/TransactionForm';
import type { Transaction } from '../../types';
import { ValidationError } from '../../store/DataStore';

export default function TransactionList() {
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const { transactions, updateTransaction, deleteTransaction } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setError('');
    setSuccess('');
  };

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`「${transaction.description}」を削除しますか？`)) {
      try {
        setError('');
        setSuccess('');
        deleteTransaction(transaction.id);
        setSuccess('取引を削除しました');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('取引の削除に失敗しました');
      }
    }
  };

  const handleUpdate = (data: TransactionFormData) => {
    if (!editingTransaction) return;

    try {
      setError('');
      setSuccess('');
      updateTransaction(editingTransaction.id, data);
      setSuccess('取引を更新しました');
      setEditingTransaction(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
      } else {
        setError('取引の更新に失敗しました');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setError('');
  };

  const handleNewTransaction = () => {
    navigate('/transactions/new');
  };

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) {
      return transactions;
    }
    return transactions.filter((transaction) => {
      return transaction.date.startsWith(selectedMonth);
    });
  }, [transactions, selectedMonth]);

  // Get unique months from transactions for the filter dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((transaction) => {
      // Extract YYYY-MM from date
      const month = transaction.date.substring(0, 7);
      months.add(month);
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  return (
    <div className="transaction-list-page">
      <div className="transaction-list-page__header">
        <h1 className="transaction-list-page__title">取引一覧</h1>
        <button
          onClick={handleNewTransaction}
          className="transaction-list-page__btn-new"
        >
          + 新規取引
        </button>
      </div>

      {error && (
        <div className="transaction-list-page__error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="transaction-list-page__success" role="status">
          {success}
        </div>
      )}

      {editingTransaction && (
        <div className="transaction-list-page__edit-form">
          <TransactionForm
            transaction={editingTransaction}
            accounts={accounts}
            onSubmit={handleUpdate}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      <div className="transaction-list-page__filters">
        <label htmlFor="month-filter" className="transaction-list-page__filter-label">
          期間フィルタ:
        </label>
        <select
          id="month-filter"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="transaction-list-page__filter-select"
        >
          <option value="">すべて</option>
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {month.replace('-', '年')}月
            </option>
          ))}
        </select>
      </div>

      <div className="transaction-list-page__stats">
        <p>
          {selectedMonth
            ? `${selectedMonth.replace('-', '年')}月の取引: ${filteredTransactions.length}件`
            : `登録済み取引: ${filteredTransactions.length}件`}
        </p>
      </div>

      <TransactionListComponent
        transactions={filteredTransactions}
        accounts={accounts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
