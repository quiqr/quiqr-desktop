/**
 * Mock SSG Provider
 *
 * A configurable mock implementation of the SSGProvider interface.
 * Used to:
 * 1. Validate that the SSGProvider abstraction works for new providers
 * 2. Test the provider registry with a controllable provider
 * 3. Serve as a template for implementing new providers
 */

import type {
  SSGProvider,
  ProviderMetadata,
  SSGProviderDependencies,
  SSGBinaryManager,
  SSGDevServer,
  SSGBuilder,
  SSGConfigQuerier,
  SSGSiteCreationOptions,
  SSGDetectionResult,
  SSGServerConfig,
  SSGBuildConfig,
  DownloadProgress,
  SSGSiteConfig,
} from '../../src/ssg-providers/types.js';

/**
 * Configuration for MockProvider behavior
 */
export interface MockProviderConfig {
  /** Provider metadata */
  metadata?: Partial<ProviderMetadata>;

  /** Detection configuration */
  detection?: {
    /** Files that indicate this provider */
    configFiles?: string[];
    /** Directories that indicate this provider */
    markerDirs?: string[];
    /** Detection confidence */
    confidence?: 'high' | 'medium' | 'low';
    /** Should detectSite return true? */
    shouldDetect?: boolean;
  };

  /** Should return a binary manager? */
  hasBinaryManager?: boolean;

  /** Should throw errors? */
  throwErrors?: boolean;
}

/**
 * Mock Binary Manager
 */
class MockBinaryManager implements SSGBinaryManager {
  private dependencies: SSGProviderDependencies;
  private config: MockProviderConfig;

  constructor(dependencies: SSGProviderDependencies, config: MockProviderConfig) {
    this.dependencies = dependencies;
    this.config = config;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isVersionInstalled(version: string): boolean {
    // Mock: always return false (not installed)
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async *download(version: string, skipExistCheck?: boolean): AsyncGenerator<DownloadProgress> {
    // Simulate download progress
    yield { percent: 0, message: 'Starting download...', complete: false };
    yield { percent: 50, message: 'Downloading...', complete: false };
    yield { percent: 100, message: 'Download complete', complete: true };
  }

  async cancel(): Promise<void> {
    this.dependencies.outputConsole.appendLine('Download cancelled');
  }

  async ensureAvailable(version: string): Promise<void> {
    if (!this.isVersionInstalled(version)) {
      for await (const progress of this.download(version)) {
        this.dependencies.outputConsole.appendLine(progress.message);
      }
    }
  }
}

/**
 * Mock Dev Server
 */
class MockDevServer implements SSGDevServer {
  private config: SSGServerConfig;
  private dependencies: SSGProviderDependencies;
  private process: { pid: number } | null = null;

  constructor(config: SSGServerConfig, dependencies: SSGProviderDependencies) {
    this.config = config;
    this.dependencies = dependencies;
  }

  async serve(): Promise<void> {
    this.dependencies.outputConsole.appendLine(
      `Mock server started on port ${this.config.port || 13131}`
    );
    // Mock: store a fake process
    this.process = { pid: 12345 };
  }

  stopIfRunning(): void {
    if (this.process) {
      this.dependencies.outputConsole.appendLine('Mock server stopped');
      this.process = null;
    }
  }

  getCurrentProcess(): unknown {
    return this.process;
  }
}

/**
 * Mock Builder
 */
class MockBuilder implements SSGBuilder {
  private config: SSGBuildConfig;
  private dependencies: SSGProviderDependencies;

  constructor(config: SSGBuildConfig, dependencies: SSGProviderDependencies) {
    this.config = config;
    this.dependencies = dependencies;
  }

  async build(): Promise<void> {
    this.dependencies.outputConsole.appendLine(
      `Mock build started for ${this.config.workspacePath}`
    );
    this.dependencies.outputConsole.appendLine(`Output directory: ${this.config.destination}`);
    this.dependencies.outputConsole.appendLine('Mock build completed successfully');
  }
}

/**
 * Mock Config Querier
 */
class MockConfigQuerier implements SSGConfigQuerier {
  private workspacePath: string;
  private version: string;
  private configFile?: string;
  private dependencies: SSGProviderDependencies;

  constructor(
    workspacePath: string,
    version: string,
    configFile: string | undefined,
    dependencies: SSGProviderDependencies
  ) {
    this.workspacePath = workspacePath;
    this.version = version;
    this.configFile = configFile;
    this.dependencies = dependencies;
  }

  async getConfig(): Promise<SSGSiteConfig> {
    return {
      config: {
        title: 'Mock Site',
        baseURL: 'http://example.org',
      },
      contentDirs: ['content'],
    };
  }

  async getConfigLines(): Promise<string[]> {
    return ['title: Mock Site', 'baseURL: http://example.org'];
  }
}

/**
 * Mock SSG Provider
 */
export class MockProvider implements SSGProvider {
  private dependencies: SSGProviderDependencies;
  private config: MockProviderConfig;
  private binaryManager: MockBinaryManager | null;

  constructor(dependencies: SSGProviderDependencies, config: MockProviderConfig = {}) {
    this.dependencies = dependencies;
    this.config = {
      metadata: {},
      detection: {
        configFiles: ['mock.config.json'],
        markerDirs: ['mock-content', 'mock-layouts'],
        confidence: 'high',
        shouldDetect: true,
        ...config.detection,
      },
      hasBinaryManager: true,
      throwErrors: false,
      ...config,
    };

    // Create binary manager if configured
    this.binaryManager =
      this.config.hasBinaryManager === true
        ? new MockBinaryManager(dependencies, this.config)
        : null;
  }

  getMetadata(): ProviderMetadata {
    return {
      type: 'mock',
      name: 'Mock SSG',
      configFormats: ['json', 'yaml'],
      requiresBinary: this.config.hasBinaryManager === true,
      supportsDevServer: true,
      supportsBuild: true,
      supportsConfigQuery: true,
      version: '1.0.0',
      ...this.config.metadata,
    };
  }

  getBinaryManager(): SSGBinaryManager | null {
    return this.binaryManager;
  }

  createDevServer(config: SSGServerConfig): SSGDevServer {
    if (this.config.throwErrors) {
      throw new Error('Mock error: Cannot create dev server');
    }
    return new MockDevServer(config, this.dependencies);
  }

  createBuilder(config: SSGBuildConfig): SSGBuilder {
    if (this.config.throwErrors) {
      throw new Error('Mock error: Cannot create builder');
    }
    return new MockBuilder(config, this.dependencies);
  }

  createConfigQuerier(
    workspacePath: string,
    version: string,
    configFile?: string
  ): SSGConfigQuerier | null {
    if (this.config.throwErrors) {
      return null;
    }
    return new MockConfigQuerier(workspacePath, version, configFile, this.dependencies);
  }

  async createSite(options: SSGSiteCreationOptions): Promise<void> {
    if (this.config.throwErrors) {
      throw new Error('Mock error: Cannot create site');
    }

    this.dependencies.outputConsole.appendLine(
      `Mock site created at ${options.directory} with title: ${options.title}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async detectSite(directory: string): Promise<SSGDetectionResult> {
    if (this.config.throwErrors) {
      throw new Error('Mock error: Cannot detect site');
    }

    // Mock detection logic based on configuration
    const { configFiles, markerDirs, confidence, shouldDetect } = this.config.detection!;

    if (shouldDetect) {
      return {
        isDetected: true,
        confidence: confidence || 'high',
        configFiles: configFiles,
        metadata: {
          markerDirs,
        },
      };
    }

    return {
      isDetected: false,
      confidence: 'low',
    };
  }
}

/**
 * Create a mock provider with custom configuration
 */
export function createMockProvider(
  dependencies: SSGProviderDependencies,
  config?: MockProviderConfig
): MockProvider {
  return new MockProvider(dependencies, config);
}
