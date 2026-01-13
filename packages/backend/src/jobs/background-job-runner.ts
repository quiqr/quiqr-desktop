import { Worker } from 'worker_threads'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface QueuedJob<T> {
  action: string
  params?: any
  resolve: (value: T) => void
  reject: (error: Error) => void
}

/**
 * Runs background jobs in worker threads for CPU-intensive operations
 * without blocking the main thread. Implements a worker pool to limit
 * concurrent workers and prevent memory issues.
 */
export class BackgroundJobRunner {
  private maxConcurrency: number
  private activeWorkers: number = 0
  private jobQueue: QueuedJob<any>[] = []

  constructor(maxConcurrency: number = 4) {
    this.maxConcurrency = maxConcurrency
  }

  /**
   * Execute a job in a worker thread.
   * @param action - Path to the job module
   * @param params - Parameters to pass to the job
   * @returns Promise that resolves with the job result
   */
  run<T = any>(action: string, params?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const job: QueuedJob<T> = { action, params, resolve, reject }

      // If we're under the concurrency limit, start the job immediately
      if (this.activeWorkers < this.maxConcurrency) {
        this.executeJob(job)
      } else {
        // Otherwise, add to queue
        this.jobQueue.push(job)
      }
    })
  }

  /**
   * Execute a queued job in a worker thread
   */
  private executeJob<T>(job: QueuedJob<T>): void {
    this.activeWorkers++
    console.log(`Starting background job (${this.activeWorkers}/${this.maxConcurrency} active):`, job.action)

    // Create a worker thread to run the job action
    const worker = new Worker(path.join(__dirname, 'worker-wrapper.js'), {
      workerData: {
        actionPath: job.action,
        params: job.params
      }
    })

    const cleanup = () => {
      this.activeWorkers--

      // Start next job from queue if available
      if (this.jobQueue.length > 0) {
        const nextJob = this.jobQueue.shift()
        if (nextJob) {
          this.executeJob(nextJob)
        }
      }
    }

    worker.on('message', (result) => {
      cleanup()
      job.resolve(result)
    })

    worker.on('error', (error) => {
      console.log('Background job error:', error.message || error)
      cleanup()
      job.reject(error)
    })

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.log(`Background job exited with code ${code}`)
        cleanup()
        job.reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  }
}
