/**
 * Hugo Utils
 *
 * Utilities for creating Hugo sites with configuration files.
 */

import fs from 'fs-extra';
import path from 'path';
import formatProviderResolver from '../../utils/format-provider-resolver.js';

/**
 * Hugo configuration format (matches Hugo's supported formats)
 */
export type HugoConfigFormat = 'toml' | 'yaml' | 'json';

/**
 * Basic Hugo configuration structure
 */
export interface HugoConfig {
  baseURL: string;
  title: string;
  [key: string]: unknown; // Allow additional Hugo config properties
}

/**
 * HugoUtils provides utilities for creating and managing Hugo sites
 */
export class HugoUtils {
  /**
   * Create a new Hugo site directory with a configuration file
   *
   * @param directory - The directory path where the Hugo site will be created
   * @param title - The title for the Hugo site
   * @param configFormat - The configuration file format (toml, yaml, or json)
   * @returns Promise that resolves to true on success
   */
  async createSiteDir(
    directory: string,
    title: string,
    configFormat: HugoConfigFormat
  ): Promise<boolean> {
    // Ensure the directory exists
    await fs.ensureDir(directory);

    // Construct the config file path
    const hugoConfigFilePath = path.join(directory, `config.${configFormat}`);

    // Resolve the format provider for this file type
    const formatProvider = formatProviderResolver.resolveForFilePath(hugoConfigFilePath);

    if (!formatProvider) {
      throw new Error(`Unsupported config format: ${configFormat}`);
    }

    // Create the basic Hugo configuration
    const hconfig: HugoConfig = {
      baseURL: 'http://example.org',
      title: title,
    };

    // Write the configuration file
    await fs.writeFile(hugoConfigFilePath, formatProvider.dump(hconfig));

    return true;
  }
}

/**
 * Default singleton instance
 */
export default new HugoUtils();
