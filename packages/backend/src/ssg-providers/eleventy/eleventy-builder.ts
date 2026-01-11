/**
 * Eleventy Builder
 *
 * Handles building Eleventy sites.
 */

import fs from 'fs-extra';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { PathHelper } from '../../utils/path-helper.js';
import type { SSGBuilder } from '../types.js';

const execFileAsync = promisify(execFile);

/**
 * Eleventy build configuration
 */
export interface EleventyBuildConfig {
  workspacePath: string;
  version: string;
  destination: string;
  config?: string;
  baseUrl?: string;
}

/**
 * EleventyBuilder - Builds Eleventy sites
 */
export class EleventyBuilder implements SSGBuilder {
  private config: EleventyBuildConfig;
  private pathHelper: PathHelper;

  constructor(config: EleventyBuildConfig, pathHelper: PathHelper) {
    this.config = config;
    this.pathHelper = pathHelper;
  }

  /**
   * Build the Eleventy site
   */
  async build(): Promise<void> {
    const eleventyArgs: string[] = [];

    // Add output directory
    if (this.config.destination) {
      eleventyArgs.push('--output', this.config.destination);
    }

    // Add config file if specified
    if (this.config.config) {
      eleventyArgs.push('--config', this.config.config);
    }

    // Note: Eleventy doesn't have a --baseURL flag like Hugo
    // Base URL should be configured in .eleventy.js or data files

    const exec = this.pathHelper.getSSGBinForVer('eleventy', this.config.version);

    if (!fs.existsSync(exec)) {
      throw new Error(`Could not find Eleventy executable for version ${this.config.version}.`);
    }

    try {
      await execFileAsync(exec, eleventyArgs, {
        cwd: this.config.workspacePath,
        windowsHide: true,
        timeout: 120000, // 2 minutes (Eleventy can be slower than Hugo)
      });
    } catch (error) {
      throw error;
    }
  }
}
