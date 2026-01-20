import { jobsManager } from './job-manager.js'
import path from 'path'
import { fileURLToPath } from 'url'
import type { GlobOptions } from 'glob'
import type { CreateThumbnailParams } from './create-thumbnail-job.js'
import type { GlobJobParams } from './glob-job.js'
import type { CommunityTemplate } from '@quiqr/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get the absolute path to a compiled job file.
 * In production, jobs are in dist/jobs/*.js
 */
function getJobPath(filename: string): string {
  return path.join(__dirname, filename)
}

/**
 * Create a thumbnail image from a source file.
 * Uses shared background job to avoid duplicate work.
 */
export function createThumbnailJob(src: string, dest: string): Promise<string> {
  const params: CreateThumbnailParams = { src, dest }
  return jobsManager.runSharedBackgroundJob<string>(
    `create-thumbnail-job:${src}->${dest}`,
    getJobPath('create-thumbnail-job.js'),
    params
  )
}

/**
 * Run a glob pattern match to find files.
 * Each call runs in its own worker thread.
 */
export function globJob(expression: string, options?: GlobOptions): Promise<string[]> {
  const params: GlobJobParams = { expression, options }
  return jobsManager.runBackgroundJob<string[]>(
    `glob-job:${expression}(${JSON.stringify(options)})`,
    getJobPath('glob-job.js'),
    params
  )
}

/**
 * Fetch and validate community templates from the Quiqr repository.
 * Each call runs in its own worker thread.
 */
export function updateCommunityTemplatesJob(): Promise<CommunityTemplate[]> {
  return jobsManager.runBackgroundJob<CommunityTemplate[]>(
    'update-community-templates-job',
    getJobPath('update-community-templates-job.js')
  )
}

// Export the manager and types
export { jobsManager, JobsManager } from './job-manager.js'
export { BackgroundJobRunner } from './background-job-runner.js'
export type { CreateThumbnailParams, GlobJobParams }
