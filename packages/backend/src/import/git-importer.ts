/**
 * Git Importer
 *
 * Imports Hugo sites from git repositories (public and private).
 */

import fs from 'fs-extra';
import path from 'path';
import type { PathHelper } from '../utils/path-helper.js';
import type { FormatProviderResolver } from '../utils/format-provider-resolver.js';
import type { LibraryService } from '../services/library/library-service.js';
import type { Embgit } from '../embgit/embgit.js';
import { InitialWorkspaceConfigBuilder } from '../services/workspace/initial-workspace-config-builder.js';

/**
 * Theme information from repository inspection
 */
export interface ThemeInfo {
  Name?: string;
  ExampleSite?: boolean;
  [key: string]: any;
}

/**
 * GitImporter - Imports sites from git repositories
 */
export class GitImporter {
  private embgit: Embgit;
  private pathHelper: PathHelper;
  private formatProviderResolver: FormatProviderResolver;
  private libraryService: LibraryService;

  constructor(
    embgit: Embgit,
    pathHelper: PathHelper,
    formatProviderResolver: FormatProviderResolver,
    libraryService: LibraryService
  ) {
    this.embgit = embgit;
    this.pathHelper = pathHelper;
    this.formatProviderResolver = formatProviderResolver;
    this.libraryService = libraryService;
  }

  /**
   * Import a site from a private git repository
   */
  async importSiteFromPrivateGitRepo(
    gitOrg: string,
    gitRepo: string,
    privKey: string,
    gitEmail: string,
    saveSyncTarget: boolean,
    siteName: string
  ): Promise<string> {
    // TODO: Currently only supports GitHub
    const url = `git@github.com:${gitOrg}/${gitRepo}.git`;
    console.log('Importing from private repo:', url);

    const siteKey = await this.libraryService.createSiteKeyFromName(siteName);
    const tempCloneDir = path.join(this.pathHelper.getTempDir(), 'siteFromGit');

    // Clean up any existing temp directory
    fs.removeSync(tempCloneDir);

    try {
      // Clone the repository
      await this.embgit.clonePrivateWithKey(url, tempCloneDir, privKey);

      // Create the site from the cloned directory
      await this.libraryService.createNewSiteWithTempDirAndKey(siteKey, tempCloneDir);

      // Save sync target if requested
      if (saveSyncTarget) {
        const siteConf = await this.libraryService.getSiteConf(siteKey);
        const inkey = `publ-${Math.random()}`;

        const publConf = {
          type: 'github' as const,
          username: gitOrg,
          email: gitEmail,
          repository: gitRepo,
          branch: 'main',
          deployPrivateKey: privKey,
          deployPublicKey: 'SET BUT UNKNOWN',
          publishScope: 'source' as const,
          setGitHubActions: false,
          keyPairBusy: false,
          overrideBaseURLSwitch: false,
          overrideBaseURL: '',
        };

        if (!siteConf.publish) {
          siteConf.publish = [];
        }
        siteConf.publish.push({ key: inkey, config: publConf });
        await this.libraryService.writeSiteConf(siteConf, siteKey);
      }

      return siteKey;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import a site from a public git URL
   * Used by "Import from Git URL" dialog
   */
  async importSiteFromPublicGitUrl(url: string, siteName: string): Promise<string> {
    const siteKey = await this.libraryService.createSiteKeyFromName(siteName);
    const tempCloneDir = path.join(this.pathHelper.getTempDir(), 'siteFromGit');

    // Clean up any existing temp directory
    fs.removeSync(tempCloneDir);

    try {
      // Clone the repository
      await this.embgit.cloneFromPublicUrl(url, tempCloneDir);

      // Create the site from the cloned directory
      await this.libraryService.createNewSiteWithTempDirAndKey(siteKey, tempCloneDir);

      return siteKey;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new site from a public Hugo theme URL
   * Used by "New from Hugo Theme" dialog
   */
  async newSiteFromPublicHugoThemeUrl(
    url: string,
    siteName: string,
    themeInfo: ThemeInfo,
    hugoVersion: string
  ): Promise<string> {
    if (!themeInfo.Name) {
      throw new Error('Theme name is required');
    }

    const themeName = themeInfo.Name.replace(/\s/g, '-').toLowerCase();
    const siteKey = await this.libraryService.createSiteKeyFromName(siteName);
    const tempDir = path.join(this.pathHelper.getTempDir(), 'siteFromTheme');
    const tempCloneThemeDir = path.join(tempDir, 'themes', themeName);

    // Clean up any existing temp directory
    fs.removeSync(tempDir);
    await fs.ensureDir(tempDir);
    await fs.ensureDir(path.join(tempDir, 'themes'));

    try {
      // Clone the theme repository
      await this.embgit.cloneFromPublicUrl(url, tempCloneThemeDir);

      // Copy exampleSite if it exists
      if (themeInfo.ExampleSite) {
        const exampleSitePath = path.join(tempCloneThemeDir, 'exampleSite');
        if (fs.existsSync(exampleSitePath)) {
          fs.copySync(exampleSitePath, tempDir);
        }
      }

      // Process Hugo config
      let formatProvider;
      let hconfig: any = null;
      const hugoConfigFilePath = this.pathHelper.hugoConfigFilePath(tempDir);

      if (hugoConfigFilePath) {
        const strData = fs.readFileSync(hugoConfigFilePath, { encoding: 'utf-8' });
        formatProvider = this.formatProviderResolver.resolveForFilePath(hugoConfigFilePath);
        if (formatProvider) {
          hconfig = formatProvider.parse(strData);
        }
      }

      // Set theme and baseURL
      if (!hconfig) {
        hconfig = {};
      }
      hconfig.theme = themeName;
      hconfig.baseURL = '/';

      // Write updated config
      if (hugoConfigFilePath && formatProvider) {
        fs.writeFileSync(hugoConfigFilePath, formatProvider.dump(hconfig));
      }

      // Build Quiqr model
      const configBuilder = new InitialWorkspaceConfigBuilder(
        tempDir,
        this.formatProviderResolver,
        this.pathHelper
      );
      configBuilder.buildAll(hugoVersion);

      // Create the site
      await this.libraryService.createNewSiteWithTempDirAndKey(siteKey, tempDir);

      return siteKey;
    } catch (error) {
      throw error;
    }
  }
}
