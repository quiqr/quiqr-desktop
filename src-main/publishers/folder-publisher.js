const fs         = require('fs-extra');
const pathHelper = require('./../utils/path-helper');


class FolderPublisher{
    constructor(config){
        this._config = config;
    }

    async publish(context){
        let { path, clean } = this._config;

        let resolvedDest = path || pathHelper.getSiteDefaultPublishDir(context.siteKey, context.publishKey);
        await fs.ensureDir(resolvedDest);
        let cleanDestBefore = clean===true;
        if(cleanDestBefore){
            await fs.emptyDir(resolvedDest);
        }
        return fs.copy(context.from, resolvedDest);
    }
}

module.exports = FolderPublisher;
