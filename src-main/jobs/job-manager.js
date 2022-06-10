const BackgroundJobRunner = require('./background-job-runner');

class JobsManager{

    constructor(){
        this.backgroundJobRunner = new BackgroundJobRunner();
        this.runningActions = {};
    }

    runSharedJob(key, job ){
        let promise  = this.runningActions[key];

        if(promise==null){
            promise = job();
            promise.finally(() => delete this.runningActions[key]);
            this.runningActions[key] = promise;
        }
        return promise;
    }

    // A single background job. Will run on its own window.
    runBackgroundJob(key, resolvedPath, payload){
        let promise  = this.backgroundJobRunner.run(resolvedPath, payload);
        return promise;
    }

    // A job whose result can be used by many methods.
    runSharedBackgroundJob(key, resolvedPath, payload){
        let promise  = this.runningActions[key];

        if(promise==null){
            promise = this.backgroundJobRunner.run(resolvedPath, payload);
            promise.finally(() => delete this.runningActions[key]);
            this.runningActions[key] = promise;
        }
        return promise;
    }

    // A shared job that has maximum number of times that it can be called over time.
    runSharedDebouncedBackgroundJob(){
        throw new Error('runSharedDebouncedJob is not implemented.');
    }

    // A shared job that can not be called again until a certain amount of time has passed without it being called.
    runSharedThrottledBackgroundJob(){
        throw new Error('runSharedThrottledJob is not implemented.');
    }
}
module.exports = new JobsManager();
