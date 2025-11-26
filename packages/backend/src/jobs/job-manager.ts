import { BackgroundJobRunner } from './background-job-runner.js'

/**
 * JobsManager handles job execution with caching and deduplication.
 * Shared jobs are cached so multiple callers get the same result.
 */
export class JobsManager {
  private backgroundJobRunner: BackgroundJobRunner
  private runningActions: Map<string, Promise<any>>

  constructor() {
    this.backgroundJobRunner = new BackgroundJobRunner()
    this.runningActions = new Map()
  }

  /**
   * Run a shared job that can be called by multiple consumers.
   * If the job is already running, returns the existing promise.
   */
  runSharedJob<T>(key: string, job: () => Promise<T>): Promise<T> {
    let promise = this.runningActions.get(key)

    if (promise == null) {
      promise = job()
      promise.finally(() => this.runningActions.delete(key))
      this.runningActions.set(key, promise)
    }

    return promise
  }

  /**
   * Run a single background job in a worker thread.
   * Each call creates a new worker.
   */
  runBackgroundJob<T>(key: string, resolvedPath: string, payload?: any): Promise<T> {
    return this.backgroundJobRunner.run<T>(resolvedPath, payload)
  }

  /**
   * Run a shared background job in a worker thread.
   * If the job is already running, returns the existing promise.
   */
  runSharedBackgroundJob<T>(key: string, resolvedPath: string, payload?: any): Promise<T> {
    let promise = this.runningActions.get(key)

    if (promise == null) {
      promise = this.backgroundJobRunner.run<T>(resolvedPath, payload)
      promise.finally(() => this.runningActions.delete(key))
      this.runningActions.set(key, promise)
    }

    return promise
  }

  /**
   * Run a shared debounced background job.
   * Maximum number of times it can be called over time.
   */
  runSharedDebouncedBackgroundJob(): Promise<any> {
    throw new Error('runSharedDebouncedJob is not implemented.')
  }

  /**
   * Run a shared throttled background job.
   * Cannot be called again until a certain amount of time has passed.
   */
  runSharedThrottledBackgroundJob(): Promise<any> {
    throw new Error('runSharedThrottledJob is not implemented.')
  }
}

// Export singleton instance
export const jobsManager = new JobsManager()
