const { execFile } = require('child_process');
const pathHelper = require('./../path-helper');
const fs = require('fs-extra');
const rimraf = require("rimraf");

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

        const exec = pathHelper.getHugoBinForVer(this.config.hugover);
        if(!fs.existsSync(exec)){
            Promise.reject(new Error(`Could not find hugo.exe for version ${this.config.hugover}.`));
            return;
        }

        //await fs.ensureDir(this.config.destination);
        //await rimraf.sync(this.config.destination);

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
