/**
 * Jekyll Builder
 *
 * Handles building Jekyll sites.
 */

import fs from 'fs-extra';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { PathHelper } from '../../utils/path-helper.js';
import type { SSGBuilder } from '../types.js';

const execFileAsync = promisify(execFile);

/**
 * Jekyll build configuration
 */
export interface JekyllBuildConfig {
  workspacePath: string;
  version: string;
  destination: string;
  config?: string;
  baseUrl?: string;
}

/**
 * JekyllBuilder - Builds Jekyll sites
 */
export class JekyllBuilder implements SSGBuilder {
  private config: JekyllBuildConfig;
  private pathHelper: PathHelper;

  constructor(config: JekyllBuildConfig, pathHelper: PathHelper) {
    this.config = config;
    this.pathHelper = pathHelper;
  }

  /**
   * Get the Jekyll wrapper script path
   */
  private getJekyllCommand(): string {
    const installDir = this.pathHelper.getSSGBinDirForVer('jekyll', this.config.version);
    const platform = process.platform;

    if (platform === 'win32') {
      return path.join(installDir, 'jekyll.cmd');
    } else {
      return path.join(installDir, 'jekyll.sh');
    }
  }

  /**
   * Build the Jekyll site
   */
  async build(): Promise<void> {
    const jekyllCommand = this.getJekyllCommand();

    if (!fs.existsSync(jekyllCommand)) {
      throw new Error(`Could not find Jekyll for version ${this.config.version}.`);
    }

    const jekyllArgs: string[] = ['build'];

    // Add destination directory (convert to absolute path)
    if (this.config.destination) {
      const destPath = path.isAbsolute(this.config.destination)
        ? this.config.destination
        : path.join(this.config.workspacePath, this.config.destination);
      jekyllArgs.push('--destination', destPath);
    }

    // Add config file if specified (convert to absolute path)
    if (this.config.config) {
      const configPath = path.isAbsolute(this.config.config)
        ? this.config.config
        : path.join(this.config.workspacePath, this.config.config);
      jekyllArgs.push('--config', configPath);
    }

    // Add base URL if specified
    if (this.config.baseUrl) {
      jekyllArgs.push('--baseurl', this.config.baseUrl);
    }

    await execFileAsync(jekyllCommand, jekyllArgs, {
      cwd: this.config.workspacePath,
      shell: true, // Use shell to properly execute the wrapper script
      timeout: 180000, // 3 minutes (Jekyll builds can be slower)
    });
  }
}
