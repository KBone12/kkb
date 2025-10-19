import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Transaction, Account } from '../../types';
import { getAccountName } from '../../utils/account';
import { formatDateWithSlash } from '../../utils/date';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

type SortOrder = 'newest' | 'oldest';

export default function TransactionList({
  transactions,
  accounts,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  if (transactions.length === 0) {
    return (
      <div className="transaction-list transaction-list--empty">
        <p className="transaction-list__empty-message">
          取引がまだ登録されていません
        </p>
      </div>
    );
  }

  return (
    <div className="transaction-list-wrapper">
      <div className="transaction-list__controls">
        <button
          onClick={toggleSortOrder}
          className="transaction-list__sort-btn"
          aria-label="ソート順を切り替え"
        >
          日付順: {sortOrder === 'newest' ? '新しい順 ▼' : '古い順 ▲'}
        </button>
      </div>
      <table className="transaction-list">
        <thead>
          <tr>
            <th className="transaction-list__header--date">日付</th>
            <th className="transaction-list__header--description">摘要</th>
            <th className="transaction-list__header--debit" colSpan={2}>借方</th>
            <th className="transaction-list__header--credit" colSpan={2}>貸方</th>
            <th className="transaction-list__header--actions">操作</th>
          </tr>
        </thead>
      <tbody>
        {sortedTransactions.map((transaction) => {
          // Separate debit and credit entries
          const debitEntries = transaction.entries.filter((entry) => entry.debit > 0);
          const creditEntries = transaction.entries.filter((entry) => entry.credit > 0);
          const maxRows = Math.max(debitEntries.length, creditEntries.length);

          return (
            <React.Fragment key={transaction.id}>
              {Array.from({ length: maxRows }).map((_, rowIdx) => (
                <tr key={`${transaction.id}-${rowIdx}`} className="transaction-list__row">
                  {rowIdx === 0 && (
                    <>
                      <td
                        className="transaction-list__cell--date"
                        rowSpan={maxRows}
                      >
                        {formatDateWithSlash(transaction.date)}
                      </td>

                      <td
                        className="transaction-list__cell--description"
                        rowSpan={maxRows}
                      >
                        {transaction.description}
                      </td>
                    </>
                  )}

                  <td className="transaction-list__cell--debit-account">
                    {debitEntries[rowIdx] && getAccountName(accounts, debitEntries[rowIdx].account_id)}
                  </td>

                  <td className="transaction-list__cell--debit-amount">
                    {debitEntries[rowIdx] && `${debitEntries[rowIdx].debit.toLocaleString()}円`}
                  </td>

                  <td className="transaction-list__cell--credit-account">
                    {creditEntries[rowIdx] && getAccountName(accounts, creditEntries[rowIdx].account_id)}
                  </td>

                  <td className="transaction-list__cell--credit-amount">
                    {creditEntries[rowIdx] && `${creditEntries[rowIdx].credit.toLocaleString()}円`}
                  </td>

                  {rowIdx === 0 && (
                    <td
                      className="transaction-list__cell--actions"
                      rowSpan={maxRows}
                    >
                      <button
                        onClick={() => navigate(`/transactions/${transaction.id}`)}
                        className="transaction-list__btn transaction-list__btn--detail"
                        aria-label={`${transaction.description}の詳細を表示`}
                      >
                        詳細
                      </button>
                      <button
                        onClick={() => onEdit(transaction)}
                        className="transaction-list__btn transaction-list__btn--edit"
                        aria-label={`${transaction.description}を編集`}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => onDelete(transaction)}
                        className="transaction-list__btn transaction-list__btn--delete"
                        aria-label={`${transaction.description}を削除`}
                      >
                        削除
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}
