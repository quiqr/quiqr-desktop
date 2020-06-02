//@flow

const electron = require('electron');
//const {BrowserWindow, BrowserView} = electron.BrowserWindow;
const { BrowserView, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');
const url = require('url')
const path = require('path')
const fs = require('fs-extra')

let mainWindow;
//let previewWindowl;
let mainWindowState;
let mobilePreviewView;

function showNotFound(mainWindow/*: any*/, lookups/*: Array<string>*/){
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


function showTesting(mainWindow/*: any*/){
    mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Testing</h1>
<p>Testing...</p>
</body>
</html>`));
}

function showLookingForServer(mainWindow/*: any*/, port/*: string*/){
    mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Waiting for Development Server</h1>
<p>Waiting for React development server in port ${port}...</p>
<p>Have you started it?</p>
</body>
</html>`));
}

function showInvalidDevelopmentUrl(mainWindow/*: any*/, url/*: ?string*/){
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
                    if(mainWindow)
                        mainWindow.loadURL(url);
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
            path.normalize(path.join(__dirname, '/../index.html')), //works in production
            path.normalize(path.join(__dirname, '../build/index.html')) //works in development after react_build
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
        }
        else{
            showNotFound(mainWindow, lookups);
        }
    }
}

function createPreviewWindow (windowState) {
    let mainWindowState = windowState;
    let previewWindowX = mainWindowState.x + mainWindowState.width;

    previewWindow = new BrowserWindow({

        show: false,
        parent: mainWindow,
        x: previewWindowX,
        y: mainWindowState.y,
        width: 500,
        height: mainWindowState.height,
    });

    previewWindow.setMenuBarVisibility(false);
    previewWindow.loadURL("http://localhost:1313");


    previewWindow.on('closed', function () {
        previewWindow.show = false;

    })
}

function createWindow () {

    const configurationDataProvider = require('./configuration-data-provider')

    let icon;
    if(process.env.REACT_DEV_URL)
        icon = path.normalize(__dirname + "/../public/icon.png");

    configurationDataProvider.get(function(err, configurations){

      let showFrame=false;
      configurations.global.hideWindowFrame ? showFrame = false : showFrame = true;

      // Load the previous state with fallback to defaults
      mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600
      });

      // Create the browser window.
      mainWindow = new BrowserWindow({
        show: false,
        frame: showFrame,
        backgroundColor:"#ffffff",

        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,

      });

      // Let us register listeners on the window, so we can update the state
      // automatically (the listeners will be removed when the window is closed)
      // and restore the maximized or full screen state
      mainWindowState.manage(mainWindow);

      if(configurations.global.maximizeAtStart){
        mainWindow.maximize();
      }
      if(configurations.global.hideMenuBar){
          //mainWindow.setMenuBarVisibility(false);
      }

      mobilePreviewView = new BrowserView();
      mainWindow.setBrowserView(mobilePreviewView);

      mainWindow.show();
        //createPreviewWindow(mainWindowState);
    });

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

    //mainWindow.webContents.openDevTools();
}

module.exports = {

    getCurrentInstance: function(){
        return mainWindow;
    },

    openMobilePreview: function(){
        let mobwidth = 340;
        mobilePreviewView.setBounds({ x: (mainWindowState.width-mobwidth), y: 0, width: mobwidth, height: mainWindowState.height });
        mobilePreviewView.webContents.loadURL('http://localhost:1313');
        //mainWindow.setContentBounds({ x: mainWindowState.x, y: mainWindowState.y, width: (mainWindowState.width-mobwidth), height: mainWindowState.height })
        mainWindow.webContents.send("setMobileBrowserOpen");
    },

    closeMobilePreview: function(){
        mobilePreviewView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
        //mainWindow.setContentBounds({ x: mainWindowState.x, y: mainWindowState.y, width: mainWindowState.width, height: mainWindowState.height })
        mainWindow.webContents.send("setMobileBrowserClose");
    },

    /*
    reloadPreview: function() {
      console.log ("function reloadPreview was called");

      //previewWindow.loadURL("http://localhost:1313");
      if (previewWindow){
        previewWindow.reload();

        previewWindow.webContents.once('dom-ready', function (){
          previewWindow.reload();
          previewWindow.show();
          });
      } else {
        createPreviewWindow;
      }



      return;
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
