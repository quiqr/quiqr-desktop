/**
 * T2.5: Unit tests for layered resolution scenarios
 *
 * Tests the ConfigResolver class for proper layered precedence:
 * App Defaults < Instance Defaults < User Preferences < Instance Forced
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConfigResolver } from '../config-resolver.js';
import { ConfigStore } from '../config-store.js';
import { EnvOverrideLayer } from '../env-override-layer.js';
import type { InstanceSettings, UserConfig } from '@quiqr/types';
import * as fs from 'fs-extra';
import { join } from 'path';
import { tmpdir } from 'os';

describe('ConfigResolver', () => {
  let tempDir: string;
  let store: ConfigStore;
  let envLayer: EnvOverrideLayer;
  let resolver: ConfigResolver;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = join(tmpdir(), `config-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.ensureDir(tempDir);

    store = new ConfigStore(tempDir);
    envLayer = new EnvOverrideLayer();
    resolver = new ConfigResolver(store, envLayer);
  });

  afterEach(async () => {
    // Clean up
    await fs.remove(tempDir);
  });

  describe('Layer Precedence', () => {
    it('should return app defaults when no other layers have values', () => {
      resolver.initializeSync();

      const result = resolver.resolvePreference('interfaceStyle');
      expect(result.value).toBe('quiqr10-light');
      expect(result.source).toBe('app-default');
      expect(result.locked).toBe(false);
    });

    it('should prefer instance defaults over app defaults', async () => {
      // Write instance settings with default preferences
      const instanceSettings: InstanceSettings = {
        storage: { type: 'fs', dataFolder: '~/Quiqr' },
        userDefaultPreferences: {
          interfaceStyle: 'quiqr10-dark',
        },
        userForcedPreferences: {},
        experimentalFeatures: false,
        dev: { localApi: false, disableAutoHugoServe: false, showCurrentUser: false },
        hugo: { serveDraftMode: false },
        disablePartialCache: false,
      };
      await store.writeInstanceSettings(instanceSettings);

      resolver.initializeSync();

      const result = resolver.resolvePreference('interfaceStyle');
      expect(result.value).toBe('quiqr10-dark');
      expect(result.source).toBe('instance-default');
      expect(result.locked).toBe(false);
    });

    it('should prefer user preferences over instance defaults', async () => {
      // Write instance settings with default preferences
      const instanceSettings: InstanceSettings = {
        storage: { type: 'fs', dataFolder: '~/Quiqr' },
        userDefaultPreferences: {
          interfaceStyle: 'quiqr10-dark',
          dataFolder: '/instance/default',
        },
        userForcedPreferences: {},
        experimentalFeatures: false,
        dev: { localApi: false, disableAutoHugoServe: false, showCurrentUser: false },
        hugo: { serveDraftMode: false },
        disablePartialCache: false,
      };
      await store.writeInstanceSettings(instanceSettings);

      // Write user config with different preferences
      const userConfig: UserConfig = {
        userId: 'default',
        preferences: {
          interfaceStyle: 'quiqr10-light', // User prefers light
        },
        lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
        lastOpenedPublishTargetForSite: {},
        skipWelcomeScreen: false,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(userConfig);

      resolver.initializeSync();

      const result = resolver.resolvePreference('interfaceStyle');
      expect(result.value).toBe('quiqr10-light');
      expect(result.source).toBe('user');
      expect(result.locked).toBe(false);
    });

    it('should prefer instance forced over user preferences', async () => {
      // Write instance settings with forced preferences
      const instanceSettings: InstanceSettings = {
        storage: { type: 'fs', dataFolder: '~/Quiqr' },
        userDefaultPreferences: {
          interfaceStyle: 'quiqr10-light',
        },
        userForcedPreferences: {
          interfaceStyle: 'quiqr10-dark', // Admin forces dark mode
        },
        experimentalFeatures: false,
        dev: { localApi: false, disableAutoHugoServe: false, showCurrentUser: false },
        hugo: { serveDraftMode: false },
        disablePartialCache: false,
      };
      await store.writeInstanceSettings(instanceSettings);

      // User prefers light mode
      const userConfig: UserConfig = {
        userId: 'default',
        preferences: {
          interfaceStyle: 'quiqr10-light',
        },
        lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
        lastOpenedPublishTargetForSite: {},
        skipWelcomeScreen: false,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(userConfig);

      resolver.initializeSync();

      const result = resolver.resolvePreference('interfaceStyle');
      expect(result.value).toBe('quiqr10-dark');
      expect(result.source).toBe('instance-forced');
      expect(result.locked).toBe(true);
    });
  });

  describe('getEffectivePreference', () => {
    it('should return just the value without metadata', () => {
      resolver.initializeSync();

      const value = resolver.getEffectivePreference('interfaceStyle');
      expect(value).toBe('quiqr10-light');
    });

    it('should return undefined for unknown preferences', () => {
      resolver.initializeSync();

      const value = resolver.getEffectivePreference('nonExistentKey' as keyof import('@quiqr/types').UserPreferences);
      expect(value).toBeUndefined();
    });
  });

  describe('getEffectivePreferences', () => {
    it('should return all effective preferences merged', async () => {
      const instanceSettings: InstanceSettings = {
        storage: { type: 'fs', dataFolder: '~/Quiqr' },
        userDefaultPreferences: {
          libraryView: 'compact',
        },
        userForcedPreferences: {},
        experimentalFeatures: false,
        dev: { localApi: false, disableAutoHugoServe: false, showCurrentUser: false },
        hugo: { serveDraftMode: false },
        disablePartialCache: false,
      };
      await store.writeInstanceSettings(instanceSettings);

      const userConfig: UserConfig = {
        userId: 'default',
        preferences: {
          dataFolder: '~/MyQuiqr',
        },
        lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
        lastOpenedPublishTargetForSite: {},
        skipWelcomeScreen: false,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(userConfig);

      resolver.initializeSync();

      const prefs = resolver.getEffectivePreferences();

      // App defaults
      expect(prefs.interfaceStyle).toBe('quiqr10-light');
      expect(prefs.sitesListingView).toBe('all');

      // Instance default
      expect(prefs.libraryView).toBe('compact');

      // User preference
      expect(prefs.dataFolder).toBe('~/MyQuiqr');
    });
  });

  describe('isPreferenceLocked', () => {
    it('should return false for non-forced preferences', () => {
      resolver.initializeSync();

      expect(resolver.isPreferenceLocked('interfaceStyle')).toBe(false);
    });

    it('should return true for forced preferences', async () => {
      const instanceSettings: InstanceSettings = {
        storage: { type: 'fs', dataFolder: '~/Quiqr' },
        userDefaultPreferences: {},
        userForcedPreferences: {
          interfaceStyle: 'quiqr10-dark',
        },
        experimentalFeatures: false,
        dev: { localApi: false, disableAutoHugoServe: false, showCurrentUser: false },
        hugo: { serveDraftMode: false },
        disablePartialCache: false,
      };
      await store.writeInstanceSettings(instanceSettings);

      resolver.initializeSync();

      expect(resolver.isPreferenceLocked('interfaceStyle')).toBe(true);
      expect(resolver.isPreferenceLocked('dataFolder')).toBe(false);
    });
  });

  describe('resolveInstanceSetting', () => {
    it('should resolve instance settings with defaults', () => {
      resolver.initializeSync();

      const result = resolver.resolveInstanceSetting('experimentalFeatures');
      expect(result.value).toBe(false);
    });

    it('should resolve storage settings', async () => {
      const instanceSettings: InstanceSettings = {
        storage: { type: 's3', dataFolder: 's3://bucket/path' },
        userDefaultPreferences: {},
        userForcedPreferences: {},
        experimentalFeatures: true,
        dev: { localApi: false, disableAutoHugoServe: false, showCurrentUser: false },
        hugo: { serveDraftMode: false },
        disablePartialCache: false,
      };
      await store.writeInstanceSettings(instanceSettings);

      resolver.initializeSync();

      const storageResult = resolver.resolveInstanceSetting('storage');
      expect(storageResult.value).toEqual({ type: 's3', dataFolder: 's3://bucket/path' });

      const expResult = resolver.resolveInstanceSetting('experimentalFeatures');
      expect(expResult.value).toBe(true);
    });
  });

  describe('getAllPropertyMetadata', () => {
    it('should return metadata for all properties', async () => {
      const userConfig: UserConfig = {
        userId: 'default',
        preferences: {
          dataFolder: '~/CustomQuiqr',
        },
        lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
        lastOpenedPublishTargetForSite: {},
        skipWelcomeScreen: false,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(userConfig);

      resolver.initializeSync();

      const metadata = await resolver.getAllPropertyMetadata();

      // Should include preference properties (path is user.preferences.*)
      const dataFolderMeta = metadata.find((m) => m.path === 'user.preferences.dataFolder');
      expect(dataFolderMeta).toBeDefined();
      expect(dataFolderMeta?.value).toBe('~/CustomQuiqr');
      expect(dataFolderMeta?.source).toBe('user');

      const interfaceStyleMeta = metadata.find((m) => m.path === 'user.preferences.interfaceStyle');
      expect(interfaceStyleMeta).toBeDefined();
      expect(interfaceStyleMeta?.source).toBe('app-default');
    });
  });

  describe('reload', () => {
    it('should reload configuration from disk', async () => {
      resolver.initializeSync();

      // Initial value
      expect(resolver.getEffectivePreference('dataFolder')).toBe('~/Quiqr');

      // Write new user config
      const userConfig: UserConfig = {
        userId: 'default',
        preferences: {
          dataFolder: '~/UpdatedFolder',
        },
        lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
        lastOpenedPublishTargetForSite: {},
        skipWelcomeScreen: false,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(userConfig);

      // Reload
      await resolver.reload();

      // Should have new value
      expect(resolver.getEffectivePreference('dataFolder')).toBe('~/UpdatedFolder');
    });
  });

  describe('User switching', () => {
    it('should support different users with different preferences', async () => {
      // Write user configs for different users (userId must be passed as second arg)
      const user1Config: UserConfig = {
        userId: 'user1',
        preferences: { dataFolder: '~/User1Quiqr' },
        lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
        lastOpenedPublishTargetForSite: {},
        skipWelcomeScreen: false,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(user1Config, 'user1');

      const user2Config: UserConfig = {
        userId: 'user2',
        preferences: { dataFolder: '~/User2Quiqr' },
        lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
        lastOpenedPublishTargetForSite: {},
        skipWelcomeScreen: false,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(user2Config, 'user2');

      // Initialize as user1
      resolver.initializeSync('user1');
      expect(resolver.getEffectivePreference('dataFolder')).toBe('~/User1Quiqr');

      // Switch to user2
      resolver.initializeSync('user2');
      expect(resolver.getEffectivePreference('dataFolder')).toBe('~/User2Quiqr');
    });
  });
});
