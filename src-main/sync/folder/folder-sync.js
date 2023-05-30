const path                    = require('path');
const pathHelper                = require('../../utils/path-helper');
const fs                      = require('fs-extra');
const outputConsole           = require('../../logger/output-console');
const fileDirUtils            = require('../../utils/file-dir-utils');
const configurationDataProvider = require('../../app-prefs-state/configuration-data-provider')

class FolderSync {

  constructor(config, siteKey){
    this._config = config;
    this.siteKey = siteKey;
    this.from = pathHelper.getLastBuildDir();
  }

  _fullDestinationPath(){
    return this._config.path;
  }

  async actionDispatcher(action, parameters){

    switch(action){
      case 'pullFromRemote': {
        return this.pullFastForwardMerge()
        break;
      }
      case 'pushToRemote': {
        return this.publish()
        break;
      }
      default:{ throw new Error('Not implemented.') }
    }
  }

  async pullFastForwardMerge(){
    return new Promise( (resolve, reject)=>{
      try {
        configurationDataProvider.get(async (err, configurations)=>{
          let site = configurations.sites.find((x)=>x.key===global.currentSiteKey);

          await this._ensureSyncDir(site.source.path);

          await this._syncSourceToDestination(this._fullDestinationPath(), site.source.path);
          resolve("reset-and-pulled-from-remote");
        });
      } catch (err) {
        console.log(err.stdout.toString())
        reject(err)
      }
    });
  }

  async publish(){

    await this._ensureSyncDir(this._fullDestinationPath());
    let mainWindow = global.mainWM.getCurrentInstance();

    outputConsole.appendLine('START FOLDER SYNC');
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('  from is:     ' + this.from);
    outputConsole.appendLine('');
    outputConsole.appendLine('  destination path:    ' + this._fullDestinationPath());
    outputConsole.appendLine('  override BaseURL:    ' + this._config.overrideBaseURL);
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('');

    mainWindow.webContents.send("updateProgress", 'Prepare files before uploading..', 30);
    if(this._config.publishScope === "build"){
      await this.publish_step2_preprare_dircontents_build(fullDestinationPath)
    }
    else{
      await this.publish_step2_preprare_dircontents_source(fullDestinationPath)
    }

    return true;
  }

  async publish_step2_preprare_dircontents_build(fullDestinationPath){

    await this._syncSourceToDestination(path.join(this.from,'public'), fullDestinationPath);
    await this._removeUnwanted(fullDestinationPath);
    await fs.writeFileSync(path.join(fullDestinationPath, ".quiqr_with_me"), JSON.stringify(this._quiqr_with_me_json()) ,'utf-8');
    outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  async publish_step2_preprare_dircontents_source(fullDestinationPath){

    await this._syncSourceToDestination(this.from, fullDestinationPath);
    await this._removeUnwanted(fullDestinationPath);

    if(this._config.publishScope === "source"){
      await fileDirUtils.recurForceRemove(fullDestinationPath+'/public');
    }

    await fs.ensureDir(path.join(fullDestinationPath,"static"))
    await fs.writeFileSync(path.join(fullDestinationPath, "static", ".quiqr_with_me"), JSON.stringify(this._quiqr_with_me_json()) ,'utf-8');

    outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  _quiqr_with_me_json(){
    let publDate = Date.now();
    return {
      lastPublish: publDate,
      path: this._config.repository
    }
  }

  async _removeUnwanted(fullDestinationPath){
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.quiqr-cache'));
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.gitlab-ci.yml'));
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.gitignore'));
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.sukoh'));
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.hugo_build.lock'));
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.git'));
    return true;
  }

  async _syncSourceToDestination(sourcePath, fullDestinationPath){
    await fs.copySync(sourcePath, fullDestinationPath);
    outputConsole.appendLine('synced source to destination ...');
    return true;
  }

  async _ensureSyncDir(dir){
    await fs.ensureDir(dir);
    await fs.emptyDir(dir);
    await fs.ensureDir(dir);
    return dir;
  }
}

module.exports = FolderSync;
