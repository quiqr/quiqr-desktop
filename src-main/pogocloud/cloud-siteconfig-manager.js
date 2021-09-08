const pathHelper    = require('../utils/path-helper');
const outputConsole = require('../logger/output-console');
const fileDirUtils  = require('../utils/file-dir-utils');
const fssimple      = require('fs');

class CloudSiteconfigManager {

  createConf(siteKey, siteName, pathSource){
    let newConf = {};
    newConf.key = siteKey;
    newConf.name = siteName;
    newConf.source = {};
    newConf.source.type = 'folder';
    newConf.source.path = pathSource;
    newConf.publish = [];
    newConf.publish.push({});
    newConf.publish[0].key = 'poppygo-nocloud';
    newConf.publish[0].config = {};
    newConf.publish[0].config.type = "poppygo";
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

