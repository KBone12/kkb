import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__container">
        <h1 className="app-header__title">
          <Link to="/">KKB - K's Kakeibo</Link>
        </h1>
        <nav className="app-header__nav">
          <Link to="/" className="app-header__nav-item">
            ダッシュボード
          </Link>
          <Link to="/transactions" className="app-header__nav-item">
            取引
          </Link>
          <Link to="/accounts" className="app-header__nav-item">
            勘定科目
          </Link>
          <Link to="/reports/income-statement" className="app-header__nav-item">
            レポート
          </Link>
          <Link to="/settings" className="app-header__nav-item">
            設定
          </Link>
        </nav>
      </div>
    </header>
  );
}
