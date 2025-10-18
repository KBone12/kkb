import { useTransactions } from '../../store/hooks';

export default function TransactionList() {
  const { transactions } = useTransactions();

  return (
    <div>
      <h1>取引一覧</h1>
      <p>登録済み取引: {transactions.length}件</p>
      <p>取引の一覧表示機能を実装予定</p>
    </div>
  );
}
