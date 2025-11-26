import { Worker } from 'worker_threads'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Runs background jobs in worker threads for CPU-intensive operations
 * without blocking the main thread.
 */
export class BackgroundJobRunner {
  /**
   * Execute a job in a worker thread.
   * @param action - Path to the job module
   * @param params - Parameters to pass to the job
   * @returns Promise that resolves with the job result
   */
  run<T = any>(action: string, params?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      console.log('Starting background job:', action)

      // Create a worker thread to run the job action
      const worker = new Worker(path.join(__dirname, 'worker-wrapper.js'), {
        workerData: {
          actionPath: action,
          params: params
        }
      })

      worker.on('message', (result) => {
        console.log('Received message from background job:', result)
        resolve(result)
      })

      worker.on('error', (error) => {
        console.log('Background job error:', error.message || error)
        reject(error)
      })

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.log(`Background job exited with code ${code}`)
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })
    })
  }
}
