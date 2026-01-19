/**
 * Jekyll SSG Provider
 *
 * Implements SSGProvider interface for Jekyll static site generator.
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
import { JekyllDownloader } from './jekyll-downloader.js';
import { JekyllServer } from './jekyll-server.js';
import { JekyllBuilder } from './jekyll-builder.js';
import { JekyllUtils } from './jekyll-utils.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * Jekyll Provider - Implements SSGProvider for Jekyll
 */
export class JekyllProvider implements SSGProvider {
  private dependencies: SSGProviderDependencies;
  private binaryManager: JekyllDownloader;
  private utils: JekyllUtils;

  constructor(dependencies: SSGProviderDependencies) {
    this.dependencies = dependencies;
    this.binaryManager = new JekyllDownloader({
      pathHelper: dependencies.pathHelper,
      outputConsole: dependencies.outputConsole,
      environmentInfo: dependencies.environmentInfo,
    });
    this.utils = new JekyllUtils();
  }

  getMetadata(): ProviderMetadata {
    return {
      type: 'jekyll',
      name: 'Jekyll',
      configFormats: ['yml', 'yaml'],
      requiresBinary: true, // Requires Ruby and gem installation
      supportsDevServer: true,
      supportsBuild: true,
      supportsConfigQuery: false, // YAML config parsing could be added later
      version: '1.0.0',
    };
  }

  getBinaryManager(): SSGBinaryManager {
    return this.binaryManager;
  }

  createDevServer(config: SSGServerConfig): SSGDevServer {
    return new JekyllServer(
      {
        workspacePath: config.workspacePath,
        version: config.version,
        config: config.configFile,
        port: config.port || 13131, // Use same port as Hugo and Eleventy
      },
      this.dependencies.pathHelper,
      this.dependencies.appConfig,
      this.dependencies.windowAdapter,
      this.dependencies.outputConsole
    );
  }

  createBuilder(config: SSGBuildConfig): SSGBuilder {
    return new JekyllBuilder(
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
    // Jekyll uses YAML config files which could be parsed
    // For now, return null to keep it simple
    // This can be implemented later if needed
    return null;
  }

  async createSite(options: SSGSiteCreationOptions): Promise<void> {
    await this.utils.createSiteDir(
      options.directory,
      options.title,
      (options.configFormat as 'yaml' | 'yml') || 'yml'
    );
  }

  async detectSite(directory: string): Promise<SSGDetectionResult> {
    // Check for Jekyll config files
    const configFiles = ['_config.yml', '_config.yaml'];
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

    // Check for Gemfile with Jekyll dependency
    const gemfilePath = path.join(directory, 'Gemfile');
    if (await fs.pathExists(gemfilePath)) {
      try {
        const gemfileContent = await fs.readFile(gemfilePath, 'utf-8');
        // Look for jekyll gem declaration
        if (
          gemfileContent.includes("gem 'jekyll'") ||
          gemfileContent.includes('gem "jekyll"')
        ) {
          return {
            isDetected: true,
            confidence: 'high',
            metadata: { source: 'Gemfile' },
          };
        }
      } catch {
        // Ignore read errors
      }
    }

    // Check for common Jekyll directories
    const jekyllMarkers = ['_posts', '_layouts', '_includes', '_site'];
    let markerCount = 0;

    for (const marker of jekyllMarkers) {
      const markerPath = path.join(directory, marker);
      if (await fs.pathExists(markerPath)) {
        markerCount++;
      }
    }

    // If we have 2 or more Jekyll marker directories, it's likely a Jekyll site
    if (markerCount >= 2) {
      return {
        isDetected: true,
        confidence: 'medium',
        metadata: { markers: markerCount },
      };
    }

    // Check if there's at least one marker directory and some .md files
    if (markerCount >= 1) {
      try {
        const files = await fs.readdir(directory);
        const hasMdFiles = files.some((file) => file.endsWith('.md'));
        if (hasMdFiles) {
          return {
            isDetected: true,
            confidence: 'low',
            metadata: { markers: markerCount, hasMdFiles: true },
          };
        }
      } catch {
        // Ignore read errors
      }
    }

    return {
      isDetected: false,
      confidence: 'low',
    };
  }
}
