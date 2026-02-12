/**
 * Tests for Config API Handlers
 * Task: T4.7 - Add API tests for new unified configuration endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import {
  createGetEffectivePreferenceHandler,
  createGetEffectivePreferencesHandler,
  createSetUserPreferenceHandler,
  createSetUserPreferencesHandler,
  createIsPreferenceLockedHandler,
  createGetAllPropertyMetadataHandler,
  createGetInstanceSettingsHandler,
  createGetInstanceSettingHandler,
  createUpdateInstanceSettingsHandler,
  createGetSiteSettingsHandler,
  createUpdateSiteSettingsHandler,
  createGetCurrentUserIdHandler,
  createSwitchUserHandler,
  createListUsersHandler,
  createIsExperimentalFeaturesEnabledHandler,
  createConfigHandlers,
} from '../../api/handlers/config-handlers.js';
import { createContainer, type AppContainer } from '../container.js';

describe('Config API Handlers', () => {
  let tempDir: string;
  let container: AppContainer;

  beforeEach(async () => {
    // Create temp directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-api-test-'));
    
    // Mock adapters for testing
    const mockAdapters = {
      dialog: {
        showOpenDialog: vi.fn(),
        showSaveDialog: vi.fn(),
        showMessageBox: vi.fn(),
      },
      shell: {
        openExternal: vi.fn(),
        openPath: vi.fn(),
        showItemInFolder: vi.fn(),
      },
      clipboard: {
        writeText: vi.fn(),
        readText: vi.fn(),
      },
      window: {
        sendToRenderer: vi.fn(),
        reloadWindow: vi.fn(),
        setTitle: vi.fn(),
        minimize: vi.fn(),
        maximize: vi.fn(),
        close: vi.fn(),
        isMaximized: vi.fn(() => false),
        setProgressBar: vi.fn(),
      },
      menu: {
        createMainMenu: vi.fn(),
        updateMenuItem: vi.fn(),
      },
      notification: {
        show: vi.fn(),
      },
      app: {
        quit: vi.fn(),
        getVersion: vi.fn(() => '1.0.0'),
        relaunch: vi.fn(),
      },
      download: {
        downloadFile: vi.fn(),
      },
      appInfo: {
        isPackaged: vi.fn(() => false),
        getPath: vi.fn((name: string) => tempDir),
        getAppPath: vi.fn(() => tempDir),
      },
    };
    
    // Create container with test config
    container = createContainer({
      userDataPath: tempDir,
      rootPath: tempDir,
      adapters: mockAdapters as unknown as AppContainer['adapters'],
      configFileName: 'quiqr-app-config.json',
    });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
    vi.clearAllMocks();
  });

  describe('getEffectivePreference', () => {
    it('returns preference with metadata', async () => {
      const handler = createGetEffectivePreferenceHandler(container);
      
      const result = await handler({ prefKey: 'interfaceStyle' });
      
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('locked');
      expect(result).toHaveProperty('path');
      expect(result.value).toBe('quiqr10-light'); // default value
      expect(result.source).toBe('app-default');
      expect(result.locked).toBe(false);
    });

    it('returns user value after setting preference', async () => {
      // Set a user preference first
      await container.unifiedConfig.setUserPreference('interfaceStyle', 'quiqr10-dark');
      
      const handler = createGetEffectivePreferenceHandler(container);
      const result = await handler({ prefKey: 'interfaceStyle' });
      
      expect(result.value).toBe('quiqr10-dark');
      expect(result.source).toBe('user');
    });
  });

  describe('getEffectivePreferences', () => {
    it('returns all preferences with defaults', async () => {
      const handler = createGetEffectivePreferencesHandler(container);
      
      const result = await handler();
      
      expect(result).toHaveProperty('interfaceStyle');
      expect(result).toHaveProperty('dataFolder');
      expect(result.interfaceStyle).toBe('quiqr10-light');
      expect(result.dataFolder).toBe('~/Quiqr');
    });

    it('includes user-set values', async () => {
      await container.unifiedConfig.setUserPreference('dataFolder', '~/MyData');
      
      const handler = createGetEffectivePreferencesHandler(container);
      const result = await handler();
      
      expect(result.dataFolder).toBe('~/MyData');
    });
  });

  describe('setUserPreference', () => {
    it('saves string preference', async () => {
      const handler = createSetUserPreferenceHandler(container);
      
      const result = await handler({ prefKey: 'dataFolder', value: '~/CustomPath' });
      
      expect(result).toBe(true);
      
      // Verify it was saved
      const effective = container.unifiedConfig.getEffectivePreference('dataFolder');
      expect(effective).toBe('~/CustomPath');
    });

    it('saves boolean preference', async () => {
      const handler = createSetUserPreferenceHandler(container);
      
      const result = await handler({ prefKey: 'showSplashAtStartup', value: false });
      
      expect(result).toBe(true);
      expect(container.unifiedConfig.getEffectivePreference('showSplashAtStartup')).toBe(false);
    });

    it('saves number preference', async () => {
      const handler = createSetUserPreferenceHandler(container);
      
      const result = await handler({ prefKey: 'logRetentionDays', value: 14 });
      
      expect(result).toBe(true);
      expect(container.unifiedConfig.getEffectivePreference('logRetentionDays')).toBe(14);
    });

    it('throws when preference is locked', async () => {
      // Lock the preference via instance settings
      await container.unifiedConfig.updateInstanceSettings({
        userForcedPreferences: { interfaceStyle: 'quiqr10-dark' },
      });
      
      const handler = createSetUserPreferenceHandler(container);
      
      await expect(handler({ prefKey: 'interfaceStyle', value: 'quiqr10-light' }))
        .rejects.toThrow();
    });
  });

  describe('setUserPreferences', () => {
    it('saves multiple preferences at once', async () => {
      const handler = createSetUserPreferencesHandler(container);
      
      const result = await handler({
        preferences: {
          dataFolder: '~/BatchPath',
          interfaceStyle: 'quiqr10-dark',
          showSplashAtStartup: false,
        },
      });
      
      expect(result).toBe(true);
      expect(container.unifiedConfig.getEffectivePreference('dataFolder')).toBe('~/BatchPath');
      expect(container.unifiedConfig.getEffectivePreference('interfaceStyle')).toBe('quiqr10-dark');
      expect(container.unifiedConfig.getEffectivePreference('showSplashAtStartup')).toBe(false);
    });
  });

  describe('isPreferenceLocked', () => {
    it('returns false for unlocked preference', async () => {
      const handler = createIsPreferenceLockedHandler(container);
      
      const result = await handler({ prefKey: 'interfaceStyle' });
      
      expect(result).toBe(false);
    });

    it('returns true for locked preference', async () => {
      // Lock via instance forced settings
      await container.unifiedConfig.updateInstanceSettings({
        userForcedPreferences: { dataFolder: '/forced/path' },
      });
      
      const handler = createIsPreferenceLockedHandler(container);
      const result = await handler({ prefKey: 'dataFolder' });
      
      expect(result).toBe(true);
    });
  });

  describe('getAllPropertyMetadata', () => {
    it('returns array of property metadata', async () => {
      const handler = createGetAllPropertyMetadataHandler(container);
      
      const result = await handler();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check structure of metadata entries - path uses full path format
      const entry = result.find((p: { path: string }) => p.path === 'user.preferences.interfaceStyle');
      expect(entry).toBeDefined();
      expect(entry).toHaveProperty('value');
      expect(entry).toHaveProperty('source');
      expect(entry).toHaveProperty('type');
    });
  });

  describe('getInstanceSettings', () => {
    it('returns instance settings', async () => {
      const handler = createGetInstanceSettingsHandler(container);
      
      const result = await handler();
      
      expect(result).toHaveProperty('storage');
      expect(result).toHaveProperty('experimentalFeatures');
      expect(result).toHaveProperty('dev');
      expect(result).toHaveProperty('hugo');
      expect(result!.storage.type).toBe('fs');
    });
  });

  describe('getInstanceSetting', () => {
    it('returns specific instance setting', async () => {
      const handler = createGetInstanceSettingHandler(container);
      
      const result = await handler({ path: 'experimentalFeatures' });
      
      expect(result).toBe(false); // default
    });

    it('returns nested setting', async () => {
      const handler = createGetInstanceSettingHandler(container);
      
      const result = await handler({ path: 'storage' });
      
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('dataFolder');
    });
  });

  describe('updateInstanceSettings', () => {
    it('updates instance settings', async () => {
      const handler = createUpdateInstanceSettingsHandler(container);
      
      const result = await handler({
        settings: { experimentalFeatures: true },
      });
      
      expect(result).toBe(true);
      
      const settings = container.unifiedConfig.getInstanceSettings();
      expect(settings!.experimentalFeatures).toBe(true);
    });

    it('updates nested settings', async () => {
      const handler = createUpdateInstanceSettingsHandler(container);
      
      const result = await handler({
        settings: {
          hugo: { serveDraftMode: true },
        },
      });
      
      expect(result).toBe(true);
      
      const settings = container.unifiedConfig.getInstanceSettings();
      expect(settings!.hugo.serveDraftMode).toBe(true);
    });
  });

  describe('getSiteSettings', () => {
    it('returns default site settings for new site', async () => {
      const handler = createGetSiteSettingsHandler(container);
      
      const result = await handler({ siteKey: 'new-site' });
      
      expect(result).toBeDefined();
      expect(result.siteKey).toBe('new-site');
    });

    it('returns saved site settings', async () => {
      // Save some settings first - updateSiteSettings updates the nested 'settings' object
      await container.unifiedConfig.updateSiteSettings('my-site', {
        customOption: true,
      });
      
      const handler = createGetSiteSettingsHandler(container);
      const result = await handler({ siteKey: 'my-site' });
      
      expect(result.siteKey).toBe('my-site');
      expect(result.settings).toHaveProperty('customOption');
    });
  });

  describe('updateSiteSettings', () => {
    it('updates site settings', async () => {
      const handler = createUpdateSiteSettingsHandler(container);
      
      // updateSiteSettings updates the nested 'settings' object, not top-level fields
      const result = await handler({
        siteKey: 'test-site',
        settings: {
          customSetting: 'test-value',
        },
      });
      
      expect(result).toBe(true);
      
      const settings = await container.unifiedConfig.getSiteSettings('test-site');
      expect(settings.settings.customSetting).toBe('test-value');
    });
  });

  describe('getCurrentUserId', () => {
    it('returns default user ID', async () => {
      const handler = createGetCurrentUserIdHandler(container);
      
      const result = await handler();
      
      expect(result).toBe('default');
    });
  });

  describe('switchUser', () => {
    it('switches to different user', async () => {
      const handler = createSwitchUserHandler(container);
      
      const result = await handler({ userId: 'user2' });
      
      expect(result).toBe(true);
      expect(container.unifiedConfig.getCurrentUserId()).toBe('user2');
    });
  });

  describe('listUsers', () => {
    it('returns list of users', async () => {
      const handler = createListUsersHandler(container);
      
      const result = await handler();
      
      expect(Array.isArray(result)).toBe(true);
      // Default user should exist after container creation
    });

    it('includes newly created users', async () => {
      // Create another user by switching and saving a preference
      await container.unifiedConfig.switchUser('newuser');
      await container.unifiedConfig.setUserPreference('dataFolder', '~/NewUserData');
      
      const handler = createListUsersHandler(container);
      const result = await handler();
      
      expect(result).toContain('newuser');
    });
  });

  describe('isExperimentalFeaturesEnabled', () => {
    it('returns false by default', async () => {
      const handler = createIsExperimentalFeaturesEnabledHandler(container);
      
      const result = await handler();
      
      expect(result).toBe(false);
    });

    it('returns true when enabled', async () => {
      await container.unifiedConfig.updateInstanceSettings({
        experimentalFeatures: true,
      });
      
      const handler = createIsExperimentalFeaturesEnabledHandler(container);
      const result = await handler();
      
      expect(result).toBe(true);
    });
  });

  describe('createConfigHandlers', () => {
    it('returns object with all unified config handlers', () => {
      const handlers = createConfigHandlers(container);
      
      // Check unified config handlers exist
      expect(handlers.getEffectivePreference).toBeDefined();
      expect(handlers.getEffectivePreferences).toBeDefined();
      expect(handlers.setUserPreference).toBeDefined();
      expect(handlers.setUserPreferences).toBeDefined();
      expect(handlers.isPreferenceLocked).toBeDefined();
      expect(handlers.getAllPropertyMetadata).toBeDefined();
      expect(handlers.getInstanceSettings).toBeDefined();
      expect(handlers.getInstanceSetting).toBeDefined();
      expect(handlers.updateInstanceSettings).toBeDefined();
      expect(handlers.getSiteSettings).toBeDefined();
      expect(handlers.updateSiteSettings).toBeDefined();
      expect(handlers.getCurrentUserId).toBeDefined();
      expect(handlers.switchUser).toBeDefined();
      expect(handlers.listUsers).toBeDefined();
      expect(handlers.isExperimentalFeaturesEnabled).toBeDefined();
    });

    it('returns object with legacy handlers for compatibility', () => {
      const handlers = createConfigHandlers(container);
      
      // Check legacy handlers still exist
      expect(handlers.readConfKey).toBeDefined();
      expect(handlers.readConfPrefKey).toBeDefined();
      expect(handlers.saveConfPrefKey).toBeDefined();
      expect(handlers.toggleExperimentalFeatures).toBeDefined();
      expect(handlers.getEnvironmentInfo).toBeDefined();
    });
  });

  describe('Integration: preference lifecycle', () => {
    it('full lifecycle: set, get, check locked, update instance, verify locked', async () => {
      const handlers = createConfigHandlers(container);
      
      // 1. Initially unlocked
      let locked = await handlers.isPreferenceLocked({ prefKey: 'dataFolder' });
      expect(locked).toBe(false);
      
      // 2. Set user preference
      await handlers.setUserPreference({ prefKey: 'dataFolder', value: '~/UserChoice' });
      
      // 3. Verify user value
      let pref = await handlers.getEffectivePreference({ prefKey: 'dataFolder' });
      expect(pref.value).toBe('~/UserChoice');
      expect(pref.source).toBe('user');
      
      // 4. Lock via instance forced
      await handlers.updateInstanceSettings({
        settings: { userForcedPreferences: { dataFolder: '/admin/forced' } },
      });
      
      // 5. Verify locked and forced value
      locked = await handlers.isPreferenceLocked({ prefKey: 'dataFolder' });
      expect(locked).toBe(true);
      
      pref = await handlers.getEffectivePreference({ prefKey: 'dataFolder' });
      expect(pref.value).toBe('/admin/forced');
      expect(pref.source).toBe('instance-forced');
      
      // 6. User cannot override locked preference
      await expect(handlers.setUserPreference({ prefKey: 'dataFolder', value: '~/TryOverride' }))
        .rejects.toThrow();
    });
  });
});
