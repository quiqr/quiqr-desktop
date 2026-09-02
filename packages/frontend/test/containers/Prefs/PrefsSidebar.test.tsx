/**
 * PrefsSidebar Component Tests
 *
 * Tests the preferences sidebar menu structure and standalone mode behavior.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

// Mock useEnvironment hook
const mockUseEnvironment = vi.fn();
vi.mock('../../../src/hooks/useEnvironment', () => ({
  useEnvironment: () => mockUseEnvironment(),
  default: () => mockUseEnvironment(),
}));

import { PrefsSidebar } from '../../../src/containers/Prefs/PrefsSidebar';

// Mock the Sidebar component to inspect what menus are passed
vi.mock('../../../src/containers/Sidebar', () => ({
  default: ({ menus }: { menus: Array<{ title: string; items: Array<{ label: string }> }> }) => (
    <div data-testid="sidebar">
      {menus.map((menu) => (
        <div key={menu.title} data-testid={`menu-${menu.title}`}>
          <h3>{menu.title}</h3>
          {menu.items.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe('PrefsSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both sections in Electron mode', () => {
    mockUseEnvironment.mockReturnValue({
      isStandalone: false,
      isPackaged: true,
      platform: 'linux',
      environmentInfo: { platform: 'linux', isPackaged: true },
    });

    render(
      <MemoryRouter>
        <PrefsSidebar />
      </MemoryRouter>
    );

    expect(screen.getByTestId('menu-Preferences')).toBeDefined();
    expect(screen.getByTestId('menu-Application Settings')).toBeDefined();
    expect(screen.getByText('Storage')).toBeDefined();
    expect(screen.getByText('Git')).toBeDefined();
    expect(screen.getByText('Variables')).toBeDefined();
  });

  it('hides Application Settings section in standalone mode', () => {
    mockUseEnvironment.mockReturnValue({
      isStandalone: true,
      isPackaged: false,
      platform: 'linux',
      environmentInfo: { platform: 'linux', isPackaged: false },
    });

    render(
      <MemoryRouter>
        <PrefsSidebar />
      </MemoryRouter>
    );

    expect(screen.getByTestId('menu-Preferences')).toBeDefined();
    expect(screen.getByText('Appearance')).toBeDefined();
    expect(screen.getByText('Behaviour')).toBeDefined();
    expect(screen.queryByTestId('menu-Application Settings')).toBeNull();
    expect(screen.queryByText('Storage')).toBeNull();
    expect(screen.queryByText('Git')).toBeNull();
  });
});
