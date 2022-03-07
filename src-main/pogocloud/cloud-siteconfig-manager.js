const pathHelper    = require('../utils/path-helper');
const outputConsole = require('../logger/output-console');
const fileDirUtils  = require('../utils/file-dir-utils');
const fssimple      = require('fs');

class CloudSiteconfigManager {

  createConfUnmanaged(siteKey, siteName, pathSource){
    let newConf = {};
    newConf.key = siteKey;
    newConf.name = siteName;
    newConf.source = {};
    newConf.source.type = 'folder';
    newConf.source.path = pathSource;
    newConf.publish = [];
    newConf.publish.push({});
    newConf.publish[0].key = 'quiqr-nocloud';
    newConf.publish[0].config = {};
    newConf.publish[0].config.type = "quiqr";
    newConf.lastPublish = 0;

    return newConf;
  }

  createConfManaged(siteKey, siteName, pathSource, remotePath){

    //TODO REMOVE we use full path
    if(remotePath.includes("/")){
      remotePath = remotePath.split("/").pop();
    }

    let newConf = {};
    newConf.key = siteKey;
    newConf.name = siteName;
    newConf.source = {};
    newConf.source.type = 'folder';
    newConf.source.path = pathSource;
    newConf.publish = [];
    newConf.publish.push({});
    newConf.publish[0].key = 'quiqr-cloud';
    newConf.publish[0].config = {};
    newConf.publish[0].config.type = "quiqr";
    newConf.publish[0].config.path = remotePath;
    newConf.lastPublish = 0;

    return newConf;
  }


  // REMOVE INVALID KEYS
  deleteInvalidConfKeys(newConf){
    delete newConf['configPath']
    delete newConf['owner']
    delete newConf['published']
    delete newConf['publishKey']

    return newConf;
  }

  async writeConf(newConf,siteKey){
    newConf = this.deleteInvalidConfKeys(newConf);
    await fssimple.writeFileSync(pathHelper.getKeyPath(siteKey), JSON.stringify(newConf), { encoding: "utf8"});
  }


}

module.exports = new CloudSiteconfigManager;
