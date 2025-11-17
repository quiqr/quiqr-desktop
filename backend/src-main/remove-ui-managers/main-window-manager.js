const { BrowserView, BrowserWindow } = require('electron');
const windowStateKeeper              = require('electron-window-state');
const url                            = require('url')
const path                           = require('path')
const fs                             = require('fs-extra')
const menuManager                    = require('./menu-manager');
const configurationDataProvider      = require('../app-prefs-state/configuration-data-provider')

let mainWindow;
let mainWindowState;

function showNotFound(mainWindow, lookups){
  let lookupsHtml = lookups.map((x)=> `<li>${x}</li>`).join('');
  mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
    <h1>Oops...</h1>
    <p>The file <b>index.html</b> was not found!</p>
    <p>We tried the following paths:</p>
    <ul>${lookupsHtml}</ul>
</body>
</html>`));
}

function showLookingForServer(mainWindow, port){
  mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Waiting for Development Server</h1>
<p>Waiting for React development server in port ${port}...</p>
<p>Have you started it?</p>
</body>
</html>`));
}

function showInvalidDevelopmentUrl(mainWindow, url){
  mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>

<body style="font-family: sans-serif; padding: 2em">
<h1>Invalid Development Server URL</h1>
<p>The provided URL (${url||'EMPTY'}) does not match the required pattern.</p>
<p>Please, fix this and try again.</p>
</body>
</html>`));
}

function getLocation(locPath = ''){

  if(process.env.REACT_DEV_URL){
    //DEVELOPMENT SERVER
    let url = process.env.REACT_DEV_URL+locPath;
    const urlWithPortMatch = url.match(/:([0-9]{4})$/);
    if(urlWithPortMatch==null){
      showInvalidDevelopmentUrl(url);
    }
    else{
      let port = urlWithPortMatch[1];
      showLookingForServer(mainWindow, port);

      const net = require('net');
      const client = new net.Socket();
      const tryConnection = () => client.connect({port: port}, () => {
        client.end();

        if(mainWindow){
          mainWindow.loadURL(url);
          getFirstScreenAfterStartup();
        }
      }
      );
      client.on('error', () => {
        setTimeout(tryConnection, 1000);
      });
      tryConnection();
    }
  }
  else{

    //LOOKING FOR INDEX.HTML
    let lookups = [
      path.normalize(path.join(__dirname, '/../../index.html')), //works in production
      path.normalize(path.join(__dirname, '../../build/index.html')) //works in development after react_build
    ];

    let indexFile = null;
    for(let i=0; i < lookups.length; i++){
      let lookup = lookups[i];
      if(fs.existsSync(lookup)){
        indexFile = lookup;
        break;
      }
    }
    if(indexFile){
      mainWindow.loadURL(
        url.format({ pathname: indexFile, protocol: 'file:', slashes: true })
      );
      getFirstScreenAfterStartup();
    }
    else{
      showNotFound(mainWindow, lookups);
    }
  }
}

function getFirstScreenAfterStartup(){
  mainWindow.webContents.once('dom-ready', async () => {
    configurationDataProvider.get((err, configurations) => {
      if(configurations.empty===true || configurations.sites.length ===0){
        mainWindow.webContents.once('dom-ready', () => {
          mainWindow.webContents.send("redirectToGivenLocation", '/welcome');
        });
      }
      else if(global.currentSiteKey && global.currentWorkspaceKey){

        //TODO catch error when site does not exist
        let newScreenURL = `/sites/${decodeURIComponent(global.currentSiteKey)}/workspaces/${decodeURIComponent(global.currentWorkspaceKey)}`;
        mainWindow.webContents.send("redirectToGivenLocation",newScreenURL);
        mainWindow.webContents.once('dom-ready', () => {
          mainWindow.webContents.send("redirectToGivenLocation",newScreenURL);
        });

        let siteConfig = configurations.sites.find((x)=>x.key===global.currentSiteKey);
        mainWindow.setTitle(`Quiqr - Site: ${siteConfig.name}`);
      }
      else{
        mainWindow.setTitle("Quiqr: Select site");
        mainWindow.webContents.send("redirectToGivenLocation",'/sites/last');
      }
    });
  });
}


function createWindow () {

  // Load the previous state with fallback to defaults
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

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(mainWindow);

  if(process.env.DEVTOOLS){
    let devtools = new BrowserWindow()
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.show();

  getLocation();

  mainWindow.on('closed', function () {
    mainWindow = undefined; //clear reference
  })

  var handleRedirect = (e, url) => {
    if(!/\/\/localhost/.test(url)) {
      e.preventDefault()
      require('electron').shell.openExternal(url)
    }
  }

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);

}

module.exports = {
  getCurrentInstance: function(){
    return mainWindow;
  },

  closeSiteAndShowSelectSites: function(){
    global.pogoconf.setLastOpenedSite(null, null, null);
    global.pogoconf.saveState().then( ()=>{
      global.currentSitePath = null;
      global.currentSiteKey = null;
      global.currentWorkspaceKey = null;

      mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
      mainWindow.webContents.send("redirectToGivenLocation", '/sites/last');

      mainWindow.setTitle("Quiqr: Select site");
    });

    menuManager.createMainMenu();
  },

  remountSite: function(){
    mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
    var newURL='/sites/'+global.currentSiteKey+'/workspaces/'+global.currentWorkspaceKey+"?key="+Math.random();
    mainWindow.webContents.send("redirectToGivenLocation", newURL);
  },

  getCurrentInstanceOrNew: function(){
    let instance = this.getCurrentInstance();

    if(instance){
      return instance;
    }

    createWindow();
    return mainWindow;
  }
}
