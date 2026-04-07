/**
 * Frontend build path resolution for standalone mode.
 */

import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Find the frontend build directory.
 * Checks FRONTEND_PATH env var first, then the default monorepo location.
 */
export function findFrontendBuildDir(rootPath: string): string | undefined {
  // Environment variable override
  const envPath = process.env.FRONTEND_PATH;
  if (envPath && existsSync(join(envPath, 'index.html'))) {
    return envPath;
  }

  // Default monorepo location
  const defaultPath = join(rootPath, 'packages', 'frontend', 'build');
  if (existsSync(join(defaultPath, 'index.html'))) {
    return defaultPath;
  }

  return undefined;
}
