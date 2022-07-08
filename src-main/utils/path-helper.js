const electron                           = require('electron')
const path                               = require('path');
const userHome                           = require('user-home');
const fs                                 = require('fs-extra');
const rootPath                           = require('./electron-root-path').rootPath;
const { EnvironmentResolver, PLATFORMS } = require('./environment-resolver');
const QuiqrAppConfig                     = require('../app-prefs-state/quiqr-app-config');

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
      thedir =  path.join(electron.app.getPath('home'), 'Quiqr Data');
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

  getSiteWorkspacesRoot(siteKey){
    if(siteKey.trim() === "") return null;
    return path.join(this.getSiteRoot(siteKey), 'workspaces');
  }

  getSiteWorkspaceRoot(siteKey, workspaceKey){
    if(siteKey.trim() === "") return null;
    return path.join(this.getSiteWorkspacesRoot(siteKey) , workspaceKey);
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

    if(process.env.NODE_ENV === 'production'){
      if(enviromnent.platform == PLATFORMS.macOS){
        //return path.join(rootPath, 'Contents','Resources');
        return path.join(rootPath, 'Resources');
      }
      else if(enviromnent.platform == PLATFORMS.windows){
        return path.join(rootPath);
      }
      else if(this.isLinuxAppImage()){
        const appPath = electron.app.getAppPath();
        return path.join(appPath.substring(0, appPath.lastIndexOf('/')));
      }
      else{
        return path.join(rootPath, 'resources');
      }
    }
    else{
      return path.join(rootPath, 'resources');
    }
  }


  /* FILES */
  ownersLookupCacheFilePath(){
    return path.join(this.getTempDir() , 'cache-ownerslookup.json');
  }

  userCacheFilePath(profileUserName){
    if(profileUserName){
      return path.join(this.getTempDir() , 'cache-user.'+profileUserName + '.json');
    }
    else{
      return '';
    }
  }

  siteCacheFilePath(siteKey){
    return path.join(this.getTempDir(), 'cache-site.'+siteKey+'.json');
  }

  sitesCacheFilePath(){
    return path.join(this.getTempDir() , 'cache-sites.json');
  }

  getKnownHosts(){
    return path.join(userHome ,'/.ssh/known_hosts');
  }

  getSiteMountConfigPath(siteKey){
    return path.join(this.getRoot(), 'config.'+siteKey+'.json');
  }

  getPogoPrivateKeyPath(username){
    return path.join(this.getRoot(),'profiles', username, 'id_rsa_pogo');
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
    return Math.random().toString(16).substr(2, length);
  }

  /* HELPERS */
  isLinuxAppImage(){
    return electron.app.getAppPath().indexOf("/tmp/.mount_") === 0
  }

  hugoConfigFilePath(hugoRootDir){
    let configExt;
    const configBase = path.join(hugoRootDir, "config");
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
    else{
      return null;
    }

    return configBase + configExt;
  }


}

module.exports = new PathHelper();
