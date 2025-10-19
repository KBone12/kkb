import { useState, useMemo } from 'react';
import { useAccounts, useTransactions } from '../../store/hooks';
import { generateIncomeStatement } from '../../services/reportService';
import { formatDateForInput } from '../../utils/date';

export default function IncomeStatement() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  // Default period: current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState<string>(formatDateForInput(firstDayOfMonth));
  const [endDate, setEndDate] = useState<string>(formatDateForInput(lastDayOfMonth));

  // Generate income statement
  const statement = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }
    return generateIncomeStatement(accounts, transactions, startDate, endDate);
  }, [accounts, transactions, startDate, endDate]);

  // Format number to Japanese currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    });
  };

  // Format date to Japanese style
  const formatDateJapanese = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="reports">
      <h1 className="reports__title">損益計算書 (P&amp;L)</h1>

      <div className="reports__filter">
        <div className="reports__filter-group">
          <label htmlFor="start-date" className="reports__filter-label">
            開始日
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="reports__filter-input"
          />
        </div>
        <div className="reports__filter-group">
          <label htmlFor="end-date" className="reports__filter-label">
            終了日
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="reports__filter-input"
          />
        </div>
      </div>

      {statement && (
        <>
          <div className="reports__period">
            {formatDateJapanese(startDate)} 〜 {formatDateJapanese(endDate)}
          </div>

          <div className="reports__section">
            <h2 className="reports__section-title">収益</h2>
            {statement.revenue.length === 0 ? (
              <p className="reports__empty">収益の取引がありません</p>
            ) : (
              <table className="reports__table">
                <thead>
                  <tr>
                    <th className="reports__table-header">勘定科目</th>
                    <th className="reports__table-header reports__table-header--amount">
                      金額
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statement.revenue.map((item) => (
                    <tr key={item.account_id} className="reports__table-row">
                      <td className="reports__table-cell">{item.account_name}</td>
                      <td className="reports__table-cell reports__table-cell--amount">
                        {formatCurrency(item.balance)}
                      </td>
                    </tr>
                  ))}
                  <tr className="reports__table-row reports__table-row--total">
                    <td className="reports__table-cell reports__table-cell--bold">
                      収益合計
                    </td>
                    <td className="reports__table-cell reports__table-cell--amount reports__table-cell--bold">
                      {formatCurrency(statement.total_revenue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="reports__section">
            <h2 className="reports__section-title">費用</h2>
            {statement.expense.length === 0 ? (
              <p className="reports__empty">費用の取引がありません</p>
            ) : (
              <table className="reports__table">
                <thead>
                  <tr>
                    <th className="reports__table-header">勘定科目</th>
                    <th className="reports__table-header reports__table-header--amount">
                      金額
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statement.expense.map((item) => (
                    <tr key={item.account_id} className="reports__table-row">
                      <td className="reports__table-cell">{item.account_name}</td>
                      <td className="reports__table-cell reports__table-cell--amount">
                        {formatCurrency(item.balance)}
                      </td>
                    </tr>
                  ))}
                  <tr className="reports__table-row reports__table-row--total">
                    <td className="reports__table-cell reports__table-cell--bold">
                      費用合計
                    </td>
                    <td className="reports__table-cell reports__table-cell--amount reports__table-cell--bold">
                      {formatCurrency(statement.total_expense)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="reports__summary">
            <div className="reports__summary-item">
              <span className="reports__summary-label">収益合計:</span>
              <span className="reports__summary-value reports__summary-value--positive">
                {formatCurrency(statement.total_revenue)}
              </span>
            </div>
            <div className="reports__summary-item">
              <span className="reports__summary-label">費用合計:</span>
              <span className="reports__summary-value reports__summary-value--negative">
                {formatCurrency(statement.total_expense)}
              </span>
            </div>
            <div
              className={`reports__summary-item reports__summary-item--net-income ${
                statement.net_income >= 0
                  ? 'reports__summary-item--profit'
                  : 'reports__summary-item--loss'
              }`}
            >
              <span className="reports__summary-label">純利益 (損失):</span>
              <span
                className={`reports__summary-value ${
                  statement.net_income >= 0
                    ? 'reports__summary-value--positive'
                    : 'reports__summary-value--negative'
                }`}
              >
                {formatCurrency(statement.net_income)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
