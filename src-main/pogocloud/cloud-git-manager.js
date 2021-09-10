const fs                     = require('fs-extra');
const spawnAw                = require('await-spawn')
const path                   = require('path');
const Embgit                 = require('../embgit/embgit');
const pathHelper             = require('../utils/path-helper');
const outputConsole          = require('../logger/output-console');
const fileDirUtils           = require('../utils/file-dir-utils');
const cloudSiteconfigManager = require('./cloud-siteconfig-manager');
const cloudCacheManager      = require('../pogocloud/cloud-cache-manager');

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

  async keygen(){

    let pubkey = '';
    var git_bin = Embgit.getGitBin();
    var sukohdir = pathHelper.getRoot();

    try {
      let gencmd = await spawnAw( git_bin, [ "keygen" ], {cwd: sukohdir});
      outputConsole.appendLine('Keygen success ...');
      pubkey = await fs.readFileSync(path.join(sukohdir,"/id_rsa_pogo.pub"));
    } catch (e) {
      outputConsole.appendLine('keygen error ...:' + e);
    }

    try {
      await fs.unlinkSync(path.join(sukohdir,"/id_rsa_pogo.pub"));
    } catch (e) {
      outputConsole.appendLine('no key were there ...:' + e);
    }

    return pubkey;
  }

  async getKeyFingerprint(){
    var git_bin = Embgit.getGitBin();
    var sukohdir = pathHelper.getRoot();
    let fingerprint = null;

    try {
      let gencmd = await spawnAw( git_bin, [ "fingerprint", "-i", path.join(sukohdir,"/id_rsa_pogo") ], {cwd: sukohdir});
      fingerprint = gencmd.toString().replace(/\n/g,"");
    } catch (e) {
      outputConsole.appendLine('fingerprint error ...:' + e);
    }

    return fingerprint;
  }
}

module.exports = new CloudGitManager;
