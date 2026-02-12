/**
 * ConfigMigrator - Legacy configuration migration
 *
 * Handles migration from the old quiqr-app-config.json format
 * to the new unified configuration structure.
 */

import path from 'path';
import fs from 'fs-extra';
import type { InstanceSettings, UserConfig, UserPreferences } from '@quiqr/types';
import { appConfigSchema } from '@quiqr/types';
import { ConfigStore } from './config-store.js';

/**
 * Legacy config format (from quiqr-app-config.json)
 */
interface LegacyConfig {
  lastOpenedSite?: {
    siteKey: string | null;
    workspaceKey: string | null;
    sitePath: string | null;
  };
  prefs?: Partial<UserPreferences>;
  lastOpenedPublishTargetForSite?: Record<string, string>;
  skipWelcomeScreen?: boolean;
  experimentalFeatures?: boolean;
  disablePartialCache?: boolean;
  devLocalApi?: boolean;
  devDisableAutoHugoServe?: boolean;
  devShowCurrentUser?: boolean;
  hugoServeDraftMode?: boolean;
  sitesListingView?: string;
  currentUsername?: string | null;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  migratedFrom?: string;
  backupPath?: string;
  errors: string[];
}

/**
 * ConfigMigrator handles migration from legacy config
 */
export class ConfigMigrator {
  private store: ConfigStore;
  private legacyConfigPath: string;
  private markerPath: string;

  constructor(store: ConfigStore, legacyConfigPath: string) {
    this.store = store;
    this.legacyConfigPath = legacyConfigPath;
    this.markerPath = path.join(store.getConfigDir(), '.migration-complete');
  }

  /**
   * Check if migration is needed
   */
  async needsMigration(): Promise<boolean> {
    // If marker exists, migration was already done
    if (await fs.pathExists(this.markerPath)) {
      return false;
    }

    // If legacy config exists, migration is needed
    return fs.pathExists(this.legacyConfigPath);
  }

  /**
   * Check if legacy config exists
   */
  async hasLegacyConfig(): Promise<boolean> {
    return fs.pathExists(this.legacyConfigPath);
  }

  /**
   * Get the path to the legacy config
   */
  getLegacyConfigPath(): string {
    return this.legacyConfigPath;
  }

  /**
   * Read and parse the legacy config
   */
  async readLegacyConfig(): Promise<LegacyConfig | null> {
    try {
      if (!(await fs.pathExists(this.legacyConfigPath))) {
        return null;
      }

      const content = await fs.readFile(this.legacyConfigPath, 'utf8');
      const parsed = JSON.parse(content);

      // Try to validate with the old schema, but be lenient
      try {
        return appConfigSchema.parse(parsed) as LegacyConfig;
      } catch {
        // If validation fails, return the raw parsed data
        return parsed as LegacyConfig;
      }
    } catch (err) {
      console.warn('Failed to read legacy config:', err);
      return null;
    }
  }

  /**
   * Create a backup of the legacy config
   */
  async createBackup(): Promise<string | null> {
    try {
      if (!(await fs.pathExists(this.legacyConfigPath))) {
        return null;
      }

      const backupPath = `${this.legacyConfigPath}.v1-backup`;

      // Don't overwrite existing backups
      if (await fs.pathExists(backupPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const timestampedBackup = `${this.legacyConfigPath}.v1-backup-${timestamp}`;
        await fs.copy(this.legacyConfigPath, timestampedBackup);
        return timestampedBackup;
      }

      await fs.copy(this.legacyConfigPath, backupPath);
      return backupPath;
    } catch (err) {
      console.error('Failed to create backup:', err);
      return null;
    }
  }

  /**
   * Migrate legacy config to new format
   */
  async migrate(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      errors: [],
    };

    try {
      // Check if migration is needed
      if (!(await this.needsMigration())) {
        result.success = true;
        return result;
      }

      // Read legacy config
      const legacy = await this.readLegacyConfig();
      if (!legacy) {
        result.errors.push('Failed to read legacy config');
        return result;
      }

      result.migratedFrom = this.legacyConfigPath;

      // Create backup
      const backupPath = await this.createBackup();
      if (backupPath) {
        result.backupPath = backupPath;
      }

      // Ensure config directory exists
      await this.store.ensureConfigDir();

      // Migrate to instance settings
      const instanceSettings = this.mapToInstanceSettings(legacy);
      await this.store.writeInstanceSettings(instanceSettings);

      // Migrate to user config (default user in single-user mode)
      const userConfig = this.mapToUserConfig(legacy);
      await this.store.writeUserConfig(userConfig, 'default');

      // Write migration marker
      await this.writeMarker();

      result.success = true;
      return result;
    } catch (err) {
      result.errors.push(`Migration failed: ${err instanceof Error ? err.message : String(err)}`);
      return result;
    }
  }

  /**
   * Map legacy config to instance settings
   */
  private mapToInstanceSettings(legacy: LegacyConfig): InstanceSettings {
    return {
      storage: {
        type: 'fs',
        dataFolder: legacy.prefs?.dataFolder || '~/Quiqr',
      },
      userDefaultPreferences: {},
      userForcedPreferences: {},
      experimentalFeatures: legacy.experimentalFeatures || false,
      dev: {
        localApi: legacy.devLocalApi || false,
        disableAutoHugoServe: legacy.devDisableAutoHugoServe || false,
        showCurrentUser: legacy.devShowCurrentUser || false,
      },
      hugo: {
        serveDraftMode: legacy.hugoServeDraftMode || false,
      },
      disablePartialCache: legacy.disablePartialCache || false,
    };
  }

  /**
   * Map legacy config to user config
   */
  private mapToUserConfig(legacy: LegacyConfig): UserConfig {
    // Extract user preferences from legacy prefs
    const preferences: Partial<UserPreferences> = {};

    if (legacy.prefs) {
      if (legacy.prefs.dataFolder) preferences.dataFolder = legacy.prefs.dataFolder;
      if (legacy.prefs.interfaceStyle) preferences.interfaceStyle = legacy.prefs.interfaceStyle;
      if (legacy.prefs.sitesListingView) preferences.sitesListingView = legacy.prefs.sitesListingView;
      if (legacy.prefs.libraryView) preferences.libraryView = legacy.prefs.libraryView;
      if (legacy.prefs.systemGitBinPath) preferences.systemGitBinPath = legacy.prefs.systemGitBinPath;
      if (legacy.prefs.customOpenInCommand) preferences.customOpenInCommand = legacy.prefs.customOpenInCommand;
      if (legacy.prefs.showSplashAtStartup !== undefined) {
        preferences.showSplashAtStartup = legacy.prefs.showSplashAtStartup;
      }
      if (legacy.prefs.applicationRole) preferences.applicationRole = legacy.prefs.applicationRole;
      if (legacy.prefs.logRetentionDays !== undefined) {
        preferences.logRetentionDays = legacy.prefs.logRetentionDays;
      }
    }

    return {
      userId: 'default',
      preferences,
      lastOpenedSite: legacy.lastOpenedSite || {
        siteKey: null,
        workspaceKey: null,
        sitePath: null,
      },
      lastOpenedPublishTargetForSite: legacy.lastOpenedPublishTargetForSite || {},
      skipWelcomeScreen: legacy.skipWelcomeScreen || false,
      sitesListingView: legacy.sitesListingView || 'all',
    };
  }

  /**
   * Write migration marker file
   */
  private async writeMarker(): Promise<void> {
    const marker = {
      migratedAt: new Date().toISOString(),
      from: this.legacyConfigPath,
      version: '2.0.0',
    };
    await fs.writeFile(this.markerPath, JSON.stringify(marker, null, 2), 'utf8');
  }

  /**
   * Check if migration was completed
   */
  async isMigrationComplete(): Promise<boolean> {
    return fs.pathExists(this.markerPath);
  }

  /**
   * Get migration status info
   */
  async getMigrationStatus(): Promise<{
    migrationComplete: boolean;
    legacyConfigExists: boolean;
    backupExists: boolean;
    migrationNeeded: boolean;
  }> {
    const [migrationComplete, legacyConfigExists, backupExists] = await Promise.all([
      fs.pathExists(this.markerPath),
      fs.pathExists(this.legacyConfigPath),
      fs.pathExists(`${this.legacyConfigPath}.v1-backup`),
    ]);

    return {
      migrationComplete,
      legacyConfigExists,
      backupExists,
      migrationNeeded: !migrationComplete && legacyConfigExists,
    };
  }
}

/**
 * Create a ConfigMigrator instance
 */
export function createConfigMigrator(
  store: ConfigStore,
  legacyConfigPath: string
): ConfigMigrator {
  return new ConfigMigrator(store, legacyConfigPath);
}
