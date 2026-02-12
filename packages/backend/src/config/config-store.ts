/**
 * ConfigStore - File-based configuration storage
 *
 * Provides low-level file operations for configuration files.
 * Handles reading, writing, and watching config files in ~/.config/quiqr/
 */

import path from 'path';
import fs from 'fs-extra';
import type { InstanceSettings, UserConfig, SiteSettings } from '@quiqr/types';
import { instanceSettingsSchema, userConfigSchema, siteSettingsSchema } from '@quiqr/types';

/**
 * Configuration file types and their schemas
 */
export type ConfigType = 'instance' | 'user' | 'site';

/**
 * Default instance settings
 */
const DEFAULT_INSTANCE_SETTINGS: InstanceSettings = {
  storage: { type: 'fs', dataFolder: '~/Quiqr' },
  userDefaultPreferences: {},
  userForcedPreferences: {},
  experimentalFeatures: false,
  dev: { localApi: false, disableAutoHugoServe: false, showCurrentUser: false },
  hugo: { serveDraftMode: false },
  disablePartialCache: false,
};

/**
 * Default user config factory
 */
const getDefaultUserConfig = (userId: string): UserConfig => ({
  userId,
  preferences: {},
  lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
  lastOpenedPublishTargetForSite: {},
  skipWelcomeScreen: false,
  sitesListingView: 'all',
});

/**
 * Default site settings factory
 */
const getDefaultSiteSettings = (siteKey: string): SiteSettings => ({
  siteKey,
  settings: {},
});

/**
 * ConfigStore manages individual configuration files
 */
export class ConfigStore {
  private configDir: string;

  constructor(configDir: string) {
    this.configDir = configDir;
  }

  /**
   * Ensure the config directory exists
   */
  async ensureConfigDir(): Promise<void> {
    await fs.ensureDir(this.configDir);
  }

  /**
   * Ensure the config directory exists (synchronous)
   */
  ensureConfigDirSync(): void {
    fs.ensureDirSync(this.configDir);
  }

  /**
   * Get the path to a config file
   */
  getFilePath(type: ConfigType, identifier?: string): string {
    switch (type) {
      case 'instance':
        return path.join(this.configDir, 'instance_settings.json');
      case 'user':
        const userId = identifier || 'default';
        return path.join(this.configDir, `user_prefs_${userId}.json`);
      case 'site':
        if (!identifier) throw new Error('Site key required for site config');
        return path.join(this.configDir, `site_settings_${identifier}.json`);
      default:
        throw new Error(`Unknown config type: ${type}`);
    }
  }

  /**
   * Read instance settings
   */
  async readInstanceSettings(): Promise<InstanceSettings> {
    const filePath = this.getFilePath('instance');

    try {
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(content);
        // Merge with defaults and validate
        const merged = this.deepMerge(DEFAULT_INSTANCE_SETTINGS, parsed);
        return instanceSettingsSchema.parse(merged);
      }
    } catch (err) {
      console.warn(`Failed to read instance settings:`, err);
    }

    return { ...DEFAULT_INSTANCE_SETTINGS };
  }

  /**
   * Read instance settings (synchronous)
   */
  readInstanceSettingsSync(): InstanceSettings {
    const filePath = this.getFilePath('instance');

    try {
      if (fs.pathExistsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        // Merge with defaults and validate
        const merged = this.deepMerge(DEFAULT_INSTANCE_SETTINGS, parsed);
        return instanceSettingsSchema.parse(merged);
      }
    } catch (err) {
      console.warn(`Failed to read instance settings:`, err);
    }

    return { ...DEFAULT_INSTANCE_SETTINGS };
  }

  /**
   * Write instance settings
   */
  async writeInstanceSettings(settings: InstanceSettings): Promise<void> {
    await this.ensureConfigDir();
    const filePath = this.getFilePath('instance');
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf8');
  }

  /**
   * Read user config
   */
  async readUserConfig(userId: string = 'default'): Promise<UserConfig> {
    const filePath = this.getFilePath('user', userId);
    const defaults = getDefaultUserConfig(userId);

    try {
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(content);
        // Merge with defaults and validate
        const merged = this.deepMerge(defaults, parsed);
        return userConfigSchema.parse(merged);
      }
    } catch (err) {
      console.warn(`Failed to read user config for ${userId}:`, err);
    }

    return defaults;
  }

  /**
   * Read user config (synchronous)
   */
  readUserConfigSync(userId: string = 'default'): UserConfig {
    const filePath = this.getFilePath('user', userId);
    const defaults = getDefaultUserConfig(userId);

    try {
      if (fs.pathExistsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        // Merge with defaults and validate
        const merged = this.deepMerge(defaults, parsed);
        return userConfigSchema.parse(merged);
      }
    } catch (err) {
      console.warn(`Failed to read user config for ${userId}:`, err);
    }

    return defaults;
  }

  /**
   * Write user config
   */
  async writeUserConfig(config: UserConfig, userId: string = 'default'): Promise<void> {
    await this.ensureConfigDir();
    const filePath = this.getFilePath('user', userId);
    await fs.writeFile(filePath, JSON.stringify({ ...config, userId }, null, 2), 'utf8');
  }

  /**
   * Read site settings
   */
  async readSiteSettings(siteKey: string): Promise<SiteSettings> {
    const filePath = this.getFilePath('site', siteKey);
    const defaults = getDefaultSiteSettings(siteKey);

    try {
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(content);
        // Merge with defaults and validate
        const merged = this.deepMerge(defaults, parsed);
        return siteSettingsSchema.parse(merged);
      }
    } catch (err) {
      console.warn(`Failed to read site settings for ${siteKey}:`, err);
    }

    return defaults;
  }

  /**
   * Write site settings
   */
  async writeSiteSettings(settings: SiteSettings): Promise<void> {
    await this.ensureConfigDir();
    const filePath = this.getFilePath('site', settings.siteKey);
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf8');
  }

  /**
   * Check if a config file exists
   */
  async exists(type: ConfigType, identifier?: string): Promise<boolean> {
    const filePath = this.getFilePath(type, identifier);
    return fs.pathExists(filePath);
  }

  /**
   * Delete a config file
   */
  async delete(type: ConfigType, identifier?: string): Promise<void> {
    const filePath = this.getFilePath(type, identifier);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  /**
   * List all user config files
   */
  async listUserConfigs(): Promise<string[]> {
    await this.ensureConfigDir();
    const files = await fs.readdir(this.configDir);
    const userFiles = files.filter(f => f.startsWith('user_prefs_') && f.endsWith('.json'));
    return userFiles.map(f => f.replace('user_prefs_', '').replace('.json', ''));
  }

  /**
   * List all site config files
   */
  async listSiteConfigs(): Promise<string[]> {
    await this.ensureConfigDir();
    const files = await fs.readdir(this.configDir);
    const siteFiles = files.filter(f => f.startsWith('site_settings_') && f.endsWith('.json'));
    return siteFiles.map(f => f.replace('site_settings_', '').replace('.json', ''));
  }

  /**
   * Get the config directory path
   */
  getConfigDir(): string {
    return this.configDir;
  }

  /**
   * Deep merge two objects, with source overriding target
   */
  private deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        (result as Record<string, unknown>)[key] = this.deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else if (sourceValue !== undefined) {
        (result as Record<string, unknown>)[key] = sourceValue;
      }
    }

    return result;
  }
}
