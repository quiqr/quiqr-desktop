let jobsManager = require('./job-manager');

module.exports.createThumbnailJob = (src , dest )=> {
    return jobsManager.runSharedBackgroundJob(
        `create-thumbnail-job:${src}->${dest}`,
        require.resolve('./create-thumbnail-job'),
        {src, dest}
    );
}

module.exports.globJob = (expression , options ) => {
    return jobsManager.runBackgroundJob(
        `glob-job:${expression}(${JSON.stringify(options)})`,
        require.resolve('./glob-job'),
        {expression, options}
    );
}

module.exports.updateCommunityTemplatesJob = () => {
    return jobsManager.runBackgroundJob(
        'update-community-templates-job',
        require.resolve('./update-community-templates-job.js')
    )
}