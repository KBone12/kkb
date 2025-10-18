import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './MainLayout';

describe('MainLayout', () => {
  it('renders header, sidebar, and footer', () => {
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    // Header should be present (appears in both header and footer)
    const kkbElements = screen.getAllByText(/KKB - K's Kakeibo/i);
    expect(kkbElements.length).toBeGreaterThan(0);

    // Sidebar navigation should be present
    expect(screen.getByText('取引一覧')).toBeInTheDocument();
    expect(screen.getByText('新規取引')).toBeInTheDocument();

    // Footer should be present
    expect(screen.getByText(/v1.0.0/i)).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    expect(container.querySelector('.app-layout')).toBeInTheDocument();
    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.app-sidebar')).toBeInTheDocument();
    expect(container.querySelector('.app-footer')).toBeInTheDocument();
    expect(container.querySelector('.app-layout__main')).toBeInTheDocument();
  });
});
