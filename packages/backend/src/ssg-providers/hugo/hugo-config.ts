/**
 * Hugo Config
 *
 * Queries Hugo configuration using the `hugo config` command.
 */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import type { PathHelper } from '../../utils/path-helper.js';
import type { SSGConfigQuerier, SSGSiteConfig } from '../types.js';

/**
 * Site configuration for Hugo operations
 */
export interface QSiteConfig {
  workspacePath: string;
  hugover: string;
  config?: string;
}

/**
 * HugoConfig - Queries Hugo configuration
 */
export class HugoConfig implements SSGConfigQuerier {
  private qSiteConfig: QSiteConfig;
  private pathHelper: PathHelper;

  constructor(qSiteConfig: QSiteConfig, pathHelper: PathHelper) {
    this.qSiteConfig = qSiteConfig;
    this.pathHelper = pathHelper;
  }

  /**
   * Get Hugo config mounts as a parsed object
   */
  async configMountsAsObject(): Promise<unknown[]> {
    const { workspacePath, hugover } = this.qSiteConfig;
    const exec = this.pathHelper.getSSGBinForVer('hugo', hugover);

    if (!fs.existsSync(exec)) {
      return [];
    }

    const output = await this.spawnHugo(exec, ['config', 'mounts'], workspacePath);
    const lines = output.split('\n');

    const startIdx = lines.findIndex((element) => element.startsWith('{'));
    const endIdx = lines.findIndex((element) => element.startsWith('}'));

    if (startIdx === -1 || endIdx === -1) {
      return [];
    }

    const retstring = lines.slice(startIdx, endIdx + 1).join('');
    return JSON.parse(retstring);
  }

  /**
   * Get Hugo config as lines
   */
  async configLines(): Promise<string[]> {
    const { workspacePath, hugover } = this.qSiteConfig;
    const exec = this.pathHelper.getSSGBinForVer('hugo', hugover);

    if (!fs.existsSync(exec)) {
      return [];
    }

    try {
      const output = await this.spawnHugo(exec, ['config'], workspacePath);
      const lines = output.split('\n');
      return lines;
    } catch {
      return [];
    }
  }

  /**
   * SSGConfigQuerier interface implementation: Get config as object
   */
  async getConfig(): Promise<SSGSiteConfig> {
    const mounts = await this.configMountsAsObject();
    return {
      config: {},  // Hugo doesn't expose full config as JSON easily
      mounts: mounts,
    };
  }

  /**
   * SSGConfigQuerier interface implementation: Get config as lines
   */
  async getConfigLines(): Promise<string[]> {
    return this.configLines();
  }

  /**
   * Helper to spawn Hugo command and capture output
   */
  private spawnHugo(exec: string, args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn(exec, args, { cwd });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Hugo command failed with code ${code}: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }
}
