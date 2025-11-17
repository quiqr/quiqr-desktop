const spawnAw    = require('await-spawn')
const fs         = require('fs-extra');
const pathHelper = require('./../utils/path-helper');

//global.currentServerProccess = undefined;
//let mainWindow;

class HugoConfig {

  constructor(qSiteConfig){
    this.qSiteConfig = qSiteConfig;
  }

  async configMountsAsObject(){
    let {workspacePath, hugover} = this.qSiteConfig;
    const exec = pathHelper.getHugoBinForVer(hugover);

    return new Promise( async (resolve, reject)=>{
      try {
        if(!fs.existsSync(exec)){
          resolve([])
        }

        const output = await spawnAw( exec, [ "config", "mounts" ], { cwd: workspacePath });
        const lines = output.toString().split('\n')

        const startIdx = lines.findIndex(element => {
          return element.startsWith("{");
        });

        const endIdx = lines.findIndex(element => {
          return element.startsWith("}");
        });

        const retstring = lines.slice(startIdx, endIdx+1).join('');
        resolve(JSON.parse(retstring));

      } catch (e) {
        reject(e)
      }
    });
  }



  async configLines(){
    let { workspacePath, hugover} = this.qSiteConfig;
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

  hugoConfToObject(qSiteConfig){

  }
}

module.exports = HugoConfig;
