const path                                      = require('path');
const rootPath                                  = require('electron-root-path').rootPath;
const spawn                                     = require("child_process").spawn;
const spawnAw                                   = require('await-spawn')
const pathHelper                                = require('../utils/path-helper');
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('../utils/environment-resolver');

let userconf = {
  email:   "anonymous@poppygo.xyz",
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

    return cmd;
  }

  async cloneWithKey(url, destination_path){
    const git_bin = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        let clonecmd = await spawnAw( git_bin, [ "clone", "-s" ,"-i", userconf.privateKey, url , destination_path ]);
        await outputConsole.appendLine(git_bin + " clone -s -i " + userconf.privateKey + " " + url + " " + destination_path );
        outputConsole.appendLine('Clone success ...');
        resolve(true)
      } catch (e) {
        await outputConsole.appendLine(git_bin + " clone -s -i " + userconf.privateKey + " " + url + " " + destination_path );
        await outputConsole.appendLine('Clone error ...:' + e);
        reject(e);
      }
    });

  }
}

module.exports = new Embgit;
