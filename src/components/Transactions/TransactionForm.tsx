import { useState, useEffect } from 'react';
import type { Transaction, Entry, Account } from '../../types';
import { formatDateForInput } from '../../utils/date';

interface TransactionFormProps {
  transaction?: Transaction | null;
  accounts: Account[];
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
}

export interface TransactionFormData {
  date: string;
  description: string;
  entries: Entry[];
}

interface EntryRow extends Entry {
  id: string; // Temporary ID for React key
}

export default function TransactionForm({
  transaction,
  accounts,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<{
    date: string;
    description: string;
    entries: EntryRow[];
  }>({
    date: transaction?.date || formatDateForInput(new Date()),
    description: transaction?.description || '',
    entries: transaction?.entries.map((e, idx) => ({ ...e, id: `entry-${idx}` })) || [
      { id: 'entry-0', account_id: '', debit: 0, credit: 0 },
      { id: 'entry-1', account_id: '', debit: 0, credit: 0 },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when transaction prop changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        description: transaction.description,
        entries: transaction.entries.map((e, idx) => ({ ...e, id: `entry-${idx}` })),
      });
    }
  }, [transaction]);

  // Get active accounts only
  const activeAccounts = accounts.filter((a) => a.is_active);

  // Calculate totals
  const totalDebit = formData.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredit = formData.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.date) {
      newErrors.date = '日付を入力してください';
    }

    if (!formData.description.trim()) {
      newErrors.description = '摘要を入力してください';
    }

    // At least 2 entries required
    if (formData.entries.length < 2) {
      newErrors.entries = '仕訳は最低2行必要です';
    }

    // Check all entries have account selected
    formData.entries.forEach((entry, idx) => {
      if (!entry.account_id) {
        newErrors[`entry-${idx}-account`] = '勘定科目を選択してください';
      }
    });

    // Balance check
    if (!isBalanced) {
      newErrors.balance = '借方合計と貸方合計が一致していません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Remove temporary IDs before submitting
    const cleanEntries: Entry[] = formData.entries.map(({ id, ...entry }) => entry);

    onSubmit({
      date: formData.date,
      description: formData.description.trim(),
      entries: cleanEntries,
    });
  };

  const handleAddEntry = () => {
    const newId = `entry-${Date.now()}`;
    setFormData({
      ...formData,
      entries: [...formData.entries, { id: newId, account_id: '', debit: 0, credit: 0 }],
    });
  };

  const handleRemoveEntry = (id: string) => {
    // Must keep at least 2 entries
    if (formData.entries.length <= 2) return;

    setFormData({
      ...formData,
      entries: formData.entries.filter((e) => e.id !== id),
    });
  };

  const handleEntryChange = (id: string, field: keyof Entry, value: string | number) => {
    setFormData({
      ...formData,
      entries: formData.entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      ),
    });
  };

  // Handle debit/credit input - ensure only one is non-zero
  const handleAmountChange = (id: string, type: 'debit' | 'credit', value: string) => {
    const amount = parseFloat(value) || 0;
    const otherType = type === 'debit' ? 'credit' : 'debit';

    setFormData({
      ...formData,
      entries: formData.entries.map((entry) =>
        entry.id === id
          ? { ...entry, [type]: amount, [otherType]: 0 }
          : entry
      ),
    });
  };

  const isEdit = !!transaction;

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h3 className="transaction-form__title">
        {isEdit ? '取引を編集' : '取引を登録'}
      </h3>

      <div className="transaction-form__header">
        <div className="transaction-form__field">
          <label htmlFor="transaction-date" className="transaction-form__label">
            日付 <span className="transaction-form__required">*</span>
          </label>
          <input
            id="transaction-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={`transaction-form__input ${errors.date ? 'transaction-form__input--error' : ''}`}
            aria-required="true"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'transaction-date-error' : undefined}
          />
          {errors.date && (
            <p id="transaction-date-error" className="transaction-form__error" role="alert">
              {errors.date}
            </p>
          )}
        </div>

        <div className="transaction-form__field">
          <label htmlFor="transaction-description" className="transaction-form__label">
            摘要 <span className="transaction-form__required">*</span>
          </label>
          <input
            id="transaction-description"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`transaction-form__input ${errors.description ? 'transaction-form__input--error' : ''}`}
            placeholder="例: スーパーで食料品購入"
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'transaction-description-error' : undefined}
          />
          {errors.description && (
            <p id="transaction-description-error" className="transaction-form__error" role="alert">
              {errors.description}
            </p>
          )}
        </div>
      </div>

      <div className="transaction-form__entries">
        <h4 className="transaction-form__entries-title">仕訳</h4>

        <div className="transaction-form__entries-header">
          <div className="transaction-form__entries-col transaction-form__entries-col--account">
            勘定科目
          </div>
          <div className="transaction-form__entries-col transaction-form__entries-col--debit">
            借方
          </div>
          <div className="transaction-form__entries-col transaction-form__entries-col--credit">
            貸方
          </div>
          <div className="transaction-form__entries-col transaction-form__entries-col--actions">
            操作
          </div>
        </div>

        {formData.entries.map((entry, idx) => (
          <div key={entry.id} className="transaction-form__entry-row">
            <div className="transaction-form__entries-col transaction-form__entries-col--account">
              <select
                value={entry.account_id}
                onChange={(e) => handleEntryChange(entry.id, 'account_id', e.target.value)}
                className={`transaction-form__select ${errors[`entry-${idx}-account`] ? 'transaction-form__select--error' : ''}`}
                aria-label={`仕訳${idx + 1}の勘定科目`}
                aria-invalid={!!errors[`entry-${idx}-account`]}
              >
                <option value="">選択してください</option>
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              {errors[`entry-${idx}-account`] && (
                <p className="transaction-form__error" role="alert">
                  {errors[`entry-${idx}-account`]}
                </p>
              )}
            </div>

            <div className="transaction-form__entries-col transaction-form__entries-col--debit">
              <input
                type="number"
                min="0"
                step="1"
                value={entry.debit || ''}
                onChange={(e) => handleAmountChange(entry.id, 'debit', e.target.value)}
                className="transaction-form__amount-input"
                placeholder="0"
                aria-label={`仕訳${idx + 1}の借方金額`}
              />
            </div>

            <div className="transaction-form__entries-col transaction-form__entries-col--credit">
              <input
                type="number"
                min="0"
                step="1"
                value={entry.credit || ''}
                onChange={(e) => handleAmountChange(entry.id, 'credit', e.target.value)}
                className="transaction-form__amount-input"
                placeholder="0"
                aria-label={`仕訳${idx + 1}の貸方金額`}
              />
            </div>

            <div className="transaction-form__entries-col transaction-form__entries-col--actions">
              <button
                type="button"
                onClick={() => handleRemoveEntry(entry.id)}
                disabled={formData.entries.length <= 2}
                className="transaction-form__btn-remove"
                aria-label={`仕訳${idx + 1}を削除`}
              >
                削除
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddEntry}
          className="transaction-form__btn-add"
        >
          + 仕訳を追加
        </button>

        {errors.entries && (
          <p className="transaction-form__error" role="alert">
            {errors.entries}
          </p>
        )}
      </div>

      <div className="transaction-form__summary">
        <div className="transaction-form__totals">
          <div className="transaction-form__total">
            <span className="transaction-form__total-label">借方合計:</span>
            <span className="transaction-form__total-value">{totalDebit.toLocaleString()} 円</span>
          </div>
          <div className="transaction-form__total">
            <span className="transaction-form__total-label">貸方合計:</span>
            <span className="transaction-form__total-value">{totalCredit.toLocaleString()} 円</span>
          </div>
          <div className={`transaction-form__balance ${isBalanced ? 'transaction-form__balance--ok' : 'transaction-form__balance--error'}`}>
            {isBalanced ? '✓ 貸借一致' : '✗ 貸借不一致'}
          </div>
        </div>

        {errors.balance && (
          <p className="transaction-form__error" role="alert">
            {errors.balance}
          </p>
        )}
      </div>

      <div className="transaction-form__actions">
        <button
          type="button"
          onClick={onCancel}
          className="transaction-form__btn transaction-form__btn--cancel"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!isBalanced}
          className="transaction-form__btn transaction-form__btn--submit"
        >
          {isEdit ? '更新' : '登録'}
        </button>
      </div>
    </form>
  );
}
