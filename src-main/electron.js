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
const ProgressBar = require('electron-progressbar');

unhandled();

// Module to control application life.
const app = electron.app

if(app.isPackaged) {
    process.env.NODE_ENV = 'production';
    console.log('production!');
}

//console.log(process.argv);

global.currentSiteKey = undefined;
global.currentSitePath = undefined;


global.hugoServer = undefined;
global.currentServerProccess = undefined;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let previewWindow;
let logWindow;

function createWindow () {
    mainWindow = mainWindowManager.getCurrentInstanceOrNew();
    mainWindow.on('closed', function () {
        mainWindow = null
    })
    console.log('process args ' + process.argv.join(','))

    contextMenu(mainWindow);
}

function downloadFile(file_url , targetPath){

    var progressBar = new ProgressBar({
        indeterminate: false,
        //text: 'To: '+targetPath+' ..',
        text: 'Downloading '+file_url+' ..',
        closeOnComplete: true,
        //abortOnError: true,
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

    out.on('finish', function(){
        //progressBar.close();
        importPogoFile(targetPath);
    });

    req.on('response', function ( data ) {
        total_bytes = parseInt(data.headers['content-length' ]);
    });

    req.on('data', function(chunk) {
        received_bytes += chunk.length;

        if(!progressBar.isCompleted()){
            showProgress(progressBar,received_bytes, total_bytes);
        }

    });

    req.on('end', async function() {
        progressBar.setCompleted();
        //progressBar.close();
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

    if(progressBar.isCompleted()){
        return;
    }

    if(percentage > 90){
        progressBar.setCompleted();
    }
    else{
        progressBar.value = percentage;
        progressBar.detail = percentage.toFixed(1) + "% | " + formatBytes(received) + " of " + formatBytes(total);
    }
}

function runQueue(){
    return true;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    menuManager.createMainMenu();
    createWindow();
    menuManager.init();
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
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
})

async function cleanTempDir(){
    await fs.ensureDir(pathHelper.getTempDir());
    //await fileDirUtils.fileRegexRemove(pathHelper.getTempDir(), /.*\.pogo*/);
}


app.on('open-url', function(event, schemeData){

    if(app.isReady()){
        handlePogoUrl(event, schemeData);
    }
    else{
        app.whenReady().then(()=>{
            /*
            if (mainWindow === null) {
                createWindow();
            }
            */
            handlePogoUrl(event, schemeData);
        });
    }
});

function handlePogoUrl(event, schemeData){
    /*
    if (mainWindow === null) {
        createWindow();
    }
    */

    cleanTempDir();

    const remoteFileURL = schemeData.substr(10);
    const remoteFileName = remoteFileURL.split('/').pop();

    const tmppath = pathHelper.getRoot() + remoteFileName;

    const dialog = electron.dialog;
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        message: 'protocol process args: ' + schemeData +"\nremote: " + remoteFileURL + "\n to: " + tmppath
    });

    downloadFile(remoteFileURL, tmppath);
}

function importPogoFile(path){

    /*
        if (mainWindow === null) {
        createWindow();
    }
    */

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
