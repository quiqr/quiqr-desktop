/**
 * Eleventy SSG Provider
 *
 * Implements SSGProvider interface for Eleventy static site generator.
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
import { EleventyDownloader } from './eleventy-downloader.js';
import { EleventyServer } from './eleventy-server.js';
import { EleventyBuilder } from './eleventy-builder.js';
import { EleventyUtils } from './eleventy-utils.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * Eleventy Provider - Implements SSGProvider for Eleventy
 */
export class EleventyProvider implements SSGProvider {
  private dependencies: SSGProviderDependencies;
  private binaryManager: EleventyDownloader;
  private utils: EleventyUtils;

  constructor(dependencies: SSGProviderDependencies) {
    this.dependencies = dependencies;
    this.binaryManager = new EleventyDownloader({
      pathHelper: dependencies.pathHelper,
      outputConsole: dependencies.outputConsole,
      environmentInfo: dependencies.environmentInfo,
    });
    this.utils = new EleventyUtils();
  }

  getMetadata(): ProviderMetadata {
    return {
      type: 'eleventy',
      name: 'Eleventy',
      configFormats: ['js', 'json'],
      requiresBinary: true, // Requires npm package
      supportsDevServer: true,
      supportsBuild: true,
      supportsConfigQuery: false, // JS config files are hard to parse reliably
      version: '1.0.0',
    };
  }

  getBinaryManager(): SSGBinaryManager {
    return this.binaryManager;
  }

  createDevServer(config: SSGServerConfig): SSGDevServer {
    return new EleventyServer(
      {
        workspacePath: config.workspacePath,
        version: config.version,
        config: config.configFile,
        port: config.port || 13131, // Use same port as Hugo for consistency
      },
      this.dependencies.pathHelper,
      this.dependencies.appConfig,
      this.dependencies.windowAdapter,
      this.dependencies.outputConsole
    );
  }

  createBuilder(config: SSGBuildConfig): SSGBuilder {
    return new EleventyBuilder(
      {
        workspacePath: config.workspacePath,
        version: config.version,
        destination: config.destination,
        config: config.configFile,
        baseUrl: config.baseUrl,
      },
      this.dependencies.pathHelper
    );
  }

  createConfigQuerier(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    workspacePath: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    version: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configFile?: string
  ): SSGConfigQuerier | null {
    // Eleventy uses JavaScript config files which are hard to parse safely
    // Return null to indicate config querying is not supported
    return null;
  }

  async createSite(options: SSGSiteCreationOptions): Promise<void> {
    await this.utils.createSiteDir(
      options.directory,
      options.title,
      options.configFormat as 'js' | 'json'
    );
  }

  async detectSite(directory: string): Promise<SSGDetectionResult> {
    // Check for Eleventy config files
    const configFiles = [
      '.eleventy.js',
      'eleventy.config.js',
      'eleventy.config.cjs',
      '.eleventy.cjs',
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

    // Check for package.json with Eleventy dependency
    const packageJsonPath = path.join(directory, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath);
        const hasDependency =
          (packageJson.dependencies && packageJson.dependencies['@11ty/eleventy']) ||
          (packageJson.devDependencies && packageJson.devDependencies['@11ty/eleventy']);

        if (hasDependency) {
          return {
            isDetected: true,
            confidence: 'medium',
            metadata: { source: 'package.json' },
          };
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // Check for common Eleventy directories
    const eleventyMarkers = ['_site', '_includes', '_data'];
    let markerCount = 0;

    for (const marker of eleventyMarkers) {
      const markerPath = path.join(directory, marker);
      if (await fs.pathExists(markerPath)) {
        markerCount++;
      }
    }

    if (markerCount >= 2) {
      return {
        isDetected: true,
        confidence: 'low',
        metadata: { markers: markerCount },
      };
    }

    return {
      isDetected: false,
      confidence: 'low',
    };
  }
}
