const path           = require('path');
const fs             = require('fs-extra');
const rimraf         = require("rimraf");
const { execFile }   = require('child_process');
const hugoDownloader = require('./hugo-downloader')
const pathHelper     = require('./../utils/path-helper');

class HugoBuilder{

  constructor(config){
    this.config = config;
  }

  async create(name, directory) {

    let hugoArgs = ['new', 'site' , name];

    const exec = pathHelper.getHugoBinForVer(this.config.hugover);
    if(!fs.existsSync(exec)){
      Promise.reject(new Error(`Could not find hugo.exe for version ${this.config.hugover}.`));
      return;
    }

    return new Promise((resolve, reject)=>{
      execFile(
        exec,
        hugoArgs,
        {
          cwd: directory,
          windowsHide: true,
          timeout: 60000, //1 minute
        },
        (error, stdout, stderr) => {
          if(error){
            reject(error);
            return;
          }
          resolve();
        }
      );
    })
  }

  async build() {

    let hugoArgs = ['--destination', this.config.destination ];
    if(this.config.config){
      hugoArgs.push('--config');
      hugoArgs.push(this.config.config);
    }
    if(this.config.baseUrl){
      hugoArgs.push('--baseURL');
      hugoArgs.push(this.config.baseUrl);
    }
    console.log(this.config)
    console.log(hugoArgs)

    const exec = pathHelper.getHugoBinForVer(this.config.hugover);
    if(!fs.existsSync(exec)){
      Promise.reject(new Error(`Could not find hugo.exe for version ${this.config.hugover}.`));
      return;
    }

    return new Promise((resolve, reject)=>{
      execFile(
        exec,
        hugoArgs,
        {
          cwd: this.config.workspacePath,
          windowsHide: true,
          timeout: 60000, //1 minute
        },
        (error, stdout, stderr) => {
          if(error){
            reject(error);
            return;
          }
          resolve();
        }
      );
    })
  }
}

module.exports = HugoBuilder;
