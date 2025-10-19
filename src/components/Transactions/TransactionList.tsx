import React from 'react';
import type { Transaction, Account } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionList({
  transactions,
  accounts,
  onEdit,
  onDelete,
}: TransactionListProps) {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Helper to get account name by ID
  const getAccountName = (accountId: string): string => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? account.name : '不明な勘定科目';
  };

  // Format date for display (YYYY/MM/DD)
  const formatDate = (dateString: string): string => {
    return dateString.replace(/-/g, '/');
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
                        {formatDate(transaction.date)}
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
                    {debitEntries[rowIdx] && getAccountName(debitEntries[rowIdx].account_id)}
                  </td>

                  <td className="transaction-list__cell--debit-amount">
                    {debitEntries[rowIdx] && `${debitEntries[rowIdx].debit.toLocaleString()}円`}
                  </td>

                  <td className="transaction-list__cell--credit-account">
                    {creditEntries[rowIdx] && getAccountName(creditEntries[rowIdx].account_id)}
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
  );
}
