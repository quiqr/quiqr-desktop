/* Copyright PoppyGo 2020
 *
 * pim@lingewoud.nl
 *
 */
const electron = require('electron')
const pathHelper = require('./path-helper');
const fs = require('fs-extra');
const dialog = electron.dialog;
const mainWindowManager = require('./main-window-manager');
const fssimple = require('fs');
const outputConsole = require('./output-console');
const path = require("path");
const { lstatSync } = require('fs')

class PogoSiteVersioHelper{

    async setSiteVersion(versionDir){
        const mainWindow = mainWindowManager.getCurrentInstanceOrNew();

        let siteKey = global.currentSiteKey;
        if(siteKey==""){
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                message: "No site selected, cannot switch version.",
            });
        }

        console.log(global.currentSiteKey);
        console.log(versionDir);

        let configFilePath = path.join(pathHelper.getRoot(),'config.'+siteKey+'.json');
        let conftxt = fs.readFileSync(configFilePath);
        var newConf = JSON.parse(conftxt);

        var pathSiteSources = path.join(pathHelper.getRoot(),"sites",siteKey,"sources");
        var pathSource = path.join(pathSiteSources, versionDir);

        if(lstatSync(pathSource).isDirectory()){
            newConf.source.path = pathSource;
            await fssimple.writeFileSync(configFilePath, JSON.stringify(newConf), { encoding: "utf8"});

            outputConsole.appendLine('linked to site version: '+versionDir);
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                message: "Linked to version "+versionDir,
            });
        }
        else{
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                message: "version directory is not readable",
            });
        }
    }
}

module.exports = new PogoSiteVersioHelper();
