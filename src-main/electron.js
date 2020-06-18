const electron = require('electron')
const ipcMainBinder = require('./ipc-main-binder');
const mainWindowManager = require('./main-window-manager');
const unhandled = require('electron-unhandled');
const contextMenu = require('electron-context-menu');
const BrowserWindow = electron.BrowserWindow;
const pogozipper = require('./pogozipper');
const menuManager = require('./menu-manager');


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
    console.log('process args ' + process.argv.join(','))

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
})

app.on('open-file', (event, path) => {
    event.preventDefault();

    if (mainWindow === null) {
        createWindow();
    }

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
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMainBinder.bind();
