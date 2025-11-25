/**
 * Site Management API Handlers
 *
 * Handles site configuration and management.
 * TODO: Implement when SiteService and LibraryService are migrated.
 */

import type { AppContainer } from '../../config/container.js';

export function createGetConfigurationsHandler(container: AppContainer) {
  return async (options: any) => {
    throw new Error('getConfigurations: Not yet implemented - needs configuration-data-provider migration');
  };
}

export function createGetSiteConfigHandler(container: AppContainer) {
  return async ({ siteKey }: { siteKey: string }) => {
    throw new Error('getSiteConfig: Not yet implemented - needs SiteService migration');
  };
}

export function createCheckFreeSiteNameHandler(container: AppContainer) {
  return async ({ proposedSiteName }: { proposedSiteName: string }) => {
    throw new Error('checkFreeSiteName: Not yet implemented - needs LibraryService migration');
  };
}

export function createSaveSiteConfHandler(container: AppContainer) {
  return async ({ siteKey, newConf }: { siteKey: string; newConf: any }) => {
    throw new Error('saveSiteConf: Not yet implemented - needs LibraryService migration');
  };
}

export function createCopySiteHandler(container: AppContainer) {
  return async ({ siteKey, newConf }: { siteKey: string; newConf: any }) => {
    throw new Error('copySite: Not yet implemented - needs FolderImporter migration');
  };
}

export function createDeleteSiteHandler(container: AppContainer) {
  return async ({ siteKey }: { siteKey: string }) => {
    throw new Error('deleteSite: Not yet implemented - needs LibraryService migration');
  };
}

export function createGetFilteredHugoVersionsHandler(container: AppContainer) {
  return async () => {
    throw new Error('getFilteredHugoVersions: Not yet implemented');
  };
}

export function createSiteHandlers(container: AppContainer) {
  return {
    getConfigurations: createGetConfigurationsHandler(container),
    getSiteConfig: createGetSiteConfigHandler(container),
    checkFreeSiteName: createCheckFreeSiteNameHandler(container),
    saveSiteConf: createSaveSiteConfHandler(container),
    copySite: createCopySiteHandler(container),
    deleteSite: createDeleteSiteHandler(container),
    getFilteredHugoVersions: createGetFilteredHugoVersionsHandler(container),
  };
}
