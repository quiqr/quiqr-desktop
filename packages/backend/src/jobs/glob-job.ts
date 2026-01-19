import { glob, type GlobOptions } from 'glob';

export interface GlobJobParams {
  expression: string
  options?: GlobOptions
}

/**
 * Runs a glob pattern match to find files.
 */
export async function globJob(params: GlobJobParams): Promise<string[]> {
  const { expression, options = {} } = params
  const results = await glob(expression, options)
  // glob can return Path[] objects, convert to strings
  return Array.isArray(results) ? results.map(r => String(r)) : []
}

// Export as default for worker-wrapper
export default globJob
