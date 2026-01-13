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
    const configMap: Record<string, any> = {
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
    prefValue: any;
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

/**
 * Create all config-related handlers
 */
export function createConfigHandlers(container: AppContainer) {
  return {
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
  };
}
