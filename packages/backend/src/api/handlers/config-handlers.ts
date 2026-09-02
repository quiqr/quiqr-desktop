/**
 * Configuration and Preferences API Handlers
 *
 * Handles reading/writing application configuration and user preferences.
 */

import { spawn } from 'child_process';
import type { AppContainer } from '../../config/container.js';

/**
 * Read a configuration key from the global config
 * LEGACY: Uses UnifiedConfigService instead of AppConfig
 */
export function createReadConfKeyHandler(container: AppContainer) {
  return async ({ confkey }: { confkey: string }) => {
    // Map config keys to their values from UnifiedConfigService
    const configMap: Record<string, unknown> = {
      sitesListingView: container.unifiedConfig.getUserState('sitesListingView'),
      lastOpenedSite: container.unifiedConfig.getUserState('lastOpenedSite'),
      prefs: {
        interfaceStyle: container.unifiedConfig.getEffectivePreference('interfaceStyle'),
        dataFolder: container.unifiedConfig.getInstanceSetting('storage.dataFolder'),
      },
      lastOpenedPublishTargetForSite: container.unifiedConfig.getUserState('lastOpenedPublishTargetForSite'),
      skipWelcomeScreen: container.unifiedConfig.getUserState('skipWelcomeScreen'),
      experimentalFeatures: container.unifiedConfig.getInstanceSetting('experimentalFeatures'),
      disablePartialCache: container.unifiedConfig.getInstanceSetting('dev.disablePartialCache'),
      devDisableAutoHugoServe: container.unifiedConfig.getInstanceSetting('hugo.disableAutoHugoServe'),
      hugoServeDraftMode: container.unifiedConfig.getInstanceSetting('hugo.serveDraftMode'),
      currentUsername: null, // Not stored in unified config
    };

    return configMap[confkey];
  };
}

/**
 * Read a preference key from user preferences
 * LEGACY: Uses UnifiedConfigService instead of AppConfig
 */
export function createReadConfPrefKeyHandler(container: AppContainer) {
  return async ({ confkey }: { confkey: string }) => {
    // Handle special cases
    if (confkey === 'dataFolder') {
      return container.unifiedConfig.getInstanceSetting('storage.dataFolder');
    }
    return container.unifiedConfig.getEffectivePreference(confkey);
  };
}

/**
 * Save a preference key to user preferences
 * LEGACY: Uses UnifiedConfigService instead of AppConfig
 */
export function createSaveConfPrefKeyHandler(container: AppContainer) {
  return async ({
    prefKey,
    prefValue,
  }: {
    prefKey: string;
    prefValue: string | boolean;
  }) => {
    // Handle special cases - dataFolder is an instance setting
    if (prefKey === 'dataFolder') {
      await container.unifiedConfig.updateInstanceSettings({
        storage: { dataFolder: prefValue as string },
      });
    } else {
      await container.unifiedConfig.setUserPreference(prefKey, prefValue);
    }
    return true;
  };
}

/**
 * Check if a role matches the application role preference
 * LEGACY: Uses UnifiedConfigService instead of AppConfig
 */
export function createMatchRoleHandler(container: AppContainer) {
  return async ({ role }: { role: string }) => {
    const applicationRole = container.unifiedConfig.getEffectivePreference('applicationRole');
    return role === applicationRole;
  };
}

/**
 * Get the current site key from application state
 */
export function createGetCurrentSiteKeyHandler(container: AppContainer) {
  return async () => {
    return container.state.currentSiteKey;
  };
}

/**
 * Get the current base URL from application state
 */
export function createGetCurrentBaseUrlHandler(container: AppContainer) {
  return async () => {
    return container.state.currentBaseUrl;
  };
}

/**
 * Invalidate the configuration cache
 */
export function createInvalidateCacheHandler(container: AppContainer) {
  return async () => {
    container.configurationProvider.invalidateCache();
    return true;
  };
}

/**
 * Get the current form node path from application state
 */
export function createGetCurrentFormNodePathHandler(container: AppContainer) {
  return async () => {
    return container.state.currentFormNodePath;
  };
}

/**
 * Set the current form node path in application state
 */
export function createSetCurrentFormNodePathHandler(container: AppContainer) {
  return async ({ path }: { path: string }) => {
    container.state.currentFormNodePath = path;
    return true;
  };
}

/**
 * Get the current form accordion index from application state
 */
export function createGetCurrentFormAccordionIndexHandler(
  container: AppContainer
) {
  return async () => {
    return container.state.currentFormAccordionIndex;
  };
}

/**
 * Set the current form accordion index in application state
 */
export function createSetCurrentFormAccordionIndexHandler(
  container: AppContainer
) {
  return async ({ index }: { index: number }) => {
    container.state.currentFormAccordionIndex = index;
    return true;
  };
}

/**
 * Mark that a form should be reloaded
 */
export function createShouldReloadFormHandler(container: AppContainer) {
  return async ({ reloadFormPath }: { reloadFormPath: string }) => {
    container.state.currentFormShouldReload = reloadFormPath;
    return true;
  };
}

/**
 * Toggle experimental features
 * Uses UnifiedConfigService for instance settings
 */
export function createToggleExperimentalFeaturesHandler(container: AppContainer) {
  return async ({ enabled }: { enabled: boolean }) => {
    await container.unifiedConfig.updateInstanceSettings({
      experimentalFeatures: enabled,
    });

    // Rebuild menu with new state
    container.adapters.menu.createMainMenu();

    return true;
  };
}

/**
 * Toggle partial cache
 * Uses UnifiedConfigService for instance settings
 */
export function createTogglePartialCacheHandler(container: AppContainer) {
  return async ({ enabled }: { enabled: boolean }) => {
    await container.unifiedConfig.updateInstanceSettings({
      dev: { disablePartialCache: enabled },
    });

    // Rebuild menu with new state
    container.adapters.menu.createMainMenu();

    return true;
  };
}

/**
 * Toggle Hugo serve draft mode
 * Uses UnifiedConfigService for instance settings
 */
export function createToggleDraftModeHandler(container: AppContainer) {
  return async ({ enabled }: { enabled: boolean }) => {
    await container.unifiedConfig.updateInstanceSettings({
      hugo: { serveDraftMode: enabled },
    });

    // Rebuild menu with new state
    container.adapters.menu.createMainMenu();

    return true;
  };
}

/**
 * Toggle auto Hugo serve
 * Uses UnifiedConfigService for instance settings
 */
export function createToggleAutoHugoServeHandler(container: AppContainer) {
  return async ({ enabled }: { enabled: boolean }) => {
    await container.unifiedConfig.updateInstanceSettings({
      hugo: { disableAutoHugoServe: enabled },
    });

    // Rebuild menu with new state
    container.adapters.menu.createMainMenu();

    return true;
  };
}

/**
 * Change application role
 * Uses UnifiedConfigService for user preferences
 */
export function createChangeApplicationRoleHandler(container: AppContainer) {
  return async ({ role }: { role: string }) => {
    await container.unifiedConfig.setUserPreference('applicationRole', role);

    // Rebuild menu with new state
    container.adapters.menu.createMainMenu();

    // Notify frontend
    container.adapters.window.sendToRenderer('role-changed', role);

    return true;
  };
}

/**
 * Get environment information
 * Returns platform and packaging status to help frontend determine UI mode
 */
export function createGetEnvironmentInfoHandler(container: AppContainer) {
  return async () => {
    return {
      platform: container.environmentInfo.platform,
      isPackaged: container.environmentInfo.isPackaged,
      runtime: container.environmentInfo.runtime,
    };
  };
}

// =============================================================================
// Unified Configuration System Handlers (New Architecture)
// =============================================================================

/**
 * Get a resolved preference value with 2-layer resolution
 * Returns the effective value after applying layers (app-default < user)
 */
export function createGetEffectivePreferenceHandler(container: AppContainer) {
  return async ({ prefKey }: { prefKey: string }) => {
    // Use resolvePreference to get full metadata including source
    const resolved = container.unifiedConfig.resolvePreference(prefKey);
    return {
      value: resolved.value,
      source: resolved.source,
      path: resolved.path,
    };
  };
}

/**
 * Get all effective preferences with their resolution metadata
 */
export function createGetEffectivePreferencesHandler(container: AppContainer) {
  return async () => {
    return container.unifiedConfig.getEffectivePreferences();
  };
}

/**
 * Set a user preference value
 */
export function createSetUserPreferenceHandler(container: AppContainer) {
  return async ({ prefKey, value }: { prefKey: string; value: unknown }) => {
    await container.unifiedConfig.setUserPreference(prefKey, value);
    return true;
  };
}

/**
 * Set multiple user preferences at once
 */
export function createSetUserPreferencesHandler(container: AppContainer) {
  return async ({ preferences }: { preferences: Record<string, unknown> }) => {
    await container.unifiedConfig.setUserPreferences(preferences);
    return true;
  };
}

/**
 * Get all property metadata (Firefox about:config style)
 * Returns all config properties with their values, sources, and types
 */
export function createGetAllPropertyMetadataHandler(container: AppContainer) {
  return async () => {
    return container.unifiedConfig.getAllPropertyMetadata();
  };
}

/**
 * Get instance settings
 */
export function createGetInstanceSettingsHandler(container: AppContainer) {
  return async () => {
    return container.unifiedConfig.getInstanceSettings();
  };
}

/**
 * Get a specific instance setting by path
 */
export function createGetInstanceSettingHandler(container: AppContainer) {
  return async ({ path }: { path: string }) => {
    // Use dot notation path to get nested instance setting value
    return container.unifiedConfig.getInstanceSetting(path);
  };
}

/**
 * Update instance settings (partial update)
 */
export function createUpdateInstanceSettingsHandler(container: AppContainer) {
  return async ({ settings }: { settings: Record<string, unknown> }) => {
    await container.unifiedConfig.updateInstanceSettings(settings);

    // Rebuild menu if experimental features setting changed
    if ('experimentalFeatures' in settings) {
      container.adapters.menu.createMainMenu();
    }

    return true;
  };
}

/**
 * Get site-specific settings
 */
export function createGetSiteSettingsHandler(container: AppContainer) {
  return async ({ siteKey }: { siteKey: string }) => {
    return container.unifiedConfig.getSiteSettings(siteKey);
  };
}

/**
 * Update site-specific settings
 */
export function createUpdateSiteSettingsHandler(container: AppContainer) {
  return async ({
    siteKey,
    settings,
  }: {
    siteKey: string;
    settings: Record<string, unknown>;
  }) => {
    await container.unifiedConfig.updateSiteSettings(siteKey, settings);
    return true;
  };
}

/**
 * Get the current user ID
 */
export function createGetCurrentUserIdHandler(container: AppContainer) {
  return async () => {
    return container.unifiedConfig.getCurrentUserId();
  };
}

/**
 * Switch to a different user
 */
export function createSwitchUserHandler(container: AppContainer) {
  return async ({ userId }: { userId: string }) => {
    await container.unifiedConfig.switchUser(userId);
    return true;
  };
}

/**
 * List all users with config files
 */
export function createListUsersHandler(container: AppContainer) {
  return async () => {
    return container.unifiedConfig.listUsers();
  };
}

/**
 * Check if experimental features are enabled (unified config)
 */
export function createIsExperimentalFeaturesEnabledHandler(container: AppContainer) {
  return async () => {
    return container.unifiedConfig.isExperimentalFeaturesEnabled();
  };
}

/**
 * Get the storage path from application configuration
 * Uses UnifiedConfigService for instance settings
 */
export function createGetStoragePathHandler(container: AppContainer) {
  return async () => {
    return {
      path: container.unifiedConfig.getInstanceSetting('storage.dataFolder'),
    };
  };
}

/**
 * Set the storage path in application configuration
 * Uses UnifiedConfigService for instance settings
 */
export function createSetStoragePathHandler(container: AppContainer) {
  return async ({ path }: { path: string }) => {
    await container.unifiedConfig.updateInstanceSettings({
      storage: { dataFolder: path },
    });
    return true;
  };
}

/**
 * Execute custom open command for a site
 * Runs user-configured command with site path and name substitution
 */
export function createExecuteCustomOpenCommandHandler(container: AppContainer) {
  return async ({ siteKey, command }: { siteKey: string; command: string }) => {
    // Get site configuration to extract path
    const configurations = await container.configurationProvider.getConfigurations();
    const site = configurations.sites.find((s) => s.key === siteKey);

    if (!site || !site.source) {
      throw new Error(`Site not found or has no source path: ${siteKey}`);
    }

    const sitePath = site.source.path;
    const siteName = site.name || site.key;

    // Substitute %site_path% and %site_name% placeholders in command
    const expandedCommand = command
      .replace(/%site_path%/g, sitePath)
      .replace(/%site_name%/g, siteName);

    // Parse command into executable and arguments
    const parts = expandedCommand.split(' ').filter((p) => p.length > 0);
    if (parts.length === 0) {
      throw new Error('Command is empty');
    }

    const executable = parts[0];
    const args = parts.slice(1);

    // Execute command
    return new Promise<boolean>((resolve, reject) => {
      const childProcess = spawn(executable, args, {
        detached: true,
        stdio: 'ignore',
      });

      childProcess.on('error', (error: Error) => {
        reject(new Error(`Failed to execute command: ${error.message}`));
      });

      childProcess.on('spawn', () => {
        // Command spawned successfully
        childProcess.unref(); // Allow parent to exit independently
        resolve(true);
      });
    });
  };
}

/**
 * Create all config-related handlers
 */
export function createConfigHandlers(container: AppContainer) {
  return {
    // Legacy handlers (backward compatibility)
    readConfKey: createReadConfKeyHandler(container),
    readConfPrefKey: createReadConfPrefKeyHandler(container),
    saveConfPrefKey: createSaveConfPrefKeyHandler(container),
    matchRole: createMatchRoleHandler(container),
    getCurrentSiteKey: createGetCurrentSiteKeyHandler(container),
    getCurrentBaseUrl: createGetCurrentBaseUrlHandler(container),
    invalidateCache: createInvalidateCacheHandler(container),
    getCurrentFormNodePath: createGetCurrentFormNodePathHandler(container),
    setCurrentFormNodePath: createSetCurrentFormNodePathHandler(container),
    getCurrentFormAccordionIndex:
      createGetCurrentFormAccordionIndexHandler(container),
    setCurrentFormAccordionIndex:
      createSetCurrentFormAccordionIndexHandler(container),
    shouldReloadForm: createShouldReloadFormHandler(container),
    toggleExperimentalFeatures: createToggleExperimentalFeaturesHandler(container),
    togglePartialCache: createTogglePartialCacheHandler(container),
    toggleDraftMode: createToggleDraftModeHandler(container),
    toggleAutoHugoServe: createToggleAutoHugoServeHandler(container),
    changeApplicationRole: createChangeApplicationRoleHandler(container),
    getEnvironmentInfo: createGetEnvironmentInfoHandler(container),

    // Unified config handlers (new architecture)
    getEffectivePreference: createGetEffectivePreferenceHandler(container),
    getEffectivePreferences: createGetEffectivePreferencesHandler(container),
    setUserPreference: createSetUserPreferenceHandler(container),
    setUserPreferences: createSetUserPreferencesHandler(container),
    getAllPropertyMetadata: createGetAllPropertyMetadataHandler(container),
    getInstanceSettings: createGetInstanceSettingsHandler(container),
    getInstanceSetting: createGetInstanceSettingHandler(container),
    updateInstanceSettings: createUpdateInstanceSettingsHandler(container),
    getSiteSettings: createGetSiteSettingsHandler(container),
    updateSiteSettings: createUpdateSiteSettingsHandler(container),
    getCurrentUserId: createGetCurrentUserIdHandler(container),
    switchUser: createSwitchUserHandler(container),
    listUsers: createListUsersHandler(container),
    isExperimentalFeaturesEnabled: createIsExperimentalFeaturesEnabledHandler(container),

    // Storage path handlers
    getStoragePath: createGetStoragePathHandler(container),
    setStoragePath: createSetStoragePathHandler(container),

    // Custom open command handler
    executeCustomOpenCommand: createExecuteCustomOpenCommandHandler(container),
  };
}
