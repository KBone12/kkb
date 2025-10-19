import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import TransactionList from './pages/Transactions/TransactionList';
import TransactionEntry from './pages/Transactions/TransactionEntry';
import TransactionDetail from './pages/Transactions/TransactionDetail';
import AccountManagement from './pages/Accounts/AccountManagement';
import IncomeStatement from './pages/Reports/IncomeStatement';
import BalanceSheet from './pages/Reports/BalanceSheet';
import Settings from './pages/Settings/Settings';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<TransactionList />} />
            <Route path="transactions/new" element={<TransactionEntry />} />
            <Route path="transactions/:id" element={<TransactionDetail />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="reports/income-statement" element={<IncomeStatement />} />
            <Route path="reports/balance-sheet" element={<BalanceSheet />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
