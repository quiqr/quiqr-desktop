const fs             = require('fs-extra');
const { execFile }   = require('child_process');
const pathHelper     = require('./../utils/path-helper');

class HugoBuilder{

  constructor(config){
    this.config = config;
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

    const exec = pathHelper.getHugoBinForVer(this.config.hugover);
    if(!fs.existsSync(exec)){
      Promise.reject(new Error(`Could not find hugo executable for version ${this.config.hugover}.`));
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
        (error) => {
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
