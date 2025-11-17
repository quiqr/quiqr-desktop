
const { Worker } = require('worker_threads');
const path = require('path');

class BackgroundJobRunner{

  run(action , params ) {
    return new Promise((resolve, reject)=>{
      console.log('Starting background job:', action);

      // Create a worker thread to run the job action
      const worker = new Worker(path.join(__dirname, 'worker-wrapper.js'), {
        workerData: {
          actionPath: action,
          params: params
        }
      });

      worker.on('message', (result) => {
        console.log('Received message from background job:', result);
        resolve(result);
      });

      worker.on('error', (error) => {
        console.log('Background job error:', error.message || error);
        reject(error);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.log(`Background job exited with code ${code}`);
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
}

module.exports = BackgroundJobRunner;
