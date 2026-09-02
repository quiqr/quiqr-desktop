/**
 * ConfigResolver - Simplified 2-layer configuration resolution
 *
 * Resolves configuration values through 2 layers:
 * 1. App Defaults (lowest priority) - hardcoded in source
 * 2. User Preferences (highest priority) - from user_prefs_ELECTRON.json
 *
 * Instance settings are read directly without layering.
 * Environment variables can override instance settings.
 */

import type { InstanceSettings, UserConfig, ConfigLayer, ConfigPropertyMetadata } from '@quiqr/types';
import { ConfigStore } from './config-store.js';
import { EnvOverrideLayer } from './env-override-layer.js';

/**
 * App-level defaults (hardcoded fallbacks)
 */
const APP_DEFAULT_INSTANCE: InstanceSettings = {
  storage: {
    type: 'fs',
    dataFolder: '~/Quiqr',
  },
  git: {
    binaryPath: undefined,
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
  preview: {
    enabled: true,
    baseUrl: '',
  },
  variables: {},
};

const APP_DEFAULT_USER_PREFS = {
  interfaceStyle: 'quiqr10-light' as const,
};

/**
 * Result of a resolved value, including metadata about its source
 */
export interface ResolvedValue<T> {
  value: T;
  source: ConfigLayer;
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
  private currentUserId: string = 'ELECTRON';

  constructor(store: ConfigStore, envLayer: EnvOverrideLayer) {
    this.store = store;
    this.envLayer = envLayer;
  }

  /**
   * Initialize the resolver by loading configs
   */
  async initialize(userId: string = 'ELECTRON'): Promise<void> {
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
  initializeSync(userId: string = 'ELECTRON'): void {
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
   * Resolve a user preference through 2 layers
   *
   * Resolution order (highest to lowest priority):
   * 1. User preferences (from user_prefs_ELECTRON.json)
   * 2. App defaults (hardcoded)
   */
  resolvePreference(key: string): ResolvedValue<unknown> {
    const path = `user.preferences.${key}`;

    // Check user preferences
    const userPrefs = this.userConfig?.preferences || {};
    if (key in userPrefs && userPrefs[key as keyof typeof userPrefs] !== undefined) {
      return {
        value: userPrefs[key as keyof typeof userPrefs],
        source: 'user',
        path,
      };
    }

    // Fall back to app defaults
    const appDefault = APP_DEFAULT_USER_PREFS[key as keyof typeof APP_DEFAULT_USER_PREFS];
    return {
      value: appDefault,
      source: 'app-default',
      path,
    };
  }

  /**
   * Get the effective value of a preference (without metadata)
   */
  getEffectivePreference(key: string): unknown {
    return this.resolvePreference(key).value;
  }

  /**
   * Get all effective preferences merged
   */
  getEffectivePreferences(): Record<string, unknown> {
    const result: Record<string, unknown> = { ...APP_DEFAULT_USER_PREFS };

    // Merge user preferences
    const userPrefs = this.userConfig?.preferences || {};
    Object.assign(result, userPrefs);

    return result;
  }

  /**
   * Resolve an instance setting with environment override support
   */
  resolveInstanceSetting(path: string): ResolvedValue<unknown> {
    const configPath = path;

    // Check environment override
    if (this.envLayer.hasOverride(configPath)) {
      const override = this.envLayer.getOverride(configPath);
      return {
        value: override?.value,
        source: 'user', // Environment is user-level override
        path: configPath,
      };
    }

    // Get value from instance settings
    const value = this.getNestedValue(this.instanceSettings, path);
    if (value !== undefined) {
      return {
        value,
        source: 'user',
        path: configPath,
      };
    }

    // Fall back to app default
    const defaultValue = this.getNestedValue(APP_DEFAULT_INSTANCE, path);
    return {
      value: defaultValue,
      source: 'app-default',
      path: configPath,
    };
  }

  /**
   * Get effective instance setting value
   */
  getEffectiveInstanceSetting(path: string): unknown {
    return this.resolveInstanceSetting(path).value;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== 'object') return undefined;

    const parts = path.split('.');
    let current: any = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Get metadata for all configuration properties
   * This enables the "about:config" style inspection
   */
  async getAllPropertyMetadata(): Promise<ConfigPropertyMetadata[]> {
    const metadata: ConfigPropertyMetadata[] = [];

    // Add user preferences
    const prefKeys = Object.keys(APP_DEFAULT_USER_PREFS);
    for (const key of prefKeys) {
      const resolved = this.resolvePreference(key);
      metadata.push({
        path: resolved.path,
        value: resolved.value,
        source: resolved.source,
        type: typeof resolved.value as 'string' | 'number' | 'boolean' | 'object',
        description: `User preference: ${key}`,
      });
    }

    // Add instance settings
    const instancePaths = [
      'storage.type',
      'storage.dataFolder',
      'logging.retention',
      'logging.logLevel',
      'experimentalFeatures',
      'dev.disablePartialCache',
      'hugo.serveDraftMode',
      'hugo.disableAutoHugoServe',
    ];

    for (const path of instancePaths) {
      const resolved = this.resolveInstanceSetting(path);
      metadata.push({
        path: `instance.${path}`,
        value: resolved.value,
        source: resolved.source,
        type: typeof resolved.value as 'string' | 'number' | 'boolean' | 'object',
        description: `Instance setting: ${path}`,
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

  /**
   * Get user state (non-preference fields from user config)
   */
  getUserState<K extends keyof UserConfig>(key: K): UserConfig[K] | undefined {
    return this.userConfig?.[key];
  }

  /**
   * Save user preference
   */
  async saveUserPreference(key: string, value: unknown): Promise<void> {
    if (!this.userConfig) {
      throw new Error('User config not loaded');
    }

    // Update in-memory config
    this.userConfig.preferences = {
      ...this.userConfig.preferences,
      [key]: value,
    };

    // Save to file
    await this.store.saveUserConfig(this.currentUserId, this.userConfig);
  }

  /**
   * Save user state field
   */
  async saveUserState<K extends keyof UserConfig>(key: K, value: UserConfig[K]): Promise<void> {
    if (!this.userConfig) {
      throw new Error('User config not loaded');
    }

    // Update in-memory config
    this.userConfig[key] = value;

    // Save to file
    await this.store.saveUserConfig(this.currentUserId, this.userConfig);
  }
}
