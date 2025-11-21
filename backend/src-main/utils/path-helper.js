const electron                           = require('electron')
const path                               = require('path');
const userHome                           = require('user-home');
const fs                                 = require('fs-extra');
const rootPath                           = require('./electron-root-path').rootPath;
const { EnvironmentResolver, PLATFORMS } = require('./environment-resolver');
const QuiqrAppConfig                     = require('../app-prefs-state/quiqr-app-config');
const {path7za}                          = require("7zip-bin");

const pogoconf = QuiqrAppConfig();

class PathHelper{

  /* DIRS */
  getRoot(){

    let thedir = "";

    let prefs = pogoconf.prefs;

    if(prefs.dataFolder && fs.existsSync(prefs.dataFolder)){
      thedir = prefs.dataFolder;
    }
    else {
      thedir =  path.join(electron.app.getPath('home'), 'Quiqr');
      fs.ensureDirSync(thedir);
      pogoconf.setPrefkey("dataFolder", thedir);
      pogoconf.saveState();
    }

    return thedir;
  }

  getTempDir(){
    const dir = path.join(this.getRoot(), 'temp');
    fs.ensureDirSync(dir);
    return dir;
  }

  getSiteRoot(siteKey){
    if(siteKey.trim() === "") return null;
    return path.join(this.getRoot(), 'sites', siteKey);
  }

  getSiteRootMountPath(){
    return global.currentSitePath;
  }

  getSiteDefaultPublishDir(siteKey, publishKey){
    if(siteKey.trim() === "") return null;
    return path.join(this.getSiteRoot(siteKey) , 'publish', publishKey);
  }

  getHugoBinRoot(){
    return path.join(this.getRoot() , 'tools','hugobin');
  }

  getPublishReposRoot(){
    return path.join(this.getRoot() , 'sitesRepos');
  }

  getHugoBinDirForVer(version){
    return path.join(this.getHugoBinRoot(), version);
  }

  getLastBuildDir() {
    return this._lastBuildDir;
  }

  getBuildDir(dir){
    this._lastBuildDir = dir;
    return this._lastBuildDir;
  }

  getThemesDir(){
    return path.join(this.getRoot() , 'tools', 'hugothemes');
  }

  getApplicationResourcesDir(){

    let enviromnent = new EnvironmentResolver().resolve();

    if(electron.app.isPackaged){
      if(enviromnent.platform == PLATFORMS.macOS){
        return path.join(rootPath, 'Resources');
      }
      else if(enviromnent.platform == PLATFORMS.windows){
        return path.join(rootPath);
      }
      else if(this.isLinuxAppImage()){
        const appPath = electron.app.getAppPath();
        // appPath is typically /tmp/.mount_xxx/resources/app.asar
        // extraResources (bin/, all/) are at /tmp/.mount_xxx/resources/
        // So we just need to go up one level to get the resources directory
        return path.dirname(appPath);
      }
      else{
        return path.join(rootPath, 'resources');
      }
    }
    else{
      return path.join(rootPath, 'resources');
    }
  }

  workspaceCacheThumbsPath(workspacePath, relativePath){
    return path.join(workspacePath, '.quiqr-cache/thumbs', relativePath);
  }

  getKnownHosts(){
    return path.join(userHome ,'/.ssh/known_hosts');
  }

  getSiteMountConfigPath(siteKey){
    const oldfile = path.join(this.getRoot(), 'config.'+siteKey+'.json');
    if(fs.existsSync(oldfile)){
      return oldfile;
    }
    else{
      return path.join(this.getRoot(), 'sites', siteKey, 'config.json');
    }
  }

  get7zaBin(){
    if(process.env.P7ZIP_PATH) {
      return process.env.P7ZIP_PATH;
    }
    else {
      return path7za;
    }
  }

  getHugoBinForVer(version){

    // CUSTOM PATH TO HUGO E.G. for nix developments
    if(process.env.HUGO_PATH){
      return process.env.HUGO_PATH;
    }

    let platform = process.platform.toLowerCase();
    if(platform.startsWith('win')){
      return path.join(this.getHugoBinDirForVer(version) , 'hugo.exe');
    }
    else{
      return path.join(this.getHugoBinDirForVer(version) , 'hugo');
    }
  }

  /* PATH STRING CREATORS */
  randomPathSafeString(length){
    return Math.random().toString(16).substring(2, length);
  }

  /* HELPERS */
  isLinuxAppImage(){
    return electron.app.getAppPath().indexOf("/tmp/.mount_") === 0;
  }

  hugoConfigFilePath(hugoRootDir){

    // TODO this could be faster and less code
    //let hugoConfigExp = path.join(this.workspacePath,'config.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    //let hugoConfigPath = glob.sync(hugoConfigExp)[0];


    let configExt;
    const configBase = path.join(hugoRootDir, "config");
    const configNewBase = path.join(hugoRootDir, "hugo");
    let confVersion=1;
    if(fs.existsSync(configBase+".toml")){
      configExt = '.toml';
    }
    else if(fs.existsSync(configBase+".json")){
      configExt = '.json';
    }
    else if(fs.existsSync(configBase+".yaml")){
      configExt = '.yaml';
    }
    else if(fs.existsSync(configBase+".yml")){
      configExt = '.yml';
    }
    else if(fs.existsSync(configNewBase+".toml")){
      configExt = '.toml';
      confVersion=2;
    }
    else if(fs.existsSync(configNewBase+".json")){
      configExt = '.json';
      confVersion=2;
    }
    else if(fs.existsSync(configNewBase+".yaml")){
      configExt = '.yaml';
      confVersion=2;
    }
    else if(fs.existsSync(configNewBase+".yml")){
      configExt = '.yml';
      confVersion=2;
    }
    else{
      return null;
    }

    if(confVersion===1){
      return configBase + configExt;
    }
    else{
      return configNewBase + configExt;
    }

  }



}

module.exports = new PathHelper();
