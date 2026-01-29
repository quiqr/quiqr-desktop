/**
 * SSG Provider Types
 *
 * Type definitions for the pluggable SSG provider system.
 * All SSG provider implementations must implement the SSGProvider interface.
 */

import type { PathHelper, EnvironmentInfo } from '../utils/path-helper.js';
import type { OutputConsole, WindowAdapter, ShellAdapter } from '../adapters/types.js';
import type { AppConfig } from '../config/app-config.js';
import type { AppContainer } from '../config/container.js';

/**
 * Provider metadata and capabilities
 */
export interface ProviderMetadata {
  /** Provider type identifier (e.g., 'hugo', 'eleventy') */
  type: string;

  /** Human-readable name */
  name: string;

  /** Supported configuration file formats */
  configFormats: string[];

  /** Whether this provider requires binary downloads */
  requiresBinary: boolean;

  /** Whether this provider supports dev server */
  supportsDevServer: boolean;

  /** Whether this provider supports build operations */
  supportsBuild: boolean;

  /** Whether this provider can query site config programmatically */
  supportsConfigQuery: boolean;

  /** Provider version */
  version: string;
}

/**
 * Download progress for streaming via SSE
 */
export interface DownloadProgress {
  percent: number;
  message: string;
  complete: boolean;
  error?: string;
}

/**
 * Binary manager for SSGs that require binary downloads (e.g., Hugo)
 */
export interface SSGBinaryManager {
  /**
   * Check if a specific version is installed
   */
  isVersionInstalled(version: string): boolean;

  /**
   * Download and install a specific version with progress streaming
   * Returns async generator for SSE progress updates
   */
  download(version: string, skipExistCheck?: boolean): AsyncGenerator<DownloadProgress>;

  /**
   * Cancel current download
   */
  cancel(): Promise<void>;

  /**
   * Ensure version is available (download if not installed)
   */
  ensureAvailable(version: string): Promise<void>;
}

/**
 * Server configuration
 */
export interface SSGServerConfig {
  workspacePath: string;
  version: string;
  configFile?: string;
  port?: number;
  additionalArgs?: string[];
  siteKey: string;
  workspaceKey: string;
}

/**
 * Dev server manager
 */
export interface SSGDevServer {
  /**
   * Start the development server
   */
  serve(): Promise<void>;

  /**
   * Stop the server if running
   */
  stopIfRunning(): void;

  /**
   * Get the current server process
   */
  getCurrentProcess(): unknown;
}

/**
 * Build configuration
 */
export interface SSGBuildConfig {
  workspacePath: string;
  version: string;
  destination: string;
  configFile?: string;
  baseUrl?: string;
  additionalArgs?: string[];
}

/**
 * Builder for static site generation
 */
export interface SSGBuilder {
  /**
   * Build the site
   */
  build(): Promise<void>;
}

/**
 * Site configuration query result
 */
export interface SSGSiteConfig {
  /** Raw config as object */
  config: Record<string, unknown>;

  /** Mounts/module information (if supported) */
  mounts?: unknown[] | undefined;

  /** Content directories */
  contentDirs?: string[];

  /** Languages (for i18n) */
  languages?: Array<{ lang: string; source: string }>;
}

/**
 * Config querier for SSGs that support programmatic config access
 */
export interface SSGConfigQuerier {
  /**
   * Get site configuration as object
   */
  getConfig(): Promise<SSGSiteConfig>;

  /**
   * Get config as lines (for display)
   */
  getConfigLines(): Promise<string[]>;
}

/**
 * Site creation options
 */
export interface SSGSiteCreationOptions {
  directory: string;
  title: string;
  configFormat: string;
  version?: string;
  template?: string;
}

/**
 * Site detector result
 */
export interface SSGDetectionResult {
  isDetected: boolean;
  confidence: 'high' | 'medium' | 'low';
  version?: string;
  configFiles?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Main SSG Provider Interface
 */
export interface SSGProvider {
  /**
   * Get provider metadata
   */
  getMetadata(): ProviderMetadata;

  /**
   * Binary manager (null if provider doesn't require binaries)
   */
  getBinaryManager(): SSGBinaryManager | null;

  /**
   * Create a dev server instance
   */
  createDevServer(config: SSGServerConfig): SSGDevServer;

  /**
   * Create a builder instance
   */
  createBuilder(config: SSGBuildConfig): SSGBuilder;

  /**
   * Create a config querier (null if not supported)
   */
  createConfigQuerier(
    workspacePath: string,
    version: string,
    configFile?: string
  ): SSGConfigQuerier | null;

  /**
   * Create a new site with this SSG
   */
  createSite(options: SSGSiteCreationOptions): Promise<void>;

  /**
   * Detect if a directory is a site of this type
   */
  detectSite(directory: string): Promise<SSGDetectionResult>;
}

/**
 * Provider dependencies (injected by factory)
 */
export interface SSGProviderDependencies {
  pathHelper: PathHelper;
  environmentInfo: EnvironmentInfo;
  outputConsole: OutputConsole;
  windowAdapter: WindowAdapter;
  shellAdapter: ShellAdapter;
  appConfig: AppConfig;
  container?: AppContainer; // Optional - injected after construction to break circular dependency
}
