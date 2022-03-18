const electron                                  = require('electron')
const path                                      = require('path');
const userHome                                  = require('user-home');
const fs                                        = require('fs-extra');
const rootPath                                  = require('electron-root-path').rootPath;
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./environment-resolver');
const QuiqrAppConfig                            = require('../app-prefs-state/quiqr-app-config');

const pogoconf = QuiqrAppConfig();

class PathHelper{

  /* DIRS */
  getRoot(){

    let dataFolder = "";
    let thedir = "";
    let prefs = pogoconf.prefs;

    if(prefs.dataFolder && fs.existsSync(prefs.dataFolder)){
      thedir = prefs.dataFolder+'/';
    }
    else {
      thedir = "~/Quiqr Data/";
      fs.ensureDirSync(thedir);
      pogoconf.setPrefkey("dataFolder", thedir);
      pogoconf.saveState();
    }

    return thedir;
  }

  getTempDir(){
    const dir = this.getRoot()+ 'temp/';
    fs.ensureDirSync(dir);
    return dir;
  }

  getSiteRoot(siteKey){
    return this.getRoot()+ `sites/${siteKey}/`;
  }

  getSiteWorkspacesRoot(siteKey){
    return this.getSiteRoot(siteKey) + 'workspaces/';
  }

  getSiteWorkspaceRoot(siteKey, workspaceKey){
    return this.getSiteWorkspacesRoot(siteKey) + workspaceKey + '/';
  }

  getSiteDefaultPublishDir(siteKey, publishKey){
    return this.getSiteRoot(siteKey) + `publish/${publishKey}/`;
  }

  getHugoBinRoot(){
    return this.getRoot() + 'tools/hugobin/';
  }
  getPublishReposRoot(){
    return this.getRoot() + 'sitesRepos/';
  }

  getHugoBinDirForVer(version){
    return this.getHugoBinRoot() + version + '/';
  }

  getLastBuildDir() {
    return this._lastBuildDir;
  }

  getBuildDir(path){
    this._lastBuildDir = path + "/";
    return this._lastBuildDir;
  }

  getThemesDir(){
    return this.getRoot() + 'tools/hugothemes/';
  }

  getApplicationResourcesDir(){

    let enviromnent = new EnvironmentResolver().resolve();

    if(process.env.NODE_ENV === 'production'){
      if(enviromnent.platform == PLATFORMS.macOS){
        return path.join(rootPath, 'Contents','Resources');
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
    return this.getTempDir() + 'cache-ownerslookup.json';
  }

  userCacheFilePath(profileUserName){
    if(profileUserName){
      return this.getTempDir() + 'cache-user.'+profileUserName + '.json';
    }
    else{
      return '';
    }
  }

  siteCacheFilePath(siteKey){
    return this.getTempDir() + 'cache-site.'+siteKey+'.json';
  }

  sitesCacheFilePath(){
    return this.getTempDir() + 'cache-sites.json';
  }

  getKnownHosts(){
    return userHome +'/.ssh/known_hosts';
  }

  getKeyPath(siteKey){
    return this.getRoot()+'config.'+siteKey+'.json';
  }

  getPogoPrivateKeyPath(username){
    return this.getRoot()+'profiles/'+username+'/id_rsa_pogo';
  }

  getHugoBinForVer(version){

    // CUSTOM PATH TO HUGO E.G. for nix developments
    if(global.process.env.HUGO_PATH){
      return global.process.env.HUGO_PATH;
    }

    let platform = process.platform.toLowerCase();
    if(platform.startsWith('win')){
      return this.getHugoBinDirForVer(version) + 'hugo.exe';
    }
    else{
      return this.getHugoBinDirForVer(version) + 'hugo';
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

}

module.exports = new PathHelper();
