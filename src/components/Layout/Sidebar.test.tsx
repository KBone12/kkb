import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  it('renders all navigation items', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('取引一覧')).toBeInTheDocument();
    expect(screen.getByText('新規取引')).toBeInTheDocument();
    expect(screen.getByText('勘定科目管理')).toBeInTheDocument();
    expect(screen.getByText('損益計算書')).toBeInTheDocument();
    expect(screen.getByText('貸借対照表')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('all navigation items are links', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(7);
  });
});
