import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccounts, useTransactions } from '../../store/hooks';
import TransactionForm, {
  type TransactionFormData,
} from '../../components/Transactions/TransactionForm';
import { ValidationError } from '../../store/DataStore';

export default function TransactionEntry() {
  const navigate = useNavigate();
  const { accounts } = useAccounts();
  const { createTransaction } = useTransactions();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = (data: TransactionFormData) => {
    try {
      setError('');
      setSuccess('');
      createTransaction(data);
      setSuccess('取引を登録しました');
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
      } else {
        setError('取引の登録に失敗しました');
      }
    }
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  return (
    <div className="transaction-entry">
      <h1 className="transaction-entry__title">取引入力</h1>

      {error && (
        <div className="transaction-entry__error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="transaction-entry__success" role="status">
          {success}
        </div>
      )}

      <TransactionForm accounts={accounts} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
