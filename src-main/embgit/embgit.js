const path                                      = require('path');
const rootPath                                  = require('electron-root-path').rootPath;
const spawnAw                                   = require('await-spawn')
const pathHelper                                = require('../utils/path-helper');
const { EnvironmentResolver, PLATFORMS }        = require('../utils/environment-resolver');

let userconf = {
  email:   "anonymous@quiqr.org",
  name:    'anonymous',
  machine: 'unknown-machine',
  privateKey: null,
};

class Embgit{

  setUserConf(email, name){
    userconf.email = email;
    userconf.name = name;
  }

  setPrivateKeyPath(keyPath){
    userconf.privateKey = keyPath;
  }

  getGitBin(){
    let enviromnent = new EnvironmentResolver().resolve();
    let platform;
    let executable;
    let cmd;

    // CUSTOM PATH TO EMBGIT E.G. for nix developments
    if(global.process.env.EMBGIT_PATH){
      cmd = global.process.env.EMBGIT_PATH;
    }
    else{
      switch(enviromnent.platform){
        case PLATFORMS.linux: {
          platform = 'linux';
          executable = 'embgit';
          break;
        }
        case PLATFORMS.windows: {
          platform = 'win';
          executable = 'embgit.exe';
          break;
        }
        case PLATFORMS.macOS: {
          platform = 'mac';
          executable = 'embgit';
          break;
        }
        default:{ throw new Error('Not implemented.') }
      }

      if(process.env.NODE_ENV === 'production'){
        cmd = path.join(pathHelper.getApplicationResourcesDir(), "bin", executable);
      }
      else{
        cmd = path.join(rootPath, 'resources', platform, executable);
      }
    }
    return cmd;
  }

  async reset_hard(destination_path){
    const gitBinary = this.getGitBin();
    return new Promise( async (resolve )=>{
      try {
        let cmd = await spawnAw( gitBinary, [ "reset_hard", destination_path ]);
        global.outputConsole.appendLine('Reset success ...');
        console.log(cmd.toString());
        resolve(true)
      } catch (e) {
        global.outputConsole.appendLine(gitBinary + " reset_hard  " + destination_path );
        console.log("ERROR")
        console.log(e.stdout.toString())
      }
    });

  }

  /*
  async commit(destination_path, message){
    const gitBinary = this.getGitBin();
    return new Promise( async (resolve)=>{
      try {
        let cmd = await spawnAw( gitBinary, [ "commit", "-a" ,"-n", global.pogoconf.currentUsername, '-e',global.pogoconf.currentUsername+'@quiqr.cloud', '-m', message, destination_path ]);
        global.outputConsole.appendLine('Commit success ...');
        console.log(cmd.toString());
        resolve(true)
      } catch (e) {
        global.outputConsole.appendLine(gitBinary + " commit -s -i " + userconf.privateKey + " " + destination_path );
        console.log(e.stdout.toString())
        if(e.stdout.toString().includes("already up-to-date")) {
          console.log("no changed");
        }
      }
    });
  }
  */

  async quiqr_repo_show(url){
    const gitBinary = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        let cmd = await spawnAw( gitBinary, [ "quiqr_repo_show", url ]);
        global.outputConsole.appendLine(gitBinary + " quiqr_repo_show " + url );
        const response = JSON.parse(cmd.toString());
        resolve(response)
      } catch (e) {
        global.outputConsole.appendLine(gitBinary + " quiqr_repo_show " + url );
        reject(e)
      }
    });
  }

  async pull(destination_path){
    const gitBinary = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        const cmd = await spawnAw( gitBinary, [ "pull", "-s" ,"-i", userconf.privateKey, destination_path ]);
        global.outputConsole.appendLine(gitBinary + " pull -s -i " + userconf.privateKey + " " + destination_path );
        global.outputConsole.appendLine('Pull success ...');
        console.log(cmd.toString());
        resolve(true)
      } catch (e) {
        global.outputConsole.appendLine(gitBinary + " pull -s -i " + userconf.privateKey + " " + destination_path );
        reject(e);
      }
    });

  }

  async cloneFromPublicUrl(url, destination_path){
    const gitBinary = this.getGitBin();

    return new Promise( async (resolve, reject)=>{
      try {
        await spawnAw( gitBinary, [ "clone", "-s" , url , destination_path ]);
        global.outputConsole.appendLine(gitBinary + " clone -s " + url + " " + destination_path );
        global.outputConsole.appendLine('Clone success ...');
        resolve(true)
      } catch (e) {
        global.outputConsole.appendLine(gitBinary + " clone -s " + url + " " + destination_path );
        global.outputConsole.appendLine('Clone error ...:' + e);
        console.log(e.stderr.toString())
        reject(e);
      }
    });

  }

  async cloneWithKey(url, destination_path){
    const gitBinary = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        await spawnAw( gitBinary, [ "clone", "-s" ,"-i", userconf.privateKey, url , destination_path ]);
        global.outputConsole.appendLine(gitBinary + " clone -s -i " + userconf.privateKey + " " + url + " " + destination_path );
        global.outputConsole.appendLine('Clone success ...');
        resolve(true)
      } catch (e) {
        global.outputConsole.appendLine(gitBinary + " clone -s -i " + userconf.privateKey + " " + url + " " + destination_path );
        global.outputConsole.appendLine('Clone error ...:' + e);
        console.log(e.stderr.toString())
        reject(e);
      }
    });

  }
}

module.exports = new Embgit;
