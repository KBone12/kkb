import { useAccounts } from '../../store/hooks';

export default function AccountManagement() {
  const { accounts } = useAccounts();

  return (
    <div>
      <h1>勘定科目管理</h1>
      <p>登録済み勘定科目: {accounts.length}件</p>
      <p>勘定科目の追加・編集・削除機能を実装予定</p>
    </div>
  );
}
