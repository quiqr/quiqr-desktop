const fs                      = require('fs-extra');
const spawnAw                 = require('await-spawn');
const path                    = require('path');
const del                     = require('del');
const Embgit                  = require('../../embgit/embgit');
const pathHelper              = require('../../utils/path-helper');
const outputConsole           = require('../../logger/output-console');
const libraryService          = require('../../services/library/library-service');

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


  clonePogoCloudSite(cloudPath, siteName, managed = true){

    const siteKey = this.newSiteKeyFromPath(cloudPath);
    Embgit.setPrivateKeyPath(pathHelper.getPogoPrivateKeyPath(global.pogoconf.currentUsername))

    const temp_clone_path = pathHelper.getTempDir()+'siteFromUrl/';

    let newConf;

    return new Promise( (resolve, reject)=>{
      try {
        del.sync([temp_clone_path],{force:true});
        Embgit.cloneWithKey( this.cloudPathToUrl(cloudPath), temp_clone_path);

        //TODO TEST22
        let pathSiteSource = this.createGitManagedSiteWithSiteKeyFromTempPath(temp_clone_path, siteKey);

        if(managed){
          newConf = this.createConfManaged(siteKey, siteName, pathSiteSource, cloudPath);
        }
        else{
          newConf = libraryService.createConfUnmanaged(siteKey, siteName, pathSiteSource);
        }
        libraryService.writeSiteConf(newConf,siteKey);
        resolve(newConf);
      } catch (err) {
        console.log("Clone Error:"+siteKey);
        reject(err);
      }
    });
  }

  pullFastForwardMerge(site){

    Embgit.setPrivateKeyPath(pathHelper.getPogoPrivateKeyPath(global.pogoconf.currentUsername))

    return new Promise( (resolve, reject)=>{
      try {
        Embgit.reset_hard(site.source.path).then(async ()=>{
          await Embgit.pull(site.source.path);
          console.log("pulled succesfully")
          resolve("reset-and-pulled-from-remote");
        });
      } catch (err) {
        console.log("Pull Error:"+site.key);

        console.log(err.stdout.toString())
        if(err.stdout.toString().includes("already up-to-date")) {
          resolve("no_changes")
        }
        else if(err.stdout.toString().includes("non-fast-forward update")){
          resolve("non_fast_forward");
        }
        else{
          reject(err)
        }
      }
    });
  }

  async keygen(){

    let pubkey = '';
    var git_bin = Embgit.getGitBin();
    var sukohdir = pathHelper.getRoot();

    try {
      await spawnAw( git_bin, [ "keygen" ], {cwd: sukohdir});
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
