/* Copyright Quiqr 2021
 *
 * pim@quiqr.org
 *
 */
const { app, shell }            = require('electron')
const request                   = require('request');
const configurationDataProvider = require('../app-prefs-state/configuration-data-provider')
const PogoPublisher             = require('../publishers/pogo-publisher');
const cloudGitManager           = require('./cloud-git-manager');
const { EnvironmentResolver }   = require('../utils/environment-resolver');

class CloudApiManager{

  sendInvitationMail(email,siteKey){

    let profileUserName;
    configurationDataProvider.get( async (err, configurations)=>{

      let siteData = configurations.sites.find((x)=>x.key===siteKey);
      if(siteData.hasOwnProperty("publish") &&
        siteData.publish[0].hasOwnProperty("config") &&
        siteData.publish[0].config.hasOwnProperty("path")){
        let sitePath = siteData.publish[0].config.path;

        if(profileUserName = global.pogoconf.currentUsername){

          let fingerprint = await cloudGitManager.getKeyFingerprint();
          let userVars = {
            username: profileUserName,
            fingerprint: fingerprint,
          };

          let requestVars = Buffer.from(JSON.stringify(userVars)).toString('base64');
          let url = configurations.global.pogoboardConn.protocol+"//"+
            configurations.global.pogoboardConn.host+":"+
            configurations.global.pogoboardConn.port+"/site/invite-member/"+sitePath+"/"+email+"/"+requestVars;

          console.log(url);
          const req = request({
            method: 'GET',
            url: url
          });
          req.on('response', (response) => {
            if(response.statusCode === 200){
              response.on('data',(chunk) => {

              });
            }
          });

        }
      }

    });
  }

  requestConnectMail(email){

    configurationDataProvider.get( function(err, configurations){

      let url = configurations.global.pogoboardConn.protocol+"//"+
        configurations.global.pogoboardConn.host+":"+
        configurations.global.pogoboardConn.port+"/connect/"+email;

      const req = request({
        method: 'GET',
        url: url
      });
      req.on('response', (response) => {
        if(response.statusCode === 200){
          response.on('data',(chunk) => {

          });
        }
      });
    }.bind(this));
  }

  async connectWithCodeSuccessFul(connect_code){

    return new Promise(resolve => {

      configurationDataProvider.get( async (err, configurations)=>{

        let pogopubl = new PogoPublisher({});
        let pubkey = await cloudGitManager.keygen();

        let environmentResolver = new EnvironmentResolver();
        var postData = JSON.stringify({
          connect_code : connect_code,
          pubkey: ""+pubkey,
          pubkey_title: environmentResolver.getUPIS()
        });

        let url = configurations.global.pogoboardConn.protocol+"//"+
          configurations.global.pogoboardConn.host+":"+
          configurations.global.pogoboardConn.port+"/connect";

        const req = request({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
          },
          url: url
        });
        req.on('error', (e) => {
          console.log(e);
          resolve(false);
        });
        req.on('response', (response) => {
          console.log(response.statusCode);
          if(response.statusCode === 200){
            response.on('data',async (chunk) => {
              let obj = JSON.parse(chunk);
              await pogopubl.writeProfile(obj)
              resolve(true);
            });
          }
          else{
            resolve(false);
          }
        });
        req.write(postData)
        req.end()

      });

    });
  }

  async registerPogoDomain(postData){

    return new Promise(resolve => {

      configurationDataProvider.get( async (err, configurations)=>{

        /*
        let environmentResolver = new EnvironmentResolver();
        var postData = JSON.stringify({
          connect_code : connect_code,
          pubkey: ""+pubkey,
          pubkey_title: environmentResolver.getUPIS()
        });
        */
          console.log(postData);
        let data='';

        let url = configurations.global.pogoboardConn.protocol+"//"+
          configurations.global.pogoboardConn.host+":"+
          configurations.global.pogoboardConn.port+"/site/new";

        const req = request({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
          },
          url: url
        });
        req.on('error', (e) => {
          console.log(e);
          resolve(false);
        });

        req.on('response', (response) => {
          console.log(response.statusCode);
          if(response.statusCode === 200){

            response.on('data',async (chunk) => {
              data += chunk;
            });

            response.on('end', () => {
              let obj = JSON.parse(data);
              if(obj.hasOwnProperty('path')){
                resolve(obj.path);
              }
              else{
                resolve(false);
              }
            });

          }
          else{
            resolve(false);
          }
        });
        req.write(postData)
        req.end()

      });

    });
  }
}

module.exports = new CloudApiManager;
