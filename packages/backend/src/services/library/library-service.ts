import { AppConfig, Configurations } from "@quiqr/types";
import del from 'del';
import fs from 'fs-extra';
import path from 'path';
import { PathHelper } from "../../utils";
import { ConfigurationDataProvider } from "../configuration";
import { AppContainer } from "../../config";

// const del                           = require('del');
// const fs                            = require('fs-extra');
// const pathHelper                    = require('../../utils/path-helper');
const configurationDataProvider     = require('../../app-prefs-state/configuration-data-provider')
const InitialWorkspaceConfigBuilder = require('../workspace/initial-workspace-config-builder');
const hugoUtils                     = require('./../../hugo/hugo-utils');

/*

This service class containes utility functions for creating and manipulating unmounted sites

*/

class LibraryService {

  private appContainer: AppContainer;

  constructor(
    appContainer: AppContainer,
  ) {
    this.appContainer = appContainer;
  }

  async getSiteConf(siteKey: string){
    const options = { invalidateCache: true }
    const configurations = await this.appContainer.configurationProvider.getConfigurations(options);
    let site = configurations.sites.find((x) => x.key === siteKey);

    if (! site) {
      throw new Error(`Could not find siteconf with sitekey ${siteKey}`)
    }

    return site;
  }

  async checkDuplicateSiteConfAttrStringValue(attr, value){
    return new Promise((resolve, reject) => {

      configurationDataProvider.get(function(err, data){
        if(err){
          reject(err);
        }
        else {
          let duplicate;
          let response;

          duplicate = data.sites.find((x)=>x[attr].toLowerCase() === value.toLowerCase());
          if(duplicate){
            response = true;
          }
          else{
            response = false;
          }

          resolve(response);
        }
      }, {invalidateCache: false});
    });
  }

  async createNewHugoQuiqrSite(siteName, hugoVersion, configFormat){
    return new Promise(async (resolve, reject) => {

      try{
        const siteKey = await this.createSiteKeyFromName(siteName);

        const pathSite = pathHelper.getSiteRoot(siteKey);
        await fs.ensureDir(pathSite);

        const pathSource = path.join(pathHelper.getSiteRoot(siteKey), "main");
        await hugoUtils.createSiteDir(pathSource, siteName, configFormat);

        let configBuilder = new InitialWorkspaceConfigBuilder(pathSource);
        configBuilder.buildAll(hugoVersion);

        let newConf = this.createMountConfUnmanaged(siteKey, siteKey, pathSource);
        await fs.writeFileSync(pathHelper.getSiteMountConfigPath(siteKey), JSON.stringify(newConf), { encoding: "utf8"});
        resolve(siteKey);
      }
      catch(err){
        reject(err)
      }

    });
  }

  async createSiteKeyFromName(name){
    return new Promise((resolve, reject) => {

      let newKey = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();

      this.checkDuplicateSiteConfAttrStringValue('key', newKey)
        .then((duplicate)=>{
          if(duplicate){
            newKey = newKey + '-' + pathHelper.randomPathSafeString(4);
          }
          resolve(newKey);
        })
        .catch((err)=>{
          reject(err);
        })


    });
  }


  createMountConfUnmanaged(siteKey, siteName, pathSource){
    let newConf = {};
    newConf.key = siteKey;
    newConf.name = siteName;
    newConf.source = {};
    newConf.source.type = 'folder';
    newConf.source.path = path.basename(pathSource); // 30sep2024, always relative from now on
    newConf.publish = [];
    newConf.lastPublish = 0;
    return newConf;
  }

  async createNewSiteWithTempDirAndKey(siteKey, tempDir){

    const pathSite = pathHelper.getSiteRoot(siteKey);
    const pathSource = path.join(pathHelper.getSiteRoot(siteKey), "main");

    await fs.ensureDir(pathSite);
    await fs.moveSync(tempDir, pathSource);

    let newConf = this.createMountConfUnmanaged(siteKey, siteKey, pathSource);
    await fs.writeFileSync(pathHelper.getSiteMountConfigPath(siteKey), JSON.stringify(newConf), { encoding: "utf8"});
  }

  // REMOVE INVALID KEYS
  deleteInvalidConfKeys(newConf){
    delete newConf['configPath']
    delete newConf['owner']
    delete newConf['published']
    delete newConf['publishKey']
    delete newConf['etalage']

    return newConf;
  }

  async writeSiteConf(newConf, siteKey){
    newConf = this.deleteInvalidConfKeys(newConf);
    // Ensure name field always exists - use key as fallback
    if (!newConf.name) {
      newConf.name = newConf.key || siteKey;
    }
    await fs.writeFileSync(pathHelper.getSiteMountConfigPath(siteKey), JSON.stringify(newConf), { encoding: "utf8"});
    return true;
  }

  async deleteSite(siteKey){
    return new Promise(async (resolve, reject) => {
      try{
        fs.remove(pathHelper.getSiteMountConfigPath(siteKey));
        del.sync([pathHelper.getSiteRoot(siteKey)],{force:true});
        resolve();
      }
      catch(err){
        reject(err)
      }

    });
  }



}

module.exports = new LibraryService;
