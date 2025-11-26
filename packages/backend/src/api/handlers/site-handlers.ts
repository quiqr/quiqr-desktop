/**
 * Site Management API Handlers
 *
 * Handles site configuration and management.
 */

import path from 'path';
import type { AppContainer } from '../../config/container.js';
import type { Configurations } from '@quiqr/types';
import { platform } from 'os';
import fs from 'fs';

export function createGetConfigurationsHandler(container: AppContainer) {
  return async (options?: { invalidateCache?: boolean }): Promise<Configurations> => {
    return container.configurationProvider.getConfigurations(options || {});
  };
}

export function createGetSiteConfigHandler(container: AppContainer) {
  return async ({ siteKey }: { siteKey: string }) => {
    const siteConfig = await container.configurationProvider.getSiteConfig(siteKey);
    if (!siteConfig) {
      throw new Error(`Site not found: ${siteKey}`);
    }
    return siteConfig;
  };
}

export function createCheckFreeSiteNameHandler(container: AppContainer) {
  return async ({ proposedSiteName }: { proposedSiteName: string }) => {
    // Check if name is already in use
    const isDuplicate = await container.libraryService.checkDuplicateSiteConfAttrStringValue(
      'name',
      proposedSiteName
    );
    return !isDuplicate; // Return true if name is free
  };
}

export function createSaveSiteConfHandler(container: AppContainer) {
  return async ({ siteKey, newConf }: { siteKey: string; newConf: Record<string, unknown> }) => {
    await container.libraryService.writeSiteConf(newConf, siteKey);
    // Invalidate cache so next read gets fresh data
    container.configurationProvider.invalidateCache();
    return true;
  };
}

export function createCopySiteHandler(container: AppContainer) {
  return async ({ siteKey, newConf }: { siteKey: string; newConf: any }) => {
    throw new Error('copySite: Not yet implemented - needs FolderImporter migration');
  };
}

export function createDeleteSiteHandler(container: AppContainer) {
  return async ({ siteKey }: { siteKey: string }) => {
    await container.libraryService.deleteSite(siteKey);
    // Invalidate cache so next read gets fresh data
    container.configurationProvider.invalidateCache();
    return true;
  };
}

export function createGetFilteredHugoVersionsHandler(container: AppContainer) {
  return async () => {
    // throw new Error('getFilteredHugoVersions: Not yet implemented');
    // TODO remove stub args
    const args = {
      platform: 'linux' as const,
      isPackaged: true
    }
    const jsonFile = path.join(container.pathHelper.getApplicationResourcesDir(args), "all", "filteredHugoVersions.json");
    let filteredVersions = ["v0.100.2"];

    if (fs.existsSync(jsonFile)) {
      const jsonContent = await fs.readFileSync(jsonFile, { encoding: 'utf8', flag: 'r' })
      filteredVersions = JSON.parse(jsonContent);
    }

    return filteredVersions;
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
