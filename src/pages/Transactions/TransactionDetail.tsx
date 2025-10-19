import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccounts, useTransactions } from '../../store/hooks';
import type { Transaction } from '../../types';
import { getAccountName } from '../../utils/account';
import { formatDateJapanese } from '../../utils/date';

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const { transactions, deleteTransaction } = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (id) {
      const found = transactions.find((t) => t.id === id);
      setTransaction(found || null);
    }
  }, [id, transactions]);

  const handleEdit = () => {
    if (!transaction) return;
    navigate('/transactions', { state: { editTransactionId: transaction.id } });
  };

  const handleDelete = () => {
    if (!transaction) return;

    if (window.confirm(`「${transaction.description}」を削除しますか？`)) {
      deleteTransaction(transaction.id);
      navigate('/transactions');
    }
  };

  const handleBack = () => {
    navigate('/transactions');
  };

  if (!transaction) {
    return (
      <div className="transaction-detail">
        <div className="transaction-detail__error">
          <p>取引が見つかりませんでした</p>
          <button onClick={handleBack} className="transaction-detail__btn-back">
            取引一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // Separate debit and credit entries
  const debitEntries = transaction.entries.filter((entry) => entry.debit > 0);
  const creditEntries = transaction.entries.filter((entry) => entry.credit > 0);

  // Calculate totals
  const debitTotal = debitEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const creditTotal = creditEntries.reduce((sum, entry) => sum + entry.credit, 0);

  return (
    <div className="transaction-detail">
      <div className="transaction-detail__header">
        <h1 className="transaction-detail__title">取引詳細</h1>
        <div className="transaction-detail__actions">
          <button
            onClick={handleEdit}
            className="transaction-detail__btn transaction-detail__btn--edit"
          >
            編集
          </button>
          <button
            onClick={handleDelete}
            className="transaction-detail__btn transaction-detail__btn--delete"
          >
            削除
          </button>
          <button
            onClick={handleBack}
            className="transaction-detail__btn transaction-detail__btn--back"
          >
            戻る
          </button>
        </div>
      </div>

      <div className="transaction-detail__content">
        <div className="transaction-detail__info">
          <div className="transaction-detail__info-item">
            <span className="transaction-detail__info-label">日付:</span>
            <span className="transaction-detail__info-value">
              {formatDateJapanese(transaction.date)}
            </span>
          </div>
          <div className="transaction-detail__info-item">
            <span className="transaction-detail__info-label">摘要:</span>
            <span className="transaction-detail__info-value">
              {transaction.description}
            </span>
          </div>
        </div>

        <div className="transaction-detail__entries">
          <h2 className="transaction-detail__subtitle">仕訳明細</h2>

          <table className="transaction-detail__table">
            <thead>
              <tr>
                <th className="transaction-detail__th--account">勘定科目</th>
                <th className="transaction-detail__th--debit">借方</th>
                <th className="transaction-detail__th--credit">貸方</th>
              </tr>
            </thead>
            <tbody>
              {transaction.entries.map((entry, index) => (
                <tr key={index} className="transaction-detail__row">
                  <td className="transaction-detail__td--account">
                    {getAccountName(accounts, entry.account_id)}
                  </td>
                  <td className="transaction-detail__td--debit">
                    {entry.debit > 0 ? `${entry.debit.toLocaleString('ja-JP')}円` : ''}
                  </td>
                  <td className="transaction-detail__td--credit">
                    {entry.credit > 0 ? `${entry.credit.toLocaleString('ja-JP')}円` : ''}
                  </td>
                </tr>
              ))}
              <tr className="transaction-detail__row--total">
                <td className="transaction-detail__td--label">合計</td>
                <td className="transaction-detail__td--debit-total">
                  {debitTotal.toLocaleString('ja-JP')}円
                </td>
                <td className="transaction-detail__td--credit-total">
                  {creditTotal.toLocaleString('ja-JP')}円
                </td>
              </tr>
            </tbody>
          </table>

          {debitTotal !== creditTotal && (
            <div className="transaction-detail__warning" role="alert">
              警告: 借方と貸方の合計が一致しません
            </div>
          )}
        </div>

        <div className="transaction-detail__metadata">
          <p className="transaction-detail__metadata-item">
            作成日時: {new Date(transaction.created_at).toLocaleString('ja-JP')}
          </p>
          <p className="transaction-detail__metadata-item">
            更新日時: {new Date(transaction.updated_at).toLocaleString('ja-JP')}
          </p>
        </div>
      </div>
    </div>
  );
}
