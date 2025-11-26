import { glob } from 'glob'

export interface GlobJobParams {
  expression: string
  options?: any
}

/**
 * Runs a glob pattern match to find files.
 */
export async function globJob(params: GlobJobParams): Promise<string[]> {
  const { expression, options } = params
  return glob(expression, options)
}

// Export as default for worker-wrapper
export default globJob
