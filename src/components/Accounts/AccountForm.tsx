import { useState, useEffect } from 'react';
import type { Account, AccountType } from '../../types';
import { ACCOUNT_TYPE_LABELS, DEFAULT_CURRENCY } from '../../types';

interface AccountFormProps {
  account?: Account | null;
  accounts: Account[];
  onSubmit: (data: AccountFormData) => void;
  onCancel: () => void;
}

export interface AccountFormData {
  name: string;
  type: AccountType;
  parent_id: string | null;
  currency: string;
}

export default function AccountForm({
  account,
  accounts,
  onSubmit,
  onCancel,
}: AccountFormProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    name: account?.name || '',
    type: account?.type || 'asset',
    parent_id: account?.parent_id || null,
    currency: account?.currency || DEFAULT_CURRENCY,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when account prop changes
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        parent_id: account.parent_id,
        currency: account.currency,
      });
    }
  }, [account]);

  // Get potential parent accounts (same type, not self or descendants)
  const potentialParents = accounts.filter((a) => {
    // Same type
    if (a.type !== formData.type) return false;

    // Active only
    if (!a.is_active) return false;

    // Cannot select self as parent
    if (account && a.id === account.id) return false;

    // Cannot select own descendants as parent
    if (account) {
      const isDescendant = (checkId: string, ancestorId: string): boolean => {
        const acc = accounts.find((x) => x.id === checkId);
        if (!acc) return false;
        if (acc.parent_id === ancestorId) return true;
        if (acc.parent_id === null) return false;
        return isDescendant(acc.parent_id, ancestorId);
      };
      if (isDescendant(a.id, account.id)) return false;
    }

    return true;
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = '勘定科目名を入力してください';
    }

    // Check duplicate name under same parent
    const duplicate = accounts.find(
      (a) =>
        a.name === formData.name.trim() &&
        a.parent_id === formData.parent_id &&
        a.type === formData.type &&
        (!account || a.id !== account.id)
    );

    if (duplicate) {
      newErrors.name = '同じ親の下に同名の勘定科目が既に存在します';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      ...formData,
      name: formData.name.trim(),
    });
  };

  const handleTypeChange = (type: AccountType) => {
    // When type changes, reset parent to null if current parent doesn't match type
    const currentParent = formData.parent_id
      ? accounts.find((a) => a.id === formData.parent_id)
      : null;

    setFormData({
      ...formData,
      type,
      parent_id: currentParent && currentParent.type === type ? formData.parent_id : null,
    });
  };

  const isEdit = !!account;

  return (
    <form onSubmit={handleSubmit} className="account-form">
      <h3 className="account-form__title">
        {isEdit ? '勘定科目を編集' : '勘定科目を追加'}
      </h3>

      <div className="account-form__field">
        <label htmlFor="account-name" className="account-form__label">
          勘定科目名 <span className="account-form__required">*</span>
        </label>
        <input
          id="account-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`account-form__input ${errors.name ? 'account-form__input--error' : ''}`}
          placeholder="例: 現金"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'account-name-error' : undefined}
        />
        {errors.name && (
          <p id="account-name-error" className="account-form__error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="account-form__field">
        <label htmlFor="account-type" className="account-form__label">
          タイプ <span className="account-form__required">*</span>
        </label>
        <select
          id="account-type"
          value={formData.type}
          onChange={(e) => handleTypeChange(e.target.value as AccountType)}
          className="account-form__select"
          disabled={isEdit} // Cannot change type when editing
          aria-required="true"
        >
          {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((type) => (
            <option key={type} value={type}>
              {ACCOUNT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {isEdit && (
          <p className="account-form__help">
            データ整合性のため、タイプは変更できません
          </p>
        )}
      </div>

      <div className="account-form__field">
        <label htmlFor="account-parent" className="account-form__label">
          親勘定科目
        </label>
        <select
          id="account-parent"
          value={formData.parent_id || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              parent_id: e.target.value || null,
            })
          }
          className="account-form__select"
        >
          <option value="">なし（ルート勘定科目）</option>
          {potentialParents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
      </div>

      <div className="account-form__field">
        <label htmlFor="account-currency" className="account-form__label">
          通貨
        </label>
        <select
          id="account-currency"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          className="account-form__select"
        >
          <option value="JPY">JPY (日本円)</option>
          <option value="USD">USD (米ドル)</option>
          <option value="EUR">EUR (ユーロ)</option>
        </select>
      </div>

      <div className="account-form__actions">
        <button
          type="button"
          onClick={onCancel}
          className="account-form__btn account-form__btn--cancel"
        >
          キャンセル
        </button>
        <button type="submit" className="account-form__btn account-form__btn--submit">
          {isEdit ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}
