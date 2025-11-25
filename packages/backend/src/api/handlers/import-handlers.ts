/**
 * Import API Handlers
 *
 * Handles importing sites from various sources.
 * TODO: Implement when import modules are migrated.
 */

import type { AppContainer } from '../../config/container.js';

export function createImportSiteActionHandler(container: AppContainer) {
  return async () => {
    throw new Error('importSiteAction: Not yet implemented - needs pogozipper migration');
  };
}

export function createImportSiteFromPrivateGitRepoHandler(container: AppContainer) {
  return async ({
    gitOrg,
    gitRepo,
    privKey,
    gitEmail,
    saveSyncTarget,
    siteName,
  }: {
    gitOrg: string;
    gitRepo: string;
    privKey: string;
    gitEmail: string;
    saveSyncTarget: boolean;
    siteName: string;
  }) => {
    throw new Error('importSiteFromPrivateGitRepo: Not yet implemented - needs git-importer migration');
  };
}

export function createImportSiteFromPublicGitUrlHandler(container: AppContainer) {
  return async ({ siteName, url }: { siteName: string; url: string }) => {
    throw new Error('importSiteFromPublicGitUrl: Not yet implemented - needs git-importer migration');
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
    throw new Error('newSiteFromPublicHugoThemeUrl: Not yet implemented - needs git-importer migration');
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
    throw new Error('newSiteFromLocalDirectory: Not yet implemented - needs folder-importer migration');
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
    configFormat: string;
  }) => {
    throw new Error('newSiteFromScratch: Not yet implemented - needs LibraryService migration');
  };
}

export function createQuiqrGitRepoShowHandler(container: AppContainer) {
  return async ({ url }: { url: string }) => {
    throw new Error('quiqr_git_repo_show: Not yet implemented - needs Embgit migration');
  };
}

export function createHugothemeGitRepoShowHandler(container: AppContainer) {
  return async ({ url }: { url: string }) => {
    throw new Error('hugotheme_git_repo_show: Not yet implemented - needs Embgit migration');
  };
}

export function createHugositeDirectoryShowHandler(container: AppContainer) {
  return async ({ folder }: { folder: string }) => {
    throw new Error('hugosite_dir_show: Not yet implemented - needs folder-importer migration');
  };
}

export function createImportHandlers(container: AppContainer) {
  return {
    importSiteAction: createImportSiteActionHandler(container),
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
