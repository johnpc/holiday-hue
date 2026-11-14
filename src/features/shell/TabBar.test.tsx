import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { TabBar } from './TabBar';

function renderTabBar(active?: string) {
  return render(
    <MemoryRouter>
      <TabBar active={active} />
    </MemoryRouter>,
  );
}

describe('TabBar', () => {
  it('marks the active tab with aria-current', () => {
    renderTabBar('Settings');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Lights' })).not.toHaveAttribute('aria-current');
  });

  it('renders Lights and Settings as wired links', () => {
    renderTabBar();
    expect(screen.getByTestId('tab-lights')).toHaveAttribute('href', '/lights');
    expect(screen.getByTestId('tab-settings')).toHaveAttribute('href', '/settings');
  });

  it('defaults the active tab to Lights', () => {
    renderTabBar();
    expect(screen.getByRole('link', { name: 'Lights' })).toHaveAttribute('aria-current', 'page');
  });
});
