/**
 * Hugo Builder
 *
 * Handles building Hugo sites.
 */

import fs from 'fs-extra';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { PathHelper } from '../../utils/path-helper.js';

const execFileAsync = promisify(execFile);

/**
 * Hugo build configuration
 */
export interface HugoBuildConfig {
  workspacePath: string;
  hugover: string;
  destination: string;
  config?: string;
  baseUrl?: string;
}

/**
 * HugoBuilder - Builds Hugo sites
 */
export class HugoBuilder {
  private config: HugoBuildConfig;
  private pathHelper: PathHelper;

  constructor(config: HugoBuildConfig, pathHelper: PathHelper) {
    this.config = config;
    this.pathHelper = pathHelper;
  }

  /**
   * Build the Hugo site
   */
  async build(): Promise<void> {
    const hugoArgs = ['--destination', this.config.destination];

    if (this.config.config) {
      hugoArgs.push('--config', this.config.config);
    }

    if (this.config.baseUrl) {
      hugoArgs.push('--baseURL', this.config.baseUrl);
    }

    const exec = this.pathHelper.getSSGBinForVer('hugo', this.config.hugover);

    if (!fs.existsSync(exec)) {
      throw new Error(`Could not find hugo executable for version ${this.config.hugover}.`);
    }

    await execFileAsync(exec, hugoArgs, {
      cwd: this.config.workspacePath,
      windowsHide: true,
      timeout: 60000, // 1 minute
    });
  }
}
