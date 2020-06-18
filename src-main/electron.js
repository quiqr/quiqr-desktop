const electron = require('electron')
const ipcMainBinder = require('./ipc-main-binder');
const mainWindowManager = require('./main-window-manager');
const fileDirUtils = require('./file-dir-utils');
const unhandled = require('electron-unhandled');
const contextMenu = require('electron-context-menu');
const BrowserWindow = electron.BrowserWindow;
const pogozipper = require('./pogozipper');
const menuManager = require('./menu-manager');
const request = require('request');
const fs = require('fs-extra');
const fssimple = require('fs');
const pathHelper = require('./path-helper');

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
    // Save variable to know progress
    var received_bytes = 0;
    var total_bytes = 0;

    var req = request({
        method: 'GET',
        uri: file_url
    });

    var out = fssimple.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function ( data ) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length' ]);
    });

    req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length;

        showProgress(received_bytes, total_bytes);
    });

    req.on('end', function() {
        importPogoFile(targetPath);
    });
}

function showProgress(received,total){
    var percentage = (received * 100) / total;
    console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
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

app.on('open-url', function(event, schemeData){
    const remoteFileURL = schemeData.substr(10);
    const tmppath = pathHelper.getRoot() + "tempdownloadpogozip."+remoteFileURL.split('.').pop();

    const dialog = electron.dialog;
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        message: 'protocol process args ' + schemeData +'remote: ' + remoteFileURL + ' to ' + tmppath
    });

    //await fileDirUtils.fileRegexRemove(tmppath, /tempdownloadpogozip.*/);
    downloadFile(remoteFileURL, tmppath);

});


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

    if (mainWindow === null) {
        createWindow();
    }

    importPogoFile(path);
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMainBinder.bind();
