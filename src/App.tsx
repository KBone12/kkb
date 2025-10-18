import { AppProvider } from './store/AppContext';
import { useAccounts, useTransactions } from './store/hooks';
import './App.css';

function AppContent() {
  const { accounts, createAccount } = useAccounts();
  const { transactions, createTransaction } = useTransactions();

  const handleAddTestAccount = () => {
    createAccount({
      name: 'テスト勘定科目',
      type: 'asset',
      parent_id: null,
      currency: 'JPY',
      is_active: true,
    });
  };

  const handleAddTestTransaction = () => {
    if (accounts.length < 2) {
      alert('取引を作成するには、少なくとも2つの勘定科目が必要です');
      return;
    }

    createTransaction({
      date: new Date().toISOString().split('T')[0],
      description: 'テスト取引',
      entries: [
        { account_id: accounts[0].id, debit: 1000, credit: 0 },
        { account_id: accounts[1].id, debit: 0, credit: 1000 },
      ],
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>KKB - K's Kakeibo</h1>
      <p>家計簿アプリ開発中（Phase 1: MVP）</p>

      <div style={{ marginTop: '20px' }}>
        <h2>動作確認</h2>
        <button onClick={handleAddTestAccount}>テスト勘定科目を追加</button>
        <button onClick={handleAddTestTransaction} style={{ marginLeft: '10px' }}>
          テスト取引を追加
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>勘定科目（{accounts.length}件）</h3>
        <ul>
          {accounts.map((account) => (
            <li key={account.id}>
              {account.name} ({account.type}) - {account.currency}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>取引（{transactions.length}件）</h3>
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.date} - {transaction.description} (
              {transaction.entries.length}件の仕訳)
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <small>
          ℹ️ ブラウザをリロードしてもデータが保持されることを確認してください
          <br />
          Developer Tools → Application → Local Storage で "kkb-data"
          を確認できます
        </small>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
