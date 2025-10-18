import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'ダッシュボード' },
  { path: '/transactions', label: '取引一覧' },
  { path: '/transactions/new', label: '新規取引' },
  { path: '/accounts', label: '勘定科目管理' },
  { path: '/reports/income-statement', label: '損益計算書' },
  { path: '/reports/balance-sheet', label: '貸借対照表' },
  { path: '/settings', label: '設定' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="app-sidebar">
      <nav className="app-sidebar__nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`app-sidebar__nav-item ${
              location.pathname === item.path ? 'app-sidebar__nav-item--active' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
