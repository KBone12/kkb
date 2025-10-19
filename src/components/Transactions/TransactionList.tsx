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
          <th className="transaction-list__header--entries">仕訳内容</th>
          <th className="transaction-list__header--amount">金額</th>
          <th className="transaction-list__header--actions">操作</th>
        </tr>
      </thead>
      <tbody>
        {sortedTransactions.map((transaction) => {
          // Calculate total amount (use debit total)
          const totalAmount = transaction.entries.reduce(
            (sum, entry) => sum + entry.debit,
            0
          );

          return (
            <tr key={transaction.id} className="transaction-list__row">
              <td className="transaction-list__cell--date">
                {formatDate(transaction.date)}
              </td>

              <td className="transaction-list__cell--description">
                {transaction.description}
              </td>

              <td className="transaction-list__cell--entries">
                <ul className="transaction-list__entries">
                  {transaction.entries.map((entry, idx) => (
                    <li key={idx} className="transaction-list__entry">
                      <span className="transaction-list__account">
                        {getAccountName(entry.account_id)}
                      </span>
                      {': '}
                      {entry.debit > 0 ? (
                        <span className="transaction-list__debit">
                          借方 {entry.debit.toLocaleString()}円
                        </span>
                      ) : (
                        <span className="transaction-list__credit">
                          貸方 {entry.credit.toLocaleString()}円
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </td>

              <td className="transaction-list__cell--amount">
                {totalAmount.toLocaleString()} 円
              </td>

              <td className="transaction-list__cell--actions">
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
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
