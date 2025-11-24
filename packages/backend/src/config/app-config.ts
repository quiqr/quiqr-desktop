/**
 * Application Configuration Manager
 *
 * Replaces global.pogoconf with a proper class-based configuration manager.
 * Handles loading, saving, and accessing application configuration and preferences.
 */

import path from 'path';
import fs from 'fs-extra';
import { z } from 'zod';
import { appConfigSchema, type AppConfig as AppConfigType } from '@quiqr/types';

/**
 * AppConfig manages the application's persistent configuration
 * Loads from and saves to a JSON file in the user data directory
 */
export class AppConfig {
  private config: AppConfigType;
  private configPath: string;
  private configFile: string;

  constructor(userDataPath: string, configFileName: string = 'quiqr-app-config.json') {
    this.configPath = userDataPath;
    this.configFile = path.join(userDataPath, configFileName);
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file, or create default if not exists
   */
  private loadConfig(): AppConfigType {
    let loadedConfig: Partial<AppConfigType> = {};

    try {
      if (fs.existsSync(this.configFile)) {
        const fileContent = fs.readFileSync(this.configFile, 'utf8');
        loadedConfig = JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn('Could not load config file, using defaults:', err);
    }

    // Merge with defaults
    const defaultConfig: AppConfigType = {
      lastOpenedSite: { siteKey: null, workspaceKey: null, sitePath: null },
      prefs: {
        dataFolder: '~/Quiqr',
        interfaceStyle: 'quiqr10-light',
      },
      lastOpenedPublishTargetForSite: {},
      skipWelcomeScreen: false,
      experimentalFeatures: false,
      disablePartialCache: false,
      devLocalApi: false,
      devDisableAutoHugoServe: false,
      hugoServeDraftMode: false,
      devShowCurrentUser: false,
      sitesListingView: 'all',
      currentUsername: null,
    };

    const mergedConfig = { ...defaultConfig, ...loadedConfig };

    // Validate with Zod schema
    try {
      return appConfigSchema.parse(mergedConfig);
    } catch (err) {
      console.warn('Config validation failed, using defaults:', err);
      return defaultConfig;
    }
  }

  /**
   * Save configuration to file
   */
  async save(): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.configFile));
      await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (err) {
      console.error('Could not save config:', err);
      throw err;
    }
  }

  /**
   * Synchronous save (for use in non-async contexts)
   */
  saveSync(): void {
    try {
      fs.ensureDirSync(path.dirname(this.configFile));
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (err) {
      console.error('Could not save config:', err);
      throw err;
    }
  }

  /**
   * Reset state to defaults
   */
  resetStateToDefault(): void {
    this.config.lastOpenedSite = { siteKey: null, workspaceKey: null, sitePath: null };
    this.config.lastOpenedPublishTargetForSite = {};
  }

  // ============================================================================
  // Getters
  // ============================================================================

  get lastOpenedSite() {
    return this.config.lastOpenedSite;
  }

  get lastOpenedPublishTargetForSite() {
    return this.config.lastOpenedPublishTargetForSite;
  }

  get prefs() {
    return this.config.prefs;
  }

  get currentUsername() {
    return this.config.currentUsername;
  }

  get skipWelcomeScreen() {
    return this.config.skipWelcomeScreen;
  }

  get experimentalFeatures() {
    return this.config.experimentalFeatures;
  }

  get disablePartialCache() {
    return this.config.disablePartialCache;
  }

  get devLocalApi() {
    return this.config.devLocalApi;
  }

  get devDisableAutoHugoServe() {
    return this.config.devDisableAutoHugoServe;
  }

  get hugoServeDraftMode() {
    return this.config.hugoServeDraftMode;
  }

  get devShowCurrentUser() {
    return this.config.devShowCurrentUser;
  }

  get sitesListingView() {
    return this.config.sitesListingView;
  }

  // ============================================================================
  // Setters
  // ============================================================================

  setLastOpenedSite(siteKey: string | null, workspaceKey: string | null, sitePath: string | null): void {
    this.config.lastOpenedSite = { siteKey, workspaceKey, sitePath };
  }

  setLastOpenedPublishTargetForSite(siteKey: string, publishKey: string): void {
    this.config.lastOpenedPublishTargetForSite[siteKey] = publishKey;
  }

  setPrefKey(prefKey: string, prefValue: any): void {
    (this.config.prefs as any)[prefKey] = prefValue;
  }

  setCurrentUsername(username: string | null): void {
    this.config.currentUsername = username;
  }

  setSkipWelcomeScreen(skip: boolean): void {
    this.config.skipWelcomeScreen = skip;
  }

  setExperimentalFeatures(toggle: boolean): void {
    this.config.experimentalFeatures = toggle;
  }

  setDisablePartialCache(toggle: boolean): void {
    this.config.disablePartialCache = toggle;
  }

  setDevLocalApi(toggle: boolean): void {
    this.config.devLocalApi = toggle;
  }

  setDevDisableAutoHugoServe(toggle: boolean): void {
    this.config.devDisableAutoHugoServe = toggle;
  }

  setHugoServeDraftMode(toggle: boolean): void {
    this.config.hugoServeDraftMode = toggle;
  }

  setDevShowCurrentUser(toggle: boolean): void {
    this.config.devShowCurrentUser = toggle;
  }

  setSitesListingView(view: string): void {
    this.config.sitesListingView = view;
  }

  // ============================================================================
  // Generic accessors for readConfKey compatibility
  // ============================================================================

  /**
   * Get a config value by key (for backward compatibility with readConfKey API)
   */
  get<K extends keyof AppConfigType>(key: K): AppConfigType[K] {
    return this.config[key];
  }

  /**
   * Set a config value by key
   */
  set<K extends keyof AppConfigType>(key: K, value: AppConfigType[K]): void {
    this.config[key] = value;
  }

  /**
   * Get the entire config object (for debugging/serialization)
   */
  getAll(): AppConfigType {
    return { ...this.config };
  }
}
