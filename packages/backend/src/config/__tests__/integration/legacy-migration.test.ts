/**
 * Integration tests for legacy migration scenario
 * Tests: legacy install → upgrade → verify migration
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ConfigMigrator } from '../../config-migrator.js';
import { ConfigStore } from '../../config-store.js';
import { createUnifiedConfigService } from '../../unified-config-service.js';

describe('Legacy Migration Integration', () => {
  let tempDir: string;
  let legacyConfigPath: string;
  let store: ConfigStore;
  let migrator: ConfigMigrator;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'quiqr-migration-'));
    legacyConfigPath = join(tempDir, 'quiqr-app-config.json');
    store = new ConfigStore(tempDir);
    migrator = new ConfigMigrator(store, legacyConfigPath);
  });

  afterEach(() => {
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Migration Detection', () => {
    it('should detect when legacy config exists', async () => {
      writeFileSync(legacyConfigPath, JSON.stringify({ prefs: {} }));
      
      expect(await migrator.hasLegacyConfig()).toBe(true);
      expect(await migrator.needsMigration()).toBe(true);
    });

    it('should not need migration when no legacy config', async () => {
      expect(await migrator.hasLegacyConfig()).toBe(false);
      expect(await migrator.needsMigration()).toBe(false);
    });

    it('should not need migration when already migrated', async () => {
      writeFileSync(legacyConfigPath, JSON.stringify({ prefs: {} }));
      
      // Perform migration
      await migrator.migrate();
      
      // Check migration is complete
      expect(await migrator.isMigrationComplete()).toBe(true);
      expect(await migrator.needsMigration()).toBe(false);
    });
  });

  describe('Legacy Config Reading', () => {
    it('should read valid legacy config', async () => {
      const legacyConfig = {
        prefs: {
          dataFolder: '/old/data/path',
          interfaceStyle: 'quiqr10-dark',
        },
        lastOpenedSite: {
          siteKey: 'my-blog',
          workspaceKey: 'main',
          sitePath: '/sites/my-blog',
        },
        experimentalFeatures: true,
      };
      writeFileSync(legacyConfigPath, JSON.stringify(legacyConfig));
      
      const parsed = await migrator.readLegacyConfig();
      
      expect(parsed).not.toBeNull();
      expect(parsed?.prefs?.dataFolder).toBe('/old/data/path');
      expect(parsed?.lastOpenedSite?.siteKey).toBe('my-blog');
    });

    it('should handle corrupted config gracefully', async () => {
      writeFileSync(legacyConfigPath, '{ invalid json');
      
      const parsed = await migrator.readLegacyConfig();
      
      // Should return null for corrupted config
      expect(parsed).toBeNull();
    });
  });

  describe('Backup Creation', () => {
    it('should create backup before migration', async () => {
      const legacyConfig = { prefs: { dataFolder: '/backup/test' } };
      writeFileSync(legacyConfigPath, JSON.stringify(legacyConfig));
      
      const backupPath = await migrator.createBackup();
      
      expect(backupPath).toBeTruthy();
      expect(existsSync(backupPath!)).toBe(true);
    });

    it('should not create backup without legacy config', async () => {
      const backupPath = await migrator.createBackup();
      
      expect(backupPath).toBeNull();
    });
  });

  describe('Migration Process', () => {
    it('should migrate preferences to new format', async () => {
      const legacyConfig = {
        prefs: {
          dataFolder: '/legacy/sites',
          interfaceStyle: 'quiqr10-dark',
          sitesListingView: 'recent',
        },
      };
      writeFileSync(legacyConfigPath, JSON.stringify(legacyConfig));
      
      const result = await migrator.migrate();
      
      expect(result.success).toBe(true);
      expect(result.backupPath).toBeTruthy();
      
      // Verify new config files created
      expect(existsSync(join(tempDir, 'user_prefs_default.json'))).toBe(true);
      expect(existsSync(join(tempDir, 'instance_settings.json'))).toBe(true);
    });

    it('should migrate lastOpenedSite', async () => {
      const legacyConfig = {
        prefs: {},
        lastOpenedSite: {
          siteKey: 'portfolio',
          workspaceKey: 'production',
          sitePath: '/sites/portfolio',
        },
      };
      writeFileSync(legacyConfigPath, JSON.stringify(legacyConfig));
      
      await migrator.migrate();
      
      // Verify via unified config service
      const service = createUnifiedConfigService({ configDir: tempDir });
      const lastSite = service.getLastOpenedSite();
      
      expect(lastSite?.siteKey).toBe('portfolio');
      expect(lastSite?.workspaceKey).toBe('production');
    });

    it('should migrate experimentalFeatures to instance settings', async () => {
      const legacyConfig = {
        prefs: {},
        experimentalFeatures: true,
      };
      writeFileSync(legacyConfigPath, JSON.stringify(legacyConfig));
      
      await migrator.migrate();
      
      const service = createUnifiedConfigService({ configDir: tempDir });
      expect(service.isExperimentalFeaturesEnabled()).toBe(true);
    });

    it('should create migration marker', async () => {
      writeFileSync(legacyConfigPath, JSON.stringify({ prefs: {} }));
      
      await migrator.migrate();
      
      expect(existsSync(join(tempDir, '.migration-complete'))).toBe(true);
    });

    it('should not re-migrate when marker exists', async () => {
      writeFileSync(legacyConfigPath, JSON.stringify({ prefs: { dataFolder: '/first' } }));
      
      // First migration
      const result1 = await migrator.migrate();
      expect(result1.success).toBe(true);
      
      // Modify legacy config
      writeFileSync(legacyConfigPath, JSON.stringify({ prefs: { dataFolder: '/second' } }));
      
      // needsMigration should return false now (marker exists)
      expect(await migrator.needsMigration()).toBe(false);
      
      // Original migrated value should remain
      const service = createUnifiedConfigService({ configDir: tempDir });
      expect(service.getEffectivePreference('dataFolder')).toBe('/first');
    });
  });

  describe('Migration Status', () => {
    it('should report correct migration status', async () => {
      writeFileSync(legacyConfigPath, JSON.stringify({ prefs: {} }));
      
      // Before migration
      const statusBefore = await migrator.getMigrationStatus();
      expect(statusBefore.legacyConfigExists).toBe(true);
      expect(statusBefore.migrationComplete).toBe(false);
      expect(statusBefore.migrationNeeded).toBe(true);
      
      // Perform migration
      await migrator.migrate();
      
      // After migration
      const statusAfter = await migrator.getMigrationStatus();
      expect(statusAfter.migrationComplete).toBe(true);
      expect(statusAfter.backupExists).toBe(true);
      expect(statusAfter.migrationNeeded).toBe(false);
    });
  });

  describe('Complete Upgrade Flow', () => {
    it('should handle full upgrade workflow', async () => {
      // Step 1: Legacy installation with user data
      const legacyConfig = {
        prefs: {
          dataFolder: '/home/user/quiqr-sites',
          interfaceStyle: 'quiqr10-dark',
          customOpenInCommand: 'code %SITE_PATH',
        },
        lastOpenedSite: {
          siteKey: 'company-blog',
          workspaceKey: 'main',
          sitePath: '/home/user/quiqr-sites/company-blog',
        },
        skipWelcomeScreen: true,
        experimentalFeatures: true,
      };
      writeFileSync(legacyConfigPath, JSON.stringify(legacyConfig));
      
      // Step 2: Detect migration needed
      expect(await migrator.needsMigration()).toBe(true);
      
      // Step 3: Perform migration
      const result = await migrator.migrate();
      expect(result.success).toBe(true);
      
      // Step 4: Verify migration via new service
      const service = createUnifiedConfigService({ configDir: tempDir });
      
      // User preferences
      expect(service.getEffectivePreference('dataFolder')).toBe('/home/user/quiqr-sites');
      expect(service.getEffectivePreference('interfaceStyle')).toBe('quiqr10-dark');
      expect(service.getEffectivePreference('customOpenInCommand')).toBe('code %SITE_PATH');
      
      // Last opened site
      const lastSite = service.getLastOpenedSite();
      expect(lastSite?.siteKey).toBe('company-blog');
      
      // Instance settings
      expect(service.isExperimentalFeaturesEnabled()).toBe(true);
      expect(service.getSkipWelcomeScreen()).toBe(true);
      
      // Step 5: User can continue using the app normally
      await service.setUserPreference('interfaceStyle', 'quiqr10-light');
      expect(service.getEffectivePreference('interfaceStyle')).toBe('quiqr10-light');
      
      // Step 6: Restart still works
      const service2 = createUnifiedConfigService({ configDir: tempDir });
      expect(service2.getEffectivePreference('interfaceStyle')).toBe('quiqr10-light');
      expect(service2.getEffectivePreference('dataFolder')).toBe('/home/user/quiqr-sites');
    });
  });
});
