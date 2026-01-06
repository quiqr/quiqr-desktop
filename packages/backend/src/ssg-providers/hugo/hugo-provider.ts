/**
 * Hugo SSG Provider
 *
 * Wraps existing Hugo implementation to fit the SSGProvider interface.
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
} from '../types.js';
import { HugoDownloader } from './hugo-downloader.js';
import { HugoServer } from './hugo-server.js';
import { HugoBuilder } from './hugo-builder.js';
import { HugoConfig } from './hugo-config.js';
import { HugoUtils } from './hugo-utils.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * Hugo Provider - Implements SSGProvider for Hugo
 */
export class HugoProvider implements SSGProvider {
  private dependencies: SSGProviderDependencies;
  private binaryManager: HugoDownloader;
  private utils: HugoUtils;

  constructor(dependencies: SSGProviderDependencies) {
    this.dependencies = dependencies;
    this.binaryManager = new HugoDownloader({
      pathHelper: dependencies.pathHelper,
      outputConsole: dependencies.outputConsole,
      environmentInfo: dependencies.environmentInfo,
    });
    this.utils = new HugoUtils();
  }

  getMetadata(): ProviderMetadata {
    return {
      type: 'hugo',
      name: 'Hugo',
      configFormats: ['toml', 'yaml', 'json'],
      requiresBinary: true,
      supportsDevServer: true,
      supportsBuild: true,
      supportsConfigQuery: true,
      version: '1.0.0',
    };
  }

  getBinaryManager(): SSGBinaryManager {
    return this.binaryManager;
  }

  createDevServer(config: SSGServerConfig): SSGDevServer {
    return new HugoServer(
      {
        workspacePath: config.workspacePath,
        hugover: config.version,
        config: config.configFile,
      },
      this.dependencies.pathHelper,
      this.dependencies.appConfig,
      this.dependencies.windowAdapter,
      this.dependencies.outputConsole
    );
  }

  createBuilder(config: SSGBuildConfig): SSGBuilder {
    return new HugoBuilder(
      {
        workspacePath: config.workspacePath,
        hugover: config.version,
        destination: config.destination,
        config: config.configFile,
        baseUrl: config.baseUrl,
      },
      this.dependencies.pathHelper
    );
  }

  createConfigQuerier(
    workspacePath: string,
    version: string,
    configFile?: string
  ): SSGConfigQuerier {
    return new HugoConfig(
      {
        workspacePath,
        hugover: version,
        config: configFile,
      },
      this.dependencies.pathHelper
    );
  }

  async createSite(options: SSGSiteCreationOptions): Promise<void> {
    await this.utils.createSiteDir(
      options.directory,
      options.title,
      options.configFormat as 'toml' | 'yaml' | 'json'
    );
  }

  async detectSite(directory: string): Promise<SSGDetectionResult> {
    // Check for Hugo config files
    const configFiles = [
      'config.toml',
      'config.yaml',
      'config.yml',
      'config.json',
      'hugo.toml',
      'hugo.yaml',
      'hugo.yml',
      'hugo.json',
    ];

    const foundConfigs: string[] = [];

    for (const configFile of configFiles) {
      const configPath = path.join(directory, configFile);
      if (await fs.pathExists(configPath)) {
        foundConfigs.push(configFile);
      }
    }

    if (foundConfigs.length > 0) {
      return {
        isDetected: true,
        confidence: 'high',
        configFiles: foundConfigs,
      };
    }

    // Check for Hugo-specific directories
    const hugoMarkers = ['archetypes', 'layouts', 'static', 'themes'];
    let markerCount = 0;

    for (const marker of hugoMarkers) {
      const markerPath = path.join(directory, marker);
      if (await fs.pathExists(markerPath)) {
        markerCount++;
      }
    }

    if (markerCount >= 2) {
      return {
        isDetected: true,
        confidence: 'medium',
        metadata: { markers: markerCount },
      };
    }

    return {
      isDetected: false,
      confidence: 'low',
    };
  }
}
