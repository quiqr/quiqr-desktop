/**
 * PrefsRouted Component Tests
 *
 * Tests the preferences routing, including standalone mode redirects.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { render } from '../../test-utils';
import { PrefsRouted } from '../../../src/containers/Prefs/PrefsRouted';
import * as api from '../../../src/api';

// Mock API
vi.mock('../../../src/api', () => ({
  getEffectivePreferences: vi.fn(),
  getInstanceSetting: vi.fn(),
  getStoragePath: vi.fn(),
  setStoragePath: vi.fn(),
  showOpenFolderDialog: vi.fn(),
}));

// Mock useEnvironment hook
const mockUseEnvironment = vi.fn();
vi.mock('../../../src/hooks/useEnvironment', () => ({
  useEnvironment: () => mockUseEnvironment(),
  default: () => mockUseEnvironment(),
}));

// Mock all Prefs page components to simple identifiable elements
vi.mock('../../../src/containers/Prefs/PrefsGeneral', () => ({
  default: () => <div data-testid="prefs-general">General</div>,
}));
vi.mock('../../../src/containers/Prefs/PrefsAdvanced', () => ({
  default: () => <div data-testid="prefs-advanced">Advanced</div>,
}));
vi.mock('../../../src/containers/Prefs/PrefsAppSettingsGeneral', () => ({
  default: () => <div data-testid="prefs-appsettings">AppSettings</div>,
}));
vi.mock('../../../src/containers/Prefs/PrefsApplicationStorage', () => ({
  default: () => <div data-testid="prefs-storage">Storage</div>,
}));
vi.mock('../../../src/containers/Prefs/PrefsGit', () => ({
  default: () => <div data-testid="prefs-git">Git</div>,
}));
vi.mock('../../../src/containers/Prefs/PrefsLogging', () => ({
  default: () => <div data-testid="prefs-logging">Logging</div>,
}));
vi.mock('../../../src/containers/Prefs/PrefsHugo', () => ({
  default: () => <div data-testid="prefs-hugo">Hugo</div>,
}));
vi.mock('../../../src/containers/Prefs/PrefsVariables', () => ({
  default: () => <div data-testid="prefs-variables">Variables</div>,
}));

describe('PrefsRouted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getEffectivePreferences).mockResolvedValue({
      interfaceStyle: 'quiqr10-light',
    } as any);
    vi.mocked(api.getInstanceSetting).mockResolvedValue(null);
    vi.mocked(api.getStoragePath).mockResolvedValue('/home/user/QuiqrData');
  });

  describe('Electron mode', () => {
    beforeEach(() => {
      mockUseEnvironment.mockReturnValue({
        isStandalone: false,
        isPackaged: true,
        platform: 'linux',
        environmentInfo: { platform: 'linux', isPackaged: true },
      });
    });

    it('renders instance settings routes', () => {
      render(
        <MemoryRouter initialEntries={['/prefs/storage']}>
          <Routes>
            <Route path="/prefs/*" element={<PrefsRouted />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('prefs-storage')).toBeDefined();
    });

    it('renders git settings route', () => {
      render(
        <MemoryRouter initialEntries={['/prefs/git']}>
          <Routes>
            <Route path="/prefs/*" element={<PrefsRouted />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('prefs-git')).toBeDefined();
    });
  });

  describe('Standalone mode', () => {
    beforeEach(() => {
      mockUseEnvironment.mockReturnValue({
        isStandalone: true,
        isPackaged: false,
        platform: 'linux',
        environmentInfo: { platform: 'linux', isPackaged: false },
      });
    });

    it('redirects storage route to general', () => {
      render(
        <MemoryRouter initialEntries={['/prefs/storage']}>
          <Routes>
            <Route path="/prefs/*" element={<PrefsRouted />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('prefs-storage')).toBeNull();
      expect(screen.getByTestId('prefs-general')).toBeDefined();
    });

    it('redirects git route to general', () => {
      render(
        <MemoryRouter initialEntries={['/prefs/git']}>
          <Routes>
            <Route path="/prefs/*" element={<PrefsRouted />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('prefs-git')).toBeNull();
      expect(screen.getByTestId('prefs-general')).toBeDefined();
    });

    it('redirects variables route to general', () => {
      render(
        <MemoryRouter initialEntries={['/prefs/variables']}>
          <Routes>
            <Route path="/prefs/*" element={<PrefsRouted />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('prefs-variables')).toBeNull();
      expect(screen.getByTestId('prefs-general')).toBeDefined();
    });

    it('still renders user preference routes', () => {
      render(
        <MemoryRouter initialEntries={['/prefs/advanced']}>
          <Routes>
            <Route path="/prefs/*" element={<PrefsRouted />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('prefs-advanced')).toBeDefined();
    });
  });
});
