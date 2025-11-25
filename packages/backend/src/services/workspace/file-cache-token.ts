/**
 * File Cache Token
 *
 * Creates a cache token based on file modification times.
 * Used to invalidate configuration caches when files change.
 */

import fs from 'fs';

/**
 * FileCacheToken generates a unique token based on file modification times
 * Used for cache invalidation when source files change
 */
export class FileCacheToken {
  private files: string[] | null;
  private token: string | null;
  private isBuilt: boolean;

  constructor(files: string[]) {
    this.files = files;
    this.token = null;
    this.isBuilt = false;
  }

  /**
   * Build the cache token from file modification times
   */
  async build(): Promise<FileCacheToken> {
    if (this.isBuilt) {
      return this;
    }

    const signatures: string[] = [];
    const promises = (this.files || []).map(
      (file) =>
        new Promise<void>((resolve, reject) => {
          fs.stat(file, (err, stats) => {
            if (err) return reject(err);
            signatures.push(`${file}>${stats.mtime.getTime()}`);
            resolve();
          });
        })
    );

    await Promise.all(promises);
    this.token = signatures.sort().join('|');
    this.isBuilt = true;
    this.files = null;
    return this;
  }

  /**
   * Check if this token matches another token
   * @param other - Another FileCacheToken to compare against
   * @returns true if tokens match, false otherwise
   */
  async match(other: FileCacheToken): Promise<boolean> {
    await Promise.all([this.build(), other.build()]);
    return this.token === other.token;
  }

  /**
   * Get the token value (after building)
   */
  getToken(): string | null {
    return this.token;
  }
}
