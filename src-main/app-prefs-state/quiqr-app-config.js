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
    state.lastOpenedPublishTargetForSite = {};
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


  function setSkipWelcomeScreen(skip){
    state.skipWelcomeScreen = skip;
  }

  function setExperimentalFeatures(toggle){
    state.experimentalFeatures = toggle;
  }
  function setDisablePartialCache(toggle){
    state.disablePartialCache = toggle;
  }

  function setExpPreviewWindow(toggle){
    state.expPreviewWindow = toggle;
  }

  function setExpNewSyncMethod(toggle){
    state.expNewSyncMethod = toggle;
  }

  function setDevLocalApi (toggle){
    state.devLocalApi = toggle;
  }
  function setDevDisableAutoHugoServe(toggle){
    state.devDisableAutoHugoServe = toggle;
  }
  function setDevShowCurrentUser(toggle){
    state.devShowCurrentUser = toggle;
  }

  function setSitesListingView(view){
    state.sitesListingView = view;
  }

  function setCurrectUsername(username){
    state.currentUsername = username;
  }


  function setPrefkey(prefKey, prefValue){
    state.prefs[prefKey] = prefValue;
  }

  function setLastOpenedPublishTargetForSite(siteKey,publishKey){
    state.lastOpenedPublishTargetForSite[siteKey] = publishKey;
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
    lastOpenedPublishTargetForSite: {
    },
    skipWelcomeScreen: false,
    experimentalFeatures: false,
    disablePartialCache: false,
    expPreviewWindow: false,
    expNewSyncMethod: false,
    devLocalApi: false,
    devDisableAutoHugoServe: false,
    devShowCurrentUser: false,
    sitesListingView: 'all',
    currentUsername: null,
  }, state);

  return {
    get lastOpenedSite() { return state.lastOpenedSite; },
    get lastOpenedPublishTargetForSite() { return state.lastOpenedPublishTargetForSite; },
    get prefs() { return state.prefs; },
    get currentUsername() { return state.currentUsername; },
    get skipWelcomeScreen() { return state.skipWelcomeScreen; },
    get experimentalFeatures() { return state.experimentalFeatures; },
    get disablePartialCache() { return state.disablePartialCache; },
    get expPreviewWindow() { return state.expPreviewWindow; },
    get expNewSyncMethod() { return state.expNewSyncMethod; },
    get devLocalApi() { return state.devLocalApi; },
    get devDisableAutoHugoServe() { return state.devDisableAutoHugoServe; },
    get devShowCurrentUser() { return state.devShowCurrentUser; },
    get sitesListingView() {
      return state.sitesListingView;
    },
    setLastOpenedSite,
    setLastOpenedPublishTargetForSite,
    setPrefkey,
    setCurrectUsername,
    setSkipWelcomeScreen,
    setExperimentalFeatures,
    setDisablePartialCache,
    setExpPreviewWindow,
    setExpNewSyncMethod,
    setDevLocalApi,
    setDevDisableAutoHugoServe,
    setDevShowCurrentUser,
    setSitesListingView,
    saveState,
    resetStateToDefault
  };
};
