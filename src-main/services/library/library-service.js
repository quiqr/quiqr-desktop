const fs                = require('fs-extra');
const fssimple             = require('fs');
const path              = require('path');
const pathHelper        = require('./../../utils/path-helper');

/*

This service containes utility functions for creating and manipulating unmounted sites

*/

class LibraryService{

  async checkDuplicateSiteConfAttrStringValue(attr, value){
    configurationDataProvider.get(function(err, data){
      if(err){
        context.reject(err);
      }
      else {
        let duplicate;
        let response;

        duplicate = data.sites.find((x)=>x[attr].toLowerCase() === value.toLowerCase());
        if(duplicate){
          response = true;
        }
        else{
          response = false;
        }

        context.resolve(response);
      }
    }, {invalidateCache: false});
  }

  async createSiteKeyFromName(name){

    var newKey = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    console.log(newKey)

    libraryService.checkDuplicateSiteConfAttrStringValue('key', newKey)
      .then((duplicate)=>{
        if(duplicate){
          newKey = newKey + '-' + pathHelper.randomPathSafeString(4);
        }
        context.resolve(newKey);
      })
      .catch((err)=>{
        context.reject(err);
      })
  }


  createConfUnmanaged(siteKey, siteName, pathSource){
    let newConf = {};
    newConf.key = siteKey;
    newConf.name = siteName;
    newConf.source = {};
    newConf.source.type = 'folder';
    newConf.source.path = pathSource;
    newConf.publish = [];
    newConf.lastPublish = 0;
    return newConf;
  }

  async createNewSiteWithTempDirAndKey(siteKey, tempDir){

    var pathSite = path.join(pathHelper.getRoot(), "sites", siteKey);
    var pathSource = path.join(pathHelper.getRoot(), "sites", siteKey, "main");

    await fs.ensureDir(pathSite);
    await fs.moveSync(tempDir, pathSource);

    let newConf = this.createConfUnmanaged(siteKey, siteKey, pathSource);
    await fssimple.writeFileSync(pathHelper.getSiteMountConfigPath(siteKey), JSON.stringify(newConf), { encoding: "utf8"});
  }

  // REMOVE INVALID KEYS
  deleteInvalidConfKeys(newConf){
    delete newConf['configPath']
    delete newConf['owner']
    delete newConf['published']
    delete newConf['publishKey']
    delete newConf['etalage']

    return newConf;
  }

  async writeSiteConf(newConf, siteKey){
    newConf = this.deleteInvalidConfKeys(newConf);
    await fssimple.writeFileSync(pathHelper.getSiteMountConfigPath(siteKey), JSON.stringify(newConf), { encoding: "utf8"});
    return true;
  }

}

module.exports = new LibraryService;
