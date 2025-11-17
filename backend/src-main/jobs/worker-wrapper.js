const { parentPort, workerData } = require('worker_threads');

/*
Worker wrapper for running background jobs in worker threads.
This receives an action module path and parameters, executes the action,
and sends the result back to the main thread.
*/

(async () => {
  try {
    const { actionPath, params } = workerData;

    // Require the action module
    const action = require(actionPath);

    // Execute the action with params
    const result = await action(params);

    // Send the result back to the main thread
    parentPort.postMessage(result);

  } catch (error) {
    console.error('Worker error:', error);
    // Worker errors are handled by the error event listener in background-job-runner.js
    throw error;
  }
})();
