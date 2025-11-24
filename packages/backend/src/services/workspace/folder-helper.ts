/**
 * Folder Helper
 *
 * Utilities for building folder tree structures.
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Tree node representing a file or directory
 */
export interface TreeNode {
  name: string;
  files?: TreeNode[];
}

/**
 * Options for building folder trees
 */
export interface FolderTreeOptions {
  /**
   * Optional function to filter which files/folders to include
   * @param fullPath - Full path to the file/folder
   * @param stat - fs.Stats object for the file/folder
   * @returns true to include, false to exclude
   */
  includeFunc?: (fullPath: string, stat: fs.Stats) => boolean;
}

/**
 * Build a single level of the folder tree recursively
 */
async function buildTreeLevel(
  treeLevel: TreeNode[],
  filePath: string,
  options: FolderTreeOptions = {}
): Promise<void> {
  const files = await fs.readdir(filePath);
  const promises: Promise<void>[] = [];

  for (const file of files) {
    const fullFilePath = path.join(filePath, file);

    promises.push(
      fs.lstat(fullFilePath).then(async (stat) => {
        // Apply filter if provided
        if (options.includeFunc !== undefined) {
          if (!options.includeFunc(fullFilePath, stat)) {
            return;
          }
        }

        if (stat.isDirectory()) {
          const obj: TreeNode = { name: file, files: [] };
          treeLevel.push(obj);
          return buildTreeLevel(obj.files!, fullFilePath, options);
        } else {
          const obj: TreeNode = { name: file };
          treeLevel.push(obj);
        }
      })
    );
  }

  await Promise.all(promises);
}

/**
 * Get a folder tree structure asynchronously
 * @param filePath - Root path to build tree from
 * @param options - Optional filter function
 * @returns Tree structure as array of TreeNode objects
 */
export async function getFolderTreeAsync(
  filePath: string,
  options: FolderTreeOptions = {}
): Promise<TreeNode[]> {
  const treeRoot: TreeNode[] = [];
  await buildTreeLevel(treeRoot, filePath, options);
  return treeRoot;
}

/**
 * Legacy object-based interface for backward compatibility
 * @deprecated Use named exports instead
 */
export const folderHelper = {
  getFolderTreeAsync,
};

export default folderHelper;
