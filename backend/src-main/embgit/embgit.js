const path                                  = require('path');
const fs                                    = require('fs-extra');
const rootPath                              = require('../utils/electron-root-path').rootPath;
const spawnAw                               = require('await-spawn')
const cliExecuteHelper                      = require('../utils/cli-execute-helper');
const pathHelper                            = require('../utils/path-helper');
const { EnvironmentResolver, PLATFORMS }    = require('../utils/environment-resolver');

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

  async createTemporaryPrivateKey(keyContents){
    const tmpkeypathPrivate = path.join(pathHelper.getTempDir(),'ghkey');
    await fs.writeFileSync(tmpkeypathPrivate, keyContents, 'utf-8');
    await fs.chmodSync(tmpkeypathPrivate, '0600');
    return tmpkeypathPrivate;
  }

  getGitBin(){
    let enviromnent = new EnvironmentResolver().resolve();
    let platform;
    let executable;
    let cmd;

    // CUSTOM PATH TO EMBGIT E.G. for nix developments
    if(process.env.EMBGIT_PATH){
      cmd = process.env.EMBGIT_PATH;
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
        //const rootPath = electron.app.getAppPath();
        cmd = path.join(rootPath, 'resources', platform, executable);

      }
    }
    return cmd;
  }

  async reset_hard(destination_path){
    const gitBinary = this.getGitBin();
    return new Promise( async (resolve )=>{
      try {
        //TODO REPLACE with cliExecuteHelper
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

  async repo_show_quiqrsite(url){
    const gitBinary = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        //TODO REPLACE with cliExecuteHelper
        let cmd = await spawnAw( gitBinary, [ "repo_show_quiqrsite", url ]);
        const response = JSON.parse(cmd.toString());
        resolve(response)
      } catch (e) {
        global.outputConsole.appendLine(gitBinary + " repo_show_quiqrsite " + url );
        reject(e)
      }
    });
  }

  async repo_show_hugotheme(url){
    const gitBinary = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        //TODO REPLACE with cliExecuteHelper
        let cmd = await spawnAw( gitBinary, [ "repo_show_hugotheme", url ]);
        global.outputConsole.appendLine(gitBinary + " repo_show_hugotheme " + url );
        const response = JSON.parse(cmd.toString());
        resolve(response)
      } catch (e) {
        global.outputConsole.appendLine(gitBinary + " repo_show_hugotheme " + url );
        reject(e)
      }
    });
  }

  async pull(destination_path){
    const gitBinary = this.getGitBin();
    return new Promise( async (resolve, reject)=>{
      try {
        await cliExecuteHelper.try_execute("git-pull", gitBinary, ["pull", "-s" ,"-i", userconf.privateKey, destination_path]);
        resolve(true)
      } catch (e) {
        reject(e);
      }
    });
  }

  async cloneFromPublicUrl(url, destination_path){
    const gitBinary = this.getGitBin();

    return new Promise( async (resolve, reject)=>{
      try {
        //TODO REPLACE with cliExecuteHelper
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

  async clonePrivateWithKey(url, destination_path, privateKey){

    const privateKeyPath = await this.createTemporaryPrivateKey(privateKey);

    const gitBinary = this.getGitBin();

    return new Promise( async (resolve, reject)=>{
      try {
        //TODO REPLACE with cliExecuteHelper
        await spawnAw( gitBinary, [ "clone", "-s" ,"-i", privateKeyPath, url , destination_path ]);
        global.outputConsole.appendLine(gitBinary + " clone -s -i " + privateKeyPath + " " + url + " " + destination_path );
        global.outputConsole.appendLine('Clone success ...');
        resolve(true)
      } catch (e) {
        global.outputConsole.appendLine(gitBinary + " clone -s -i " + privateKeyPath + " " + url + " " + destination_path );
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
        //TODO REPLACE with cliExecuteHelper
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
