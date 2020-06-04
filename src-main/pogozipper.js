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
const PogoPassExtension = "pogopass";
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
        newConf.key = newKey;
        newConf.name = newKey;
        var newConfJson = JSON.stringify(newConf);

        var zip = new AdmZip();
        await zip.addFile("sitekey", Buffer.alloc(newKey.length, newKey), "");
        await zip.addFile('config.'+newKey+'.json', Buffer.alloc(newConfJson.length, newConfJson), "");

        await zip.addLocalFolder(tmppath);
        var willSendthis = zip.toBuffer();

        var exportFilePath = path+"/"+newKey+"."+PogoSiteExtension;
        await zip.writeZip(exportFilePath);

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Finished site export. Check" + exportFilePath,
        });
    }

    async importSite(path=null) {

        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        if(!path){
            let files = dialog.showOpenDialog(mainWindow, {
                filters: [
                    { name: "PoppyGo Sites", extensions: [PogoSiteExtension] }
                ],
                properties: ['openFile'] });

            if (!files || files.length != 1) {
                return;
            }
            path = files[0];
        }
        else {
            let filename = path.split('/').pop();
            let options  = {
                buttons: ["Yes","Cancel"],
                message: "You're about to import the site "+filename+". Do you like to continue?"
            }
            let response = dialog.showMessageBox(options)
            if(response === 1) return;
        }

        var zip = new AdmZip(path);
        var zipEntries = zip.getEntries();
        var siteKey = "";

        await zipEntries.forEach(function(zipEntry) {
            if (zipEntry.entryName == "sitekey") {
                siteKey = zip.readAsText("sitekey");
                console.log("found sitekey:" + siteKey);
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

        mainWindow.webContents.send("unselectSite");
    }

    async importTheme(path=null) {

        //stop server
        //stop preview

        if(!this.checkCurrentSiteKey()) {return;}
        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        if(!path){
            let files = dialog.showOpenDialog(mainWindow, {
                filters: [
                    { name: "PoppyGo Themes", extensions: [PogoThemeExtension] }
                ],
                properties: ['openFile'] });

            if (!files || files.length != 1) {
                return;
            }
            path = files[0];
        }
        else {
            let filename = path.split('/').pop();
            let options  = {
                buttons: ["Yes","Cancel"],
                message: "You're about to import the theme "+filename+" into "+ global.currentSiteKey +". Do you like to continue?"
            }
            let response = dialog.showMessageBox(options)
            if(response === 1) return;
        }

        var zip = new AdmZip(path);
        var zipEntries = zip.getEntries();
        var siteKey = "";

        await zipEntries.forEach(function(zipEntry) {
            if (zipEntry.entryName == "sitekey") {
                siteKey = zip.readAsText("sitekey");
                console.log("found sitekey:" + siteKey);
            }
        });

        if(siteKey == ""){
            dialog.showmessagebox(mainwindow, {
                type: 'warning',
                message: "failed to import site. invalid site file 1, no sitekey",
            });
            return;
        }

        if(siteKey != global.currentSiteKey){
            let options  = {
                buttons: ["Yes","Cancel"],
                message: "The Sitekey of the themefile does not match. Do you like to continue?"
            }
            let response = dialog.showMessageBox(options)
            if(response === 1) return;
        }

        outputConsole.appendLine('Found a site with key ' + siteKey);

        /*
        var confFileName = "config."+siteKey+".json";

        var conftxt = zip.readAsText(confFileName);
        if(!conftxt){
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                message: "Failed to import site. Invalid site file. 2, unreadable config."+siteKey+".json",
            });
            return;
        }

        var newConf = JSON.parse(conftxt);
        newConf.source.path = global.currentSitePath;
        newConf.key = global.currentSiteKey;
        newConf.name = global.currentSiteKey;

        let newConfigJsobPath = pathHelper.getRoot()+'config.'+currentSiteKey+'.json';
        await fssimple.writeFileSync(newConfigJsobPath, JSON.stringify(newConf), { encoding: "utf8"});

        outputConsole.appendLine('replaced site configuration');
        */

        await this.recurForceRemove(global.currentSitePath + '/themes');
        await zip.extractAllTo(global.currentSitePath, true);
        //await fs.removeSync(global.currentSitePath+'/'+confFileName);

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Theme has been imported.",
        });

        //start server
        //mainWindow.webContents.send("unselectSite");
    }

    checkCurrentSiteKey(){
        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        if(global.currentSiteKey){
            return true;
        }
        else {
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                message: "First, you need to select a site.",
            });
            return;
        }

    }

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
        await this.recurForceRemove(tmppath + '/archetypes');
        await this.recurForceRemove(tmppath + '/resources');
        await this.recurForceRemove(tmppath + '/layouts');
        await this.recurForceRemove(tmppath + '/data');
        await this.fileRegexRemove(tmppath, /sitekey$/);
        await this.fileRegexRemove(tmppath, /config.*.json/);
        await this.fileRegexRemove(tmppath, /.gitignore/);
        await this.fileRegexRemove(tmppath, /.gitlab-ci.yml/);
        await this.fileRegexRemove(tmppath, /.gitmodules/);
        await this.fileRegexRemove(tmppath, /.DS_Store/);

        var zip = new AdmZip();

        //let configJsobPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        //const newConfJson = fssimple.readFileSync(configJsobPath, {encoding:'utf8', flag:'r'});
        //await zip.addFile('config.'+global.currentSiteKey+'.json', Buffer.alloc(newConfJson.length, newConfJson), "");

        await zip.addFile("sitekey", Buffer.alloc(global.currentSiteKey.length, global.currentSiteKey), "");

        await zip.addLocalFolder(tmppath);
        var willSendthis = zip.toBuffer();

        var exportFilePath = path+"/"+global.currentSiteKey+"."+PogoThemeExtension;
        await zip.writeZip(exportFilePath);

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Finished theme export. Check" + exportFilePath,
        });

    }

    async exportPass() {
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
        await fs.ensureDir(tmppath);

        var zip = new AdmZip();

        let configJsobPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        const newConfJson = fssimple.readFileSync(configJsobPath, {encoding:'utf8', flag:'r'});
        await zip.addFile('config.'+global.currentSiteKey+'.json', Buffer.alloc(newConfJson.length, newConfJson), "");
        await zip.addFile("sitekey", Buffer.alloc(global.currentSiteKey.length, global.currentSiteKey), "");

        await zip.addLocalFolder(tmppath);
        var willSendthis = zip.toBuffer();

        var exportFilePath = path+"/"+global.currentSiteKey+"."+PogoPassExtension;
        await zip.writeZip(exportFilePath);

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Finished pass export. Check" + exportFilePath,
        });

    }

    async importPass(path=null) {

        //stop server
        //stop preview

        if(!this.checkCurrentSiteKey()) {return;}
        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        if(!path){
            let files = dialog.showOpenDialog(mainWindow, {
                filters: [
                    { name: "PoppyGo Passports", extensions: [PogoPassExtension] }
                ],
                properties: ['openFile'] });

            if (!files || files.length != 1) {
                return;
            }
            path = files[0];
        }
        else {
            let filename = path.split('/').pop();
            let options  = {
                buttons: ["Yes","Cancel"],
                message: "You're about to import the passport "+filename+" into "+ global.currentSiteKey +". Do you like to continue?"
            }
            let response = dialog.showMessageBox(options)
            if(response === 1) return;
        }

        var zip = new AdmZip(path);
        var zipEntries = zip.getEntries();
        var siteKey = "";

        await zipEntries.forEach(function(zipEntry) {
            if (zipEntry.entryName == "sitekey") {
                siteKey = zip.readAsText("sitekey");
                console.log("found sitekey:" + siteKey);
            }
        });

        if(siteKey == ""){
            dialog.showmessagebox(mainwindow, {
                type: 'warning',
                message: "failed to import site. invalid site file 1, no sitekey",
            });
            return;
        }

        if(siteKey != global.currentSiteKey){
            let options  = {
                buttons: ["Yes","Cancel"],
                message: "The Sitekey of the passport does not match. Do you like to continue?"
            }
            let response = dialog.showMessageBox(options)
            if(response === 1) return;
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

        var newConf = JSON.parse(conftxt);
        newConf.source.path = global.currentSitePath;
        newConf.key = global.currentSiteKey;
        newConf.name = global.currentSiteKey;

        let newConfigJsobPath = pathHelper.getRoot()+'config.'+currentSiteKey+'.json';
        await fssimple.writeFileSync(newConfigJsobPath, JSON.stringify(newConf), { encoding: "utf8"});

        outputConsole.appendLine('replaced site configuration');

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Passport has been imported.",
        });

        //start server
        //mainWindow.webContents.send("unselectSite");
    }

}

module.exports = new Pogozipper();
