const fs                      = require('fs-extra');
const spawnAw                 = require('await-spawn')
const path                    = require('path');
const del                     = require('del');
const Embgit                  = require('../../embgit/embgit');
const pathHelper              = require('../../utils/path-helper');
const fileDirUtils            = require('../../utils/file-dir-utils');
const { EnvironmentResolver } = require('../../utils/environment-resolver');
const outputConsole           = require('../../logger/output-console');
const cloudSiteconfigManager  = require('./cloud-siteconfig-manager');
const cloudCacheManager       = require('./cloud-cache-manager');

class CloudGitManager {

  cloudPathToUrl(cloudPath){
    return `git@gl.quiqr.org:${cloudPath}.git`;
  }

  newSiteKeyFromPath(cloudPath){
    return cloudPath.split('/').pop() + '-' + pathHelper.randomPathSafeString(4);
  }

  async createGitManagedSiteWithSiteKeyFromTempPath(tempSourcePath, siteKey){

    const pathSite = (pathHelper.getRoot()+"sites/"+siteKey);
    await fs.ensureDir(pathSite);

    const pathSiteSource = pathHelper.getRoot()+"sites/"+siteKey+"/pogocloudrepo";

    await fs.moveSync(tempSourcePath, pathSiteSource);
    return pathSiteSource;
  }

  clonePogoCloudSite(cloudPath, siteName, managed = true){

    const siteKey = this.newSiteKeyFromPath(cloudPath);
    Embgit.setPrivateKeyPath(pathHelper.getPogoPrivateKeyPath(global.pogoconf.currentUsername))

    const temp_clone_path = pathHelper.getTempDir()+'siteFromUrl/';

    let newConf;

    return new Promise( async (resolve, reject)=>{
      try {
        await del.sync([temp_clone_path],{force:true});
        await Embgit.cloneWithKey( this.cloudPathToUrl(cloudPath), temp_clone_path);

        let pathSiteSource = await this.createGitManagedSiteWithSiteKeyFromTempPath(temp_clone_path, siteKey);

        if(managed){
          newConf = cloudSiteconfigManager.createConfManaged(siteKey, siteName, pathSiteSource, cloudPath);
        }
        else{
          newConf = cloudSiteconfigManager.createConfUnmanaged(siteKey, siteName, pathSiteSource);
        }
        await cloudSiteconfigManager.writeConf(newConf,siteKey);
        resolve(newConf);
      } catch (e) {
        console.log("Clone Error:"+siteKey);
        reject(e);
      }
    });
  }

  pullFastForwardMerge(site){

    Embgit.setPrivateKeyPath(pathHelper.getPogoPrivateKeyPath(global.pogoconf.currentUsername))

    const environmentResolver = new EnvironmentResolver();
    const UPIS = environmentResolver.getUPIS();
    const message = "merge from " + UPIS;

    return new Promise( async (resolve, reject)=>{
      try {
        //await Embgit.pull(site.source.path).then(async(e)=>{
          //resolve("merged_with_remote");
        //});
        await Embgit.reset_hard(site.source.path).then(async (e)=>{
          await Embgit.pull(site.source.path);
          console.log("pulled succesfully")
          resolve("reset-and-pulled-from-remote");
        });
      } catch (e) {
        console.log("Pull Error:"+site.key);

        console.log(e.stdout.toString())
        if(e.stdout.toString().includes("already up-to-date")) {
          resolve("no_changes")
        }
        else if(e.stdout.toString().includes("non-fast-forward update")){
          resolve("non_fast_forward");
        }
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
      pubkey = await fs.readFileSync(path.join(sukohdir,"/id_rsa_pogo.pub"), {encoding: 'utf8'});
      console.log(pubkey);
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
      console.log(e);
    }

    return fingerprint;
  }
}

module.exports = new CloudGitManager;
