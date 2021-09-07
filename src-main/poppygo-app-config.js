'use strict';

const path = require('path');
const electron = require('electron');
const jsonfile = require('jsonfile');
const mkdirp = require('mkdirp');

module.exports = function (options) {
    const app = electron.app || electron.remote.app;
    let state;
    const config = Object.assign({
        file: 'poppygo-app-config.json',
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

    /* view: string (all, mylocal, myremote)  */
    function setSitesListingView(view){
        state.sitesListingView = view;
    }

    /* currentUsername: string  */
    function setCurrectUsername(username){
        state.currentUsername = username;
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
        skipWelcomeScreen: false,
        experimentalFeatures: false,
        sitesListingView: 'all',
        currentUsername: null,
    }, state);

    return {
        get lastOpenedSite() { return state.lastOpenedSite; },
        get currentUsername() { return state.currentUsername; },
        get skipWelcomeScreen() { return state.skipWelcomeScreen; },
        get experimentalFeatures() { return state.experimentalFeatures; },
        get sitesListingView() {
            return state.sitesListingView;
        },
        setLastOpenedSite,
        setCurrectUsername,
        setSkipWelcomeScreen,
        setExperimentalFeatures,
        setSitesListingView,
        saveState,
        resetStateToDefault
    };
};
