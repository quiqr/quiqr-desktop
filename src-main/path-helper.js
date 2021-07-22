const electron = require('electron')
const path = require('path');
const userHome = require('user-home');
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./environment-resolver');
const rootPath = require('electron-root-path').rootPath;

class PathHelper{

    getKnownHosts(){
        return userHome +'/.ssh/known_hosts';
    }

    getRoot(){
        return userHome +'/Sukoh/';
    }

    getTempDir(){
        return this.getRoot()+ 'temp/';
    }

    getSiteRoot(siteKey){
        return this.getRoot()+ `sites/${siteKey}/`;
    }

    getKeyPath(siteKey){
        return this.getRoot()+'config.'+siteKey+'.json';
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

    getHugoBinForVer(version){
        let platform = process.platform.toLowerCase();
        if(platform.startsWith('win')){
            return this.getHugoBinDirForVer(version) + 'hugo.exe';
        }
        else{
            return this.getHugoBinDirForVer(version) + 'hugo';
        }

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

    isLinuxAppImage(){
        return electron.app.getAppPath().indexOf("/tmp/.mount_") === 0
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
}

module.exports = new PathHelper();
