const electron          = require('electron')
const unhandled         = require('electron-unhandled');
const ipcMainBinder     = require('./bridge/ipc-main-binder');
const mainWindowManager = require('./ui-managers/main-window-manager');
const menuManager       = require('./ui-managers/menu-manager');
const QuiqrAppConfig    = require('./app-prefs-state/quiqr-app-config');
const outputConsole     = require('./logger/output-console');
const apiMain           = require('./bridge/api-main');

unhandled();

const app = electron.app

if(app.isPackaged) {
  process.env.NODE_ENV = 'production';
}



// FIXME TODO this is to solve the 2021q3 Lets Encrypt problems
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.setAsDefaultProtocolClient('quiqr');

require('events').EventEmitter.prototype._maxListeners = 25;

let pogoconf = QuiqrAppConfig();
global.pogoconf = pogoconf;
global.outputConsole = outputConsole;
global.currentSiteKey = pogoconf.lastOpenedSite.siteKey;
global.currentSitePath = pogoconf.lastOpenedSite.sitePath;
global.currentBaseUrl = "";

global.currentFormShouldReload = undefined;
global.currentFormNodePath = undefined;
global.currentFormAccordionIndex = undefined;

global.currentWorkspaceKey = pogoconf.lastOpenedSite.workspaceKey;
global.skipWelcomeScreen = pogoconf.skipWelcomeScreen;
global.hugoServer = undefined;
global.currentServerProccess = undefined;
global.mainWM = mainWindowManager;
global.apiMain = apiMain;
global.modelDirWatcher = undefined;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
function createWindow () {
  mainWindow = global.mainWM.getCurrentInstanceOrNew();
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createWindow();
  menuManager.createMainMenu();
  mainWindow.setMenuBarVisibility(true)
})

app.on('before-quit', function () {
  if(global.hugoServer){
    global.hugoServer.stopIfRunning();
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit();
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

app.on('open-url', function(event, schemeData){
  if(app.isReady()){
    handleQuiqrUrl(event, schemeData);
  }
  else{
    app.whenReady().then(()=>{
      handleQuiqrUrl(event, schemeData);
    });
  }
});

// Iterate over arguments and look out for uris
function openUrlFromArgv(argv) {
  for (let i = 1; i < argv.length; i++) {
    let arg = argv[i]
    if (!arg.startsWith('quiqr:')) {
      console.log("open-url: URI doesn't start with quiqr:", arg)
      continue
    }

    console.log('open-url: Detected URI: ', arg)
    app.emit('open-url', null, arg)
  }
}

openUrlFromArgv(process.argv)

app.on('second-instance', function(event, argv){
  console.log('Someone tried to run a second instance')
  openUrlFromArgv(argv)
})

async function handleQuiqrUrl(event, schemeData){

  const remoteFileURL = schemeData.substr(8);
  if(remoteFileURL.trim() !== "continue"){
    const newURL='/sites/import-site-url/' + encodeURIComponent(remoteFileURL.replace(',',"://"));
    //mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
    mainWindow.webContents.send("redirectToGivenLocation", newURL);
  }
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMainBinder.bind();
global.apiMain = ipcMainBinder.api();
