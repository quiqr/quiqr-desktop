const path                    = require('path');
const fs                      = require('fs-extra');
const outputConsole           = require('../../logger/output-console');
const fileDirUtils            = require('../../utils/file-dir-utils');

class FolderSync {
  constructor(config){
    this._config = config;
  }

  async publish(context){

    const fullDestinationPath = this._config.path
    await this._ensureSyncDir(fullDestinationPath);
    let mainWindow = global.mainWM.getCurrentInstance();

    outputConsole.appendLine('START FOLDER SYNC');
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('  context.from is:     ' + context.from);
    outputConsole.appendLine('');
    outputConsole.appendLine('  destination path:    ' + fullDestinationPath);
    outputConsole.appendLine('  override BaseURL:    ' + this._config.overrideBaseURL);
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('');

    mainWindow.webContents.send("updateProgress", 'Prepare files before uploading..', 30);
    if(this._config.publishScope === "build"){
      await this.publish_step2_preprare_dircontents_build(context, fullDestinationPath)
    }
    else{
      await this.publish_step2_preprare_dircontents_source(context, fullDestinationPath)
    }

    return true;
  }

  async publish_step2_preprare_dircontents_build(context, fullDestinationPath){

    await this._syncSourceToDestination(path.join(context.from,'public'), fullDestinationPath);
    await this._removeUnwanted(fullDestinationPath);
    await fs.writeFileSync(path.join(fullDestinationPath, ".quiqr_with_me"), JSON.stringify(this._quiqr_with_me_json()) ,'utf-8');
    outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  async publish_step2_preprare_dircontents_source(context, fullDestinationPath){

    await this._syncSourceToDestination(context.from, fullDestinationPath);
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
