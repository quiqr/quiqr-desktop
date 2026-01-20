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
import { HugoThemeInfo, hugoConfigSchema, type HugoConfig } from '@quiqr/types';

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
   * Build a Git URL from components
   * @param baseUrl - The Git host, may include port for HTTPS (e.g., 'github.com', 'localhost:3000')
   * @param org - The organization or username
   * @param repo - The repository name
   * @param protocol - 'ssh' or 'https' (defaults to 'ssh')
   * @param sshPort - SSH port (defaults to 22, only used for SSH protocol)
   */
  private buildGitUrl(
    baseUrl: string,
    org: string,
    repo: string,
    protocol: 'ssh' | 'https' = 'ssh',
    sshPort: number = 22
  ): string {
    // Ensure repo ends with .git
    const repoWithGit = repo.endsWith('.git') ? repo : `${repo}.git`;

    if (protocol === 'ssh') {
      // Extract host without port for SSH (port is specified separately)
      const host = baseUrl.split(':')[0];
      if (sshPort === 22) {
        // Standard SSH format: git@host:org/repo.git
        return `git@${host}:${org}/${repoWithGit}`;
      } else {
        // Non-standard port SSH format: ssh://git@host:port/org/repo.git
        return `ssh://git@${host}:${sshPort}/${org}/${repoWithGit}`;
      }
    } else {
      // HTTPS format: https://host:port/org/repo.git
      // Use http for localhost, https otherwise
      const isLocalhost = baseUrl.startsWith('localhost') || baseUrl.startsWith('127.0.0.1');
      const scheme = isLocalhost ? 'http' : 'https';
      return `${scheme}://${baseUrl}/${org}/${repoWithGit}`;
    }
  }

  /**
   * Import a site from a private git repository
   * @param gitBaseUrl - The Git host, may include port for HTTPS (e.g., 'github.com', 'localhost:3000')
   * @param gitOrg - The organization or username
   * @param gitRepo - The repository name
   * @param privKey - SSH private key for authentication
   * @param gitEmail - Email for Git commits
   * @param saveSyncTarget - Whether to save the sync configuration
   * @param siteName - Name for the imported site
   * @param protocol - 'ssh' or 'https' (defaults to 'ssh')
   * @param sshPort - SSH port (defaults to 22, only used for SSH protocol)
   * @param gitProvider - The git provider type for CI configuration (defaults to 'generic')
   */
  async importSiteFromPrivateGitRepo(
    gitBaseUrl: string,
    gitOrg: string,
    gitRepo: string,
    privKey: string,
    gitEmail: string,
    saveSyncTarget: boolean,
    siteName: string,
    protocol: 'ssh' | 'https' = 'ssh',
    sshPort: number = 22,
    gitProvider: 'github' | 'gitlab' | 'forgejo' | 'generic' = 'generic'
  ): Promise<string> {
    const url = this.buildGitUrl(gitBaseUrl, gitOrg, gitRepo, protocol, sshPort);
    console.log('Importing from private repo:', url);

    const siteKey = await this.libraryService.createSiteKeyFromName(siteName);
    const tempCloneDir = path.join(this.pathHelper.getTempDir(), 'siteFromGit');

    // Clean up any existing temp directory
    fs.removeSync(tempCloneDir);

    await this.embgit.clonePrivateWithKey(url, tempCloneDir, privKey);

    // Create the site from the cloned directory
    await this.libraryService.createNewSiteWithTempDirAndKey(siteKey, tempCloneDir);

    // Save sync target if requested
    if (saveSyncTarget) {
      const siteConf = await this.libraryService.getSiteConf(siteKey);
      const inkey = `publ-${Math.random()}`;

      // Derive public key from private key
      const deployPublicKey = this.embgit.derivePublicKeyFromPrivate(privKey);

      const publConf = {
        type: 'git' as const,
        gitProvider: gitProvider,
        gitBaseUrl: gitBaseUrl,
        gitProtocol: protocol,
        sshPort: sshPort,
        username: gitOrg,
        email: gitEmail,
        repository: gitRepo,
        branch: 'main',
        deployPrivateKey: privKey,
        deployPublicKey,
        publishScope: 'source' as const,
        keyPairBusy: false,
        overrideBaseURLSwitch: false,
        overrideBaseURL: '',
        setCIWorkflow: false,
      };

      if (!siteConf.publish) {
        siteConf.publish = [];
      }
      siteConf.publish.push({ key: inkey, config: publConf });
      await this.libraryService.writeSiteConf(siteConf, siteKey);
    }

    return siteKey;
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

    // Clone the repository
    await this.embgit.cloneFromPublicUrl(url, tempCloneDir);

    // Create the site from the cloned directory
    await this.libraryService.createNewSiteWithTempDirAndKey(siteKey, tempCloneDir);

    return siteKey;
  }

  /**
   * Create a new site from a public Hugo theme URL
   * Used by "New from Hugo Theme" dialog
   */
  async newSiteFromPublicHugoThemeUrl(
    url: string,
    siteName: string,
    themeInfo: HugoThemeInfo,
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
    let hconfig: HugoConfig | null = null;
    const hugoConfigFilePath = this.pathHelper.hugoConfigFilePath(tempDir);

    if (hugoConfigFilePath) {
      const strData = fs.readFileSync(hugoConfigFilePath, { encoding: 'utf-8' });
      formatProvider = this.formatProviderResolver.resolveForFilePath(hugoConfigFilePath);
      if (formatProvider) {
        const rawData = formatProvider.parse(strData);
        const parseResult = hugoConfigSchema.safeParse(rawData);
        if (parseResult.success) {
          hconfig = parseResult.data;
        }
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
    configBuilder.buildAll('hugo', hugoVersion);

    // Create the site
    await this.libraryService.createNewSiteWithTempDirAndKey(siteKey, tempDir);

    return siteKey;
  }
}
