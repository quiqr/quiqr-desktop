const { execFile } = require('child_process');
const pathHelper = require('./../path-helper');
const path = require('path');
const fs = require('fs-extra');
const rimraf = require("rimraf");
const hugoDownloader = require('./hugo-downloader')

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

        //await fs.ensureDir(this.config.destination);
        //await rimraf.sync(this.config.destination);

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

    async buildModel() {

        let destination = this.config.destination;
        let hugoArgs = ['--destination', destination ];

        let config = this.config.config

        if(!config){
            let config="";
        }
        else{
            config +=","
        }

        config += path.join(pathHelper.getApplicationResourcesDir(),"all","hugo-extra","config.modelcreator.yml");
        hugoArgs.push('--config');
        hugoArgs.push(config);

        //extraThemesDir
        let layoutDir = path.join(pathHelper.getApplicationResourcesDir(),"all","hugo-extra","themes","modelcreator","layouts");
        hugoArgs.push('--layoutDir');
        hugoArgs.push(layoutDir);

        const exec = pathHelper.getHugoBinForVer(this.config.hugover);
        console.log(exec + " " + hugoArgs.join(" "));

        await fs.ensureDir(destination);
        await rimraf.sync(destination);
        await fs.ensureDir(destination);

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
