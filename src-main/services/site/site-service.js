const syncFactory       = require('./../../sync/sync-factory');
const siteSourceFactory = require('./../../site-sources/site-source-factory');
const pathHelper        = require('./../../utils/path-helper');

class SiteService{
  constructor(config){
    this._config = config;
  }

  _getSiteSource(){
    return siteSourceFactory.get(this._config.key, this._config.source);
  }

  async listWorkspaces(){
    return this._getSiteSource().listWorkspaces();
  }

  async getWorkspaceHead(workspaceKey){
    return (await this.listWorkspaces())
      .find(x => x.key===workspaceKey);
  }

  getSiteConfig(){
    return this._config;
  }

  async mountWorkspace(workspaceKey){
    await this._getSiteSource().mountWorkspace(workspaceKey);
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

  /*
  async publish(publishConfig){
    let from = pathHelper.getLastBuildDir();
    if(from==null)
      throw new Error('Could not resolve the last build directory.');

    let publisher = syncFactory.getPublisher(publishConfig.config, this._config.key);
    return await publisher.publish({siteKey: this._config.key, publishKey: publishConfig.key, from });
  }

  async mergeSiteWithRemote(publishConfig){
    let publisher = syncFactory.getPublisher(publishConfig.config, this._config.key);
    return await publisher.pullFastForwardMerge({siteKey: this._config.key, publishKey: publishConfig.key });
  }
  */

  async publisherDispatchAction(publishConfig, action, actionParameters){
    let publisher = syncFactory.getPublisher(publishConfig, this._config.key);
    return await publisher.actionDispatcher(action, actionParameters);
  }

}

module.exports = SiteService;
