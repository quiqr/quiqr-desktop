'use strict';

const path = require('path');
const electron = require('electron');
const jsonfile = require('jsonfile');
const mkdirp = require('mkdirp');

module.exports = function (options) {
  const app = electron.app || electron.remote.app;
  let state;
  const config = Object.assign({
    file: 'quiqr-app-config.json',
    path: app.getPath('userData')
  }, options);
  const fullStoreFileName = path.join(config.path, config.file);

  function resetStateToDefault() {
    state.lastOpenedSite = {siteKey: null, workspaceKey: null, sitePath: null};
  }

  function validateState() {
    const isValid = true;
    if (!isValid) {
      state = null;
      return;
    }
  }

  async function saveState() {
    try {
      mkdirp.sync(path.dirname(fullStoreFileName));
      jsonfile.writeFileSync(fullStoreFileName, state);
    } catch (err) {
      console.log(`could not save state ${err.to_json()}`)
    }
    return;
  }

  /*
   * START SETTINGS METHODS
   */
  function setLastOpenedSite(siteKey,workspaceKey, sitePath){
    state.lastOpenedSite = {siteKey: siteKey, workspaceKey: workspaceKey, sitePath: sitePath};
  }

  /* skip: bool */
  function setSkipWelcomeScreen(skip){
    state.skipWelcomeScreen = skip;
  }

  /* toggle: bool */
  function setExperimentalFeatures(toggle){
    state.experimentalFeatures = toggle;
  }
  /* toggle: bool */
  function setDisablePartialCache(toggle){
    state.disablePartialCache = toggle;
  }
  /* toggle: bool */
  function setExpPreviewWindow(toggle){
    state.expPreviewWindow = toggle;
  }
  /* toggle: bool */
  function setDevLocalApi (toggle){
    state.devLocalApi = toggle;
  }
  /* toggle: bool */
  function setDevDisableAutoHugoServe(toggle){
    state.devDisableAutoHugoServe = toggle;
  }
  /* toggle: bool */
  function setDevShowCurrentUser(toggle){
    state.devShowCurrentUser = toggle;
  }

  /* view: string (all, mylocal, myremote)  */
  function setSitesListingView(view){
    state.sitesListingView = view;
  }

  /* currentUsername: string  */
  function setCurrectUsername(username){
    state.currentUsername = username;
  }


  function setPrefkey(prefKey, prefValue){
    state.prefs[prefKey] = prefValue;
  }


  /*
   * END SETTINGS METHODS
   */

  // Load previous state
  try {
    state = jsonfile.readFileSync(fullStoreFileName);
  } catch (err) {
    // Don't care
  }

  // Check state validity
  validateState();

  // Set state fallback values
  state = Object.assign({
    lastOpenedSite: {siteKey: null, workspaceKey: null, sitePath: null},
    prefs: {
      dataFolder: "~/QuiqrData"
    },
    skipWelcomeScreen: false,
    experimentalFeatures: false,
    disablePartialCache: false,
    expPreviewWindow: false,
    devLocalApi: false,
    devDisableAutoHugoServe: false,
    devShowCurrentUser: false,
    sitesListingView: 'all',
    currentUsername: null,
  }, state);

  return {
    get lastOpenedSite() { return state.lastOpenedSite; },
    get prefs() { return state.prefs; },
    get currentUsername() { return state.currentUsername; },
    get skipWelcomeScreen() { return state.skipWelcomeScreen; },
    get experimentalFeatures() { return state.experimentalFeatures; },
    get disablePartialCache() { return state.disablePartialCache; },
    get expPreviewWindow() { return state.expPreviewWindow; },
    get devLocalApi() { return state.devLocalApi; },
    get devDisableAutoHugoServe() { return state.devDisableAutoHugoServe; },
    get devShowCurrentUser() { return state.devShowCurrentUser; },
    get sitesListingView() {
      return state.sitesListingView;
    },
    setLastOpenedSite,
    setPrefkey,
    setCurrectUsername,
    setSkipWelcomeScreen,
    setExperimentalFeatures,
    setDisablePartialCache,
    setExpPreviewWindow,
    setDevLocalApi,
    setDevDisableAutoHugoServe,
    setDevShowCurrentUser,
    setSitesListingView,
    saveState,
    resetStateToDefault
  };
};
