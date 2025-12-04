/**
 * Git Sync Service
 *
 * Universal git-based sync that works with any git provider (GitHub, GitLab, Forgejo, etc.).
 * Handles git operations and delegates CI configuration to provider-specific helpers.
 */

import path from 'path';
import fs from 'fs-extra';
import type { GitPublishConf, GitProvider } from '@quiqr/types';
import type { SyncServiceDependencies } from '../sync-factory.js';
import { EmbgitSyncBase, type BaseSyncConfig } from '../embgit-sync-base.js';
import { CIConfigurator, getCIConfigurator } from '../ci-configurators/index.js';

/**
 * Git sync configuration (extends base with git-specific fields)
 */
export interface GitSyncConfig extends BaseSyncConfig {
  type: 'git';
  gitProvider: GitProvider;
  gitBaseUrl: string;
  gitProtocol: 'ssh' | 'https';
  sshPort?: number;
  username: string;
  repository: string;
  setCIWorkflow?: boolean;
}

/**
 * GitSync - Universal git-based sync for any provider
 */
export class GitSync extends EmbgitSyncBase {
  protected override config: GitSyncConfig;
  protected ciConfigurator: CIConfigurator | null;

  constructor(config: GitPublishConf, siteKey: string, dependencies: SyncServiceDependencies) {
    // Pass config to parent - it will be cast to BaseSyncConfig
    super(config, siteKey, dependencies);
    this.config = config as unknown as GitSyncConfig;
    this.ciConfigurator = getCIConfigurator(this.config.gitProvider);
  }

  /**
   * Build a Git URL from configuration
   */
  getGitUrl(): string {
    return this.buildGitUrl(
      this.config.gitBaseUrl,
      this.config.username,
      this.config.repository,
      this.config.gitProtocol,
      this.config.sshPort
    );
  }

  /**
   * Build a Git URL from components
   * @param baseUrl - The Git host, may include port for HTTPS (e.g., 'github.com', 'localhost:3000')
   * @param org - The organization or username
   * @param repo - The repository name
   * @param protocol - 'ssh' or 'https' (defaults to 'ssh')
   * @param sshPort - SSH port (defaults to 22, only used for SSH protocol)
   */
  protected buildGitUrl(
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
   * Get the log prefix for console output
   */
  getLogPrefix(): string {
    return `GIT[${this.config.gitProvider.toUpperCase()}]`;
  }

  /**
   * Override step 2 for source scope to use provider-specific CI
   */
  protected override async publishStep2PrepareDircontentsSource(fullDestinationPath: string): Promise<boolean> {
    if (!this.fromPath) {
      throw new Error('Last build directory is not set');
    }
    await this.syncSourceToDestination(this.fromPath, fullDestinationPath, 'all');

    // Use provider-specific CI configuration
    if (this.config.publishScope === 'source' && this.config.setCIWorkflow && this.ciConfigurator) {
      await this.ciConfigurator.writeWorkflow(fullDestinationPath, {
        branch: this.config.branch || 'main',
        overrideBaseURL: this.config.overrideBaseURLSwitch ? this.config.overrideBaseURL : undefined,
      });
    }

    if (this.config.CNAMESwitch && this.config.CNAME) {
      await this.githubCname(fullDestinationPath);
    }

    await fs.ensureDir(path.join(fullDestinationPath, 'static'));

    this.outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  /**
   * Override hard push to use provider-specific CI
   */
  protected override async hardPush(): Promise<boolean> {
    const tmpDir = this.pathHelper.getTempDir();
    await this.ensureSyncDirEmpty(tmpDir);

    const tmpCloneDir = path.join(tmpDir, 'tmpclone');
    await fs.mkdir(tmpCloneDir);

    const tmpKeypathPrivate = await this.tempCreatePrivateKey();

    const parentPath = path.join(this.pathHelper.getRoot(), 'sites', this.siteKey, 'githubSyncRepo');
    await this.ensureSyncDirEmpty(parentPath);

    this.outputConsole.appendLine(`START ${this.getLogPrefix()} CHECKOUT`);
    this.outputConsole.appendLine('-----------------');
    this.outputConsole.appendLine('  git url:             ' + this.getGitUrl());
    this.outputConsole.appendLine('  private key path:    ' + tmpKeypathPrivate);
    this.outputConsole.appendLine('  destination path:    ' + this.fullDestinationPath());
    this.outputConsole.appendLine('');
    this.outputConsole.appendLine('  repository:          ' + this.config.repository);
    this.outputConsole.appendLine('  branch:              ' + this.config.branch);
    this.outputConsole.appendLine('  email:               ' + this.config.email);
    this.outputConsole.appendLine('-----------------');
    this.outputConsole.appendLine('');

    this.sendProgress('Getting latest remote commit history..', 20);
    await this.embgit.clonePrivateWithKey(this.getGitUrl(), tmpCloneDir, this.config.deployPrivateKey!);

    this.sendProgress('Copying commit history to destination directory', 30);
    await fs.copy(path.join(tmpCloneDir, '.git'), path.join(this.fullDestinationPath(), '.git'));

    this.sendProgress('Copying site files to git destination directory', 40);
    const currentSitePath = await this.getCurrentSitePath();
    const filter = this.createIgnoreFilter(currentSitePath);
    await fs.copy(currentSitePath, this.fullDestinationPath(), { filter });

    // Use provider-specific CI configuration
    if (this.config.publishScope === 'source' && this.config.setCIWorkflow && this.ciConfigurator) {
      await this.ciConfigurator.writeWorkflow(this.fullDestinationPath(), {
        branch: this.config.branch || 'main',
        overrideBaseURL: this.config.overrideBaseURLSwitch ? this.config.overrideBaseURL : undefined,
      });
    }

    await this.publishStep3AddCommitPush(tmpKeypathPrivate, this.fullDestinationPath());

    return true;
  }
}
