import { parentPort, workerData } from 'worker_threads'
import { pathToFileURL } from 'url'

/**
 * Worker wrapper for running background jobs in worker threads.
 * This receives an action module path and parameters, executes the action,
 * and sends the result back to the main thread.
 */

interface WorkerData {
  actionPath: string
  params?: any
}

;(async () => {
  try {
    const { actionPath, params } = workerData as WorkerData

    // Convert file path to file URL for ESM import
    const moduleUrl = pathToFileURL(actionPath).href

    // Dynamically import the job module (ESM)
    const module = await import(moduleUrl)

    // The job module should export a default function or named function
    const action = module.default || module[Object.keys(module)[0]]

    if (typeof action !== 'function') {
      throw new Error(`Job module at ${actionPath} does not export a function`)
    }

    // Execute the action with params
    const result = await action(params)

    // Send the result back to the main thread
    parentPort?.postMessage(result)
  } catch (error) {
    console.error('Worker error:', error)
    // Worker errors are handled by the error event listener in background-job-runner.ts
    throw error
  }
})()
