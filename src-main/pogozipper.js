/* Copyright PoppyGo 2020
 *
 * pim@lingewoud.nl
 *
 */
const electron = require('electron')
const mainWindowManager = require('./main-window-manager');

const rimraf = require("rimraf");

const ProgressBar = require('electron-progressbar');

const pathHelper = require('./path-helper');
const fs = require('fs-extra');
const fssimple = require('fs');
const AdmZip = require('adm-zip');
//const PogozipperExtension = "pogozip"
const PogozipperExtension = "hsite"
const dialog = electron.dialog;

class Pogozipper{

    async recurForceRemove(path){
        await fs.ensureDir(path);
        await rimraf.sync(path);
        console.log("created and rm'd dir: " + path);
    }

    async exportSite() {
        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        if(!global.currentSiteKey){
            dialog.showMessageBox(mainWindow, {
                type: 'error',
                message: "First, select a site to export.",
            });
            return;
        }

        const prompt = require('electron-prompt');
        var newKey = await prompt({
            title: 'Enter site key',
            label: 'key:',
            value: global.currentSiteKey,
            inputAttrs: {
                type: 'text',
                required: true
            },
            type: 'input'
        }, mainWindow);

        if(!newKey || newKey===""){
            return;
        }

        let dirs = dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
        if (!dirs || dirs.length != 1) {
            return;
        }

        var progressBar = new ProgressBar({
            indeterminate: false,
            text: 'Exporting, ..',
            abortOnError: true,
            detail: 'Preparing export..',
            browserWindow: { parent: mainWindow }
        });

        progressBar.on('completed', function() {
            progressBar.detail = 'Site has been exported';
        })
            .on('aborted', function(value) {
                console.info(`aborted... ${value}`);
            })
            .on('progress', function(value) {
            });

        progressBar.value += 1;
        progressBar.detail = `Start exporting site...`

        let path = dirs[0];
        let tmppath = pathHelper.getRoot() + 'sites/'+global.currentSiteKey + '/exportTmp';

        await this.recurForceRemove(tmppath);

        fs.copySync(global.currentSitePath, tmppath);
        console.log("copied to temp dir");

        await this.recurForceRemove(tmppath + '/.git');
        await this.recurForceRemove(tmppath + '/public');

        const conftxt = fssimple.readFileSync((pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json'), {encoding:'utf8', flag:'r'});
        var newConf = JSON.parse(conftxt);
        console.log("read and parsed conf file");

        var zip = new AdmZip();

        newConf.key = newKey;
        newConf.name = newKey;
        var newConfJson = JSON.stringify(newConf);

        progressBar.value += 1;
        progressBar.detail = `Packing configuration...`

        await zip.addFile("sitekey", Buffer.alloc(newKey.length, newKey), "");
        await zip.addFile('config.'+newKey+'.json', Buffer.alloc(newConfJson.length, newConfJson), "");

        progressBar.value += 1;
        progressBar.detail = `Packing files...`

        await zip.addLocalFolder(tmppath);
        var willSendthis = zip.toBuffer();

        progressBar.value += 1;
        progressBar.detail = `Creating site file...`

        var exportFilePath = path+"/"+newKey+"."+PogozipperExtension;
        await zip.writeZip(exportFilePath);

        progressBar.setCompleted();
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Finished export. Check" + exportFilePath,
        });

        console.log("Finished export:"+exportFilePath);
    }

    importTheme() {
        console.log('import')
    }

    exportTheme() {
        console.log('export')
    }

}

module.exports = new Pogozipper();
