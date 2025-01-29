const electron                                  = require('electron');
const Menu                                      = electron.Menu;
const path                                      = require("path");
const fssimple                                  = require('fs');
const fs                                        = require('fs-extra');
const { shell }                                 = require('electron')
const logWindowManager                          = require('./log-window-manager');
const pogozipper                                = require('../import-export/pogozipper');
const ScaffoldModel                             = require('../scaffold-model/scaffold-model');
const pathHelper                                = require('../utils/path-helper');
//const configurationDataProvider                 = require('../app-prefs-state/configuration-data-provider')
const hugoDownloader                            = require('../hugo/hugo-downloader')
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./../utils/environment-resolver');

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
    global.logWindow = logWindowManager.getCurrentInstanceOrNew();

    global.logWindow.webContents.on('did-finish-load',() => {
      global.logWindow.webContents.send("redirectToGivenLocation", "/console")
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


  toggleHugoServeDraftMode(){

    if(global.pogoconf.hugoServeDraftMode){
      global.pogoconf.setHugoServeDraftMode(false);
    }
    else{
      global.pogoconf.setHugoServeDraftMode(true);
    }

    global.pogoconf.saveState().then(()=>{
      let mainWindow = global.mainWM.getCurrentInstanceOrNew();
      this.createMainMenu();
      this.startServer()
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
      this.createMainMenu();
    });
  }




  getHugoVersionsSubMenu(platform, extended){

    const jsonFile = path.join(pathHelper.getApplicationResourcesDir(),"all","filteredHugoVersions.json");
    let filteredVersions = ["v0.100.2"];

    if(fs.existsSync(jsonFile)){
      const jsonContent = fssimple.readFileSync(jsonFile, {encoding:'utf8', flag:'r'})
      filteredVersions = JSON.parse(jsonContent);
    }

    let expMenu = []
    filteredVersions.forEach((version)=>{

      let versionStr = version;
      if(extended){
        versionStr = 'extended_'+version.replace("v",'');
      }


      let versionItem = {
        id: `${versionStr}_${platform}`,
        label: versionStr,
        click: async () => {
          hugoDownloader.downloader.download(versionStr, {platform: platform, arch: ARCHS.x64 }, true);
        }
      };
      expMenu.push(versionItem);
    })

    return expMenu;
  }



  createExperimentalMenu(){
    let expMenu = [
      {
        label: 'Disable CMS Partials Cache',
        type: "checkbox",
        checked: global.pogoconf.disablePartialCache,
        click: async () => {
          this.toggleDisablePartialCache()
        }
      },
      {
        id: 'invalidate-cache',
        label: 'Invalidate Sites Cache',
        click: async () => {
          global.apiMain.invalidateCache({},context);
        }
      },
      {
        label: 'Hugo Download',
        submenu: [
          {
            label: 'Minimal',
            submenu: [
              {
                label: 'Windows',
                submenu: this.getHugoVersionsSubMenu(PLATFORMS.windows, false),
              },
              {
                label: 'macOS',
                submenu: this.getHugoVersionsSubMenu(PLATFORMS.macOS, false),
              },
              {
                label: 'Linux',
                submenu: this.getHugoVersionsSubMenu(PLATFORMS.linux, false),
              },
            ]
          },
          {
            label: 'Extended',
            submenu: [
              {
                label: 'Windows',
                submenu: this.getHugoVersionsSubMenu(PLATFORMS.windows, true),
              },
              {
                label: 'macOS',
                submenu: this.getHugoVersionsSubMenu(PLATFORMS.macOS, true),
              },
              {
                label: 'Linux',
                submenu: this.getHugoVersionsSubMenu(PLATFORMS.linux, true),
              },
            ]
          },
        ]
      },
      {
        label: 'Scaffold Model',
        submenu: [
          {
            label: 'Scaffold Single',
            click: async () => {
              ScaffoldModel.scaffoldFromFile('single');
            }
          },
          {
            label: 'Scaffold Collection',
            click: async () => {
              ScaffoldModel.scaffoldFromFile('collection');
            }
          },
        ]
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
              mainWindow.webContents.send("newSiteDialogOpen");
            }
          },
          {
            label: 'Import Quiqr Site',
            id: 'import-site',
            click: async () => {
              let mainWindow = global.mainWM.getCurrentInstanceOrNew();
              mainWindow.webContents.send("importSiteDialogOpen");
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
          { type: 'separator' },
          {
            label: 'Server Draft Mode',
            type: "checkbox",
            checked: global.pogoconf.hugoServeDraftMode,
            click: async () => {
              this.toggleHugoServeDraftMode()
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
            label: 'Troubleshooting',
            submenu: [
              {
                label: 'Open Logs Window',
                click: async () => {
                  this.createLogWindow()
                }
              },
              {
                label: 'Report Issue',
                click: async () => {
                  await shell.openExternal("https://github.com/quiqr/quiqr-desktop/issues/new");
                }
              }
            ]
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
  }
}

module.exports = new MenuManager();
