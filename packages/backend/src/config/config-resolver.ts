/**
 * ConfigResolver - Layered configuration resolution
 *
 * Resolves configuration values through the 4-layer hierarchy:
 * 1. App Defaults (lowest priority)
 * 2. Instance Defaults
 * 3. User Preferences
 * 4. Instance Forced (highest priority)
 *
 * Also handles environment variable overrides via EnvOverrideLayer.
 */

import type { InstanceSettings, UserConfig, UserPreferences, ConfigLayer, ConfigPropertyMetadata } from '@quiqr/types';
import { ConfigStore } from './config-store.js';
import { EnvOverrideLayer } from './env-override-layer.js';

/**
 * App-level defaults (hardcoded fallbacks)
 */
const APP_DEFAULT_PREFERENCES: UserPreferences = {
  dataFolder: '~/Quiqr',
  interfaceStyle: 'quiqr10-light',
  sitesListingView: 'all',
  libraryView: 'default',
  showSplashAtStartup: true,
  logRetentionDays: 30,
};

/**
 * Result of a resolved value, including metadata about its source
 */
export interface ResolvedValue<T> {
  value: T;
  source: ConfigLayer;
  locked: boolean;
  path: string;
}

/**
 * ConfigResolver resolves configuration values through layers
 */
export class ConfigResolver {
  private store: ConfigStore;
  private envLayer: EnvOverrideLayer;
  private instanceSettings: InstanceSettings | null = null;
  private userConfig: UserConfig | null = null;
  private currentUserId: string = 'default';

  constructor(store: ConfigStore, envLayer: EnvOverrideLayer) {
    this.store = store;
    this.envLayer = envLayer;
  }

  /**
   * Initialize the resolver by loading configs
   */
  async initialize(userId: string = 'default'): Promise<void> {
    this.currentUserId = userId;
    await this.reload();
  }

  /**
   * Reload all configuration from files
   */
  async reload(): Promise<void> {
    this.instanceSettings = await this.store.readInstanceSettings();
    this.userConfig = await this.store.readUserConfig(this.currentUserId);
  }

  /**
   * Initialize the resolver synchronously
   */
  initializeSync(userId: string = 'default'): void {
    this.currentUserId = userId;
    this.reloadSync();
  }

  /**
   * Reload all configuration synchronously
   */
  reloadSync(): void {
    this.instanceSettings = this.store.readInstanceSettingsSync();
    this.userConfig = this.store.readUserConfigSync(this.currentUserId);
  }

  /**
   * Get the current user ID
   */
  getUserId(): string {
    return this.currentUserId;
  }

  /**
   * Set the current user ID and reload their config
   */
  async setUserId(userId: string): Promise<void> {
    this.currentUserId = userId;
    this.userConfig = await this.store.readUserConfig(userId);
  }

  /**
   * Resolve a user preference through all layers
   *
   * Resolution order (highest to lowest priority):
   * 1. Environment variable override
   * 2. Instance forced preferences
   * 3. User preferences
   * 4. Instance default preferences
   * 5. App defaults
   */
  resolvePreference<K extends keyof UserPreferences>(key: K): ResolvedValue<UserPreferences[K]> {
    const path = `user.preferences.${key}`;

    // Check environment override first (highest priority outside forced)
    const envPath = `instance.settings.userForcedPreferences.${key}`;
    if (this.envLayer.hasOverride(envPath)) {
      return {
        value: this.envLayer.getOverride(envPath) as UserPreferences[K],
        source: 'instance-forced',
        locked: true,
        path,
      };
    }

    // Check instance forced preferences
    const forcedPrefs = this.instanceSettings?.userForcedPreferences || {};
    if (key in forcedPrefs && forcedPrefs[key] !== undefined) {
      return {
        value: forcedPrefs[key] as UserPreferences[K],
        source: 'instance-forced',
        locked: true,
        path,
      };
    }

    // Check user preferences
    const userPrefs = this.userConfig?.preferences || {};
    if (key in userPrefs && userPrefs[key] !== undefined) {
      return {
        value: userPrefs[key] as UserPreferences[K],
        source: 'user',
        locked: false,
        path,
      };
    }

    // Check instance default preferences
    const defaultPrefs = this.instanceSettings?.userDefaultPreferences || {};
    if (key in defaultPrefs && defaultPrefs[key] !== undefined) {
      return {
        value: defaultPrefs[key] as UserPreferences[K],
        source: 'instance-default',
        locked: false,
        path,
      };
    }

    // Fall back to app defaults
    return {
      value: APP_DEFAULT_PREFERENCES[key] as UserPreferences[K],
      source: 'app-default',
      locked: false,
      path,
    };
  }

  /**
   * Get the effective value of a preference (without metadata)
   */
  getEffectivePreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.resolvePreference(key).value;
  }

  /**
   * Get all effective preferences merged
   */
  getEffectivePreferences(): UserPreferences {
    const result: Partial<UserPreferences> = {};

    // Get all possible preference keys from app defaults
    const allKeys = Object.keys(APP_DEFAULT_PREFERENCES) as (keyof UserPreferences)[];

    // Also include keys from other layers
    const instanceDefaultKeys = Object.keys(this.instanceSettings?.userDefaultPreferences || {});
    const instanceForcedKeys = Object.keys(this.instanceSettings?.userForcedPreferences || {});
    const userPrefKeys = Object.keys(this.userConfig?.preferences || {});

    const uniqueKeys = new Set([
      ...allKeys,
      ...instanceDefaultKeys,
      ...instanceForcedKeys,
      ...userPrefKeys,
    ]) as Set<keyof UserPreferences>;

    for (const key of uniqueKeys) {
      result[key] = this.getEffectivePreference(key);
    }

    return result as UserPreferences;
  }

  /**
   * Check if a preference is locked (forced by instance)
   */
  isPreferenceLocked<K extends keyof UserPreferences>(key: K): boolean {
    return this.resolvePreference(key).locked;
  }

  /**
   * Resolve an instance setting
   */
  resolveInstanceSetting<K extends keyof InstanceSettings>(key: K): ResolvedValue<InstanceSettings[K]> {
    const configPath = `instance.settings.${key}`;

    // Check environment override
    if (this.envLayer.hasOverride(configPath)) {
      const envValue = this.envLayer.getOverride(configPath);
      return {
        value: envValue as unknown as InstanceSettings[K],
        source: 'instance-default',
        locked: true,
        path: configPath,
      };
    }

    // Return from instance settings (no layering for instance settings)
    const value = this.instanceSettings?.[key];
    if (value !== undefined) {
      return {
        value,
        source: 'instance-default',
        locked: false,
        path: configPath,
      };
    }

    // Return default - use a simple default object
    const defaults: Partial<InstanceSettings> = {
      experimentalFeatures: false,
      disablePartialCache: false,
    };
    return {
      value: defaults[key] as InstanceSettings[K],
      source: 'app-default',
      locked: false,
      path: configPath,
    };
  }

  /**
   * Get metadata for all configuration properties
   * This enables the "about:config" style inspection
   */
  async getAllPropertyMetadata(): Promise<ConfigPropertyMetadata[]> {
    const metadata: ConfigPropertyMetadata[] = [];

    // Add user preferences
    const allPrefKeys = Object.keys(APP_DEFAULT_PREFERENCES) as (keyof UserPreferences)[];
    for (const key of allPrefKeys) {
      const resolved = this.resolvePreference(key);
      metadata.push({
        path: resolved.path,
        value: resolved.value,
        source: resolved.source,
        locked: resolved.locked,
        type: typeof resolved.value as 'string' | 'number' | 'boolean' | 'object',
        description: `User preference: ${key}`,
      });
    }

    // Add instance settings
    if (this.instanceSettings) {
      metadata.push({
        path: 'instance.settings.storage.type',
        value: this.instanceSettings.storage.type,
        source: 'instance-default',
        locked: this.envLayer.hasOverride('instance.settings.storage.type'),
        type: 'string',
        description: 'Storage backend type',
      });

      metadata.push({
        path: 'instance.settings.storage.dataFolder',
        value: this.instanceSettings.storage.dataFolder,
        source: 'instance-default',
        locked: this.envLayer.hasOverride('instance.settings.storage.dataFolder'),
        type: 'string',
        description: 'Default data folder path',
      });

      metadata.push({
        path: 'instance.settings.experimentalFeatures',
        value: this.instanceSettings.experimentalFeatures,
        source: 'instance-default',
        locked: this.envLayer.hasOverride('instance.settings.experimentalFeatures'),
        type: 'boolean',
        description: 'Enable experimental features',
      });
    }

    return metadata;
  }

  /**
   * Get the raw instance settings (for direct access)
   */
  getInstanceSettings(): InstanceSettings | null {
    return this.instanceSettings;
  }

  /**
   * Get the raw user config (for direct access)
   */
  getUserConfig(): UserConfig | null {
    return this.userConfig;
  }
}
