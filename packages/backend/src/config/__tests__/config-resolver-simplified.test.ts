/**
 * R2.8: Unit tests for simplified 2-layer resolution
 *
 * Tests the ConfigResolver class for simplified precedence:
 * App Defaults < User Preferences (no forced, no instance defaults, no groups)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigResolver } from '../config-resolver.js';
import { ConfigStore } from '../config-store.js';
import { EnvOverrideLayer } from '../env-override-layer.js';
import type { InstanceSettings, UserConfig } from '@quiqr/types';
import * as fs from 'fs-extra';
import { join } from 'path';
import { tmpdir } from 'os';

describe('ConfigResolver - Simplified 2-Layer', () => {
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

  describe('2-Layer Precedence: App Defaults < User Preferences', () => {
    it('should return app defaults when no user preferences exist', () => {
      resolver.initializeSync('ELECTRON');

      const result = resolver.resolvePreference('interfaceStyle');
      expect(result.value).toBe('quiqr10-light');
      expect(result.source).toBe('app-default');
    });

    it('should prefer user preferences over app defaults', async () => {
      // Write user config with preferences
      const userConfig: UserConfig = {
        userId: 'ELECTRON',
        preferences: {
          interfaceStyle: 'quiqr10-dark',
        },
        lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
        lastOpenedPublishTargetForSite: {},
        skipWelcomeScreen: false,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(userConfig, 'ELECTRON');

      resolver.initializeSync('ELECTRON');

      const result = resolver.resolvePreference('interfaceStyle');
      expect(result.value).toBe('quiqr10-dark');
      expect(result.source).toBe('user');
    });

    it('should handle empty user preferences (value from app default)', async () => {
      // Write user config without interfaceStyle in preferences
      const userConfig: UserConfig = {
        userId: 'ELECTRON',
        preferences: {}, // Empty preferences
        lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
        lastOpenedPublishTargetForSite: {},
        skipWelcomeScreen: true,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(userConfig, 'ELECTRON');

      resolver.initializeSync('ELECTRON');

      // When user config file exists, ConfigResolver loads it
      // Empty preferences means no preference keys are defined
      const result = resolver.resolvePreference('interfaceStyle');
      expect(result.value).toBe('quiqr10-light'); // Value from app default
      // Note: Since we can't tell if empty prefs came from file or defaults,
      // and file exists, this is acceptable behavior
    });
  });

  describe('Instance Settings Resolution', () => {
    it('should return app default instance settings when no file exists', () => {
      resolver.initializeSync('ELECTRON');

      const storageType = resolver.getEffectiveInstanceSetting('storage.type');
      expect(storageType).toBe('fs');

      const dataFolder = resolver.getEffectiveInstanceSetting('storage.dataFolder');
      expect(dataFolder).toBe('~/Quiqr');
    });

    it('should read instance settings from file', async () => {
      const instanceSettings: InstanceSettings = {
        storage: {
          type: 'fs',
          dataFolder: '/custom/data/path',
        },
        logging: {
          retention: 60,
          logLevel: 'debug',
        },
        experimentalFeatures: true,
        dev: {
          disablePartialCache: true,
        },
        hugo: {
          serveDraftMode: true,
          disableAutoHugoServe: false,
        },
      };
      await store.writeInstanceSettings(instanceSettings);

      resolver.initializeSync('ELECTRON');

      expect(resolver.getEffectiveInstanceSetting('storage.dataFolder')).toBe('/custom/data/path');
      expect(resolver.getEffectiveInstanceSetting('logging.retention')).toBe(60);
      expect(resolver.getEffectiveInstanceSetting('logging.logLevel')).toBe('debug');
      expect(resolver.getEffectiveInstanceSetting('experimentalFeatures')).toBe(true);
      expect(resolver.getEffectiveInstanceSetting('hugo.serveDraftMode')).toBe(true);
    });

    it('should handle environment variable overrides for instance settings', async () => {
      const instanceSettings: InstanceSettings = {
        storage: {
          type: 'fs',
          dataFolder: '/default/path',
        },
        logging: {
          retention: 30,
          logLevel: 'info',
        },
        experimentalFeatures: false,
        dev: {
          disablePartialCache: false,
        },
        hugo: {
          serveDraftMode: false,
          disableAutoHugoServe: false,
        },
      };
      await store.writeInstanceSettings(instanceSettings);

      // Set environment override
      process.env.QUIQR_STORAGE_DATAFOLDER = '/env/override/path';
      envLayer.loadFromEnvironment();

      resolver.initializeSync('ELECTRON');

      expect(resolver.getEffectiveInstanceSetting('storage.dataFolder')).toBe('/env/override/path');

      // Clean up
      delete process.env.QUIQR_STORAGE_DATAFOLDER;
    });
  });

  describe('User State Fields', () => {
    it('should retrieve lastOpenedSite from user config', async () => {
      const userConfig: UserConfig = {
        userId: 'ELECTRON',
        preferences: { interfaceStyle: 'quiqr10-light' },
        lastOpenedSite: {
          siteKey: 'my-blog',
          workspaceKey: 'main',
          sitePath: '/path/to/site',
        },
        lastOpenedPublishTargetForSite: { 'my-blog': 'github-pages' },
        skipWelcomeScreen: true,
        sitesListingView: 'favorites',
      };
      await store.writeUserConfig(userConfig, 'ELECTRON');

      resolver.initializeSync('ELECTRON');

      const lastSite = resolver.getUserState('lastOpenedSite');
      expect(lastSite).toEqual({
        siteKey: 'my-blog',
        workspaceKey: 'main',
        sitePath: '/path/to/site',
      });

      const skipWelcome = resolver.getUserState('skipWelcomeScreen');
      expect(skipWelcome).toBe(true);

      const listingView = resolver.getUserState('sitesListingView');
      expect(listingView).toBe('favorites');
    });
  });

  describe('User Config Persistence', () => {
    it('should save user preference changes', async () => {
      resolver.initializeSync('ELECTRON');

      await resolver.saveUserPreference('interfaceStyle', 'quiqr10-dark');

      // Reload and verify
      await resolver.reload();
      const result = resolver.resolvePreference('interfaceStyle');
      expect(result.value).toBe('quiqr10-dark');
      expect(result.source).toBe('user');
    });

    it('should save user state changes', async () => {
      resolver.initializeSync('ELECTRON');

      await resolver.saveUserState('skipWelcomeScreen', true);

      // Reload and verify
      await resolver.reload();
      expect(resolver.getUserState('skipWelcomeScreen')).toBe(true);
    });
  });

  describe('Default userId is ELECTRON', () => {
    it('should use ELECTRON as default userId', () => {
      resolver.initializeSync();
      expect(resolver.getUserId()).toBe('ELECTRON');
    });

    it('should create user_prefs_ELECTRON.json file', async () => {
      resolver.initializeSync('ELECTRON');
      await resolver.saveUserPreference('interfaceStyle', 'quiqr10-dark');

      const filePath = join(tempDir, 'user_prefs_ELECTRON.json');
      const exists = await fs.pathExists(filePath);
      expect(exists).toBe(true);

      const content = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(content);
      expect(parsed.userId).toBe('ELECTRON');
      expect(parsed.preferences.interfaceStyle).toBe('quiqr10-dark');
    });
  });

  describe('Complete Configuration Structure', () => {
    it('should handle complete instance_settings.json structure', async () => {
      const completeInstanceSettings: InstanceSettings = {
        storage: {
          type: 'fs',
          dataFolder: '/home/user/QuiqrData',
        },
        logging: {
          retention: 30,
          logLevel: 'info',
          retention: 30,
        },
        git: {
          binaryPath: undefined,
        },
        experimentalFeatures: false,
        dev: {
          disablePartialCache: false,
        },
        hugo: {
          serveDraftMode: false,
          disableAutoHugoServe: false,
        },
        preview: {
          enabled: true,
          baseUrl: 'http://localhost:13131',
        },
        variables: {},
      };
      await store.writeInstanceSettings(completeInstanceSettings);

      resolver.initializeSync('ELECTRON');

      const loaded = resolver.getInstanceSettings();
      expect(loaded).toEqual(completeInstanceSettings);
    });

    it('should handle complete user_prefs_ELECTRON.json structure', async () => {
      const completeUserConfig: UserConfig = {
        userId: 'ELECTRON',
        preferences: {
          interfaceStyle: 'quiqr10-dark',
        },
        lastOpenedSite: {
          siteKey: 'my-site',
          workspaceKey: 'main',
          sitePath: '/path/to/site',
        },
        lastOpenedPublishTargetForSite: {
          'my-site': 'github',
        },
        skipWelcomeScreen: false,
        sitesListingView: 'all',
      };
      await store.writeUserConfig(completeUserConfig, 'ELECTRON');

      resolver.initializeSync('ELECTRON');

      const loaded = resolver.getUserConfig();
      expect(loaded).toEqual(completeUserConfig);
    });
  });
});
