/**
 * Configuration and Preferences API Handlers
 *
 * Handles reading/writing application configuration and user preferences.
 */

import type { AppContainer } from '../../config/container.js';

/**
 * Read a configuration key from the global config
 */
export function createReadConfKeyHandler(container: AppContainer) {
  return async ({ confkey }: { confkey: string }) => {
    // Map config keys to their values
    const configMap: Record<string, unknown> = {
      sitesListingView: container.config.sitesListingView,
      lastOpenedSite: container.config.lastOpenedSite,
      prefs: container.config.prefs,
      lastOpenedPublishTargetForSite: container.config.lastOpenedPublishTargetForSite,
      skipWelcomeScreen: container.config.skipWelcomeScreen,
      experimentalFeatures: container.config.experimentalFeatures,
      disablePartialCache: container.config.disablePartialCache,
      devLocalApi: container.config.devLocalApi,
      devDisableAutoHugoServe: container.config.devDisableAutoHugoServe,
      hugoServeDraftMode: container.config.hugoServeDraftMode,
      devShowCurrentUser: container.config.devShowCurrentUser,
      currentUsername: container.config.currentUsername,
    };

    return configMap[confkey];
  };
}

/**
 * Read a preference key from user preferences
 */
export function createReadConfPrefKeyHandler(container: AppContainer) {
  return async ({ confkey }: { confkey: string }) => {
    return container.config.prefs[confkey as keyof typeof container.config.prefs];
  };
}

/**
 * Save a preference key to user preferences
 */
export function createSaveConfPrefKeyHandler(container: AppContainer) {
  return async ({
    prefKey,
    prefValue,
  }: {
    prefKey: string;
    prefValue: string | boolean;
  }) => {
    container.config.setPrefKey(prefKey, prefValue);
    container.config.saveSync();
    return true;
  };
}

/**
 * Check if a role matches the application role preference
 */
export function createMatchRoleHandler(container: AppContainer) {
  return async ({ role }: { role: string }) => {
    return role === container.config.prefs.applicationRole;
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
 */
export function createToggleExperimentalFeaturesHandler(container: AppContainer) {
  return async ({ enabled }: { enabled: boolean }) => {
    container.config.setExperimentalFeatures(enabled);
    await container.config.save();

    // Rebuild menu with new state
    container.adapters.menu.createMainMenu();

    return true;
  };
}

/**
 * Toggle partial cache
 */
export function createTogglePartialCacheHandler(container: AppContainer) {
  return async ({ enabled }: { enabled: boolean }) => {
    container.config.setDisablePartialCache(enabled);
    await container.config.save();

    // Rebuild menu with new state
    container.adapters.menu.createMainMenu();

    return true;
  };
}

/**
 * Toggle Hugo serve draft mode
 */
export function createToggleDraftModeHandler(container: AppContainer) {
  return async ({ enabled }: { enabled: boolean }) => {
    container.config.setHugoServeDraftMode(enabled);
    await container.config.save();

    // Rebuild menu with new state
    container.adapters.menu.createMainMenu();

    return true;
  };
}

/**
 * Toggle auto Hugo serve
 */
export function createToggleAutoHugoServeHandler(container: AppContainer) {
  return async ({ enabled }: { enabled: boolean }) => {
    container.config.setDevDisableAutoHugoServe(enabled);
    await container.config.save();

    // Rebuild menu with new state
    container.adapters.menu.createMainMenu();

    return true;
  };
}

/**
 * Change application role
 */
export function createChangeApplicationRoleHandler(container: AppContainer) {
  return async ({ role }: { role: string }) => {
    container.config.setPrefKey('applicationRole', role);
    await container.config.save();

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
    };
  };
}

// =============================================================================
// Unified Configuration System Handlers (New Architecture)
// =============================================================================

/**
 * Get a resolved preference value with layered resolution
 * Returns the effective value after applying all layers (app-default < instance-default < user < instance-forced)
 */
export function createGetEffectivePreferenceHandler(container: AppContainer) {
  return async ({ prefKey }: { prefKey: string }) => {
    // Use resolvePreference to get full metadata including source and locked status
    const resolved = container.unifiedConfig.resolvePreference(prefKey as keyof import('@quiqr/types').UserPreferences);
    return {
      value: resolved.value,
      source: resolved.source,
      locked: resolved.locked,
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
 * Will fail if the preference is locked by instance-forced settings
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
 * Check if a preference is locked by instance-forced settings
 */
export function createIsPreferenceLockedHandler(container: AppContainer) {
  return async ({ prefKey }: { prefKey: string }) => {
    return container.unifiedConfig.isPreferenceLocked(prefKey);
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
    // Cast path to valid InstanceSettings key - frontend is responsible for valid paths
    return container.unifiedConfig.getInstanceSetting(path as keyof import('@quiqr/types').InstanceSettings);
  };
}

/**
 * Update instance settings (partial update)
 */
export function createUpdateInstanceSettingsHandler(container: AppContainer) {
  return async ({ settings }: { settings: Record<string, unknown> }) => {
    await container.unifiedConfig.updateInstanceSettings(settings);
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
    isPreferenceLocked: createIsPreferenceLockedHandler(container),
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
  };
}
