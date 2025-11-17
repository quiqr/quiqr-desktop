const { app, BrowserWindow } = require("electron");
const path = require("path");
const remoteMain = require('@electron/remote/main');
const isDev = process.env.NODE_ENV === "development";
const backend = require("../backend/server");
const fs = require('fs-extra')
const url = require('node:url');
const QuiqrAppConfig    = require('../backend/src-main/app-prefs-state/quiqr-app-config');
const mainWindowManager = require('./ui-managers/main-window-manager');
const menuManager       = require('./ui-managers/menu-manager');
const outputConsole     = require('../backend/src-main/logger/output-console');

const apiMain = require('../backend/src-main/bridge/api-main');

remoteMain.initialize();

let pogoconf = QuiqrAppConfig();
global.pogoconf = pogoconf;

global.outputConsole = outputConsole;
global.currentSiteKey = pogoconf.lastOpenedSite.siteKey;
global.currentSitePath = pogoconf.lastOpenedSite.sitePath;
global.currentBaseUrl = "";

global.currentFormShouldReload = undefined;
global.currentFormNodePath = undefined;
global.currentFormAccordionIndex = undefined;

global.currentWorkspaceKey = pogoconf.lastOpenedSite.workspaceKey;
//global.skipWelcomeScreen = pogoconf.skipWelcomeScreen;
global.hugoServer = undefined;
global.currentServerProccess = undefined;
global.logWindow;
global.apiMain = apiMain;
global.modelDirWatcher = undefined;

global.mainWM = mainWindowManager;
let mainWindow;

function createWindow () {
  mainWindow = global.mainWM.getCurrentInstanceOrNew();
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on("ready", () => {
  backend.startServer();
  createWindow();
  menuManager.createMainMenu();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
