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

    // CUSTOM PATH TO EMBGIT E.G. for nix developments
    if(global.process.env.EMBGIT_PATH){
      cmd = global.process.env.EMBGIT_PATH;
    }
    else{
      //TODO USE ENVIRONMENT UTIL
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
    const git_bin = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        let cmd = await spawnAw( git_bin, [ "reset_hard", destination_path ]);
        outputConsole.appendLine('Reset success ...');
        console.log(cmd.toString());
        resolve(true)
      } catch (e) {
        await outputConsole.appendLine(git_bin + " reset_hard  " + destination_path );
        console.log("ERROR")
        console.log(e.stdout.toString())
      }
    });

  }

  async commit(destination_path, message){
    const git_bin = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        let cmd = await spawnAw( git_bin, [ "commit", "-a" ,"-n", global.pogoconf.currentUsername, '-e','sukoh@brepi.eu', '-m', message, destination_path ]);
        outputConsole.appendLine('Commit success ...');
        console.log(cmd.toString());
        resolve(true)
      } catch (e) {
        await outputConsole.appendLine(git_bin + " commit -s -i " + userconf.privateKey + " " + destination_path );
        console.log(e.stdout.toString())
        if(e.stdout.toString().includes("already up-to-date")) {
          console.log("no changed");
        }
      }
    });

  }

  async pull(destination_path){
    const git_bin = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        let clonecmd = await spawnAw( git_bin, [ "pull", "-s" ,"-i", userconf.privateKey, destination_path ]);
        await outputConsole.appendLine(git_bin + " pull -s -i " + userconf.privateKey + " " + destination_path );
        outputConsole.appendLine('Pull success ...');
        console.log(clonecmd.toString());
        resolve(true)
      } catch (e) {
        await outputConsole.appendLine(git_bin + " pull -s -i " + userconf.privateKey + " " + destination_path );
        //await outputConsole.appendLine('Pull error ...:' + e);
        reject(e);
      }
    });

  }
  async cloneWithKey(url, destination_path){
    const git_bin = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        let cmd = await spawnAw( git_bin, [ "clone", "-s" ,"-i", userconf.privateKey, url , destination_path ]);
        await outputConsole.appendLine(git_bin + " clone -s -i " + userconf.privateKey + " " + url + " " + destination_path );
        outputConsole.appendLine('Clone success ...');
        resolve(true)
      } catch (e) {
        await outputConsole.appendLine(git_bin + " clone -s -i " + userconf.privateKey + " " + url + " " + destination_path );
        await outputConsole.appendLine('Clone error ...:' + e);
        console.log(e.stderr.toString())
        reject(e);
      }
    });

  }
}

module.exports = new Embgit;
