const electron = require('electron')
const ipcMainBinder = require('./ipc-main-binder');
const mainWindowManager = require('./main-window-manager');
const unhandled = require('electron-unhandled');
const contextMenu = require('electron-context-menu');
const BrowserWindow = electron.BrowserWindow;
const pogozipper = require('./pogozipper');
const menuManager = require('./menu-manager');
const request = require('request');
const fs = require('fs-extra');
const fssimple = require('fs');
const pathHelper = require('./path-helper');
const fileDirUtils = require('./file-dir-utils');
const PoppyGoAppConfig = require('./poppygo-app-config');
const ProgressBar = require('electron-progressbar');


const outputConsole = require('./output-console');

unhandled();

// Module to control application life.
const app = electron.app

if(app.isPackaged) {
    process.env.NODE_ENV = 'production';
    console.log('production!');
}

require('events').EventEmitter.prototype._maxListeners = 15;

//console.log(process.argv);
let pogoconf = PoppyGoAppConfig();
global.outputConsole = outputConsole;
global.currentSiteKey = pogoconf.lastOpenedSite.siteKey;
global.currentSitePath = pogoconf.lastOpenedSite.sitePath;
global.currentWorkspaceKey = pogoconf.lastOpenedSite.workspaceKey;
global.skipWelcomeScreen = pogoconf.skipWelcomeScreen;

global.hugoServer = undefined;
global.currentServerProccess = undefined;
global.mainWM = mainWindowManager;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let previewWindow;
let logWindow;

function createWindow () {
    mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.on('closed', function () {
        mainWindow = null
    })

    contextMenu(mainWindow);
}

function downloadFile(file_url , targetPath){

    if(file_url.includes("picdrop.t3lab.com")){
        let urlarr = file_url.split('picdrop.t3lab.com')
        file_url = 'https://picdrop.t3lab.com'+urlarr[1];
        console.log(file_url);
    }

    let progressBar = new ProgressBar({
        indeterminate: false,
        text: 'Downloading '+file_url+' ..',
        detail: 'Preparing upload..',
        browserWindow: {
            frame: false,
            parent: mainWindow,
            webPreferences: {
                nodeIntegration: true
            }
        }
    });

    var received_bytes = 0;
    var total_bytes = 0;

    var req = request({
        method: 'GET',
        uri: file_url
    });

    var out = fssimple.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function ( data ) {
        total_bytes = parseInt(data.headers['content-length' ]);
    });

    req.on('data', function(chunk) {
        received_bytes += chunk.length;
        showProgress(progressBar,received_bytes, total_bytes);
    });

    out.on('finish', () =>{
        progressBar.setCompleted();
        progressBar._window.hide();
        importPogoFile(targetPath);
    });
}

function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function showProgress(progressBar,received,total){
    var percentage = (received * 100) / total;
    progressBar.value = percentage;
    progressBar.detail = percentage.toFixed(1) + "% | " + formatBytes(received) + " of " + formatBytes(total);
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    createWindow();
    menuManager.createMainMenu();
})

app.on('before-quit', function () {
    if(global.hugoServer){
        global.hugoServer.stopIfRunning(function(err, stdout, stderr){
            if(err) reject(err);
            else{ resolve(); }
        });
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
        handlePogoUrl(event, schemeData);
    }
    else{
        app.whenReady().then(()=>{
            handlePogoUrl(event, schemeData);
        });
    }
});

// Iterate over arguments and look out for uris
function openUrlFromArgv(argv) {
    for (let i = 1; i < argv.length; i++) {
        let arg = argv[i]
        if (!arg.startsWith('poppygo:') && !arg.startsWith('poppygo:')) {
            console.log("open-url: URI doesn't start with poppygo:", arg)
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
        /*
    if (window) {
        if (window.isMinimized()) window.show()
        window.focus()
    }
    */
})

async function handlePogoUrl(event, schemeData){

    await fs.ensureDir(pathHelper.getTempDir());

    const remoteFileURL = schemeData.substr(10);
    const remoteFileName = remoteFileURL.split('/').pop();
    const tmppath = pathHelper.getTempDir() + remoteFileName;

    downloadFile(remoteFileURL, tmppath);
}

function importPogoFile(path){

    if(path.split('.').pop()=='pogosite'){
        pogozipper.importSite(path)
    }
    else if(path.split('.').pop()=='pogotheme'){
        pogozipper.importTheme(path)
    }
    else if(path.split('.').pop()=='pogopass'){
        pogozipper.importPass(path)
    }
    else if(path.split('.').pop()=='pogocontent'){
        pogozipper.importContent(path)
    }
}


app.on('open-file', (event, path) => {
    event.preventDefault();

    if(app.isReady()){
        importPogoFile(path);
    }
    else{
        app.whenReady().then(() => {
            /*
            if (mainWindow === null) {
                createWindow();
            }
            */
            importPogoFile(path);
        });
    }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMainBinder.bind();
