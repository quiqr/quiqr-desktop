const electron                  = require('electron');
const windowStateKeeper         = require('electron-window-state');
const BrowserWindow             = electron.BrowserWindow;
const url                       = require('url')
const path                      = require('path')
const fs                        = require('fs-extra')

let logWindow;

const isDev = process.env.NODE_ENV === "development";
let mainWindow;
let mainWindowState;

function getLocation(){

  if (isDev) {
    mainWindow.loadURL("http://localhost:4001/console"); // For development
  } else {

    let lookups = [
      path.join(__dirname, "../dist/frontend/console.html"),
      path.normalize(path.join(__dirname, '/../../console.html')), //works in production
      path.normalize(path.join(__dirname, '../frontend/build/console.html')), //works in development after react_build
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
      { pathname: indexFile+"?console=true", protocol: 'file:', slashes: true });

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
    return logWindow;
  },

  getCurrentInstanceOrNew: function(){
    let instance = this.getCurrentInstance();

    if(instance){
      instance.show();
      return instance;
    }

    createWindow();
    return logWindow;
  }
}
