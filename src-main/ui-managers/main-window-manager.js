const electron                       = require('electron');
const { BrowserView, BrowserWindow } = require('electron');
const windowStateKeeper              = require('electron-window-state');
const url                            = require('url')
const path                           = require('path')
const fs                             = require('fs-extra')
const menuManager                    = require('./menu-manager');
const configurationDataProvider      = require('../app-prefs-state/configuration-data-provider')

let mainWindow;
let mainWindowState;
let mobilePreviewView;
let mobilePreviewViewUrl;
let mobilePreviewViewActive = false;

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

function showPreviewWaitForServer(previewWindow){
  previewWindow.webContents.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`
    <html>
        <body style="background-color:#ccc;font-family: sans-serif; padding: 2em">
        <h3>Starting preview..</h3>
        <p>Quiqr is building your site. </p>
        <p>It can take a minute or two the first time.</p>
        </body>
    </html>`));
}


function showTesting(mainWindow){
  mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Testing</h1>
<p>Testing...</p>
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
        if(mobilePreviewTopBarView){
          mobilePreviewTopBarView.webContents.loadURL(url);
        }
      }
      );
      client.on('error', (error) => {
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
      if(mobilePreviewTopBarView){
        mobilePreviewTopBarView.webContents.loadURL(url.format({ pathname: indexFile, protocol: 'file:', slashes: true }));
      }
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
        console.log("switch to welcomeScreen ");
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

      }
    });
  });
}


function createWindow () {

  let icon;
  if(process.env.REACT_DEV_URL)
    icon = path.normalize(__dirname + "/../public/icon.png");

  configurationDataProvider.get(function(err, configurations){

    // Load the previous state with fallback to defaults
    mainWindowState = windowStateKeeper({
      defaultWidth: 800,
      defaultHeight: 600
    });

    // Create the browser window.
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

    });

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(mainWindow);

    mobilePreviewView = new BrowserView();
    mobilePreviewTopBarView = new BrowserView({
      webPreferences: {
        nodeIntegration: true,
      },
    });
    mainWindow.addBrowserView(mobilePreviewView);
    mainWindow.addBrowserView(mobilePreviewTopBarView);
    mainWindow.show();

  });

  getLocation();

  mainWindow.on('resize', () => {
    //Linux hack, Win and Mac should use will-resize with newBound
    setTimeout(function(){
      setMobilePreviewBounds();
    }, 200);
  })

  mainWindow.on('enter-full-screen', () => {
    setTimeout(function(){
      setMobilePreviewBounds();
    }, 200);
  })
  mainWindow.on('leave-full-screen', () => {
    setTimeout(function(){
      setMobilePreviewBounds();
    }, 200);
  })

  mainWindow.on('enter-html-full-screen', () => {
    console.log('videofull');
    setTimeout(function(){
      mobilePreviewView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
      mobilePreviewTopBarView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }, 200);
  })

  mainWindow.on('leave-html-full-screen', () => {
    setTimeout(function(){
      setMobilePreviewBounds();
    }, 200);
  })


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

async function setMobilePreviewBounds(){
  let mobwidth = 340;
  let topheight = 83;

  let view = mainWindow.getBounds();

  if(mobilePreviewViewActive){
    mobilePreviewTopBarView.setBounds({
      x: (view.width-mobwidth),
      y: 0,
      width: mobwidth,
      height:topheight
    });
    mobilePreviewView.setBounds({
      x: (view.width-mobwidth),
      y: topheight,
      width: mobwidth,
      height: view.height-topheight
    });
  }
  else{
    mobilePreviewView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    mobilePreviewTopBarView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  }
}

module.exports = {
  getCurrentInstance: function(){
    return mainWindow;
  },


  closeSiteAndCreateNew: function(){
    global.pogoconf.setLastOpenedSite(null, null, null);
    global.pogoconf.saveState().then( ()=>{
      global.currentSitePath = null;
      global.currentSiteKey = null;
      global.currentWorkspaceKey = null;

      mainWindow.webContents.send("disableMobilePreview");
      mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
      mainWindow.webContents.send("redirectToGivenLocation", '/sites/create-new');

      mainWindow.setTitle("Quiqr: Create new Quiqr site");
    });

    menuManager.updateMenu(null);
    menuManager.createMainMenu();
  },
  closeSiteAndShowSelectSites: function(){
    global.pogoconf.setLastOpenedSite(null, null, null);
    global.pogoconf.saveState().then( ()=>{
      global.currentSitePath = null;
      global.currentSiteKey = null;
      global.currentWorkspaceKey = null;

      mainWindow.webContents.send("disableMobilePreview");
      mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
      mainWindow.webContents.send("redirectToGivenLocation", '/sites/last');

      mainWindow.setTitle("Quiqr: Select site");
    });

    menuManager.updateMenu(null);
    menuManager.createMainMenu();
  },

  remountSite: function(){
    mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
    var newURL='/sites/'+global.currentSiteKey+'/workspaces/'+global.currentWorkspaceKey+"?key="+Math.random();
    mainWindow.webContents.send("redirectToGivenLocation", newURL);
  },

  reloadMobilePreview: function(){
    module.exports.setMobilePreviewUrl(mobilePreviewViewUrl);
  },


  setMobilePreviewUrl: function(url){
    mobilePreviewViewUrl = url;
    mobilePreviewView.webContents.session.clearCache(function(){return true});
    mobilePreviewTopBarView.webContents.send("redirectToGivenLocation", '/preview-empty');

    if(global.currentServerProccess){
      const net = require('net');
      const client = new net.Socket();
      const tryConnection = () => client.connect({port: 13131}, () => {

        client.end();
        mobilePreviewView.webContents.loadURL(url);
        mobilePreviewTopBarView.webContents.send("redirectToGivenLocation", '/preview-buttons');
        mobilePreviewTopBarView.webContents.send("previewButtonsShowingUrl", url);
      }
      );
      client.on('error', (error) => {
        mobilePreviewTopBarView.webContents.send("redirectToGivenLocation", '/preview-no-server');
        //setTimeout(tryConnection, 1000);
      });
      tryConnection();
    }
    else{
      mobilePreviewTopBarView.webContents.send("redirectToGivenLocation", '/preview-no-server');
      showPreviewWaitForServer(mobilePreviewView);
    }

  },

  openMobilePreview: function(){

    if(global.pogoconf.expPreviewWindow === false){
      return;
    }

    mobilePreviewView.webContents.session.clearCache(function(){return true});

    showPreviewWaitForServer(mobilePreviewView);

    if(global.currentServerProccess){
      const net = require('net');
      const client = new net.Socket();
      const tryConnection = () => client.connect({port: 13131}, () => {

        client.end();

        console.log('preview');
        mobilePreviewViewUrl = 'http://localhost:13131';
        mobilePreviewView.webContents.loadURL(mobilePreviewViewUrl);
        mobilePreviewTopBarView.webContents.send("redirectToGivenLocation", '/preview-buttons');
      }
      );
      client.on('error', (error) => {
        mobilePreviewTopBarView.webContents.send("redirectToGivenLocation", '/preview-no-server');
        //setTimeout(tryConnection, 1000);
      });
      tryConnection();

    }
    else{
      mobilePreviewTopBarView.webContents.send("redirectToGivenLocation", '/preview-no-server');
      console.log(global.currentSitePath);

    }

    mobilePreviewViewActive = true;
    mainWindow.webContents.send("setMobileBrowserOpen");
    setMobilePreviewBounds();

  },

  closeMobilePreview: function(){
    mobilePreviewViewActive = false;
    mainWindow.webContents.send("setMobileBrowserClose");
    setMobilePreviewBounds();
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
