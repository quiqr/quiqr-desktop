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
const PogoSiteExtension = "pogosite";
const PogoThemeExtension = "pogotheme";
const dialog = electron.dialog;
const outputConsole = require('./output-console');
const app = electron.app

class Pogozipper{

    async recurForceRemove(path){
        await fs.ensureDir(path);
        await rimraf.sync(path);
        console.log("created and rm'd dir: " + path);
    }

    async fileRegexRemove(path, regex){
        fssimple.readdirSync(path)
            .filter(f => regex.test(f))
            .map(f => fs.unlinkSync(path +"/"+ f))
    }

    async exportSite() {
        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        if(!this.checkCurrentSiteKey()) {return;}

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

        let dirs = dialog.showOpenDialog(mainWindow,
            { properties: ['openDirectory'] });
        if (!dirs || dirs.length != 1) {
            return;
        }

        let path = dirs[0];
        let tmppath = pathHelper.getRoot() + 'sites/'+global.currentSiteKey + '/exportTmp';

        await this.recurForceRemove(tmppath);

        fs.copySync(global.currentSitePath, tmppath);
        console.log("copied to temp dir");

        await this.recurForceRemove(tmppath + '/.git');
        await this.recurForceRemove(tmppath + '/public');
        await this.fileRegexRemove(tmppath, /sitekey$/);
        await this.fileRegexRemove(tmppath, /config.*.json/);
        await this.fileRegexRemove(tmppath, /.gitignore/);
        await this.fileRegexRemove(tmppath, /.gitlab-ci.yml/);
        await this.fileRegexRemove(tmppath, /.gitmodules/);
        await this.fileRegexRemove(tmppath, /.DS_Store/);

        let configJsobPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        const conftxt = fssimple.readFileSync(configJsobPath, {encoding:'utf8', flag:'r'});
        var newConf = JSON.parse(conftxt);
        console.log("read and parsed conf file");

        var zip = new AdmZip();

        newConf.key = newKey;
        newConf.name = newKey;
        var newConfJson = JSON.stringify(newConf);

        await zip.addFile("sitekey", Buffer.alloc(newKey.length, newKey), "");
        await zip.addFile('config.'+newKey+'.json', Buffer.alloc(newConfJson.length, newConfJson), "");

        await zip.addLocalFolder(tmppath);
        var willSendthis = zip.toBuffer();

        var exportFilePath = path+"/"+newKey+"."+PogoSiteExtension;
        await zip.writeZip(exportFilePath);

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Finished export. Check" + exportFilePath,
        });
    }

    async importSite() {
        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        let files = dialog.showOpenDialog(mainWindow, {
            filters: [
                { name: "Sukoh Sites", extensions: [PogoSiteExtension] }
            ],
            properties: ['openFile'] });

        if (!files || files.length != 1) {
            return;
        }

        var zip = new AdmZip(files[0]);
        var zipEntries = zip.getEntries();
        var siteKey = "";

        await zipEntries.forEach(function(zipEntry) {
            if (zipEntry.entryName == "sitekey") {
                siteKey = zip.readAsText("sitekey");
                console.log("found sitekey:" + siteKey);
            }
            else if (zipEntry.entryName == "pogoziptype") {
                pogoziptype = zip.readAsText("pogoziptype");
            }
        });

        if(siteKey==""){
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                message: "Failed to import site. Invalid site file 1, no siteKey",
            });
            return;
        }

        outputConsole.appendLine('Found a site with key ' + siteKey);

        var confFileName = "config."+siteKey+".json";
        var conftxt = zip.readAsText(confFileName);
        if(!conftxt){
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                message: "Failed to import site. Invalid site file. 2, unreadable config."+siteKey+".json",
            });
            return;
        }

        var todayDate = new Date().toISOString().replace(':','-').replace(':','-').slice(0,-5);
        var pathSite = (pathHelper.getRoot()+"sites/"+siteKey);
        var pathSiteSources = (pathHelper.getRoot()+"sites/"+siteKey+"/sources");
        var pathSource = (pathSiteSources+"/"+siteKey+"-"+todayDate);
        await fs.ensureDir(pathSite);
        await fs.ensureDir(pathSiteSources);
        await fs.ensureDir(pathSource);

        var newConf = JSON.parse(conftxt);
        newConf.source.path = pathSource;

        let newConfigJsobPath = pathHelper.getRoot()+'config.'+siteKey+'.json';
        await fssimple.writeFileSync(newConfigJsobPath, JSON.stringify(newConf), { encoding: "utf8"});

        outputConsole.appendLine('wrote new site configuration');
        await zip.extractAllTo(pathSource, true);

        await fs.removeSync(pathSource+'/'+confFileName);

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Site has been imported.",
        });

        //mainWindow.webContents.send("refreshSites");
        mainWindow.webContents.send("unselectSite");
        //app.relaunch()
        //app.exit()
    }

    //themes, sukoh.*, config.toml
    async importTheme() {
    }

    checkCurrentSiteKey(){
        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        if(global.currentSiteKey){
            return true;
        }
        else {
            dialog.showMessageBox(mainWindow, {
                type: 'error',
                message: "First, select a site to export.",
            });
            return;
        }

    }

    //themes, sukoh.*, config.toml
    async exportTheme() {
        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        if(!this.checkCurrentSiteKey()) {return;}

        let dirs = dialog.showOpenDialog(mainWindow,
            { properties: ['openDirectory'] });
        if (!dirs || dirs.length != 1) {
            return;
        }

        let path = dirs[0];
        let tmppath = pathHelper.getRoot() + 'sites/'+global.currentSiteKey + '/exportTmp';

        await this.recurForceRemove(tmppath);

        fs.copySync(global.currentSitePath, tmppath);
        console.log("copied to temp dir");

        await this.recurForceRemove(tmppath + '/.git');
        await this.recurForceRemove(tmppath + '/public');
        await this.recurForceRemove(tmppath + '/content');
        await this.recurForceRemove(tmppath + '/static');
        await this.recurForceRemove(tmppath + '/data');
        await this.fileRegexRemove(tmppath, /sitekey$/);
        await this.fileRegexRemove(tmppath, /config.*.json/);
        await this.fileRegexRemove(tmppath, /.gitignore/);
        await this.fileRegexRemove(tmppath, /.gitlab-ci.yml/);
        await this.fileRegexRemove(tmppath, /.gitmodules/);
        await this.fileRegexRemove(tmppath, /.DS_Store/);

        let configJsobPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        const conftxt = fssimple.readFileSync(configJsobPath, {encoding:'utf8', flag:'r'});

        var zip = new AdmZip();

        await zip.addFile("sitekey", Buffer.alloc(global.currentSiteKey.length, global.currentSiteKey), "");

        await zip.addLocalFolder(tmppath);
        var willSendthis = zip.toBuffer();

        var exportFilePath = path+"/"+global.currentSiteKey+"."+PogoThemeExtension;
        await zip.writeZip(exportFilePath);

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Finished theme export. Check" + exportFilePath,
        });

        console.log("Finished theme export:"+exportFilePath);
    }

}

module.exports = new Pogozipper();
