/**
 * Embgit Sync Base Class
 *
 * Shared base class for git-based sync services (GitHub, Sysgit).
 * Contains all common functionality for clone, push, pull, commit history, etc.
 */

import path from 'path';
import fs from 'fs-extra';
import type { PublConf } from '@quiqr/types';
import type { SyncService, SyncServiceDependencies, SyncProgressCallback } from './sync-factory.js';
import type { Embgit } from '../embgit/embgit.js';
import type { PathHelper } from '../utils/path-helper.js';
import type { OutputConsole, WindowAdapter } from '../adapters/types.js';
import type { ConfigurationDataProvider } from '../services/configuration/index.js';
import { recurForceRemove } from '../utils/file-dir-utils.js';

/**
 * Base configuration shared by GitHub, Sysgit, and Git sync
 */
export interface BaseSyncConfig {
  type: 'github' | 'sysgit' | 'git';
  email?: string;
  username?: string;
  branch?: string;
  repository?: string;
  deployPrivateKey?: string;
  deployPublicKey?: string;
  publishScope?: 'build' | 'source';
  setGitHubActions?: boolean;
  setCIWorkflow?: boolean;
  CNAMESwitch?: boolean;
  CNAME?: string;
  overrideBaseURLSwitch?: boolean;
  overrideBaseURL?: string;
  syncSelection?: 'all' | 'themeandquiqr';
}

/**
 * Commit info returned by history operations
 */
export interface CommitInfo {
  ref: string;
  message?: string;
  author?: string;
  date?: string;
  local?: boolean;
}

/**
 * History result with last refresh time and commit list
 */
export interface HistoryResult {
  lastRefresh: Date;
  commitList: CommitInfo[];
}

/**
 * Abstract base class for embgit-based sync services
 */
export abstract class EmbgitSyncBase implements SyncService {
  protected embgit: Embgit;
  protected pathHelper: PathHelper;
  protected outputConsole: OutputConsole;
  protected windowAdapter: WindowAdapter;
  protected configurationProvider: ConfigurationDataProvider;
  protected progressCallback?: SyncProgressCallback;
  protected config: BaseSyncConfig;
  protected siteKey: string;
  protected fromPath: string | undefined;

  constructor(
    config: PublConf,
    siteKey: string,
    dependencies: SyncServiceDependencies
  ) {
    this.config = config as BaseSyncConfig;
    this.siteKey = siteKey;
    this.embgit = dependencies.embgit;
    this.pathHelper = dependencies.pathHelper;
    this.outputConsole = dependencies.outputConsole;
    this.windowAdapter = dependencies.windowAdapter;
    this.configurationProvider = dependencies.configurationProvider;
    this.progressCallback = dependencies.progressCallback;
    this.fromPath = this.pathHelper.getLastBuildDir();
  }

  /**
   * Get the git URL for the repository.
   * Must be implemented by subclasses.
   */
  abstract getGitUrl(): string;

  /**
   * Get the log prefix for console output.
   * Must be implemented by subclasses.
   */
  abstract getLogPrefix(): string;

  /**
   * Dispatch sync actions
   */
  async actionDispatcher(action: string, parameters?: unknown): Promise<unknown> {
    switch (action) {
      case 'readRemote': {
        const historyRemote = await this.historyRemoteFromCache();
        if (historyRemote) {
          return historyRemote;
        }
        return await this.historyRemote();
      }
      case 'refreshRemote': {
        return await this.historyRemote();
      }
      case 'checkoutRef': {
        const params = parameters as { ref: string };
        return this.checkoutRef(params.ref);
      }
      case 'pullFromRemote': {
        return this.pullFastForwardMerge();
      }
      case 'hardPush': {
        return this.hardPush();
      }
      case 'checkoutLatest': {
        return this.checkoutRef('LATEST');
      }
      case 'pushWithSoftMerge': {
        return this.pushWithSoftMerge();
      }
      default:
        throw new Error(`Action not implemented: ${action}`);
    }
  }

  /**
   * Hard push - force push all files to remote
   */
  protected async hardPush(): Promise<boolean> {
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

    if (this.config.publishScope === 'source') {
      if (this.config.setGitHubActions) {
        await this.githubActionWorkflowSource(this.fullDestinationPath());
      }
    }

    await this.publishStep3AddCommitPush(tmpKeypathPrivate, this.fullDestinationPath());

    return true;
  }

  /**
   * Push with soft merge - clone, copy files, commit, push
   */
  protected async pushWithSoftMerge(): Promise<boolean> {
    const tmpKeypathPrivate = await this.tempCreatePrivateKey();
    const resolvedDest = await this.ensureSyncRepoDir(this.siteKey);
    const fullDestinationPath = path.join(resolvedDest, this.config.repository!);

    this.outputConsole.appendLine(`START ${this.getLogPrefix()} SYNC`);
    this.outputConsole.appendLine('-----------------');
    this.outputConsole.appendLine('  git url:             ' + this.getGitUrl());
    this.outputConsole.appendLine('  private key path:    ' + tmpKeypathPrivate);
    this.outputConsole.appendLine('  destination path:    ' + fullDestinationPath);
    this.outputConsole.appendLine('  from is:             ' + this.fromPath);
    this.outputConsole.appendLine('');
    this.outputConsole.appendLine('  repository:          ' + this.config.repository);
    this.outputConsole.appendLine('  email:               ' + this.config.email);
    this.outputConsole.appendLine('  branch:              ' + this.config.branch);
    this.outputConsole.appendLine('  publishScope:        ' + this.config.publishScope);
    this.outputConsole.appendLine('  set actions:         ' + this.config.setGitHubActions);
    this.outputConsole.appendLine('  override BaseURL:    ' + this.config.overrideBaseURL);
    this.outputConsole.appendLine('-----------------');
    this.outputConsole.appendLine('');

    this.sendProgress('Get remote files..', 20);
    await this.publishStep1InitialClone(tmpKeypathPrivate, this.getGitUrl(), fullDestinationPath);

    this.sendProgress('Prepare files before uploading..', 30);
    if (this.config.publishScope === 'build') {
      await this.publishStep2PrepareDircontentsBuild(fullDestinationPath);
    } else {
      await this.publishStep2PrepareDircontentsSource(fullDestinationPath);
    }

    this.sendProgress('Upload files to remote server..', 70);
    await this.publishStep3AddCommitPush(tmpKeypathPrivate, fullDestinationPath);

    return true;
  }

  /**
   * Pull with fast-forward merge
   */
  protected async pullFastForwardMerge(): Promise<string> {
    const tmpKeypathPrivate = await this.tempCreatePrivateKey();
    this.embgit.setPrivateKeyPath(tmpKeypathPrivate);

    const resolvedDest = path.join(this.pathHelper.getRoot(), 'sites', this.siteKey, 'githubSyncRepo');
    const fullDestinationPath = path.join(resolvedDest, this.config.repository!);
    let syncSelection: 'all' | 'themeandquiqr' = 'all';

    // Check if we need initial clone
    if (!await fs.pathExists(path.join(fullDestinationPath, '.git'))) {
      await this.publishStep1InitialClone(tmpKeypathPrivate, this.getGitUrl(), fullDestinationPath);
    }

    try {
      await this.embgit.reset_hard(fullDestinationPath);

      try {
        await this.embgit.pull(fullDestinationPath);
      } catch (pullError: any) {
        const errorOutput = pullError.stdout?.toString() || pullError.message || '';
        if (errorOutput.includes('already up-to-date')) {
          // Not an error, just no changes
        } else {
          throw pullError;
        }
      }

      const configurations = await this.configurationProvider.getConfigurations({});
      const site = configurations.sites.find((x) => x.key === this.siteKey);

      if (!site || !site.source?.path) {
        throw new Error(`Site not found or invalid source path: ${this.siteKey}`);
      }

      if (this.config.syncSelection && this.config.syncSelection !== 'all') {
        syncSelection = this.config.syncSelection;
      }

      await this.syncSourceToDestination(fullDestinationPath, site.source.path, syncSelection);
      return 'reset-and-pulled-from-remote';
    } catch (err: any) {
      const errorOutput = err.stdout?.toString() || err.message || '';
      if (errorOutput.includes('already up-to-date')) {
        return 'no_changes';
      } else if (errorOutput.includes('non-fast-forward update')) {
        return 'non_fast_forward';
      }
      throw err;
    }
  }

  /**
   * Checkout a specific ref
   */
  protected async checkoutRef(ref: string = 'LATEST'): Promise<boolean> {
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
    this.outputConsole.appendLine('  email:               ' + this.config.email);
    this.outputConsole.appendLine('');
    this.outputConsole.appendLine('  git ref:             ' + ref);
    this.outputConsole.appendLine('-----------------');
    this.outputConsole.appendLine('');

    this.sendProgress('Making a fresh clone of the repository..', 20);
    await this.embgit.clonePrivateWithKey(this.getGitUrl(), this.fullDestinationPath(), this.config.deployPrivateKey!);

    if (ref !== 'LATEST') {
      this.sendProgress('Checking out ref: ' + ref, 70);
      await this.embgit.checkout(ref, this.fullDestinationPath());
    }

    this.sendProgress('Copying to main site directory', 90);
    const currentSitePath = await this.getCurrentSitePath();
    await this.ensureSyncDirEmpty(currentSitePath);

    // Copy without .git directory
    const filter = (src: string) => !src.endsWith('.git') && !src.includes('/.git/');
    await fs.copy(this.fullDestinationPath(), currentSitePath, { filter });

    return true;
  }

  /**
   * Get remote commit history (fresh fetch)
   */
  protected async historyRemote(): Promise<HistoryResult> {
    this.sendProgress('Getting remote commits.', 20);
    const tmpKeypathPrivate = await this.tempCreatePrivateKey();

    const historyRemoteArr = await this.embgit.logRemote(this.getGitUrl(), tmpKeypathPrivate);

    let historyLocalArr: any[] = [];
    if (await fs.pathExists(this.fullDestinationPath())) {
      this.sendProgress('Comparing with local commit history', 80);
      try {
        historyLocalArr = await this.embgit.logLocal(this.fullDestinationPath());
      } catch (error) {
        // Log local may fail if repo is in detached HEAD state after checkout
        this.outputConsole.appendLine(`Warning: Could not get local commit history: ${error}`);
        historyLocalArr = [];
      }
    }

    const historyMergedArr: CommitInfo[] = historyRemoteArr.map((commit: any) => {
      const localMatch = historyLocalArr.find((e: any) => e.ref === commit.ref);
      return {
        ...commit,
        local: !!localMatch,
      };
    });

    this.sendProgress('Writing commit history cache', 100);
    await fs.writeFile(this.remoteHistoryCacheFile(), JSON.stringify(historyMergedArr), 'utf-8');
    const stat = await fs.stat(this.remoteHistoryCacheFile());

    return { lastRefresh: stat.mtime, commitList: historyMergedArr };
  }

  /**
   * Get remote commit history from cache
   */
  protected async historyRemoteFromCache(): Promise<HistoryResult | null> {
    if (await fs.pathExists(this.remoteHistoryCacheFile())) {
      const historyRemoteJson = await fs.readFile(this.remoteHistoryCacheFile(), 'utf-8');
      const stat = await fs.stat(this.remoteHistoryCacheFile());
      return { lastRefresh: stat.mtime, commitList: JSON.parse(historyRemoteJson) };
    }
    return null;
  }

  // ============================================
  // Helper methods
  // ============================================

  /**
   * Step 1: Initial clone
   */
  protected async publishStep1InitialClone(
    tmpKeypathPrivate: string,
    fullGitUrl: string,
    fullDestinationPath: string
  ): Promise<boolean> {
    await this.embgit.clonePrivateWithKey(fullGitUrl, fullDestinationPath, this.config.deployPrivateKey!);
    return true;
  }

  /**
   * Step 2: Prepare directory contents for build scope
   */
  protected async publishStep2PrepareDircontentsBuild(fullDestinationPath: string): Promise<boolean> {
    if (!this.fromPath) {
      throw new Error('Last build directory is not set');
    }
    await this.syncSourceToDestination(path.join(this.fromPath, 'public'), fullDestinationPath, 'all');
    this.outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  /**
   * Step 2: Prepare directory contents for source scope
   */
  protected async publishStep2PrepareDircontentsSource(fullDestinationPath: string): Promise<boolean> {
    if (!this.fromPath) {
      throw new Error('Last build directory is not set');
    }
    await this.syncSourceToDestination(this.fromPath, fullDestinationPath, 'all');

    if (this.config.publishScope === 'source') {
      if (this.config.setGitHubActions) {
        await this.githubActionWorkflowSource(fullDestinationPath);
      }
    }

    if (this.config.CNAMESwitch && this.config.CNAME) {
      await this.githubCname(fullDestinationPath);
    }

    await fs.ensureDir(path.join(fullDestinationPath, 'static'));

    this.outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  /**
   * Step 3: Add, commit, and push
   */
  protected async publishStep3AddCommitPush(
    tmpKeypathPrivate: string,
    fullDestinationPath: string
  ): Promise<boolean> {
    await this.embgit.addAll(fullDestinationPath);

    const commitMessage = `push by Quiqr Desktop`;
    await this.embgit.commit(
      fullDestinationPath,
      commitMessage,
      this.config.username || 'Quiqr',
      this.config.email || 'noreply@quiqr.org'
    );

    await this.embgit.push(fullDestinationPath, tmpKeypathPrivate);

    return true;
  }

  /**
   * Get current site path from configuration
   */
  protected async getCurrentSitePath(): Promise<string> {
    const configurations = await this.configurationProvider.getConfigurations({});
    const site = configurations.sites.find((x) => x.key === this.siteKey);
    if (!site || !site.source?.path) {
      throw new Error(`Site not found or invalid source path: ${this.siteKey}`);
    }
    return site.source.path;
  }

  /**
   * Read sync ignore file to array
   */
  protected async readSyncIgnoreFileToArray(): Promise<string[]> {
    try {
      const currentSitePath = await this.getCurrentSitePath();
      const filepath = path.join(currentSitePath, 'quiqr', 'sync_ignore.txt');

      if (await fs.pathExists(filepath)) {
        const strData = await fs.readFile(filepath, 'utf-8');
        if (strData) {
          let arrData = strData.split('\n');
          arrData = [...new Set(arrData)]; // Remove duplicates
          arrData = arrData.filter((item) => {
            if (item === '') return false;
            if (item.trim().startsWith('#')) return false;
            return true;
          });
          return arrData;
        }
      }
    } catch {
      // Ignore errors reading sync_ignore.txt
    }
    return [];
  }

  /**
   * Create ignore filter function for fs.copy
   */
  protected createIgnoreFilter(currentSitePath: string): (src: string) => boolean {
    const ignoreList = ['.git', '.quiqr-cache'];
    if (this.config.publishScope === 'source') {
      ignoreList.push('public');
    }

    return (file: string) => {
      let rootFile = file.substring(currentSitePath.length + 1);
      if (rootFile.startsWith('/')) {
        rootFile = rootFile.substring(1);
      }
      return !ignoreList.includes(rootFile);
    };
  }

  /**
   * Sync source to destination
   */
  protected async syncSourceToDestination(
    sourcePath: string,
    fullDestinationPath: string,
    syncSelection: 'all' | 'themeandquiqr'
  ): Promise<boolean> {
    if (syncSelection === 'themeandquiqr') {
      await recurForceRemove(path.join(fullDestinationPath, 'themes'));
      await recurForceRemove(path.join(fullDestinationPath, 'quiqr'));
      await fs.copy(path.join(sourcePath, 'themes'), path.join(fullDestinationPath, 'themes'));
      await fs.copy(path.join(sourcePath, 'quiqr'), path.join(fullDestinationPath, 'quiqr'));
      this.outputConsole.appendLine('synced THEME AND QUIQR sources to destination ...');
    } else {
      const currentSitePath = await this.getCurrentSitePath();
      const filter = this.createIgnoreFilter(currentSitePath);
      await fs.copy(sourcePath, fullDestinationPath, { filter });
      this.outputConsole.appendLine('synced ALL source to destination ...');
    }
    return true;
  }

  /**
   * Full destination path for the repository
   */
  protected fullDestinationPath(): string {
    const resolvedDest = path.join(this.pathHelper.getRoot(), 'sites', this.siteKey, 'githubSyncRepo');
    return path.join(resolvedDest, this.config.repository!);
  }

  /**
   * Remote history cache file path
   */
  protected remoteHistoryCacheFile(): string {
    const resolvedDest = path.join(this.pathHelper.getRoot(), 'sites', this.siteKey);
    return path.join(resolvedDest, `githubSync-${this.config.repository}-cache_remote_history.json`);
  }

  /**
   * Create temporary private key file
   */
  protected async tempCreatePrivateKey(): Promise<string> {
    if (!this.config.deployPrivateKey) {
      throw new Error('Deploy private key is not configured');
    }
    return await this.embgit.createTemporaryPrivateKey(this.config.deployPrivateKey);
  }

  /**
   * Ensure sync directory is empty
   */
  protected async ensureSyncDirEmpty(dir: string): Promise<string> {
    await fs.ensureDir(dir);
    await fs.emptyDir(dir);
    await fs.ensureDir(dir);
    return dir;
  }

  /**
   * Ensure sync repo directory exists
   */
  protected async ensureSyncRepoDir(siteKey: string): Promise<string> {
    const resolvedDest = path.join(this.pathHelper.getRoot(), 'sites', siteKey, 'githubSyncRepo');
    await fs.ensureDir(resolvedDest);
    await fs.emptyDir(resolvedDest);
    await fs.ensureDir(resolvedDest);
    return resolvedDest;
  }

  /**
   * Write CNAME file for GitHub Pages
   */
  protected async githubCname(fullDestinationPath: string): Promise<void> {
    await fs.writeFile(path.join(fullDestinationPath, 'CNAME'), this.config.CNAME!, 'utf-8');
  }

  /**
   * Write GitHub Actions workflow for Hugo builds
   */
  protected async githubActionWorkflowSource(fullDestinationPath: string): Promise<void> {
    const hugoVersion = '0.81.0';
    const baseUrlArg = this.config.overrideBaseURLSwitch ? `--baseURL ${this.config.overrideBaseURL}` : '';

    const yaml = `
name: github pages

on:
  push:
    branches:
    - ${this.config.branch || 'main'}  # Set a branch to deploy

permissions:
    contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true  # Fetch Hugo themes (true OR recursive)
          fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '${hugoVersion}'
          extended: true

      - name: Build
        run: hugo --minify ${baseUrlArg}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
`;

    await fs.ensureDir(path.join(fullDestinationPath, '.github'));
    await fs.ensureDir(path.join(fullDestinationPath, '.github', 'workflows'));
    await fs.writeFile(path.join(fullDestinationPath, '.github', 'workflows', 'hugobuild.yml'), yaml, 'utf-8');
  }

  /**
   * Send progress update via SSE callback or fall back to window adapter
   */
  protected sendProgress(message: string, progress: number): void {
    if (this.progressCallback) {
      this.progressCallback(message, progress);
    } else {
      this.windowAdapter.sendToRenderer('updateProgress', { message, progress });
    }
  }
}
