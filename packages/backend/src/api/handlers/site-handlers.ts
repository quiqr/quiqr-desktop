/**
 * Site Management API Handlers
 *
 * Handles site configuration and management.
 */

import path from 'path';
import type { AppContainer } from '../../config/container.js';
import type { Configurations } from '@quiqr/types';
import fs from 'fs-extra';

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
    // Get the source site configuration
    const sourceSiteConfig = await container.libraryService.getSiteConf(siteKey);

    // Validate source configuration
    if (!sourceSiteConfig.source?.path) {
      throw new Error(`Invalid source configuration for siteKey: ${siteKey}`);
    }

    // Get the source site's source path
    const siteRoot = container.pathHelper.getSiteRoot(siteKey);
    if (!siteRoot) {
      throw new Error(`Could not get site root for siteKey: ${siteKey}`);
    }
    const sourcePath = path.join(siteRoot, sourceSiteConfig.source.path);

    // Validate source path exists
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    // Create a new site key from the new site name
    const newSiteName = newConf.name || sourceSiteConfig.name + ' (copy)';
    const newSiteKey = await container.libraryService.createSiteKeyFromName(newSiteName);

    // Copy source directory to temp location
    const tempCopyDir = path.join(container.pathHelper.getTempDir(), 'copySite-' + newSiteKey);
    await fs.copy(sourcePath, tempCopyDir);

    // Create the new site from the temp directory
    await container.libraryService.createNewSiteWithTempDirAndKey(newSiteKey, tempCopyDir);

    // Update the site config with the new name and any other properties
    const updatedConf = {
      ...sourceSiteConfig,
      ...newConf,
      key: newSiteKey,
      name: newSiteName,
    };
    await container.libraryService.writeSiteConf(updatedConf, newSiteKey);

    // Invalidate cache so next read gets fresh data
    container.configurationProvider.invalidateCache();

    return true;
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
      const jsonContent = fs.readFileSync(jsonFile, { encoding: 'utf8', flag: 'r' })
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
