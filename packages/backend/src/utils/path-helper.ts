/**
 * Path Helper Utilities
 *
 * Handles path resolution for application directories and resources.
 * Uses dependency injection instead of global state.
 */

import path from 'path';
import fs from 'fs-extra';
import { path7za } from '7zip-bin';
import type { AppInfoAdapter } from '../adapters/types.js';

export interface PathHelperConfig {
  dataFolder?: string;
  currentSitePath?: string;
}

export interface EnvironmentInfo {
  platform: 'macOS' | 'windows' | 'linux';
  isPackaged: boolean;
}

/**
 * PathHelper class provides methods for resolving application paths
 * Uses dependency injection for platform adapters
 */
export class PathHelper {
  private _lastBuildDir?: string;
  private config: PathHelperConfig;
  private appInfo: AppInfoAdapter;
  private rootPath: string;

  constructor(
    appInfo: AppInfoAdapter,
    rootPath: string,
    config: PathHelperConfig = {}
  ) {
    this.appInfo = appInfo;
    this.rootPath = rootPath;
    this.config = config;
  }

  /* DIRS */

  /**
   * Get the root data directory for Quiqr
   */
  getRoot(): string {
    let thedir = '';

    if (this.config.dataFolder && fs.existsSync(this.config.dataFolder)) {
      thedir = this.config.dataFolder;
    } else {
      thedir = path.join(this.appInfo.getPath('home'), 'Quiqr');
      fs.ensureDirSync(thedir);
      // Caller should update config with this value
      this.config.dataFolder = thedir;
    }

    return thedir;
  }

  /**
   * Get the temporary directory
   */
  getTempDir(): string {
    const dir = path.join(this.getRoot(), 'temp');
    fs.ensureDirSync(dir);
    return dir;
  }

  /**
   * Get the root directory for a specific site
   */
  getSiteRoot(siteKey: string): string | null {
    if (siteKey.trim() === '') return null;
    return path.join(this.getRoot(), 'sites', siteKey);
  }

  /**
   * Get the current site mount path from global state
   * TODO: Replace with dependency-injected value
   */
  getSiteRootMountPath(): string | undefined {
    return this.config.currentSitePath;
  }

  /**
   * Get the default publish directory for a site
   */
  getSiteDefaultPublishDir(siteKey: string, publishKey: string): string | null {
    if (siteKey.trim() === '') return null;
    const siteRoot = this.getSiteRoot(siteKey);
    if (!siteRoot) return null;
    return path.join(siteRoot, 'publish', publishKey);
  }

  /**
   * Get the Hugo binary root directory
   */
  getHugoBinRoot(): string {
    const hugobinroot = path.join(this.getRoot(), 'tools', 'hugobin');
    console.log('HUGO BIN ROOT!!!');
    console.log(hugobinroot)

    return hugobinroot;
  }

  /**
   * Get the publish repositories root directory
   */
  getPublishReposRoot(): string {
    return path.join(this.getRoot(), 'sitesRepos');
  }

  /**
   * Get the Hugo binary directory for a specific version
   */
  getHugoBinDirForVer(version: string): string {
    return path.join(this.getHugoBinRoot(), version);
  }

  /**
   * Get the last build directory
   */
  getLastBuildDir(): string | undefined {
    return this._lastBuildDir;
  }

  /**
   * Set and get the build directory
   */
  getBuildDir(dir: string): string {
    this._lastBuildDir = dir;
    return this._lastBuildDir;
  }

  /**
   * Get the Hugo themes directory
   */
  getThemesDir(): string {
    return path.join(this.getRoot(), 'tools', 'hugothemes');
  }

  /**
   * Get the application resources directory based on platform and packaging status
   */
  getApplicationResourcesDir(environment: EnvironmentInfo): string {
    if (environment.isPackaged) {
      if (environment.platform === 'macOS') {
        return path.join(this.rootPath, 'Resources');
      } else if (environment.platform === 'windows') {
        // On Windows, extraResources are in the resources folder next to app.asar
        // rootPath is app.getAppPath() which returns path to app.asar
        // So we need to go up one level to get the resources directory
        return path.dirname(this.rootPath);
      } else if (this.isLinuxAppImage()) {
        const appPath = this.appInfo.getAppPath();
        // appPath is typically /tmp/.mount_xxx/resources/app.asar
        // extraResources (bin/, all/) are at /tmp/.mount_xxx/resources/
        // So we just need to go up one level to get the resources directory
        return path.dirname(appPath);
      } else {
        return path.join(this.rootPath, 'resources');
      }
    } else {
      return path.join(this.rootPath, 'resources');
    }
  }

  /**
   * Get the workspace cache thumbs path
   */
  workspaceCacheThumbsPath(workspacePath: string, relativePath: string): string {
    return path.join(workspacePath, '.quiqr-cache/thumbs', relativePath);
  }

  /**
   * Get the SSH known_hosts file path
   */
  getKnownHosts(): string {
    const homeDir = this.appInfo.getPath('home');
    return path.join(homeDir, '.ssh', 'known_hosts');
  }

  /**
   * Get the site mount config path
   */
  getSiteMountConfigPath(siteKey: string): string {
    const oldfile = path.join(this.getRoot(), 'config.' + siteKey + '.json');
    if (fs.existsSync(oldfile)) {
      return oldfile;
    } else {
      return path.join(this.getRoot(), 'sites', siteKey, 'config.json');
    }
  }

  /**
   * Get the 7-Zip binary path
   */
  get7zaBin(): string {
    if (process.env.P7ZIP_PATH) {
      return process.env.P7ZIP_PATH;
    } else {
      return path7za;
    }
  }

  /**
   * Get the Hugo binary path for a specific version
   */
  getHugoBinForVer(version: string): string {
    // CUSTOM PATH TO HUGO E.G. for nix developments
    if (process.env.HUGO_PATH) {
      return process.env.HUGO_PATH;
    }

    const platform = process.platform.toLowerCase();
    if (platform.startsWith('win')) {
      return path.join(this.getHugoBinDirForVer(version), 'hugo.exe');
    } else {
      return path.join(this.getHugoBinDirForVer(version), 'hugo');
    }
  }

  /* PATH STRING CREATORS */

  /**
   * Generate a random path-safe string
   */
  randomPathSafeString(length: number): string {
    return Math.random().toString(16).substring(2, length);
  }

  /* HELPERS */

  /**
   * Check if running as a Linux AppImage
   */
  isLinuxAppImage(): boolean {
    return this.appInfo.getAppPath().indexOf('/tmp/.mount_') === 0;
  }

  /**
   * Find the Hugo config file path in a Hugo root directory
   * Supports both old (config.*) and new (hugo.*) naming conventions
   */
  hugoConfigFilePath(hugoRootDir: string): string | null {
    // TODO this could be faster and less code
    // let hugoConfigExp = path.join(this.workspacePath,'config.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    // let hugoConfigPath = glob.sync(hugoConfigExp)[0];

    let configExt: string | undefined;
    const configBase = path.join(hugoRootDir, 'config');
    const configNewBase = path.join(hugoRootDir, 'hugo');
    let confVersion = 1;

    // Check old-style config files
    if (fs.existsSync(configBase + '.toml')) {
      configExt = '.toml';
    } else if (fs.existsSync(configBase + '.json')) {
      configExt = '.json';
    } else if (fs.existsSync(configBase + '.yaml')) {
      configExt = '.yaml';
    } else if (fs.existsSync(configBase + '.yml')) {
      configExt = '.yml';
    }
    // Check new-style hugo files
    else if (fs.existsSync(configNewBase + '.toml')) {
      configExt = '.toml';
      confVersion = 2;
    } else if (fs.existsSync(configNewBase + '.json')) {
      configExt = '.json';
      confVersion = 2;
    } else if (fs.existsSync(configNewBase + '.yaml')) {
      configExt = '.yaml';
      confVersion = 2;
    } else if (fs.existsSync(configNewBase + '.yml')) {
      configExt = '.yml';
      confVersion = 2;
    } else {
      return null;
    }

    if (confVersion === 1) {
      return configBase + configExt;
    } else {
      return configNewBase + configExt;
    }
  }
}
