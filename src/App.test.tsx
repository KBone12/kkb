import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // There are multiple instances of "KKB - K's Kakeibo" (header and footer)
    const elements = screen.getAllByText(/KKB - K's Kakeibo/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('renders header navigation', () => {
    render(<App />);
    // Some text appears in both header and sidebar, so we use getAllBy
    const dashboardLinks = screen.getAllByText('ダッシュボード');
    expect(dashboardLinks.length).toBeGreaterThan(0);
    expect(screen.getByText('取引')).toBeInTheDocument();
    expect(screen.getByText('勘定科目')).toBeInTheDocument();
    expect(screen.getByText('レポート')).toBeInTheDocument();
    const settingsLinks = screen.getAllByText('設定');
    expect(settingsLinks.length).toBeGreaterThan(0);
  });

  it('renders sidebar navigation', () => {
    render(<App />);
    expect(screen.getByText('取引一覧')).toBeInTheDocument();
    expect(screen.getByText('新規取引')).toBeInTheDocument();
    expect(screen.getByText('勘定科目管理')).toBeInTheDocument();
    expect(screen.getByText('損益計算書')).toBeInTheDocument();
    expect(screen.getByText('貸借対照表')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<App />);
    expect(screen.getByText(/KKB - K's Kakeibo v1.0.0/i)).toBeInTheDocument();
  });

  it('renders dashboard by default', () => {
    render(<App />);
    // Verify dashboard content appears (unique to the dashboard page)
    expect(
      screen.getByText(/資産・負債・収支のサマリーを表示します/i)
    ).toBeInTheDocument();
  });
});
