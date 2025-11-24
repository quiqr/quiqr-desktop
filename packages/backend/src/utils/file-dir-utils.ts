/**
 * File and Directory Utilities
 *
 * Helper functions for file system operations.
 */

import del from 'del';
import fs from 'fs-extra';
import fssimple from 'fs';

/**
 * Extract filename from a full path
 * TODO: use everywhere in code
 */
export function filenameFromPath(fullPath: string): string {
  return fullPath.replace(/^.*[\\/]/, '');
}

/**
 * Recursively and forcefully remove a file or directory
 */
export async function recurForceRemove(dirPath: string): Promise<void> {
  if (fs.existsSync(dirPath)) {
    const lstat = fs.lstatSync(dirPath);

    if (lstat.isDirectory()) {
      del.sync([dirPath], { force: true });
    } else if (lstat.isFile()) {
      fs.unlinkSync(dirPath);
    }
  }
}

/**
 * Remove files in a directory matching a regex pattern
 * TODO: TEST ON WINDOWS
 */
export async function fileRegexRemove(dirPath: string, regex: RegExp): Promise<void> {
  fssimple
    .readdirSync(dirPath)
    .filter((f) => regex.test(f))
    .forEach((f) => fs.unlinkSync(dirPath + '/' + f));
}

/**
 * Ensure a directory exists and is empty
 */
export async function ensureEmptyDir(destination_dirPath: string): Promise<void> {
  await fs.ensureDir(destination_dirPath);
  await fs.emptyDir(destination_dirPath);
  await fs.ensureDir(destination_dirPath);
}

/**
 * Check if a path is a directory
 */
export function pathIsDirectory(dirPath: string): boolean {
  if (fs.existsSync(dirPath)) {
    const lstat = fs.lstatSync(dirPath);
    return lstat.isDirectory();
  }
  return false;
}

/**
 * Legacy class-based interface for backward compatibility
 * @deprecated Use named exports instead
 */
export class FileDirUtils {
  filenameFromPath = filenameFromPath;
  recurForceRemove = recurForceRemove;
  fileRegexRemove = fileRegexRemove;
  ensureEmptyDir = ensureEmptyDir;
  pathIsDirectory = pathIsDirectory;
}

/**
 * Default singleton instance for backward compatibility
 * @deprecated Use named function exports instead
 */
export default new FileDirUtils();
