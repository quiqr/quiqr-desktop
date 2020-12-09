//@flow

const glob = require('glob');
const fs = require('fs-extra');
const path = require('path');
const pathHelper = require('./path-helper');
const formatProviderResolver = require('./format-provider-resolver');
const outputConsole = require('./output-console');
const Joi = require('joi');

let configurationCache = undefined;

const supportedFormats = formatProviderResolver.allFormatsExt().join(',');
const defaultPathSearchPattern = (pathHelper.getRoot() + 'config.{'+supportedFormats+'}').replace(/\\/gi,'/');
const namespacedPathSearchPattern = (pathHelper.getRoot() + 'config.*.{'+supportedFormats+'}').replace(/\\/gi,'/');
const globalConfigPattern = (pathHelper.getRoot() + 'config.{'+supportedFormats+'}').replace(/\\/gi,'/');

function normalizeSite(site){

}

function validateSite(site) {
    if(site==null){
        throw new Error(`Site config can't be null.`);
    }
    const schema = Joi.object().keys({
        key: Joi.string().required(),
        name: Joi.string().required(),
        source: Joi.object().required(),
        serve: Joi.array(),
        build: Joi.array(),
        publish: Joi.array(),
        lastPublish: Joi.number().integer(),
        lastEdit: Joi.number().integer(),
        transform: Joi.array()

    });
    const result = Joi.validate(site, schema);
    if(result.error)
        throw result.error;
}


const GLOBAL_DEFAULTS = {
    debugEnabled: false,
    cookbookEnabled: true,
    siteManagementEnabled: true,
    maximizeAtStart: false,
    hideWindowFrame: false,
    hideMenuBar: false,
    hideInlineMenus: true,
    appTheme: "simple",
    pogoboardConn: {host:"localhost",port:9999, protocol: "http:"},
    pogostripeConn: {host:"localhost",port:4242, protocol: "http:"},
    //pogoboardConn: {host:"board.poppygo.io",port:443, protocol: "https:"},
}

function invalidateCache(){
    configurationCache = undefined;
}

function get(callback, {invalidateCache} = {}){

    if(invalidateCache===true)
        configurationCache = undefined;

    if(configurationCache){
        callback(undefined, configurationCache);
        return;
    }

    let files = glob.sync(defaultPathSearchPattern)
        .concat(glob.sync(namespacedPathSearchPattern))
        .map(x=>path.normalize(x));

    let configurations = {sites:[], global: GLOBAL_DEFAULTS};

    for(let i = 0; i < files.length; i++){
        let file = files[i];
        if(fs.existsSync(file)){
            try{
                let strData = fs.readFileSync(file, {encoding: 'utf-8'});
                let formatProvider = formatProviderResolver.resolveForFilePath(file);
                if(formatProvider==null) throw new Error(`Could not resolve a format provider for file ${file}.`)
                let site = formatProvider.parse(strData);
                validateSite(site);
                normalizeSite(site);
                site.configPath = file;
                configurations.sites.push(site);

            }
            catch(e){
                outputConsole.appendLine(`Configuration file is invalid '${file}': ${e.toString()}`);
            }
        }
    }

    let globalConfigFile = (glob.sync(globalConfigPattern)||[])[0];
    if(globalConfigFile){
        try{
            let strData = fs.readFileSync(globalConfigFile, {encoding: 'utf-8'});
            let formatProvider = formatProviderResolver.resolveForFilePath(globalConfigFile);
            if(formatProvider==null) throw new Error(`Could not resolve a format provider for "${globalConfigFile}".`)
            let global = formatProvider.parse(strData);
            global = {
                debugEnabled: global.debugEnabled == null ? GLOBAL_DEFAULTS.debugEnabled : global.debugEnabled===true, //default false
                cookbookEnabled: global.cookbookEnabled == null ? GLOBAL_DEFAULTS.cookbookEnabled : global.cookbookEnabled===true, //default true
                siteManagementEnabled: global.siteManagementEnabled == null ? GLOBAL_DEFAULTS.siteManagementEnabled : global.siteManagementEnabled===true,
                maximizeAtStart: global.maximizeAtStart == null ? GLOBAL_DEFAULTS.maximizeAtStart : global.maximizeAtStart===true,
                hideWindowFrame: global.hideMenuBar == null ? GLOBAL_DEFAULTS.hideWindowFrame : global.hideWindowFrame===true,
                hideMenuBar: false,
                //hideMenuBar: global.hideMenuBar == null ? GLOBAL_DEFAULTS.hideMenuBar : global.hideMenuBar===true,
                hideInlineMenus: global.hideInlineMenus == null ? GLOBAL_DEFAULTS.hideInlineMenus : global.hideInlineMenus===true,
                appTheme: global.appTheme == null ? GLOBAL_DEFAULTS.appTheme : global.appTheme,


            }

            //settings overruled


            configurations.global = global;
        }
        catch(e){
            outputConsole.appendLine(`Global configuration file is invalid '${globalConfigFile}': ${e.toString()}`);
        }
    }

    configurationCache = configurations;
    callback(undefined, configurations);
}
function getPromise(options) {
    return new Promise((resolve, reject)=>{
        get((err, data)=>{
            if(err) reject(err);
            else resolve(data);
        }, options);
    });
}

module.exports = { get, getPromise, invalidateCache }
