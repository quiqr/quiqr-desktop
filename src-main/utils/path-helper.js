const electron                                  = require('electron')
const path                                      = require('path');
const userHome                                  = require('user-home');
const fs                                        = require('fs-extra');
const rootPath                                  = require('electron-root-path').rootPath;
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./environment-resolver');

class PathHelper{

    /* DIRS */
    getRoot(){
        const thedir = userHome +'/Sukoh/';
        fs.ensureDirSync(thedir);
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

    sitesCacheFilePath(){
        return this.getTempDir() + 'cache-sites.json';
    }

    getKnownHosts(){
        return userHome +'/.ssh/known_hosts';
    }

    getKeyPath(siteKey){
        return this.getRoot()+'config.'+siteKey+'.json';
    }

    getHugoBinForVer(version){
        let platform = process.platform.toLowerCase();
        if(platform.startsWith('win')){
            return this.getHugoBinDirForVer(version) + 'hugo.exe';
        }
        else{
            return this.getHugoBinDirForVer(version) + 'hugo';
        }

    }

    /* HELPERS */
    isLinuxAppImage(){
        return electron.app.getAppPath().indexOf("/tmp/.mount_") === 0
    }

}

module.exports = new PathHelper();
