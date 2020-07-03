const { execFile } = require('child_process');
const electron = require('electron')
const fs = require('fs-extra');
const mkdirp = require("mkdirp");
const path = require("path");
const glob = require("glob");
const pathHelper = require('./../path-helper');
const {path7za} = require("7zip-bin");
const request = require('request');
const outputConsole = require('./../output-console');
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./../environment-resolver');

const ProgressBar = require('electron-progressbar');
const mainWindowManager = require('../main-window-manager');

class OfficialHugoSourceUrlBuilder{
    build(enviromnent, version){
        let platform;
        let format;
        switch(enviromnent.platform){
            case PLATFORMS.linux: { platform = 'Linux'; format = 'tar.gz'; break; }
            case PLATFORMS.windows: { platform = 'Windows'; format = 'zip'; break; }
            case PLATFORMS.macOS: { platform = 'macOS'; format = 'tar.gz'; break; }
            default:{ throw new Error('Not implemented.') }
        }
        let arch;
        switch(enviromnent.arch){
            case ARCHS.x32: { arch = '32bit'; break; }
            case ARCHS.x64: { arch = '64bit'; break; }
            default:{ throw new Error('Not implemented.') }
        }
        version = version.replace(/^v/i,'');
        return `https://github.com/gohugoio/hugo/releases/download/v${version.replace('extended_','')}/hugo_${version}_${platform}-${arch}.${format}`;
    }
}

class OfficialHugoUnpacker{

    _unpackLinux(packagePath){
        packagePath = path.normalize(packagePath);
        let output = path.dirname(packagePath);
        return new Promise((resolve,reject)=>{
            execFile(path7za, ['e', packagePath, '-o'+output, '*', '-r', '-y' ], (error, stdout, stderr)=>{
                if(error) reject(error);
                else resolve();
            });
        }).then(()=>{
            return new Promise((resolve, reject)=>{
                let globExpression = packagePath.replace('download.partial','download');
                glob(globExpression, (err, matches)=>{
                    if(err){reject(err); return; }
                    if(matches.length!==1){ reject(new Error(`Expecting one "tar" file, found ${matches.length}.`)); }
                    resolve(matches[0]);
                });
            });
        }).then((tarFile)=>{
            return new Promise((resolve, reject)=>{
                execFile(path7za, ['e', tarFile, '-o'+output, 'hugo*', '-r', '-y' ], (error, stdout, stderr)=>{
                    if(error){ reject(error); return; }
                    fs.chmodSync(packagePath.replace('download.partial','hugo'),722);
                    resolve();
                });
            });
        });
    }

    _unpackWindows(packagePath){
        packagePath = path.normalize(packagePath);
        let output = path.dirname(packagePath);
        return new Promise((resolve,reject)=>{
            execFile(path7za, ['e', packagePath, '-o'+output, '*.exe', '-r', '-y' ], (error, stdout, stderr)=>{
                if(error)
                    reject(error);
                else
                    resolve();
            });
        });
    }

    unpack(packagePath, enviromnent){
        switch(enviromnent.platform){
            case PLATFORMS.linux:
            case PLATFORMS.macOS: //don't know if this will work
                return this._unpackLinux(packagePath);
            case PLATFORMS.windows:
                return this._unpackWindows(packagePath);
            default:
                throw new Error('Not implemented.');
        }
    }
}

class HugoDownloader{

    constructor(){
        this._isRunning = false;
        this._queue = [];
    }

    async _downloadToFile(url, dest){

        let dir = path.dirname(dest);
        let exists = fs.existsSync(dir);
        if(!exists)
            mkdirp.sync(dir);

        return new Promise((resolve, reject) =>{
            let stream = fs.createWriteStream(dest);
            stream.on('finish', () => {
                resolve();
            });

            request.get(url)
            .on('error', function(err) {
              reject(err);
            })
            .pipe(stream)
        });
    }

    async download(version){

        if(this._isRunning){ return; }

        let bin = pathHelper.getHugoBinForVer(version);
        if(fs.existsSync(bin)){
            return;
        }

        this._isRunning = true;

        try{
            let enviromnent = new EnvironmentResolver().resolve();
            let url = new OfficialHugoSourceUrlBuilder().build(enviromnent,version);
            let unpacker = new OfficialHugoUnpacker();
            let tempDest = pathHelper.getHugoBinDirForVer(version) + 'download.partial';


            if(fs.existsSync(tempDest)){
                await fs.unlink(tempDest)
            }

            let mainWindow = mainWindowManager.getCurrentInstance();
            var progressBar = new ProgressBar({
                indeterminate: false,
                text: 'Downloading PoppyGo Components, ..',
                abortOnError: true,
                detail: 'Preparing download..',
                browserWindow: {
                    frame: false,
                    parent: mainWindow,
                    webPreferences: {
                        nodeIntegration: true
                    }
                }

            });

            progressBar.on('completed', function() {
                progressBar.detail = 'Hugo has been installed';
            })
                .on('aborted', function(value) {
                    console.info(`aborted... ${value}`);
                })
                .on('progress', function(value) {
                });

            progressBar.value += 20;

            outputConsole.appendLine(`Hugo installation started. Downloading package from ${url}...`);
            progressBar.value += 30;
            progressBar.detail = `Hugo installation started. Downloading...`

            await this._downloadToFile(url, tempDest);

            outputConsole.appendLine(`Unpacking....`);
            progressBar.value += 30;
            progressBar.detail = `Unpacking Hugo-component`
            await unpacker.unpack(tempDest, enviromnent);
            await fs.unlink(tempDest);

            progressBar.value = 100;
            progressBar.detail = `Hugo installation completed.`
            progressBar.setCompleted();
            progressBar._window.hide();
            outputConsole.appendLine(`Hugo installation completed.`);
            this._isRunning = false;
        }
        catch(e){
            outputConsole.appendLine(`Hugo installation failed.`);
            const dialog = electron.dialog;
            let mainWindow = mainWindowManager.getCurrentInstance();
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                message: "Hugo installation failed. Please contact your developer",
            });

            progressBar._window.hide();
            progressBar.close();
            this._isRunning = false;
            return e;
        }
    }
}

module.exports = {
    downloader: new HugoDownloader(),
    HugoDownloader: HugoDownloader,
    OfficialHugoSourceUrlBuilder,
    OfficialHugoUnpacker
}
