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

  async saveSiteConf(newConf){
    let configJsonPath = pathHelper.getRoot() + 'config.'+this._config.key+'.json';
    delete newConf['configPath']
    delete newConf['owner']
    delete newConf['published']
    delete newConf['publishKey']
    delete newConf['etalage']
    await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});
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
