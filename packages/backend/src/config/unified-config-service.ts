/**
 * UnifiedConfigService - High-level configuration management
 *
 * Provides a unified interface for all configuration operations,
 * combining storage, resolution, and migration capabilities.
 */

import path from 'path';
import os from 'os';
import type {
  InstanceSettings,
  UserConfig,
  UserPreferences,
  SiteSettings,
  ConfigPropertyMetadata,
} from '@quiqr/types';
import { ConfigStore } from './config-store.js';
import { EnvOverrideLayer } from './env-override-layer.js';
import { ConfigResolver, ResolvedValue } from './config-resolver.js';

/**
 * Options for creating the UnifiedConfigService
 */
export interface UnifiedConfigServiceOptions {
  /**
   * Override the config directory (defaults to ~/.config/quiqr/)
   */
  configDir?: string;

  /**
   * Current user ID (defaults to 'default' for single-user mode)
   */
  userId?: string;
}

/**
 * UnifiedConfigService provides the main API for configuration management
 */
export class UnifiedConfigService {
  private store: ConfigStore;
  private envLayer: EnvOverrideLayer;
  private resolver: ConfigResolver;
  private initialized: boolean = false;

  constructor(options: UnifiedConfigServiceOptions = {}) {
    const configDir = options.configDir || path.join(os.homedir(), '.config', 'quiqr');
    const userId = options.userId || 'default';

    this.store = new ConfigStore(configDir);
    this.envLayer = new EnvOverrideLayer();
    this.resolver = new ConfigResolver(this.store, this.envLayer);

    // Auto-initialize synchronously
    // Note: This uses sync file operations for initial setup
    this.initializeSync(userId);
  }

  /**
   * Initialize the service synchronously
   * Used for auto-initialization in constructor
   */
  private initializeSync(userId: string = 'default'): void {
    if (this.initialized) return;

    this.store.ensureConfigDirSync();
    this.envLayer.loadFromEnvironment();
    this.resolver.initializeSync(userId);
    this.initialized = true;
  }

  /**
   * Initialize the service (async version for re-initialization)
   */
  async initialize(userId: string = 'default'): Promise<void> {
    if (this.initialized) return;

    await this.store.ensureConfigDir();
    this.envLayer.loadFromEnvironment();
    await this.resolver.initialize(userId);
    this.initialized = true;
  }

  /**
   * Ensure the service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('UnifiedConfigService not initialized. Call initialize() first.');
    }
  }

  // ============================================================
  // User Preference Methods
  // ============================================================

  /**
   * Get the effective value of a user preference
   * This resolves through all layers and returns the final value
   */
  getEffectivePreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    this.ensureInitialized();
    return this.resolver.getEffectivePreference(key);
  }

  /**
   * Get all effective preferences as a merged object
   */
  getEffectivePreferences(): UserPreferences {
    this.ensureInitialized();
    return this.resolver.getEffectivePreferences();
  }

  /**
   * Get a preference with full resolution metadata
   */
  resolvePreference<K extends keyof UserPreferences>(key: K): ResolvedValue<UserPreferences[K]> {
    this.ensureInitialized();
    return this.resolver.resolvePreference(key);
  }

  /**
   * Check if a preference is locked by instance admin
   */
  isPreferenceLocked<K extends keyof UserPreferences>(key: K): boolean {
    this.ensureInitialized();
    return this.resolver.isPreferenceLocked(key);
  }

  /**
   * Set a user preference (only works for non-locked preferences)
   */
  async setUserPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<void> {
    this.ensureInitialized();

    if (this.resolver.isPreferenceLocked(key)) {
      throw new Error(`Preference '${key}' is locked by instance administrator`);
    }

    const userConfig = this.resolver.getUserConfig();
    if (!userConfig) {
      throw new Error('User config not loaded');
    }

    const updatedConfig: UserConfig = {
      ...userConfig,
      preferences: {
        ...userConfig.preferences,
        [key]: value,
      },
    };

    await this.store.writeUserConfig(updatedConfig, this.resolver.getUserId());
    await this.resolver.reload();
  }

  /**
   * Set multiple user preferences at once
   */
  async setUserPreferences(prefs: Partial<UserPreferences>): Promise<void> {
    this.ensureInitialized();

    // Check for locked preferences
    for (const key of Object.keys(prefs) as (keyof UserPreferences)[]) {
      if (this.resolver.isPreferenceLocked(key)) {
        throw new Error(`Preference '${key}' is locked by instance administrator`);
      }
    }

    const userConfig = this.resolver.getUserConfig();
    if (!userConfig) {
      throw new Error('User config not loaded');
    }

    const updatedConfig: UserConfig = {
      ...userConfig,
      preferences: {
        ...userConfig.preferences,
        ...prefs,
      },
    };

    await this.store.writeUserConfig(updatedConfig, this.resolver.getUserId());
    await this.resolver.reload();
  }

  // ============================================================
  // User Config Methods (non-preference user data)
  // ============================================================

  /**
   * Get the last opened site for the current user
   */
  getLastOpenedSite(): UserConfig['lastOpenedSite'] {
    this.ensureInitialized();
    const userConfig = this.resolver.getUserConfig();
    return userConfig?.lastOpenedSite || { siteKey: null, workspaceKey: null, sitePath: null };
  }

  /**
   * Set the last opened site
   */
  async setLastOpenedSite(
    siteKey: string | null,
    workspaceKey: string | null,
    sitePath: string | null
  ): Promise<void> {
    this.ensureInitialized();

    const userConfig = this.resolver.getUserConfig();
    if (!userConfig) {
      throw new Error('User config not loaded');
    }

    const updatedConfig: UserConfig = {
      ...userConfig,
      lastOpenedSite: { siteKey, workspaceKey, sitePath },
    };

    await this.store.writeUserConfig(updatedConfig, this.resolver.getUserId());
    await this.resolver.reload();
  }

  /**
   * Get the skip welcome screen setting
   */
  getSkipWelcomeScreen(): boolean {
    this.ensureInitialized();
    return this.resolver.getUserConfig()?.skipWelcomeScreen || false;
  }

  /**
   * Set the skip welcome screen setting
   */
  async setSkipWelcomeScreen(skip: boolean): Promise<void> {
    this.ensureInitialized();

    const userConfig = this.resolver.getUserConfig();
    if (!userConfig) {
      throw new Error('User config not loaded');
    }

    const updatedConfig: UserConfig = {
      ...userConfig,
      skipWelcomeScreen: skip,
    };

    await this.store.writeUserConfig(updatedConfig, this.resolver.getUserId());
    await this.resolver.reload();
  }

  /**
   * Get last opened publish target for a site
   */
  getLastPublishTarget(siteKey: string): string | null {
    this.ensureInitialized();
    const targets = this.resolver.getUserConfig()?.lastOpenedPublishTargetForSite || {};
    return targets[siteKey] || null;
  }

  /**
   * Set last opened publish target for a site
   */
  async setLastPublishTarget(siteKey: string, publishKey: string): Promise<void> {
    this.ensureInitialized();

    const userConfig = this.resolver.getUserConfig();
    if (!userConfig) {
      throw new Error('User config not loaded');
    }

    const updatedConfig: UserConfig = {
      ...userConfig,
      lastOpenedPublishTargetForSite: {
        ...userConfig.lastOpenedPublishTargetForSite,
        [siteKey]: publishKey,
      },
    };

    await this.store.writeUserConfig(updatedConfig, this.resolver.getUserId());
    await this.resolver.reload();
  }

  // ============================================================
  // Instance Settings Methods
  // ============================================================

  /**
   * Get instance settings
   */
  getInstanceSettings(): InstanceSettings | null {
    this.ensureInitialized();
    return this.resolver.getInstanceSettings();
  }

  /**
   * Get an instance setting value
   */
  getInstanceSetting<K extends keyof InstanceSettings>(key: K): InstanceSettings[K] | undefined {
    this.ensureInitialized();
    return this.resolver.getInstanceSettings()?.[key];
  }

  /**
   * Check if experimental features are enabled
   */
  isExperimentalFeaturesEnabled(): boolean {
    this.ensureInitialized();
    return this.resolver.getInstanceSettings()?.experimentalFeatures || false;
  }

  /**
   * Update instance settings (admin operation)
   */
  async updateInstanceSettings(updates: Partial<InstanceSettings>): Promise<void> {
    this.ensureInitialized();

    const current = this.resolver.getInstanceSettings();
    if (!current) {
      throw new Error('Instance settings not loaded');
    }

    const updated: InstanceSettings = {
      ...current,
      ...updates,
      storage: {
        ...current.storage,
        ...(updates.storage || {}),
      },
      dev: {
        ...current.dev,
        ...(updates.dev || {}),
      },
      hugo: {
        ...current.hugo,
        ...(updates.hugo || {}),
      },
    };

    await this.store.writeInstanceSettings(updated);
    await this.resolver.reload();
  }

  // ============================================================
  // Site Settings Methods
  // ============================================================

  /**
   * Get settings for a site
   */
  async getSiteSettings(siteKey: string): Promise<SiteSettings> {
    this.ensureInitialized();
    return this.store.readSiteSettings(siteKey);
  }

  /**
   * Update settings for a site
   */
  async updateSiteSettings(siteKey: string, updates: Partial<SiteSettings['settings']>): Promise<void> {
    this.ensureInitialized();

    const current = await this.store.readSiteSettings(siteKey);
    const updated: SiteSettings = {
      ...current,
      settings: {
        ...current.settings,
        ...updates,
      },
    };

    await this.store.writeSiteSettings(updated);
  }

  /**
   * List all sites with settings
   */
  async listSitesWithSettings(): Promise<string[]> {
    this.ensureInitialized();
    return this.store.listSiteConfigs();
  }

  // ============================================================
  // Property Inspection (about:config style)
  // ============================================================

  /**
   * Get all configuration properties with metadata
   * Useful for debugging and advanced configuration UI
   */
  async getAllPropertyMetadata(): Promise<ConfigPropertyMetadata[]> {
    this.ensureInitialized();
    return this.resolver.getAllPropertyMetadata();
  }

  // ============================================================
  // User Management (for multi-user scenarios)
  // ============================================================

  /**
   * Get the current user ID
   */
  getCurrentUserId(): string {
    this.ensureInitialized();
    return this.resolver.getUserId();
  }

  /**
   * Switch to a different user
   */
  async switchUser(userId: string): Promise<void> {
    this.ensureInitialized();
    await this.resolver.setUserId(userId);
  }

  /**
   * List all user configs
   */
  async listUsers(): Promise<string[]> {
    this.ensureInitialized();
    return this.store.listUserConfigs();
  }

  // ============================================================
  // Low-level Access
  // ============================================================

  /**
   * Get the config store (for migration purposes)
   */
  getStore(): ConfigStore {
    return this.store;
  }

  /**
   * Get the environment override layer
   */
  getEnvLayer(): EnvOverrideLayer {
    return this.envLayer;
  }

  /**
   * Get the config directory path
   */
  getConfigDir(): string {
    return this.store.getConfigDir();
  }

  /**
   * Force reload all configuration
   */
  async reload(): Promise<void> {
    this.ensureInitialized();
    await this.resolver.reload();
  }
}

/**
 * Create a UnifiedConfigService instance
 */
export function createUnifiedConfigService(
  options: UnifiedConfigServiceOptions = {}
): UnifiedConfigService {
  return new UnifiedConfigService(options);
}
