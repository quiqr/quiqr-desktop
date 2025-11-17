const { BrowserView, BrowserWindow } = require('electron');
const windowStateKeeper              = require('electron-window-state');
const url                            = require('url')
const path                           = require('path')
const fs                             = require('fs-extra')
const menuManager                    = require('./menu-manager');

const isDev = process.env.NODE_ENV === "development";
let mainWindow;
let mainWindowState;

function getLocation(){

  if (isDev) {
    mainWindow.loadURL("http://localhost:4001"); // For development
  } else {

    let lookups = [
      path.join(__dirname, "../dist/frontend/index.html"),
      path.normalize(path.join(__dirname, '/../../index.html')), //works in production
      path.normalize(path.join(__dirname, '../frontend/build/index.html')), //works in development after react_build
    ];

    let indexFile = null;
    for(let i=0; i < lookups.length; i++){
      let lookup = lookups[i];
      if(fs.existsSync(lookup)){
        indexFile = lookup;
        break;
      }
    }

    let myUrl = url.format(
      { pathname: indexFile, protocol: 'file:', slashes: true });

    mainWindow.loadURL(myUrl);
  }
}

function createWindow () {

  mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600
  });

  mainWindow = new BrowserWindow({
    show: false,
    frame: true,
    backgroundColor:"#ffffff",
    webPreferences: {
      nodeIntegration: true,
    },
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 1055,
    minHeight: 700,

  });

  mainWindowState.manage(mainWindow);

  if(process.env.DEVTOOLS){
    let devtools = new BrowserWindow()
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  getLocation();
  mainWindow.show();

  mainWindow.on('closed', function () {
    mainWindow = undefined; //clear reference
  })

  /*
  var handleRedirect = (e, url) => {
    if(!/\/\/localhost/.test(url)) {
      e.preventDefault()
      require('electron').shell.openExternal(url)
    }
  }

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);
  */

}

module.exports = {
  getCurrentInstance: function(){
    return mainWindow;
  },

  closeSiteAndShowSelectSites: async function(){
    global.pogoconf.setLastOpenedSite(null, null, null);
    await global.pogoconf.saveState().then( ()=>{
      global.currentSitePath = null;
      global.currentSiteKey = null;
      global.currentWorkspaceKey = null;

      mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
      mainWindow.webContents.send("redirectToGivenLocation", '/sites/last');

      mainWindow.setTitle("Quiqr: Select site");
      menuManager.createMainMenu();
    });
    return true;

  },

  /*
  remountSite: function(){
    mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
    var newURL='/sites/'+global.currentSiteKey+'/workspaces/'+global.currentWorkspaceKey+"?key="+Math.random();
    mainWindow.webContents.send("redirectToGivenLocation", newURL);
  },
  */

  getCurrentInstanceOrNew: function(){
    let instance = this.getCurrentInstance();

    if(instance){
      return instance;
    }

    createWindow();
    return mainWindow;
  }
}
