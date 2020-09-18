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

    function saveState() {
        try {
            mkdirp.sync(path.dirname(fullStoreFileName));
            jsonfile.writeFileSync(fullStoreFileName, state);
        } catch (err) {
            // Don't care
        }
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
    }, state);

    return {
        get lastOpenedSite() { return state.lastOpenedSite; },
        setLastOpenedSite,
        saveState,
        resetStateToDefault
    };
};
