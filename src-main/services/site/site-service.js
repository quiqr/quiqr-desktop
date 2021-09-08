const fs                = require('fs-extra');
const path              = require('path');
const publisherFactory  = require('./../../publishers/publisher-factory');
const siteSourceFactory = require('./../../site-sources/site-source-factory');
const pathHelper        = require('./../../utils/path-helper');

class SiteService{
    constructor(config){
        this._config = config;
    }

    _getSiteSource(){
        return siteSourceFactory.get(this._config.key, this._config.source);
    }

    //List all workspaces
    async listWorkspaces(){
        return this._getSiteSource().listWorkspaces();
    }

    async getWorkspaceHead(workspaceKey){
        return (await this.listWorkspaces())
            .find(x => x.key===workspaceKey);
    }

    async mountWorkspace(workspaceKey){
        console.log("mount workspace:"+workspaceKey);
        await this._getSiteSource().mountWorkspace(workspaceKey);
    }

    async getCreatorMessage(){

        let indexPath = this._config.source.path + "/poppygo/home/index.md"
        try {
            if (fs.existsSync(indexPath)) {
                var data = fs.readFileSync(indexPath);
                return data.toString();
            }
        } catch(err) {
            console.error('error checking');
        }
        return '';

    }

    _findFirstMatchOrDefault(arr, key){
        let result;

        if(key){
            result = (arr||[]).find(x => x.key===key);
            if(result) return result;
        }

        result = (arr||[]).find(x => x.key==='default'|| x.key==='' || x.key==null);
        if(result) return result;

        if(arr!==undefined && arr.length===1)
            return arr[0];

        if(key){
            throw new Error(`Could not find a config for key "${key}" and a default value was not available.`);
        }
        else{
            throw new Error(`Could not find a default config.`);
        }
    }

    async publish(publishKey){
        let publishConfig = this._findFirstMatchOrDefault(this._config.publish, publishKey);
        if(publishConfig==null)
            throw new Error(`Could not find a publisher config for key '${publishKey}'.`);
        if(publishConfig.config==null)
            throw new Error(`The matcher publisher config does not have a property config.`);

        let from = pathHelper.getLastBuildDir();
        if(from==null)
            throw new Error('Could not resolve the last build directory.');

        let publisher = publisherFactory.getPublisher(publishConfig.config);
        return await publisher.publish({siteKey: this._config.key, publishKey, from });
    }
}

module.exports = SiteService;
