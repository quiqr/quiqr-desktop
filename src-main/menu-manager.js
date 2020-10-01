const electron = require('electron')
const Menu = electron.Menu
const path = require("path");
const { lstatSync, readdirSync } = require('fs')
const prefsWindowManager = require('./prefs-window-manager');
const logWindowManager = require('./log-window-manager');
const pogozipper = require('./pogozipper');
const pogoversions = require('./pogo-site-version-helper');
const PoppyGoAppConfig = require('./poppygo-app-config');

const SiteService = require('./services/site/site-service')
let configurationDataProvider = require('./configuration-data-provider')

const rimraf = require("rimraf");
const pathHelper = require('./path-helper');
const fs = require('fs-extra');
const { shell } = require('electron')

const app = electron.app
let mainWindow = null;
let logWindow = null;
let menu = null;
let pogoconf = PoppyGoAppConfig();

class MenuManager {

    openCookbooks() {
        mainWindow = global.mainWM.getCurrentInstanceOrNew();
        mainWindow.webContents.send("disableMobilePreview");
        if (mainWindow) {
            mainWindow.webContents.send("redirectCookbook")
        }
    }
    stopServer() {
        mainWindow = global.mainWM.getCurrentInstanceOrNew();
        mainWindow.webContents.send("disableMobilePreview");
        if(global.hugoServer){
            global.hugoServer.stopIfRunning(function(err, stdout, stderr){
                if(err){
                    console.log(err)
                }

                else{ resolve(); }
            });
        }
    }
    startServer() {
        if(global.hugoServer){
            global.hugoServer.serve(function(err, stdout, stderr){
                if(err){
                    console.log(err)
                }
            });
        }
    }

    showVersion(){
        const dialog = electron.dialog;

        let options  = {
            buttons: ["Close"],
            message: "PoppyGo Version " + app.getVersion()
        }
        dialog.showMessageBox(options)
    }

    deleteSite() {
        mainWindow = global.mainWM.getCurrentInstanceOrNew();
        mainWindow.webContents.send("disableMobilePreview");
        let dir;

        const dialog = electron.dialog;

        if(global.currentSiteKey){

            let options  = {
                buttons: ["Yes","Cancel"],
                message: "Do you really want to delete " + global.currentSiteKey
            }
            let response = dialog.showMessageBox(options)
            if(response === 1) return;

            fs.remove(pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json');

            var rimraf = require("rimraf");
            rimraf(pathHelper.getRoot() + 'sites/'+global.currentSiteKey, function(){
                //console.log("rm done");
            });

            this.selectSitesWindow();
        }
        else{
            dialog.showMessageBox(mainWindow, {
                type: 'error',
                message: "First, select a site to delete.",
            });
        }
    }
    createPrefsWindow () {
        prefsWindow = prefsWindowManager.getCurrentInstanceOrNew();
        if (prefsWindow) {
            prefsWindow.webContents.send("redirectPrefs")
        }

        prefsWindow.once('ready-to-show', () => {
            prefsWindow.webContents.send("redirectPrefs")
        })

        prefsWindow.webContents.on('did-finish-load',() => {
            prefsWindow.webContents.send("redirectPrefs")
        })

        prefsWindow.on('closed', function() {
            prefsWindow = null
        })
    }

    createLogWindow () {
        logWindow = logWindowManager.getCurrentInstanceOrNew();

        if (logWindow) {
            logWindow.webContents.send("redirectConsole")
        }

        logWindow.once('ready-to-show', () => {
            logWindow.webContents.send("redirectConsole")
        })

        logWindow.webContents.on('did-finish-load',() => {
            logWindow.webContents.send("redirectConsole")
        })

        logWindow.on('closed', function() {
            logWindow = null
        })
    }

    openWorkSpaceDir(){
        let path = global.currentSitePath;
        //let path = pathHelper.getRoot()+'config.'+global.currentSiteKey+'.json';
        //console.log(path);
        try{
            let lstat = fs.lstatSync(path);
            if(lstat.isDirectory()){
                shell.openItem(path);
            }
            else{
                shell.openItem(dirname(path));
            }
        }
        catch(e){
            console.log(e);
        }
    }
    openWorkSpaceConfig(){
        let path = pathHelper.getRoot()+'config.'+global.currentSiteKey+'.json';
        try{
            shell.openItem(path);
        }
        catch(e){
        }
    }

    async selectSitesWindow () {
        global.mainWM.closeSiteAndShowSelectSites();

        return;
    }

    siteSelected(){
        if(global.currentSiteKey){
            return true;
        }
        else{
            return false;
        }
    }

    updateMenu(currentSiteKey){
        //console.log(currentSiteKey);

        let siteRelatedMenuIds = [
            'export-site',
            'delete-site',
            'export-theme',
            'import-theme',
            'export-pass',
            'import-pass',
            'export-content',
            'import-content',
            'start-server',
            'open-site-dir',
            'open-site-conf'
        ];
        siteRelatedMenuIds.forEach(function(id){
            let myItem = menu.getMenuItemById(id);
            myItem.enabled = (currentSiteKey?true:false);
        });

    }

    openHome() {
        mainWindow = global.mainWM.getCurrentInstanceOrNew();
        if (mainWindow) {
            mainWindow.webContents.send("redirectHome")
        }
    }
    async selectSiteVersion(subdir){
        console.log(subdir);
    }

    createVersionsMenu(){
        if(global.currentSiteKey && global.currentWorkspaceKey){
            let siteKey = global.currentSiteKey;
            let siteService = null;
            let configurationDataProvider = require('./configuration-data-provider')
            configurationDataProvider.get(function(err, configurations){
                if(configurations.empty===true) throw new Error('Configurations is empty.');
                if(err) { reject(err); return; }
                let siteData = configurations.sites.find((x)=>x.key===global.currentSiteKey);
                if(siteData==null) throw new Error('Could not find site is empty.');
                siteService = new SiteService(siteData);
            });

            let currentPath = siteService._config.source.path;
            let currentVersion = siteService._config.source.path.split("/").pop();


            let versionsMenu = [];

            if(path.resolve(currentPath, '..').split("/").pop()==='sources'){
                let sources = path.resolve(currentPath, '..');
                var files = fs.readdirSync(sources);
                files.forEach(function(f){
                    let label = "";
                    let checked = false;
                    if(lstatSync(path.join(sources,f)).isDirectory()){
                        label = f;
                        if(f == currentVersion){
                            checked = true;
                        }
                        versionsMenu.push({
                            id: f,
                            type: "checkbox",
                            label: label,
                            checked: checked,
                            click: async () => {
                                pogoversions.setSiteVersion(f);
                            }
                        });
                    }
                });
            }
            return versionsMenu;
        }
        else {
            return [];
        }
    }

    createDevMenu(){
        let devMenu = [];
        devMenu.push(
        );
        return devMenu;
    }

    createMainMenu(){

        const isMac = process.platform === 'darwin'
        const versionsMenu = this.createVersionsMenu();

        const template = [
            ...(isMac ? [{
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    /*                {
                    label: 'Preferences',
                    click: async () => {
                        createPrefsWindow()
                    }
                },*/
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            }] : []),
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Select website',
                        click: async () => {
                            this.selectSitesWindow();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Import website',
                        click: async () => {
                            pogozipper.importSite()
                        }
                    },
                    {
                        id: 'export-site',
                        label: 'Export website',
                        enabled: this.siteSelected(),
                        click: async () => {
                            pogozipper.exportSite()
                        }
                    },
                    {
                        id: 'delete-site',
                        enabled: this.siteSelected(),
                        label: 'Delete Site',
                        click: async () => {
                            this.deleteSite()
                        }
                    },
                    { type: 'separator' },
                    {
                        id: 'import-theme',
                        enabled: this.siteSelected(),
                        label: 'Import theme',
                        click: async () => {
                            pogozipper.importTheme()
                        }
                    },
                    {
                        id: 'export-theme',
                        enabled: this.siteSelected(),
                        label: 'Export theme',
                        click: async () => {
                            pogozipper.exportTheme()
                        }
                    },
                    { type: 'separator' },
                    {
                        id: 'import-content',
                        enabled: this.siteSelected(),
                        label: 'Import content',
                        click: async () => {
                            pogozipper.importContent()
                        }
                    },
                    {
                        id: 'export-content',
                        enabled: this.siteSelected(),
                        label: 'Export content',
                        click: async () => {
                            pogozipper.exportContent()
                        }
                    },
                    { type: 'separator' },
                    {
                        id: 'import-pass',
                        enabled: this.siteSelected(),
                        label: 'Import passport',
                        click: async () => {
                            pogozipper.importPass()
                        }
                    },
                    {
                        id: 'export-pass',
                        enabled: this.siteSelected(),
                        label: 'Export passport',
                        click: async () => {
                            pogozipper.exportPass()
                        }
                    },
                    { type: 'separator' },
                    isMac ? { role: 'close' } : { role: 'quit' }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    ...(isMac ? [
                        { role: 'pasteAndMatchStyle' },
                        { role: 'delete' },
                        { role: 'selectAll' },
                        { type: 'separator' },
                        {
                            label: 'Speech',
                            submenu: [
                                { role: 'startspeaking' },
                                { role: 'stopspeaking' }
                            ]
                        }
                    ] : [
                        { role: 'delete' },
                        { type: 'separator' },
                        { role: 'selectAll' },
                        /*
                    {
                        label: 'Preferences',
                        click: async () => {
                            createPrefsWindow()
                        }
                    }
                    */
                    ])
                ]
            },
            {
                label: 'View',
                submenu: [

                    { role: 'reload' },

                    { type: 'separator' },

                    { role: 'resetzoom' },
                    { role: 'zoomin' },
                    { role: 'zoomout' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    ...(isMac ? [
                        { type: 'separator' },
                        { role: 'front' },
                        { type: 'separator' },
                        { role: 'window' }
                    ] : [
                        { role: 'close' }
                    ])
                ]
            },
            {
                label: 'Expert',
                submenu: [
                    {
                        label: 'Front page',
                        click: async () => {
                            this.openHome()
                        }
                    },
                    {
                        label: 'Open Form Cookbooks',
                        click: async () => {
                            this.openCookbooks()
                        }
                    },
                    {
                        label: 'Show Log Window',
                        click: async () => {
                            this.createLogWindow()
                        }
                    },
                    {
                        label: 'Stop server',
                        click: async () => {
                            this.stopServer()
                        }
                    },
                    {
                        id: 'start-server',
                        label: 'Start server',
                        enabled: this.siteSelected(),
                        click: async () => {
                            this.startServer()
                        }
                    },
                    { type: 'separator' },
                    {
                        id: 'open-site-dir',
                        label: 'Open Site Directory',
                        enabled: this.siteSelected(),
                        click: async () => {
                            this.openWorkSpaceDir()
                        }
                    },
                    {
                        id: 'open-site-conf',
                        label: 'Open Workspace Config',
                        enabled: this.siteSelected(),
                        click: async () => {
                            this.openWorkSpaceConfig()
                        }
                    },
                    {
                        id: 'switch-version',
                        label: 'Site versions',
                        submenu: versionsMenu
                    },
                    { type: 'separator' },
                    { role: 'forcereload' },
                    { role: 'toggledevtools' },
                ]
            },

            ...(process.env.REACT_DEV_URL ? [{
                label: 'DevMenu',
                submenu: this.createDevMenu()
            }] : []),

            {
                role: 'help',
                submenu: [
                    {
                        id: 'welcome',
                        label: 'Show welcome screen',
                        click: async () => {
                            mainWindow = global.mainWM.getCurrentInstanceOrNew();
                            mainWindow.webContents.send("disableMobilePreview");
                            mainWindow.webContents.send("redirectToGivenLocation","/welcome");
                        }
                    },
                    {
                        label: 'Getting started',
                        click: async () => {
                            await shell.openExternal("https://router.poppygo.app/getting-started");
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Show PoppyGo version',
                        click: async () => {
                            this.showVersion();
                        }
                    },
                    {
                        label: 'Release notes',
                        click: async () => {
                            await shell.openExternal("https://router.poppygo.app/release-notes");
                        }
                    }
                ]
            }
        ]

        menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }
}

module.exports = new MenuManager();
