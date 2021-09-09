const Embgit                 = require('../embgit/embgit');
const pathHelper             = require('../utils/path-helper');
const outputConsole          = require('../logger/output-console');
const fileDirUtils           = require('../utils/file-dir-utils');
const cloudSiteconfigManager = require('./cloud-siteconfig-manager');
//const fssimple               = require('fs');
const fs                     = require('fs-extra');

//const git_bin = Embgit.getGitBin();

class CloudGitManager {

  cloudPathToUrl(cloudPath){
    return `git@gitlab.brepi.eu:${cloudPath}.git`;
  }

  newSiteKeyFromPath(cloudPath){
    return cloudPath.split('/').pop() + '-' + pathHelper.randomPathSafeString(4);
  }

  async createGitManagedSiteWithSiteKeyFromTempPath(tempSourcePath, siteKey){

    const pathSite = (pathHelper.getRoot()+"sites/"+siteKey);
    await fs.ensureDir(pathSite);

    const pathSiteSource = pathHelper.getRoot()+"sites/"+siteKey+"/pogocloudrepo";
    await fs.ensureDir(pathSiteSource);

    await fs.moveSync(tempSourcePath, pathSiteSource);
    return pathSiteSource;
  }

  clonePogoCloudSite(cloudPath, siteName){

    const siteKey = this.newSiteKeyFromPath(cloudPath);
    Embgit.setPrivateKeyPath(pathHelper.getPogoPrivateKeyPath(global.pogoconf.currentUsername))

    const temp_clone_path = pathHelper.getTempDir()+'siteFromUrl/';
    fileDirUtils.ensureEmptyDir(temp_clone_path);

    return new Promise( async (resolve, reject)=>{
      try {

        await Embgit.cloneWithKey( this.cloudPathToUrl(cloudPath), temp_clone_path);
        let pathSiteSource = await this.createGitManagedSiteWithSiteKeyFromTempPath(temp_clone_path, siteKey);
        let newConf = cloudSiteconfigManager.createConfManaged(siteKey, siteName, pathSiteSource, cloudPath);
        await cloudSiteconfigManager.writeConf(newConf,siteKey);
        resolve(newConf);
      } catch (e) {
        console.log("Clone Error:"+siteKey);
        reject(e);
      }
    });
  }
}

module.exports = new CloudGitManager;
