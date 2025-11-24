/**
 * Application Runtime State
 *
 * Replaces global.currentSiteKey, global.currentWorkspaceKey, etc.
 * Manages runtime state that is not persisted to disk.
 */

/**
 * AppState manages runtime application state (non-persistent)
 * This is state that changes during runtime but is not saved to config
 */
export class AppState {
  /**
   * Currently active site key
   */
  currentSiteKey: string | undefined;

  /**
   * Currently active workspace key
   */
  currentWorkspaceKey: string | undefined;

  /**
   * Current site path (mounted workspace path)
   */
  currentSitePath: string | undefined;

  /**
   * Current Hugo server process (if running)
   */
  currentServerProcess: any;

  /**
   * Whether a Hugo server is currently running
   */
  isServerRunning: boolean;

  /**
   * Current Hugo server port
   */
  serverPort: number | undefined;

  /**
   * Current build directory
   */
  currentBuildDir: string | undefined;

  constructor() {
    this.currentSiteKey = undefined;
    this.currentWorkspaceKey = undefined;
    this.currentSitePath = undefined;
    this.currentServerProcess = undefined;
    this.isServerRunning = false;
    this.serverPort = undefined;
    this.currentBuildDir = undefined;
  }

  /**
   * Set the current site and workspace
   */
  setCurrentSite(siteKey: string, workspaceKey: string, sitePath: string): void {
    this.currentSiteKey = siteKey;
    this.currentWorkspaceKey = workspaceKey;
    this.currentSitePath = sitePath;
  }

  /**
   * Clear the current site
   */
  clearCurrentSite(): void {
    this.currentSiteKey = undefined;
    this.currentWorkspaceKey = undefined;
    this.currentSitePath = undefined;
  }

  /**
   * Set the Hugo server process
   */
  setServerProcess(process: any, port: number): void {
    this.currentServerProcess = process;
    this.isServerRunning = true;
    this.serverPort = port;
  }

  /**
   * Clear the Hugo server process
   */
  clearServerProcess(): void {
    this.currentServerProcess = undefined;
    this.isServerRunning = false;
    this.serverPort = undefined;
  }

  /**
   * Set the current build directory
   */
  setBuildDir(dir: string): void {
    this.currentBuildDir = dir;
  }

  /**
   * Get a snapshot of current state (for debugging)
   */
  getSnapshot(): Record<string, any> {
    return {
      currentSiteKey: this.currentSiteKey,
      currentWorkspaceKey: this.currentWorkspaceKey,
      currentSitePath: this.currentSitePath,
      isServerRunning: this.isServerRunning,
      serverPort: this.serverPort,
      currentBuildDir: this.currentBuildDir,
    };
  }
}
