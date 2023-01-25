const electron                    = require('electron');
const Menu                        = electron.Menu;
const path                        = require("path");
const { lstatSync }               = require('fs')
const fssimple                    = require('fs');
const fs                          = require('fs-extra');
const { shell }                   = require('electron')
const logWindowManager            = require('./log-window-manager');
const pogozipper                  = require('../import-export/pogozipper');
//const cloudCacheManager           = require('../sync/quiqr-cloud/cloud-cache-manager');
//const cloudApiManager             = require('../sync/quiqr-cloud/cloud-api-manager');
//const cloudGitManager             = require('../sync/quiqr-cloud/cloud-git-manager');
//const PogoPublisher               = require('../publishers/pogo-publisher');
const pathHelper                  = require('../utils/path-helper');
const configurationDataProvider   = require('../app-prefs-state/configuration-data-provider')
const { EnvironmentResolver }     = require('../utils/environment-resolver');

const app = electron.app
let menuObject = null;

let context = {};
context.reject = function(error){
  console.log(error);
}

context.resolve = function(response){
  console.log(response);
}

class MenuManager {

  stopServer() {
    if(global.hugoServer){
      global.hugoServer.stopIfRunning();
    }

  }
  startServer() {
    if(global.hugoServer){
      global.hugoServer.serve((err) => {
        if(err){
          console.log(err)
        }
      });
    }
  }

  showVersion(){
    const idPath = path.join(pathHelper.getApplicationResourcesDir(),"all","build-git-id.txt");
    const datePath = path.join(pathHelper.getApplicationResourcesDir(),"all", "build-date.txt");
    let buildGitId = "";
    let buildDate = "";

    let environmentResolver = new EnvironmentResolver();
    const upis = `\n\nUQIS: ${environmentResolver.getUQIS()}\n`;

    if(fs.existsSync(idPath)){
      buildGitId = "\nBuild ID " + fssimple.readFileSync(idPath, {encoding:'utf8', flag:'r'})
    }
    if(fs.existsSync(datePath)){
      buildDate = "\nBuild Date " + fssimple.readFileSync(datePath, {encoding:'utf8', flag:'r'}).replace("\n",'');
    }

    const dialog = electron.dialog;

    let options  = {
      buttons: ["Close"],
      title: "About",
      message: "Quiqr Desktop\n\nVersion: " + app.getVersion() + buildGitId + buildDate + upis
    }
    dialog.showMessageBox(options)
  }

  appPrefs(){
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("redirectToGivenLocation","/prefs");
  }

  createLogWindow () {
    let logWindow = logWindowManager.getCurrentInstanceOrNew();

    if (logWindow) {
      logWindow.webContents.send("redirectToGivenLocation", "/console")
    }

    logWindow.once('ready-to-show', () => {
      logWindow.webContents.send("redirectToGivenLocation", "/console")
    })

    logWindow.webContents.on('did-finish-load',() => {
      logWindow.webContents.send("redirectToGivenLocation", "/console")
    })

    logWindow.on('closed', () => {
      logWindow = null
    })
  }

  openWorkSpaceQuiqrDir(){
    let wspath = path.join(global.currentSitePath, "quiqr");

    try{
      let lstat = fs.lstatSync(wspath);
      if(lstat.isDirectory()){
        shell.openPath(wspath);
      }
      else{
        shell.openPath(path.dirname(wspath));
      }
    }
    catch(e){
      console.log(e);
    }
  }

  openWorkSpaceDir(){
    let wspath = global.currentSitePath;

    try{
      let lstat = fs.lstatSync(wspath);
      if(lstat.isDirectory()){
        shell.openPath(wspath);
      }
      else{
        shell.openPath(path.dirname(wspath));
      }
    }
    catch(e){
      console.log(e);
    }
  }

  openWorkSpaceConfig(){
    let wspath = pathHelper.getSiteMountConfigPath(global.currentSiteKey);
    try{
      shell.openPath(wspath);
    }
    catch(e){
      console.log(e);
    }
  }

  async selectSitesWindow () {
    if(global.hugoServer){
      global.hugoServer.stopIfRunning();
    }

    global.mainWM.closeSiteAndShowSelectSites();
    return;
  }

  siteSelected(){
    if(global.currentSiteKey && global.currentSiteKey !== ""){
      return true;
    }
    else{
      return false;
    }
  }

  async setRole(role){

    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("frontEndBusy");

    global.pogoconf.setPrefkey("applicationRole", role);

    global.pogoconf.saveState().then( ()=>{
      this.createMainMenu();
      console.log("Role changed, should restart?")
    });
  }

  createRolesSelectionMenu(){

    let _menuContent = [
      {
        key: "contentEditor",
        label: "Content Editor",
      },
      {
        key: "siteDeveloper",
        label: "Site Developer",
      },
    ];

    let rolesMenu = [];
    _menuContent.forEach((itemContent)=>{
      rolesMenu.push({
        id: `roles-${itemContent.key}`,
        label: itemContent.label,
        type: "checkbox",
        enabled: itemContent.enabled,
        checked: (itemContent.key===global.pogoconf.prefs["applicationRole"]),
        click: async () => {
          this.setRole(itemContent.key);
          let mainWindow = global.mainWM.getCurrentInstanceOrNew();
          mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
        }
      });
    });

    return rolesMenu;
  }


  toggleNewSyncMethod(){

    if(global.pogoconf.expNewSyncMethod){
      global.pogoconf.setExpNewSyncMethod(false);
    }
    else{
      global.pogoconf.setExpNewSyncMethod(true);
    }

    global.pogoconf.saveState().then(()=>{
      this.createMainMenu();
    });
  }

  toggleExperimental(){
    if(global.pogoconf.experimentalFeatures){
      global.pogoconf.setExperimentalFeatures(false);
    }
    else{
      global.pogoconf.setExperimentalFeatures(true);
    }

    global.pogoconf.saveState().then(()=>{
      this.createMainMenu();
    });
  }

  toggleDisablePartialCache(){

    if(global.pogoconf.disablePartialCache){
      global.pogoconf.setDisablePartialCache(false);
    }
    else{
      global.pogoconf.setDisablePartialCache(true);
    }

    global.pogoconf.saveState().then(()=>{
      this.createMainMenu();
    });
  }

  toggleDevDisableAutoHugoServe(){

    if(global.pogoconf.devDisableAutoHugoServe){
      global.pogoconf.setDevDisableAutoHugoServe(false);
    }
    else{
      global.pogoconf.setDevDisableAutoHugoServe(true);
    }

    global.pogoconf.saveState().then(()=>{
      let mainWindow = global.mainWM.getCurrentInstanceOrNew();
      mainWindow.webContents.send("updateBadges");
      this.createMainMenu();
    });
  }

  createExperimentalMenu(){
    let expMenu = [
      {
        label: 'Enable new Sync Method',
        type: "checkbox",
        checked: global.pogoconf.expNewSyncMethod,
        click: async () => {
          this.toggleNewSyncMethod()
        }
      },
      {
        label: 'Disable CMS Partials Cache',
        type: "checkbox",
        checked: global.pogoconf.disablePartialCache,
        click: async () => {
          this.toggleDisablePartialCache()
        }
      },
      {
        label: 'Import',
        submenu: [
          {
            label: 'Import Site',
            click: async () => {
              pogozipper.importSite()
            }
          },
          {
            id: 'import-theme',
            enabled: this.siteSelected(),
            label: 'Import Theme',
            click: async () => {
              pogozipper.importTheme()
            }
          },
          {
            id: 'import-content',
            enabled: this.siteSelected(),
            label: 'Import Content',
            click: async () => {
              pogozipper.importContent()
            }
          },
        ]
      },
      {
        label: 'Export',
        submenu: [
          {
            id: 'export-site',
            label: 'Export Site',
            enabled: this.siteSelected(),
            click: async () => {
              pogozipper.exportSite()
            }
          },
          {
            id: 'export-theme',
            enabled: this.siteSelected(),
            label: 'Export Theme',
            click: async () => {
              pogozipper.exportTheme()
            }
          },
          {
            id: 'export-content',
            enabled: this.siteSelected(),
            label: 'Export Content',
            click: async () => {
              pogozipper.exportContent()
            }
          },
        ]
      },


    ];

    return expMenu;
  }

  mainMenuArray(){

    const isMac = process.platform === 'darwin'

    const template = [
      ...(isMac ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          {
            label: 'Preferences',
            click: async () => {

              this.appPrefs();

            }
          },
          {
            label: "Role",
            submenu: this.createRolesSelectionMenu()
          },
          { type: 'separator' },
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
            id: 'switch-select-sites-view',
            label: 'Site Library',
            click: async () => {
              //TODO this seems smarter. Implement at other places
              global.mainWM.closeSiteAndShowSelectSites();
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
            id: 'populate-etale-visuals',
            label: 'Recreate Site Thumbnail',
            enabled: this.siteSelected(),
            click: async () => {
              global.apiMain.genereateEtalageImages({siteKey:global.currentSiteKey, workspaceKey: global.currentWorkspaceKey},context);
            }
          },
          { type: 'separator' },
          {
            label: 'New Quiqr Site',
            id: 'new-site',
            click: async () => {
              let mainWindow = global.mainWM.getCurrentInstanceOrNew();
              mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
              var newURL='/sites/new-site/x-'+Math.random();
              mainWindow.webContents.send("redirectToGivenLocation", newURL);
            }
          },
          {
            label: 'Import Quiqr Site',
            id: 'import-site',
            click: async () => {
              let mainWindow = global.mainWM.getCurrentInstanceOrNew();
              mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
              var newURL='/sites/import-site/x-'+Math.random();
              mainWindow.webContents.send("redirectToGivenLocation", newURL);
            }
          },
          { type: 'separator' },
          {
            id: 'close-site',
            label: 'Close Site',
            enabled: this.siteSelected(),
            click: async () => {
              this.selectSitesWindow();
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
          { type: 'separator' },
          {
            label: 'Preferences',
            click: async () => {
              this.appPrefs();
            }
          },
          {
            label: "Role",
            submenu: this.createRolesSelectionMenu()
          },
          { type: 'separator' },
          {
            label: 'Enable Experimental',
            type: "checkbox",
            checked: global.pogoconf.experimentalFeatures,
            click: async () => {
              this.toggleExperimental()
            }
          },

          ...(global.pogoconf.experimentalFeatures ? [{
            label: 'Experimental',
            submenu: this.createExperimentalMenu()
          }] : []),
        ]
      },
      {
        label: 'View',
        submenu: [
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
          ])
        ]
      },
      {
        label: 'Hugo',
        submenu: [
          {
            id: 'start-server',
            label: 'Restart server',
            enabled: this.siteSelected(),
            click: async () => {
              this.startServer()
            }
          },
          {
            label: 'Disable Auto Serve',
            type: "checkbox",
            checked: global.pogoconf.devDisableAutoHugoServe,
            click: async () => {
              this.toggleDevDisableAutoHugoServe()
            }
          },
          /*
          {
            label: 'Stop server',
            click: async () => {
              this.stopServer()
            }
          },
          */
          {
            label: 'Open Server Logs',
            click: async () => {
              this.createLogWindow()
            }
          },
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            id: 'welcome',
            label: 'Show Welcome Screen',
            click: async () => {
              let mainWindow = global.mainWM.getCurrentInstanceOrNew();
              mainWindow.webContents.send("openSplashDialog");
            }
          },
          {
            label: 'Getting Started',
            click: async () => {
              await shell.openExternal("https://book.quiqr.org/docs/10-getting-started/");
            }
          },
          {
            label: 'Quiqr Book',
            click: async () => {
              await shell.openExternal("https://book.quiqr.org");
            }
          },
          { type: 'separator' },
          {
            label: 'Quiqr Version',
            click: async () => {
              this.showVersion();
            }
          },
          {
            label: 'Release Notes',
            click: async () => {
              await shell.openExternal("https://book.quiqr.org/docs/80-release-notes/01-quiqr-desktop/");
            }
          }
        ]
      }
    ]

    return template;

  }

  createMainMenu(){

    menuObject = Menu.buildFromTemplate(this.mainMenuArray());
    Menu.setApplicationMenu(menuObject)

    /* THIS IS A GREAT EXÅMPLE HOW TO USE PROMISES
     *
     * Before executing the main action get all needed promise data and run from within Promise.all
     *
     * */
    /*
    this.profileUserName = "";
    let pogopubl = new PogoPublisher({});
    let readProfileAction = pogopubl.readProfile();
    readProfileAction.then((profile)=>{
      if(profile){
        this.profileUserName = profile.username
      }
    });

    Promise.all([readProfileAction]).then( () => {
      menuObject = Menu.buildFromTemplate(this.mainMenuArray());
      Menu.setApplicationMenu(menuObject)
      return true;
    });
    */
  }
}

module.exports = new MenuManager();
