/* Copyright PoppyGo 2021
 *
 * pim@poppygo.io
 *
 */

const { app, shell }                   = require('electron')
const fs       = require('fs-extra');
const fssimple = require('fs');
const request = require('request');
const glob = require('glob');
const path = require('path');

const configurationDataProvider = require('../configuration-data-provider')
const pathHelper                = require('../path-helper');
const fileDirUtils              = require('../file-dir-utils');
const PogoPublisher             = require('../publishers/pogo-publisher');

class CloudCacheManager{

  async updateUserRemoteCaches(){


    return new Promise(resolve => {
      let sites = [];
      let profileUserName;

      configurationDataProvider.get(async (err, configurations)=>{

        if(profileUserName = global.pogoconf.currentUsername){

          let pogopubl = new PogoPublisher({});
          let fingerprint = await pogopubl.getKeyFingerprint();

          let userVars = {
            username: profileUserName,
            fingerprint: fingerprint,
          };

          let requestVars = Buffer.from(JSON.stringify(userVars)).toString('base64');
          let url = configurations.global.pogoboardConn.protocol+"//"+
            configurations.global.pogoboardConn.host+":"+
            configurations.global.pogoboardConn.port+"/profile/sites/"+requestVars;

          const req = request({
            method: 'GET',
            url: url
          });
          req.on('response', (response) => {
            if(response.statusCode === 200){
              response.on('data',async (chunk) => {
                await fs.writeFileSync( pathHelper.userCacheFilePath(profileUserName), chunk.toString(), 'utf-8');
                await this.updateOwnersLookupCache();
                resolve(true);
              });
            }
          });

          /*
          req.on('finish', async () => {
          });
          */
          req.end();

        }
        //let //profileUserName = "";
        //let pogopubl = new PogoPublisher({});
        //let readProfileAction = pogopubl.readProfile();
        //readProfileAction.then( async (profile)=>{
        //if(profile){
        //}
        //});

      });


    });

  }

  getUserRemoteSites(username){
    let sites = {sites:[], sites_with_member_access:[]};
    let file = pathHelper.userCacheFilePath(username);
    if(file!==''){
      try{
        let strData = fs.readFileSync(file, {encoding: 'utf-8'});
        sites = JSON.parse(strData);
      }
      catch(e){
        console.log(e);
      }
    }
    return sites;
  }

  async updateOwnersLookupCache(){
    const namespacedPathSearchPattern = (pathHelper.getTempDir() + 'cache-user.*.json').replace(/\\/gi,'/');

    let ownerslookupdata = {
      usersToPaths: {},
      usersToSites: {},
      sitesToPaths: {},
      sitesToUsers: {},
      sitesUnpublished: [],
      pathsToSites: {},
      pathsToUsers: {},
    }

    configurationDataProvider.get( async (err, configurations)=>{
      if(configurations.empty===true || configurations.sites.length ===0){
        console.log("No sites to get remote info for ");
      }
      else{
        configurations.sites.forEach(function(site){
          try{
            if(site.publish[0].key=="poppygo-cloud"){
              let path = site.publish[0].config.path;
              ownerslookupdata.sitesToPaths[site.key] = "sites/"+path;
              ownerslookupdata.pathsToSites["sites/"+path] = site.key;
            }
            else{
              ownerslookupdata.sitesUnpublished.push(site.key);
            }
          }
          catch{
            console.log("no path");
          }
        });
      }

      let files = glob.sync(namespacedPathSearchPattern).map(x=>path.normalize(x));
      for(let i = 0; i < files.length; i++){
        let file = files[i];
        if(fs.existsSync(file)){
          try{
            let strData = fs.readFileSync(file, {encoding: 'utf-8'});
            let usercache = JSON.parse(strData);

            let username = file.split('.')[1];
            ownerslookupdata.usersToPaths[username] = usercache.sites;
            usercache.sites.forEach(function(sitePaths){
              ownerslookupdata.pathsToUsers[sitePaths] = username;
            });
          }
          catch(e){
            outputConsole.appendLine(`Cache file is invalid '${file}': ${e.toString()}`);
          }
        }
      }

      for (let path in ownerslookupdata.pathsToSites) {
        let username = ownerslookupdata.pathsToUsers[path];
        if (typeof(username) != "undefined"){
          ownerslookupdata.sitesToUsers[ownerslookupdata.pathsToSites[path]] = username;
        }
      }

      for (let username in ownerslookupdata.usersToPaths) {
        try{
          ownerslookupdata.usersToSites[username] = [];

          ownerslookupdata.usersToPaths[username].forEach(function(path){
            if(path in ownerslookupdata.pathsToSites){
              ownerslookupdata.usersToSites[username].push(ownerslookupdata.pathsToSites[path]);
            }
          });
        }
        catch(err){
          console.log(err);
        }
      }

      await fs.writeFileSync( pathHelper.ownersLookupCacheFilePath(), JSON.stringify(ownerslookupdata), 'utf-8');
    });
    console.log("fin");
    return true;
  }

  async updateAllRemoteCaches() {

    let cache = {};
    let sites = {};

    configurationDataProvider.get( function(err, configurations){
      if(configurations.empty===true || configurations.sites.length ===0){
        console.log("No sites to get remote info for ");
      }
      else{
        configurations.sites.forEach(function(site){
          sites[site.key] = {}
          sites[site.key].name = site.name
        });
      }
      cache["sites"] = sites;

      fs.writeFileSync( pathHelper.sitesCacheFilePath(), JSON.stringify(cache), 'utf-8');
    });
  }
}
module.exports = new CloudCacheManager;
