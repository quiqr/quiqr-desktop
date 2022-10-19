const { spawn }  = require('child_process');
const spawnAw                                   = require('await-spawn')
const fs         = require('fs-extra');
const pathHelper = require('./../utils/path-helper');

global.currentServerProccess = undefined;
let mainWindow;

class HugoConfig {

  constructor(config){
    this.config = config;
  }

  async configLines(){
    let {config, workspacePath, hugover} = this.config;
    const exec = pathHelper.getHugoBinForVer(hugover);

    return new Promise( async (resolve, reject)=>{
      try {
        if(!fs.existsSync(exec)){
          resolve([])
        }

        const output = await spawnAw( exec, [ "config" ], { cwd: workspacePath });
        const lines = output.toString().split('\n')
        resolve(lines);

      } catch (e) {
        resolve([])
      }
    });

  }
}

module.exports = HugoConfig;
