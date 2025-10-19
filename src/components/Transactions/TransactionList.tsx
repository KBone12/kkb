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
    <div className="transaction-list">
      <div className="transaction-list__header">
        <div className="transaction-list__col transaction-list__col--date">日付</div>
        <div className="transaction-list__col transaction-list__col--description">摘要</div>
        <div className="transaction-list__col transaction-list__col--entries">仕訳内容</div>
        <div className="transaction-list__col transaction-list__col--amount">金額</div>
        <div className="transaction-list__col transaction-list__col--actions">操作</div>
      </div>

      {sortedTransactions.map((transaction) => {
        // Calculate total amount (use debit total)
        const totalAmount = transaction.entries.reduce(
          (sum, entry) => sum + entry.debit,
          0
        );

        return (
          <div key={transaction.id} className="transaction-list__item">
            <div className="transaction-list__col transaction-list__col--date">
              {formatDate(transaction.date)}
            </div>

            <div className="transaction-list__col transaction-list__col--description">
              {transaction.description}
            </div>

            <div className="transaction-list__col transaction-list__col--entries">
              <div className="transaction-list__entries">
                {transaction.entries.map((entry, idx) => (
                  <div key={idx} className="transaction-list__entry">
                    <span className="transaction-list__account">
                      {getAccountName(entry.account_id)}
                    </span>
                    <span className="transaction-list__entry-amount">
                      {entry.debit > 0 ? (
                        <span className="transaction-list__debit">
                          借方: {entry.debit.toLocaleString()}
                        </span>
                      ) : (
                        <span className="transaction-list__credit">
                          貸方: {entry.credit.toLocaleString()}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="transaction-list__col transaction-list__col--amount">
              {totalAmount.toLocaleString()} 円
            </div>

            <div className="transaction-list__col transaction-list__col--actions">
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
