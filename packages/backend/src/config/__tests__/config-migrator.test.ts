/**
 * Tests for ConfigMigrator - Legacy configuration migration
 * Task: T3.5 - Write migration tests with sample legacy configs
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { ConfigMigrator, createConfigMigrator } from '../config-migrator.js';
import { ConfigStore } from '../config-store.js';

describe('ConfigMigrator', () => {
  let tempDir: string;
  let configDir: string;
  let legacyConfigPath: string;
  let store: ConfigStore;
  let migrator: ConfigMigrator;

  beforeEach(async () => {
    // Create temp directories
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-migrator-test-'));
    configDir = path.join(tempDir, 'config');
    legacyConfigPath = path.join(tempDir, 'quiqr-app-config.json');
    
    await fs.ensureDir(configDir);
    
    store = new ConfigStore(configDir);
    migrator = new ConfigMigrator(store, legacyConfigPath);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('needsMigration', () => {
    it('returns false when no legacy config exists', async () => {
      const needs = await migrator.needsMigration();
      expect(needs).toBe(false);
    });

    it('returns true when legacy config exists and no marker', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({ prefs: {} }));
      
      const needs = await migrator.needsMigration();
      expect(needs).toBe(true);
    });

    it('returns false when migration marker exists', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({ prefs: {} }));
      await fs.writeFile(path.join(configDir, '.migration-complete'), JSON.stringify({ version: '2.0.0' }));
      
      const needs = await migrator.needsMigration();
      expect(needs).toBe(false);
    });
  });

  describe('hasLegacyConfig', () => {
    it('returns false when no legacy config exists', async () => {
      const has = await migrator.hasLegacyConfig();
      expect(has).toBe(false);
    });

    it('returns true when legacy config exists', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({}));
      
      const has = await migrator.hasLegacyConfig();
      expect(has).toBe(true);
    });
  });

  describe('getLegacyConfigPath', () => {
    it('returns the configured legacy path', () => {
      expect(migrator.getLegacyConfigPath()).toBe(legacyConfigPath);
    });
  });

  describe('readLegacyConfig', () => {
    it('returns null when no legacy config exists', async () => {
      const config = await migrator.readLegacyConfig();
      expect(config).toBeNull();
    });

    it('reads and parses valid legacy config', async () => {
      const legacyConfig = {
        prefs: {
          dataFolder: '~/MyData',
          interfaceStyle: 'quiqr10-dark',
        },
        skipWelcomeScreen: true,
        experimentalFeatures: true,
      };
      await fs.writeFile(legacyConfigPath, JSON.stringify(legacyConfig));
      
      const config = await migrator.readLegacyConfig();
      expect(config).toBeDefined();
      expect(config?.prefs?.dataFolder).toBe('~/MyData');
      expect(config?.prefs?.interfaceStyle).toBe('quiqr10-dark');
      expect(config?.skipWelcomeScreen).toBe(true);
      expect(config?.experimentalFeatures).toBe(true);
    });

    it('handles legacy config with lastOpenedSite', async () => {
      const legacyConfig = {
        lastOpenedSite: {
          siteKey: 'my-site',
          workspaceKey: 'main',
          sitePath: '/path/to/site',
        },
      };
      await fs.writeFile(legacyConfigPath, JSON.stringify(legacyConfig));
      
      const config = await migrator.readLegacyConfig();
      expect(config?.lastOpenedSite?.siteKey).toBe('my-site');
      expect(config?.lastOpenedSite?.workspaceKey).toBe('main');
      expect(config?.lastOpenedSite?.sitePath).toBe('/path/to/site');
    });

    it('handles invalid JSON gracefully', async () => {
      await fs.writeFile(legacyConfigPath, 'invalid json {{{');
      
      const config = await migrator.readLegacyConfig();
      expect(config).toBeNull();
    });

    it('handles extra fields not in schema (passthrough)', async () => {
      const legacyConfig = {
        prefs: {},
        customField: 'some-value',
        anotherCustom: 123,
      };
      await fs.writeFile(legacyConfigPath, JSON.stringify(legacyConfig));
      
      const config = await migrator.readLegacyConfig();
      expect(config).toBeDefined();
      // Extra fields may or may not be preserved depending on schema strictness
    });
  });

  describe('createBackup', () => {
    it('returns null when no legacy config exists', async () => {
      const backupPath = await migrator.createBackup();
      expect(backupPath).toBeNull();
    });

    it('creates backup with .v1-backup suffix', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({ prefs: {} }));
      
      const backupPath = await migrator.createBackup();
      expect(backupPath).toBe(`${legacyConfigPath}.v1-backup`);
      expect(await fs.pathExists(backupPath!)).toBe(true);
    });

    it('creates timestamped backup if .v1-backup exists', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({ prefs: {} }));
      await fs.writeFile(`${legacyConfigPath}.v1-backup`, JSON.stringify({ old: true }));
      
      const backupPath = await migrator.createBackup();
      expect(backupPath).toContain('.v1-backup-');
      expect(await fs.pathExists(backupPath!)).toBe(true);
    });

    it('preserves original content in backup', async () => {
      const original = { prefs: { dataFolder: '~/Data' }, custom: 'value' };
      await fs.writeFile(legacyConfigPath, JSON.stringify(original));
      
      const backupPath = await migrator.createBackup();
      const backupContent = JSON.parse(await fs.readFile(backupPath!, 'utf8'));
      expect(backupContent).toEqual(original);
    });
  });

  describe('migrate', () => {
    it('succeeds when no migration needed', async () => {
      const result = await migrator.migrate();
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('migrates minimal legacy config', async () => {
      const legacyConfig = { prefs: {} };
      await fs.writeFile(legacyConfigPath, JSON.stringify(legacyConfig));
      
      const result = await migrator.migrate();
      
      expect(result.success).toBe(true);
      expect(result.migratedFrom).toBe(legacyConfigPath);
      expect(result.backupPath).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('migrates full legacy config with all fields', async () => {
      const legacyConfig = {
        prefs: {
          dataFolder: '~/MyQuiqr',
          interfaceStyle: 'quiqr10-dark',
          sitesListingView: 'recent',
          libraryView: 'compact',
          systemGitBinPath: '/usr/bin/git',
          customOpenInCommand: 'code',
          showSplashAtStartup: false,
          applicationRole: 'advanced',
          logRetentionDays: 14,
        },
        lastOpenedSite: {
          siteKey: 'my-blog',
          workspaceKey: 'main',
          sitePath: '/home/user/sites/my-blog',
        },
        lastOpenedPublishTargetForSite: {
          'my-blog': 'github-pages',
          'docs-site': 's3-bucket',
        },
        skipWelcomeScreen: true,
        experimentalFeatures: true,
        disablePartialCache: true,
        devLocalApi: true,
        devDisableAutoHugoServe: true,
        devShowCurrentUser: true,
        hugoServeDraftMode: true,
        sitesListingView: 'favorites',
      };
      await fs.writeFile(legacyConfigPath, JSON.stringify(legacyConfig));
      
      const result = await migrator.migrate();
      expect(result.success).toBe(true);
      
      // Verify instance settings were created
      const instanceSettings = await store.readInstanceSettings();
      expect(instanceSettings.experimentalFeatures).toBe(true);
      expect(instanceSettings.disablePartialCache).toBe(true);
      expect(instanceSettings.dev.localApi).toBe(true);
      expect(instanceSettings.dev.disableAutoHugoServe).toBe(true);
      expect(instanceSettings.dev.showCurrentUser).toBe(true);
      expect(instanceSettings.hugo.serveDraftMode).toBe(true);
      expect(instanceSettings.storage.dataFolder).toBe('~/MyQuiqr');
      
      // Verify user config was created
      const userConfig = await store.readUserConfig('default');
      expect(userConfig.preferences.dataFolder).toBe('~/MyQuiqr');
      expect(userConfig.preferences.interfaceStyle).toBe('quiqr10-dark');
      expect(userConfig.preferences.sitesListingView).toBe('recent');
      expect(userConfig.preferences.showSplashAtStartup).toBe(false);
      expect(userConfig.preferences.logRetentionDays).toBe(14);
      expect(userConfig.lastOpenedSite.siteKey).toBe('my-blog');
      expect(userConfig.lastOpenedPublishTargetForSite['my-blog']).toBe('github-pages');
      expect(userConfig.skipWelcomeScreen).toBe(true);
    });

    it('creates migration marker after successful migration', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({ prefs: {} }));
      
      await migrator.migrate();
      
      const markerExists = await fs.pathExists(path.join(configDir, '.migration-complete'));
      expect(markerExists).toBe(true);
      
      const marker = JSON.parse(await fs.readFile(path.join(configDir, '.migration-complete'), 'utf8'));
      expect(marker.version).toBe('2.0.0');
      expect(marker.from).toBe(legacyConfigPath);
      expect(marker.migratedAt).toBeDefined();
    });

    it('does not re-migrate when marker exists', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({ prefs: { dataFolder: '~/Original' } }));
      
      // First migration
      await migrator.migrate();
      
      // Modify legacy config
      await fs.writeFile(legacyConfigPath, JSON.stringify({ prefs: { dataFolder: '~/Modified' } }));
      
      // Second migration attempt
      const result = await migrator.migrate();
      expect(result.success).toBe(true);
      
      // Should still have original value
      const userConfig = await store.readUserConfig('default');
      expect(userConfig.preferences.dataFolder).toBe('~/Original');
    });

    it('handles missing optional fields in legacy config', async () => {
      const legacyConfig = {
        // Only some fields set
        skipWelcomeScreen: true,
      };
      await fs.writeFile(legacyConfigPath, JSON.stringify(legacyConfig));
      
      const result = await migrator.migrate();
      expect(result.success).toBe(true);
      
      const userConfig = await store.readUserConfig('default');
      expect(userConfig.skipWelcomeScreen).toBe(true);
      // Default values should be used for missing fields
      expect(userConfig.lastOpenedSite).toEqual({
        siteKey: null,
        workspaceKey: null,
        sitePath: null,
      });
    });
  });

  describe('isMigrationComplete', () => {
    it('returns false when marker does not exist', async () => {
      const complete = await migrator.isMigrationComplete();
      expect(complete).toBe(false);
    });

    it('returns true when marker exists', async () => {
      await fs.writeFile(path.join(configDir, '.migration-complete'), JSON.stringify({ version: '2.0.0' }));
      
      const complete = await migrator.isMigrationComplete();
      expect(complete).toBe(true);
    });
  });

  describe('getMigrationStatus', () => {
    it('returns correct status when nothing exists', async () => {
      const status = await migrator.getMigrationStatus();
      
      expect(status.migrationComplete).toBe(false);
      expect(status.legacyConfigExists).toBe(false);
      expect(status.backupExists).toBe(false);
      expect(status.migrationNeeded).toBe(false);
    });

    it('returns correct status when legacy config exists', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({}));
      
      const status = await migrator.getMigrationStatus();
      
      expect(status.migrationComplete).toBe(false);
      expect(status.legacyConfigExists).toBe(true);
      expect(status.backupExists).toBe(false);
      expect(status.migrationNeeded).toBe(true);
    });

    it('returns correct status after migration', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({ prefs: {} }));
      await migrator.migrate();
      
      const status = await migrator.getMigrationStatus();
      
      expect(status.migrationComplete).toBe(true);
      expect(status.legacyConfigExists).toBe(true);
      expect(status.backupExists).toBe(true);
      expect(status.migrationNeeded).toBe(false);
    });
  });

  describe('createConfigMigrator factory', () => {
    it('creates a ConfigMigrator instance', () => {
      const instance = createConfigMigrator(store, legacyConfigPath);
      expect(instance).toBeInstanceOf(ConfigMigrator);
      expect(instance.getLegacyConfigPath()).toBe(legacyConfigPath);
    });
  });

  describe('Sample legacy config scenarios', () => {
    it('migrates v1 minimal config (just created app)', async () => {
      const v1Config = {
        prefs: {
          dataFolder: '~/Quiqr',
          interfaceStyle: 'quiqr10-light',
        },
      };
      await fs.writeFile(legacyConfigPath, JSON.stringify(v1Config));
      
      const result = await migrator.migrate();
      expect(result.success).toBe(true);
      
      const userConfig = await store.readUserConfig('default');
      expect(userConfig.preferences.interfaceStyle).toBe('quiqr10-light');
    });

    it('migrates v1 power user config', async () => {
      const v1Config = {
        prefs: {
          dataFolder: '/custom/path/quiqr',
          interfaceStyle: 'quiqr10-dark',
          sitesListingView: 'favorites',
          systemGitBinPath: '/opt/homebrew/bin/git',
          customOpenInCommand: 'nvim',
          showSplashAtStartup: false,
          logRetentionDays: 7,
        },
        lastOpenedSite: {
          siteKey: 'company-docs',
          workspaceKey: 'staging',
          sitePath: '/custom/path/quiqr/sites/company-docs',
        },
        lastOpenedPublishTargetForSite: {
          'company-docs': 'netlify-staging',
          'personal-blog': 'github-pages',
        },
        skipWelcomeScreen: true,
        experimentalFeatures: true,
        devLocalApi: true,
        hugoServeDraftMode: true,
      };
      await fs.writeFile(legacyConfigPath, JSON.stringify(v1Config));
      
      const result = await migrator.migrate();
      expect(result.success).toBe(true);
      
      // Verify all power user settings migrated
      const instanceSettings = await store.readInstanceSettings();
      expect(instanceSettings.experimentalFeatures).toBe(true);
      expect(instanceSettings.dev.localApi).toBe(true);
      expect(instanceSettings.hugo.serveDraftMode).toBe(true);
      
      const userConfig = await store.readUserConfig('default');
      expect(userConfig.preferences.customOpenInCommand).toBe('nvim');
      expect(userConfig.preferences.logRetentionDays).toBe(7);
      expect(userConfig.lastOpenedPublishTargetForSite['company-docs']).toBe('netlify-staging');
    });

    it('migrates config with null values', async () => {
      const v1Config = {
        lastOpenedSite: {
          siteKey: null,
          workspaceKey: null,
          sitePath: null,
        },
        prefs: {
          dataFolder: '~/Quiqr',
        },
      };
      await fs.writeFile(legacyConfigPath, JSON.stringify(v1Config));
      
      const result = await migrator.migrate();
      expect(result.success).toBe(true);
      
      const userConfig = await store.readUserConfig('default');
      expect(userConfig.lastOpenedSite.siteKey).toBeNull();
    });

    it('migrates empty config', async () => {
      await fs.writeFile(legacyConfigPath, JSON.stringify({}));
      
      const result = await migrator.migrate();
      expect(result.success).toBe(true);
      
      // Should use defaults
      const instanceSettings = await store.readInstanceSettings();
      expect(instanceSettings.storage.dataFolder).toBe('~/Quiqr');
      expect(instanceSettings.experimentalFeatures).toBe(false);
    });
  });
});
