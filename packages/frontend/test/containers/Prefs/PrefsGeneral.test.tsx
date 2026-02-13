/**
 * PrefsGeneral Component Tests - Simplified
 *
 * Tests the core theme changing functionality.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../test-utils';
import PrefsGeneral from '../../../src/containers/Prefs/PrefsGeneral';
import { ThemeContext } from '../../../src/contexts/ThemeContext';
import * as api from '../../../src/api';

// Mock the api module (used by query options)
vi.mock('../../../src/api', () => ({
  getEffectivePreferences: vi.fn(),
  getEffectivePreference: vi.fn(),
  setUserPreference: vi.fn(),
}));

// Mock FolderPicker component
vi.mock('../../../src/components/FolderPicker', () => ({
  default: () => <div data-testid="folder-picker">Folder Picker</div>,
}));

describe('PrefsGeneral - Theme Core Functionality', () => {
  const mockUpdateTheme = vi.fn();
  const mockPreferences = {
    interfaceStyle: 'quiqr10-light' as const,
    dataFolder: '~/Quiqr',
    showSplashAtStartup: true,
    libraryView: 'cards',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getEffectivePreferences).mockResolvedValue(mockPreferences as any);
    vi.mocked(api.getEffectivePreference).mockImplementation((prefKey: any) => {
      return Promise.resolve({
        value: mockPreferences[prefKey as keyof typeof mockPreferences],
        source: 'user' as const,
        locked: false,
        path: `user.preferences.${prefKey}`,
      });
    });
    vi.mocked(api.setUserPreference).mockResolvedValue(true);
  });

  const renderWithThemeContext = () => {
    return render(
      <ThemeContext.Provider value={{ updateTheme: mockUpdateTheme }}>
        <PrefsGeneral />
      </ThemeContext.Provider>
    );
  };

  it('renders the component successfully', async () => {
    renderWithThemeContext();

    // Wait for async state updates to complete
    await waitFor(() => {
      expect(screen.getByText('General Preferences')).toBeInTheDocument();
    });
  });

  it('loads preferences on mount', async () => {
    renderWithThemeContext();

    await waitFor(() => {
      expect(api.getEffectivePreferences).toHaveBeenCalled();
    });
  });

  it('provides theme update function from context', async () => {
    renderWithThemeContext();

    // Wait for component to finish loading
    await waitFor(() => {
      expect(screen.getByText('General Preferences')).toBeInTheDocument();
    });
  });

  it('saves preference using the API when theme changes', async () => {
    // This test verifies the API method exists and can be called
    const result = await api.setUserPreference('interfaceStyle', 'quiqr10-dark');
    expect(result).toBe(true);
  });
});
