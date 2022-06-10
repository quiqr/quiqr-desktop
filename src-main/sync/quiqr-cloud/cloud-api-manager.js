const request                   = require('request');
const configurationDataProvider = require('../../app-prefs-state/configuration-data-provider')
const PogoPublisher             = require('../../publishers/pogo-publisher');
const cloudGitManager           = require('./cloud-git-manager');
const cloudCacheManager         = require('./cloud-cache-manager');
const { EnvironmentResolver }   = require('../../utils/environment-resolver');

class CloudApiManager{

  sendInvitationMail(email,siteKey){

    configurationDataProvider.get( async (err, configurations)=>{

      let siteData = configurations.sites.find((x)=>x.key===siteKey);
      if('publish' in siteData &&
        'config' in siteData.publish[0] &&
        'path' in siteData.publish[0].config){
        let sitePath = siteData.publish[0].config.path;

        const profileUserName = global.pogoconf.currentUsername;
        if(profileUserName){

          let fingerprint = await cloudGitManager.getKeyFingerprint();
          let userVars = {
            username: profileUserName,
            fingerprint: fingerprint,
          };

          let requestVars = Buffer.from(JSON.stringify(userVars)).toString('base64');
          let url = configurations.global.pogoboardConn.protocol+"//"+
            configurations.global.pogoboardConn.host+":"+
            configurations.global.pogoboardConn.port+"/site/invite-member/"+sitePath+"/"+email+"/"+requestVars;

          request({
            method: 'GET',
            url: url
          });
        }
      }

    });
  }

  requestConnectMail(email){

    configurationDataProvider.get( (err, configurations)=>{

      let url = configurations.global.pogoboardConn.protocol+"//"+
        configurations.global.pogoboardConn.host+":"+
        configurations.global.pogoboardConn.port+"/connect/"+email;

      request({
        method: 'GET',
        url: url
      });
    });
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
          pubkey_title: environmentResolver.getUQIS()
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

  async registerPogoUser(postData){

    return new Promise(resolve => {

      configurationDataProvider.get( async (err, configurations)=>{

        let data='';

        let url = configurations.global.pogoboardConn.protocol+"//"+
          configurations.global.pogoboardConn.host+":"+
          configurations.global.pogoboardConn.port+"/user/new";

        const req = request({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
          },
          url: url
        });
        req.on('error', () => {
          resolve(false);
        });

        req.on('response', (response) => {
          if(response.statusCode === 200){

            response.on('data',async (chunk) => {
              data += chunk;
            });

            response.on('end', () => {
              let obj = JSON.parse(data);
              if('username' in obj){
                resolve(obj);
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

  async deleteSiteFromCloud(postData){

    return new Promise(resolve => {

      configurationDataProvider.get( async (err, configurations)=>{

        let url = configurations.global.pogoboardConn.protocol+"//"+
          configurations.global.pogoboardConn.host+":"+
          configurations.global.pogoboardConn.port+'/site/delete';

        console.log(url);
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
          if(response.statusCode === 200){
            response.on('end', async () => {

              let pogopubl = new PogoPublisher({});
              await pogopubl.UnlinkCloudPath();

              //NOTE this is an example how to update cache in the background
              cloudCacheManager.updateUserRemoteCaches()

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

  async disconnectPogoDomain(postData){

    return new Promise(resolve => {

      configurationDataProvider.get( async (err, configurations)=>{

        let url = configurations.global.pogoboardConn.protocol+"//"+
          configurations.global.pogoboardConn.host+":"+
          configurations.global.pogoboardConn.port+'/site/disconnect-domain';

        console.log(url);
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
            response.on('end', () => {
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



  async resendConfirmationLinkPogoUser(postData){

    return new Promise(resolve => {

      configurationDataProvider.get( async (err, configurations)=>{

        let url = configurations.global.pogoboardConn.protocol+"//"+
          configurations.global.pogoboardConn.host+":"+
          configurations.global.pogoboardConn.port+'/resend-confirmation-link';

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
          if(response.statusCode === 200){
            response.on('end', () => {
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
          if(response.statusCode === 200){

            response.on('data',async (chunk) => {
              data += chunk;
            });

            response.on('end', async () => {
              let obj = JSON.parse(data);
              if('path' in obj){

                let pogopubl = new PogoPublisher({});
                await pogopubl.writeDomainInfo(obj.path, obj.path+".quiqr.cloud")

                cloudCacheManager.updateUserRemoteCaches();

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

  async connectPogoDomain(postData){

    return new Promise(resolve => {

      configurationDataProvider.get( async (err, configurations)=>{

        let data='';

        let url = configurations.global.pogoboardConn.protocol+"//"+
          configurations.global.pogoboardConn.host+":"+
          configurations.global.pogoboardConn.port+'/site/connect-domain';

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
          if(response.statusCode === 200){

            response.on('data',async (chunk) => {
              data += chunk;
            });

            response.on('end', () => {
              let obj = JSON.parse(data);
              if('domain' in obj){
                resolve(obj.domain);
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
