import { useState, useMemo } from 'react';
import { useAccounts, useTransactions } from '../../store/hooks';
import { generateBalanceSheet } from '../../services/reportService';
import { formatDateForInput } from '../../utils/date';

export default function BalanceSheet() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  // Default date: today
  const today = new Date();
  const [asOfDate, setAsOfDate] = useState<string>(formatDateForInput(today));

  // Generate balance sheet
  const balanceSheet = useMemo(() => {
    if (!asOfDate) {
      return null;
    }
    return generateBalanceSheet(accounts, transactions, asOfDate);
  }, [accounts, transactions, asOfDate]);

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

  // Verify balance sheet equation
  const isBalanced =
    balanceSheet &&
    balanceSheet.total_assets === balanceSheet.total_liabilities + balanceSheet.total_equity;

  return (
    <div className="reports">
      <h1 className="reports__title">貸借対照表 (B/S)</h1>

      <div className="reports__filter">
        <div className="reports__filter-group">
          <label htmlFor="as-of-date" className="reports__filter-label">
            基準日
          </label>
          <input
            id="as-of-date"
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="reports__filter-input"
          />
        </div>
      </div>

      {balanceSheet && (
        <>
          <div className="reports__period">{formatDateJapanese(asOfDate)} 時点</div>

          {!isBalanced && (
            <div className="reports__warning">
              ⚠️ 警告: 貸借対照表が均衡していません (資産 ≠ 負債 + 純資産)
            </div>
          )}

          <div className="reports__balance-sheet">
            {/* Left side: Assets */}
            <div className="reports__balance-sheet-side">
              <div className="reports__section">
                <h2 className="reports__section-title">資産</h2>
                {balanceSheet.assets.length === 0 ? (
                  <p className="reports__empty">資産の取引がありません</p>
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
                      {balanceSheet.assets.map((item) => (
                        <tr key={item.account_id} className="reports__table-row">
                          <td className="reports__table-cell">{item.account_name}</td>
                          <td className="reports__table-cell reports__table-cell--amount">
                            {formatCurrency(item.balance)}
                          </td>
                        </tr>
                      ))}
                      <tr className="reports__table-row reports__table-row--total">
                        <td className="reports__table-cell reports__table-cell--bold">
                          資産合計
                        </td>
                        <td className="reports__table-cell reports__table-cell--amount reports__table-cell--bold">
                          {formatCurrency(balanceSheet.total_assets)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right side: Liabilities and Equity */}
            <div className="reports__balance-sheet-side">
              <div className="reports__section">
                <h2 className="reports__section-title">負債</h2>
                {balanceSheet.liabilities.length === 0 ? (
                  <p className="reports__empty">負債の取引がありません</p>
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
                      {balanceSheet.liabilities.map((item) => (
                        <tr key={item.account_id} className="reports__table-row">
                          <td className="reports__table-cell">{item.account_name}</td>
                          <td className="reports__table-cell reports__table-cell--amount">
                            {formatCurrency(item.balance)}
                          </td>
                        </tr>
                      ))}
                      <tr className="reports__table-row reports__table-row--total">
                        <td className="reports__table-cell reports__table-cell--bold">
                          負債合計
                        </td>
                        <td className="reports__table-cell reports__table-cell--amount reports__table-cell--bold">
                          {formatCurrency(balanceSheet.total_liabilities)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              <div className="reports__section">
                <h2 className="reports__section-title">純資産</h2>
                {balanceSheet.equity.length === 0 ? (
                  <p className="reports__empty">純資産の取引がありません</p>
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
                      {balanceSheet.equity.map((item) => (
                        <tr key={item.account_id} className="reports__table-row">
                          <td className="reports__table-cell">{item.account_name}</td>
                          <td className="reports__table-cell reports__table-cell--amount">
                            {formatCurrency(item.balance)}
                          </td>
                        </tr>
                      ))}
                      <tr className="reports__table-row reports__table-row--total">
                        <td className="reports__table-cell reports__table-cell--bold">
                          純資産合計
                        </td>
                        <td className="reports__table-cell reports__table-cell--amount reports__table-cell--bold">
                          {formatCurrency(balanceSheet.total_equity)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="reports__summary">
            <div className="reports__summary-item">
              <span className="reports__summary-label">資産合計:</span>
              <span className="reports__summary-value">
                {formatCurrency(balanceSheet.total_assets)}
              </span>
            </div>
            <div className="reports__summary-item">
              <span className="reports__summary-label">負債合計:</span>
              <span className="reports__summary-value">
                {formatCurrency(balanceSheet.total_liabilities)}
              </span>
            </div>
            <div className="reports__summary-item">
              <span className="reports__summary-label">純資産合計:</span>
              <span className="reports__summary-value">
                {formatCurrency(balanceSheet.total_equity)}
              </span>
            </div>
            <div
              className={`reports__summary-item reports__summary-item--equation ${
                isBalanced ? 'reports__summary-item--balanced' : 'reports__summary-item--unbalanced'
              }`}
            >
              <span className="reports__summary-label">
                {isBalanced ? '✓' : '✗'} 資産 = 負債 + 純資産:
              </span>
              <span className="reports__summary-value">
                {formatCurrency(balanceSheet.total_assets)} ={' '}
                {formatCurrency(
                  balanceSheet.total_liabilities + balanceSheet.total_equity
                )}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
