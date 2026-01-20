/**
 * Site Management API Handlers
 *
 * Handles site configuration and management.
 */

import path from 'path';
import type { AppContainer } from '../../config/container.js';
import type { Configurations, SiteConfig } from '@quiqr/types';
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
  return async ({ siteKey, newConf }: { siteKey: string; newConf: SiteConfig }) => {
    await container.libraryService.writeSiteConf(newConf, siteKey);
    // Invalidate cache so next read gets fresh data
    container.configurationProvider.invalidateCache();
    return true;
  };
}

export function createCopySiteHandler(container: AppContainer) {
  return async ({ siteKey, newConf }: { siteKey: string; newConf: SiteConfig }) => {
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
    const sourcePath = path.isAbsolute(sourceSiteConfig.source.path)
      ? sourceSiteConfig.source.path
      : path.join(siteRoot, sourceSiteConfig.source.path);

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

/**
 * @deprecated Use createGetFilteredSSGVersionsHandler instead
 */
export function createGetFilteredHugoVersionsHandler(container: AppContainer) {
  return async () => {
    const environmentInfo = container.workspaceConfigProvider.getEnvironmentInfo();

    const jsonFile = path.join(container.pathHelper.getApplicationResourcesDir(environmentInfo), "all", "filteredHugoVersions.json");
    let filteredVersions = ["v0.100.2"];

    if (fs.existsSync(jsonFile)) {
      const jsonContent = fs.readFileSync(jsonFile, { encoding: 'utf8', flag: 'r' })
      filteredVersions = JSON.parse(jsonContent);
    }

    return filteredVersions;
  };
}

/**
 * Get filtered SSG versions for a specific SSG type
 */
export function createGetFilteredSSGVersionsHandler(container: AppContainer) {
  return async ({ ssgType }: { ssgType: string }) => {
    const environmentInfo = container.workspaceConfigProvider.getEnvironmentInfo();

    // Look for ssgType-specific version file (e.g., filteredHugoVersions.json, filteredEleventyVersions.json)
    const ssgTypeCapitalized = ssgType.charAt(0).toUpperCase() + ssgType.slice(1);
    const jsonFile = path.join(
      container.pathHelper.getApplicationResourcesDir(environmentInfo),
      "all",
      `filtered${ssgTypeCapitalized}Versions.json`
    );

    // Default versions based on SSG type
    const defaultVersions: Record<string, string[]> = {
      hugo: ["v0.100.2"],
      eleventy: ["2.0.1"],
    };

    let filteredVersions = defaultVersions[ssgType.toLowerCase()] || [];

    if (fs.existsSync(jsonFile)) {
      const jsonContent = fs.readFileSync(jsonFile, { encoding: 'utf8', flag: 'r' });
      filteredVersions = JSON.parse(jsonContent);
    }

    return { ssgType, versions: filteredVersions };
  };
}

/**
 * Import site from a .pogosite ZIP file
 */
export function createImportSiteActionHandler(container: AppContainer) {
  return async (params?: { filePath?: string }) => {
    await container.pogozipper.importSite({
      filePath: params?.filePath,
      autoConfirm: false,
    });
    // Invalidate cache so next read gets fresh data
    container.configurationProvider.invalidateCache();
  };
}

/**
 * Export a site to a .pogosite ZIP file
 */
export function createExportSiteHandler(container: AppContainer) {
  return async ({ siteKey, newSiteKey }: { siteKey: string; newSiteKey?: string }) => {
    const siteConfig = await container.libraryService.getSiteConf(siteKey);
    if (!siteConfig.source?.path) {
      throw new Error(`Invalid source configuration for siteKey: ${siteKey}`);
    }

    const siteRoot = container.pathHelper.getSiteRoot(siteKey);
    if (!siteRoot) {
      throw new Error(`Could not get site root for siteKey: ${siteKey}`);
    }
    const sitePath = path.isAbsolute(siteConfig.source.path)
      ? siteConfig.source.path
      : path.join(siteRoot, siteConfig.source.path);

    await container.pogozipper.exportSite({
      siteKey,
      sitePath,
      newSiteKey,
    });
  };
}

/**
 * Export a theme to a .pogotheme ZIP file
 */
export function createExportThemeHandler(container: AppContainer) {
  return async ({ siteKey }: { siteKey: string }) => {
    const siteConfig = await container.libraryService.getSiteConf(siteKey);
    if (!siteConfig.source?.path) {
      throw new Error(`Invalid source configuration for siteKey: ${siteKey}`);
    }

    const siteRoot = container.pathHelper.getSiteRoot(siteKey);
    if (!siteRoot) {
      throw new Error(`Could not get site root for siteKey: ${siteKey}`);
    }
    const sitePath = path.isAbsolute(siteConfig.source.path)
      ? siteConfig.source.path
      : path.join(siteRoot, siteConfig.source.path);

    await container.pogozipper.exportTheme({
      siteKey,
      sitePath,
    });
  };
}

/**
 * Import a theme from a .pogotheme ZIP file
 */
export function createImportThemeHandler(container: AppContainer) {
  return async ({ siteKey, filePath }: { siteKey: string; filePath?: string }) => {
    const siteConfig = await container.libraryService.getSiteConf(siteKey);
    if (!siteConfig.source?.path) {
      throw new Error(`Invalid source configuration for siteKey: ${siteKey}`);
    }

    const siteRoot = container.pathHelper.getSiteRoot(siteKey);
    if (!siteRoot) {
      throw new Error(`Could not get site root for siteKey: ${siteKey}`);
    }
    const sitePath = path.isAbsolute(siteConfig.source.path)
      ? siteConfig.source.path
      : path.join(siteRoot, siteConfig.source.path);

    await container.pogozipper.importTheme({
      siteKey,
      sitePath,
      filePath,
    });
  };
}

/**
 * Export content to a .pogocontent ZIP file
 */
export function createExportContentHandler(container: AppContainer) {
  return async ({ siteKey }: { siteKey: string }) => {
    const siteConfig = await container.libraryService.getSiteConf(siteKey);
    if (!siteConfig.source?.path) {
      throw new Error(`Invalid source configuration for siteKey: ${siteKey}`);
    }

    const siteRoot = container.pathHelper.getSiteRoot(siteKey);
    if (!siteRoot) {
      throw new Error(`Could not get site root for siteKey: ${siteKey}`);
    }
    const sitePath = path.isAbsolute(siteConfig.source.path)
      ? siteConfig.source.path
      : path.join(siteRoot, siteConfig.source.path);

    await container.pogozipper.exportContent({
      siteKey,
      sitePath,
    });
  };
}

/**
 * Import content from a .pogocontent ZIP file
 */
export function createImportContentHandler(container: AppContainer) {
  return async ({ siteKey, filePath }: { siteKey: string; filePath?: string }) => {
    const siteConfig = await container.libraryService.getSiteConf(siteKey);
    if (!siteConfig.source?.path) {
      throw new Error(`Invalid source configuration for siteKey: ${siteKey}`);
    }

    const siteRoot = container.pathHelper.getSiteRoot(siteKey);
    if (!siteRoot) {
      throw new Error(`Could not get site root for siteKey: ${siteKey}`);
    }
    const sitePath = path.isAbsolute(siteConfig.source.path)
      ? siteConfig.source.path
      : path.join(siteRoot, siteConfig.source.path);

    await container.pogozipper.importContent({
      siteKey,
      sitePath,
      filePath,
    });
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
    getFilteredSSGVersions: createGetFilteredSSGVersionsHandler(container),
    // ZIP import/export handlers
    importSiteAction: createImportSiteActionHandler(container),
    exportSite: createExportSiteHandler(container),
    exportTheme: createExportThemeHandler(container),
    importTheme: createImportThemeHandler(container),
    exportContent: createExportContentHandler(container),
    importContent: createImportContentHandler(container),
  };
}
