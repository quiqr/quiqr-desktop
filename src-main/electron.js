//@flow

const electron = require('electron')
const ipcMainBinder = require('./ipc-main-binder');
const mainWindowManager = require('./main-window-manager');
const logWindowManager = require('./log-window-manager');
const prefsWindowManager = require('./prefs-window-manager');
const selectsiteWindowManager = require('./selectsite-window-manager');
const unhandled = require('electron-unhandled');
const contextMenu = require('electron-context-menu');
const BrowserWindow = electron.BrowserWindow;
const outputConsole = require('./output-console');

const ProgressBar = require('electron-progressbar');

const pathHelper = require('./path-helper');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
unhandled();

// Module to control application life.
const app = electron.app
const Menu = electron.Menu

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

function openHome() {
  mainWindow = mainWindowManager.getCurrentInstanceOrNew();
  if (mainWindow) {
    mainWindow.webContents.send("redirectHome")
  }
}

function reloadPreview() {
    return;
    /*
  previewWindow = mainWindowManager.previewWindow;
  if (previewWindow) {
    previewWindow.reload();
  }
  */
}

function openCookbooks() {
  mainWindow = mainWindowManager.getCurrentInstanceOrNew();
  if (mainWindow) {
    mainWindow.webContents.send("redirectCookbook")
  }
}

function openpreviewWindow() {
    return;
  previewWindow = previewWindowManager.getCurrentInstanceOrNew();
  if (previewWindow) {
    previewWindow.webContents.send("redirectCookbook")
  }
}

function stopServer() {
  if(global.hugoServer){
    global.hugoServer.stopIfRunning(function(err, stdout, stderr){
      if(err) reject(err);
      else{ resolve(); }
    });
  }
}
function importSite() {
    let dir;

    const dialog = electron.dialog;

    dir = dialog.showOpenDialog(mainWindow, {
        filters: [
            { name: "Sukoh Sites", extensions: ["hsite"] }
        ],
        properties: ['openFile']

    }, async function (file) {
        if (file) {

            var zip = new AdmZip(file[0]);
            var zipEntries = zip.getEntries();
            var siteKey = "";

            await zipEntries.forEach(function(zipEntry) {
                if (zipEntry.entryName == "sitekey") {
                    siteKey = zip.readAsText("sitekey");
                }
                else{
                    console.log("no sitekey");
                }
            });

            if(siteKey!=""){

                var todayDate = new Date().toISOString().replace(':','-').replace(':','-').slice(0,-5);
                var pathSite = (pathHelper.getRoot()+"sites/"+siteKey);
                var pathSiteSources = (pathHelper.getRoot()+"sites/"+siteKey+"/sources");
                var pathSource = (pathSiteSources+"/"+siteKey+"-"+todayDate);
                await fs.ensureDir(pathSite);
                await fs.ensureDir(pathSiteSources);
                await fs.ensureDir(pathSource);

                var confFileName = "config."+siteKey+".json";
                var conftxt = zip.readAsText(confFileName);
                if(conftxt){
                    var newConf = JSON.parse(conftxt);

                    outputConsole.appendLine('Found a site with key ' + siteKey);
                    newConf.source.path = pathSource;

                    fssimple = require('fs');
                    fssimple.writeFile(pathHelper.getRoot()+'config.'+siteKey+'.json', JSON.stringify(newConf), 'utf8', async function(){
                        outputConsole.appendLine('wrote new site configuration');
                        await zip.extractAllTo(pathSource, true);

                        fs.remove(pathSource+'/'+confFileName, err => {
                            if (err) return console.error(err)
                            console.log('rm success!')
                        })

                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            message: "Site has been imported, PoppyGo will now be restarted.",
                        });

                        app.relaunch()
                        app.exit()

                    });
                }
                else{
                    dialog.showMessageBox(mainWindow, {
                        type: 'warning',
                        message: "Failed to import site. Invalid site file. 2",
                    });
                }

            }
            else{
                dialog.showMessageBox(mainWindow, {
                    type: 'warning',
                    message: "Failed to import site. Invalid site file 1",
                });
                return;
            }
        }
    });

}

function deleteSite() {
    let dir;

    const dialog = electron.dialog;

    if(global.currentSiteKey){

        let options  = {
            buttons: ["Yes","Cancel"],
            message: "Do you really want to delete " + global.currentSiteKey
        }

        //Synchronous usage
        let response = dialog.showMessageBox(options)
        if(response === 1) return;
        fs.remove(pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json');

        var rimraf = require("rimraf");
        rimraf(pathHelper.getRoot() + 'sites/'+global.currentSiteKey, function(){
            console.log("rm done");
        });

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            message: "Site "+ global.currentSiteKey +" deleted. Please restart Sukoh",
        });

        app.relaunch()
        app.exit()
    }
    else{
        dialog.showMessageBox(mainWindow, {
            type: 'error',
            message: "First, select a site to delete.",
        });
    }
}

function exportSite() {

    const dialog = electron.dialog;

    if(global.currentSiteKey){

        const prompt = require('electron-prompt');
        var newKey = "";
        prompt({
            title: 'Enter site key',
            label: 'key:',
            value: global.currentSiteKey,
            inputAttrs: {
                type: 'text',
                required: true
            },
            type: 'input'
        }, mainWindow)
        .then((r) => {
            if(r === null) {
            } else {
                newKey = r;
                if(newKey!=""){

                    let dir;

                    dir = dialog.showOpenDialog(mainWindow, {
                        properties: ['openDirectory']
                    }, async function (path) {
                        if (path) {

                            var progressBar = new ProgressBar({
                                indeterminate: false,
                                text: 'Downloading PoppyGo Components, ..',
                                abortOnError: true,
                                detail: 'Preparing download..'
                            });

                            progressBar.on('completed', function() {
                                progressBar.detail = 'Site has been exported';
                            })
                                .on('aborted', function(value) {
                                    console.info(`aborted... ${value}`);
                                })
                                .on('progress', function(value) {
                                });

                            progressBar.value += 1;
                            progressBar.detail = `Start exporting site...`

                            fssimple = require('fs');
                            fssimple.readFile((pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json'), 'utf8', async (err, conftxt) => {
                                if (err) {
                                    dialog.showMessageBox(mainWindow, {
                                        type: 'warning',
                                        message: "Failed to export. 2",
                                    });
                                    return;
                                }

                                var newName = path+"/"+newKey+".hsite";
                                var zip = new AdmZip();

                                var newConf = JSON.parse(conftxt);
                                newConf.key = newKey;
                                newConf.name = newKey;
                                var newConfJson = JSON.stringify(newConf);
                                progressBar.value += 1;
                                progressBar.detail = `Packing configuration...`

                                await zip.addFile("sitekey", Buffer.alloc(newKey.length, newKey), "");
                                await zip.addFile('config.'+newKey+'.json', Buffer.alloc(newConfJson.length, newConfJson), "");

                                progressBar.value += 1;
                                progressBar.detail = `Packing files...`

                                await zip.addLocalFolder(global.currentSitePath);
                                var willSendthis = zip.toBuffer();

                                progressBar.value += 1;
                                progressBar.detail = `Creating site file...`

                                await zip.writeZip(newName);
                                progressBar.setCompleted();
                                dialog.showMessageBox(mainWindow, {
                                    type: 'info',
                                    message: "Finished export. Check" + path+"/"+newKey+".hsite",
                                });

                                return;
                            })
                        }
                    });
                }
                else {
                    dialog.showMessageBox(mainWindow, {
                        type: 'error',
                        message: "A site key is required",
                    });
                }
                console.log('result', r);
            }
        })
        .catch(console.error);

    }
    else{
        dialog.showMessageBox(mainWindow, {
            type: 'error',
            message: "First, select a site to export.",
        });
    }
}

function createSelectSiteWindow () {
  selectsiteWindow = selectsiteWindowManager.getCurrentInstanceOrNew();
  if (selectsiteWindow) {
    selectsiteWindow.webContents.send("redirectselectsite")
  }

  selectsiteWindow.once('ready-to-show', () => {
    selectsiteWindow.webContents.send("redirectselectsite")
  })

  selectsiteWindow.webContents.on('did-finish-load',() => {
    selectsiteWindow.webContents.send("redirectselectsite")
  })

  selectsiteWindow.on('closed', function() {
    selectsiteWindow = null
  })
}

function createPrefsWindow () {
  prefsWindow = prefsWindowManager.getCurrentInstanceOrNew();
  if (prefsWindow) {
    prefsWindow.webContents.send("redirectPrefs")
  }

  prefsWindow.once('ready-to-show', () => {
    prefsWindow.webContents.send("redirectPrefs")
  })

  prefsWindow.webContents.on('did-finish-load',() => {
    prefsWindow.webContents.send("redirectPrefs")
  })

  prefsWindow.on('closed', function() {
    prefsWindow = null
  })
}


function createLogWindow () {
  logWindow = logWindowManager.getCurrentInstanceOrNew();
  if (logWindow) {
    logWindow.webContents.send("redirectConsole")
  }

  logWindow.once('ready-to-show', () => {
    logWindow.webContents.send("redirectConsole")
  })

  logWindow.webContents.on('did-finish-load',() => {
    logWindow.webContents.send("redirectConsole")
  })

  logWindow.on('closed', function() {
    logWindow = null
  })
}

function createMainMenu(){

  const isMac = process.platform === 'darwin'

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
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
          label: 'Select site',
          click: async () => {
            createSelectSiteWindow()
          }
        },
        {
            label: 'Import website',
            click: async () => {
                importSite()
            }
        },
        {
            label: 'Export website',
            click: async () => {
                exportSite()
            }
        },
        {
            label: 'Delete Site',
            click: async () => {
                deleteSite()
            }
        },
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
        { type: 'separator' },

        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },

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
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createMainMenu();
  createWindow();
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


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMainBinder.bind();
