/**
 * Import API Handlers
 *
 * Handles importing sites from various sources (git repositories, local directories).
 * Note: ZIP-based import (importSiteAction) is in site-handlers.ts.
 */

import type { AppContainer } from '../../config/container.js';
import type { HugoConfigFormat } from '../../hugo/hugo-utils.js';

export function createImportSiteFromPrivateGitRepoHandler(container: AppContainer) {
  return async ({
    gitBaseUrl,
    gitOrg,
    gitRepo,
    privKey,
    gitEmail,
    saveSyncTarget,
    siteName,
    protocol = 'ssh',
    sshPort = 22,
  }: {
    gitBaseUrl: string;
    gitOrg: string;
    gitRepo: string;
    privKey: string;
    gitEmail: string;
    saveSyncTarget: boolean;
    siteName: string;
    protocol?: 'ssh' | 'https';
    sshPort?: number;
  }) => {
    const siteKey = await container.gitImporter.importSiteFromPrivateGitRepo(
      gitBaseUrl,
      gitOrg,
      gitRepo,
      privKey,
      gitEmail,
      saveSyncTarget,
      siteName,
      protocol,
      sshPort
    );
    // Invalidate cache so the new site appears in the list
    container.configurationProvider.invalidateCache();
    return siteKey;
  };
}

export function createImportSiteFromPublicGitUrlHandler(container: AppContainer) {
  return async ({ siteName, url }: { siteName: string; url: string }) => {
    const siteKey = await container.gitImporter.importSiteFromPublicGitUrl(url, siteName);
    // Invalidate cache so the new site appears in the list
    container.configurationProvider.invalidateCache();
    return siteKey;
  };
}

export function createNewSiteFromPublicHugoThemeUrlHandler(container: AppContainer) {
  return async ({
    siteName,
    url,
    themeInfo,
    hugoVersion,
  }: {
    siteName: string;
    url: string;
    themeInfo: any;
    hugoVersion: string;
  }) => {
    const siteKey = await container.gitImporter.newSiteFromPublicHugoThemeUrl(
      url,
      siteName,
      themeInfo,
      hugoVersion
    );
    // Invalidate cache so the new site appears in the list
    container.configurationProvider.invalidateCache();
    return siteKey;
  };
}

export function createNewSiteFromLocalDirectoryHandler(container: AppContainer) {
  return async ({
    siteName,
    directory,
    generateQuiqrModel,
    hugoVersion,
  }: {
    siteName: string;
    directory: string;
    generateQuiqrModel: boolean;
    hugoVersion: string;
  }) => {
    const siteKey = await container.folderImporter.newSiteFromLocalDirectory(
      directory,
      siteName,
      generateQuiqrModel,
      hugoVersion
    );
    // Invalidate cache so the new site appears in the list
    container.configurationProvider.invalidateCache();
    return siteKey;
  };
}

export function createNewSiteFromScratchHandler(container: AppContainer) {
  return async ({
    siteName,
    hugoVersion,
    configFormat,
  }: {
    siteName: string;
    hugoVersion: string;
    configFormat: HugoConfigFormat;
  }) => {
    const siteKey = await container.libraryService.createNewHugoQuiqrSite(
      siteName,
      hugoVersion,
      configFormat
    );
    // Invalidate cache so the new site appears in the list
    container.configurationProvider.invalidateCache();
    return siteKey;
  };
}

export function createQuiqrGitRepoShowHandler(container: AppContainer) {
  return async ({ url }: { url: string }) => {
    return await container.embgit.repo_show_quiqrsite(url);
  };
}

export function createHugothemeGitRepoShowHandler(container: AppContainer) {
  return async ({ url }: { url: string }) => {
    return await container.embgit.repo_show_hugotheme(url);
  };
}

export function createHugositeDirectoryShowHandler(container: AppContainer) {
  return async ({ folder }: { folder: string }) => {
    return await container.folderImporter.siteDirectoryInspect(folder);
  };
}

export function createImportHandlers(container: AppContainer) {
  return {
    // Note: importSiteAction (ZIP import) is in site-handlers.ts
    importSiteFromPrivateGitRepo: createImportSiteFromPrivateGitRepoHandler(container),
    importSiteFromPublicGitUrl: createImportSiteFromPublicGitUrlHandler(container),
    newSiteFromPublicHugoThemeUrl: createNewSiteFromPublicHugoThemeUrlHandler(container),
    newSiteFromLocalDirectory: createNewSiteFromLocalDirectoryHandler(container),
    newSiteFromScratch: createNewSiteFromScratchHandler(container),
    quiqr_git_repo_show: createQuiqrGitRepoShowHandler(container),
    hugotheme_git_repo_show: createHugothemeGitRepoShowHandler(container),
    hugosite_dir_show: createHugositeDirectoryShowHandler(container),
  };
}
