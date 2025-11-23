const glob                   = require('glob');
const fs                     = require('fs-extra');
const path                   = require('path');
const Joi                    = require('joi');
const pathHelper             = require('../utils/path-helper');
const formatProviderResolver = require('../utils/format-provider-resolver');
const outputConsole          = require('../logger/output-console');

let configurationCache = undefined;

const sitePathSearchPattern    = path.join(pathHelper.getRoot(), 'sites', '*/config.json').replace(/\\/gi,'/');
const oldSitePathSearchPattern = path.join(pathHelper.getRoot(), 'config.*.json').replace(/\\/gi,'/');

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

    tags: Joi.array(),

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
  const result = schema.validate(site);
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

  let files = glob.sync(sitePathSearchPattern)
    .concat(glob.sync(oldSitePathSearchPattern))
    .map(x=>path.normalize(x));

  let configurations = {sites:[]};

  for(let i = 0; i < files.length; i++){
    let conffile = files[i];
    if(fs.existsSync(conffile)){
      try{
        let strData = fs.readFileSync(conffile, {encoding: 'utf-8'});
        let formatProvider = formatProviderResolver.resolveForFilePath(conffile);
        if(formatProvider==null) throw new Error(`Could not resolve a format provider for file ${conffile}.`)
        let site = formatProvider.parse(strData);

        // Migration: Ensure required fields exist
        let needsMigration = false;

        // Ensure name field exists - use key as fallback
        if (!site.name && site.key) {
          site.name = site.key;
          needsMigration = true;
          outputConsole.appendLine(`Migration: Added missing 'name' field to '${conffile}'`);
        }

        // Ensure source field exists - use default folder source
        if (!site.source) {
          site.source = {
            type: 'folder',
            path: 'main'
          };
          needsMigration = true;
          outputConsole.appendLine(`Migration: Added missing 'source' field to '${conffile}'`);
        }

        // Save the fixed config back to disk
        if (needsMigration) {
          try {
            fs.writeFileSync(conffile, JSON.stringify(site), { encoding: "utf8"});
            outputConsole.appendLine(`Migrated site config '${conffile}'`);
          } catch(writeErr) {
            outputConsole.appendLine(`Warning: Could not save migrated config '${conffile}': ${writeErr.toString()}`);
          }
        }

        validateSite(site);
        site.published = 'unknown';

        site.source.path = siteSourceRelativeToAbsolute(site, conffile);
        site.configPath = conffile;
        site.etalage = getEtalage(site);
        configurations.sites.push(site);
      }
      catch(e){
        outputConsole.appendLine(`Configuration file is invalid '${conffile}': ${e.toString()}`);
      }
    }
  }

  configurationCache = configurations;
  callback(undefined, configurations);
}

function siteSourceRelativeToAbsolute(site, conffile){
  if(site.source.path.substring(0, 1) !== "/" ){
    siteKey = path.basename(path.dirname(conffile));
    return path.join(pathHelper.getRoot(), 'sites', siteKey, site.source.path);
  }
  else{
    return site.source.path;
  }
}

function getEtalage(site){

  let etalagePath = path.join(site.source.path,"/quiqr/etalage/etalage.json");
  let etalageScreenshotsPath = path.join(site.source.path,"/quiqr/etalage/screenshots/");
  let etalageFaviconPath = path.join(site.source.path,"/quiqr/etalage/favicon/");
  let etalage = {}

  if(fs.existsSync(etalagePath)){
    let strData = fs.readFileSync(etalagePath, {encoding: 'utf-8'});
    let formatProvider = formatProviderResolver.resolveForFilePath(etalagePath);
    etalage = formatProvider.parse(strData);
  }

  const screenshotPattern = (etalageScreenshotsPath + '*.{png,jpg,jpeg,gif}').replace(/\\/gi,'/');
  let files = glob.sync(screenshotPattern)
    .map((x)=>{
      let y = path.normalize(x);
      return y.substr(site.source.path.length, x.length)
    });
  etalage.screenshots = files;


  const faviconPattern = (etalageFaviconPath + '*.{png,jpg,jpeg,gif,ico}').replace(/\\/gi,'/');
  let files2 = glob.sync(faviconPattern)
    .map((x)=>{
      let y = path.normalize(x);
      return y.substr(site.source.path.length, x.length)
    });
  etalage.favicons = files2;

  return etalage;

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
