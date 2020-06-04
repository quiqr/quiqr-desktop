const electron = require('electron')
const ipcMainBinder = require('./ipc-main-binder');
const mainWindowManager = require('./main-window-manager');
//const logWindowManager = require('./log-window-manager');
//const prefsWindowManager = require('./prefs-window-manager');
//const selectsiteWindowManager = require('./selectsite-window-manager');
const unhandled = require('electron-unhandled');
const contextMenu = require('electron-context-menu');
const BrowserWindow = electron.BrowserWindow;
//const outputConsole = require('./output-console');
const pogozipper = require('./pogozipper');

const menuManager = require('./menu-manager');

//const AdmZip = require('adm-zip');

unhandled();

// Module to control application life.
const app = electron.app
//const Menu = electron.Menu

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
    // Create the browser window.
    mainWindow = mainWindowManager.getCurrentInstanceOrNew();
    mainWindow.on('closed', function () {
        mainWindow = null
    })

    contextMenu(mainWindow);
}


/*
function openpreviewWindow() {
    return;
    previewWindow = previewWindowManager.getCurrentInstanceOrNew();
    if (previewWindow) {
        previewWindow.webContents.send("redirectCookbook")
    }
}
*/

    /*
function createMainMenu(){

    const isMac = process.platform === 'darwin'

    const template = [
        // { role: 'appMenu' }
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                    label: 'Preferences',
                    click: async () => {
                        createPrefsWindow()
                    }
                },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                {
                    label: 'Select website',
                    click: async () => {
                        createSelectSiteWindow()
                    }
                },
                { type: 'separator' },
                {
                    label: 'Import website',
                    click: async () => {
                        pogozipper.importSite()
                    }
                },
                {
                    label: 'Export website',
                    click: async () => {
                        pogozipper.exportSite()
                    }
                },
                {
                    label: 'Delete Site',
                    click: async () => {
                        deleteSite()
                    }
                },
                { type: 'separator' },
                {
                    label: 'Import theme',
                    click: async () => {
                        pogozipper.importTheme()
                    }
                },
                {
                    label: 'Export theme',
                    click: async () => {
                        pogozipper.exportTheme()
                    }
                },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startspeaking' },
                            { role: 'stopspeaking' }
                        ]
                    }
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' },
                    {
                        label: 'Preferences',
                        click: async () => {
                            createPrefsWindow()
                        }
                    }
                ])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [

                { role: 'reload' },

                { type: 'separator' },

                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        },
        {
            label: 'Expert',
            submenu: [
                {
                    label: 'Front page',
                    click: async () => {
                        openHome()
                    }
                },
                {
                    label: 'Open Form Cookbooks',
                    click: async () => {
                        openCookbooks()
                    }
                },
                {
                    label: 'Show Log Window',
                    click: async () => {
                        createLogWindow()
                    }
                },
                {
                    label: 'Stop server',
                    click: async () => {
                        stopServer()
                    }
                },

                ...(global.currentSiteKey ?
                [{
                    label: 'Start server',
                    click: async () => {
                        startServer()
                    }
                }]:[]),

                { type: 'separator' },
                {
                    label: 'Open Site Directory',
                    click: async () => {
                        openWorkSpaceDir()
                    }
                },
                {
                    label: 'Open Workspace Config',
                    click: async () => {
                        openWorkSpaceConfig()
                    }
                },
                { type: 'separator' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        await shell.openExternal('https://docs.poppygo.app/')
                    }
                }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}
    */



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    //createMainMenu();
    menuManager.createMainMenu();
    createWindow();
    menuManager.init();
})

app.on('before-quit', function () {
    stopServer();
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
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMainBinder.bind();
