const glob                   = require('glob');
const fs                     = require('fs-extra');
const path                   = require('path');
const Joi                    = require('joi');
const pathHelper             = require('../utils/path-helper');
const formatProviderResolver = require('../utils/format-provider-resolver');
const outputConsole          = require('../logger/output-console');
const QuiqrAppConfig         = require('./quiqr-app-config');

const pogoconf = QuiqrAppConfig();

let configurationCache = undefined;

const supportedFormats = formatProviderResolver.allFormatsExt().join(',');
const defaultPathSearchPattern = (pathHelper.getRoot() + 'config.{'+supportedFormats+'}').replace(/\\/gi,'/');
const namespacedPathSearchPattern = (pathHelper.getRoot() + 'config.*.{'+supportedFormats+'}').replace(/\\/gi,'/');
const globalConfigPattern = (pathHelper.getRoot() + 'config.{'+supportedFormats+'}').replace(/\\/gi,'/');

let pogoboardConn, pogostripeConn;

if(pogoconf.devLocalApi){
  pogoboardConn = {host:"localhost",port:9999, protocol: "http:"};
  pogostripeConn = {host:"localhost",port:4242, protocol: "http:"};
}
else{
  pogoboardConn = {host:"board.quiqr.app",port:443, protocol: "https:"};
  pogostripeConn = {host:"pay.quiqr.app",port:443, protocol: "https:"};
}

const GLOBAL_DEFAULTS = {
  appTheme: "quiqr10", // default / quiqr10 / simple
  pogostripeConn: pogostripeConn,
  pogoboardConn: pogoboardConn
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

    //0 = never published
    //1 = publication time unknown
    //other = publication time stamp (end polling)
    lastPublish: Joi.number().integer(),

    //0 = never published
    //1 = publication finished
    //2 = publication pending (start polling)
    //6 = publication timeout (error end polling)
    //7 = publication failed could not push(error end polling)
    //8 = publication failed could not commit(error end polling)
    publishStatus: Joi.number().integer(),

    lastEdit: Joi.number().integer(),
    transform: Joi.array()

  });
  const result = Joi.validate(site, schema);
  if(result.error)
    throw result.error;
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

  let ownerslookupHash = {};
  let lookuploaded = false;
  try{
    ownerslookUpData = fs.readFileSync(pathHelper.ownersLookupCacheFilePath(), {encoding: 'utf-8'});
    ownerslookupHash = JSON.parse(ownerslookUpData);
    lookuploaded = true;
  }
  catch(e){
    outputConsole.appendLine(`Could not read ownerslookup}': ${e.toString()}`);
  }

  for(let i = 0; i < files.length; i++){
    let file = files[i];
    if(fs.existsSync(file)){
      try{
        let strData = fs.readFileSync(file, {encoding: 'utf-8'});
        let formatProvider = formatProviderResolver.resolveForFilePath(file);
        if(formatProvider==null) throw new Error(`Could not resolve a format provider for file ${file}.`)
        let site = formatProvider.parse(strData);
        validateSite(site);
        site.published = 'unknown';
        if(lookuploaded){
          site.published = 'yes';
          site.owner = ''
          if(site.key in ownerslookupHash.sitesToUsers){
            site.owner = ownerslookupHash.sitesToUsers[site.key];
          }
          if(site.key in ownerslookupHash.sitesToUsers){
            site.publishKey = ownerslookupHash.sitesToPaths[site.key];
          }
          if(Array.isArray(ownerslookupHash.sitesUnpublished) && ownerslookupHash.sitesUnpublished.includes(site.key)){
            site.published = 'no';
          }
        }
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
        appTheme: global.appTheme == null ? GLOBAL_DEFAULTS.appTheme : global.appTheme,
      }

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
