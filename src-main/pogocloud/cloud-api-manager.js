/* Copyright PoppyGo 2021
 *
 * pim@poppygo.io
 *
 */
const { app, shell }            = require('electron')
const request                   = require('request');
const configurationDataProvider = require('../app-prefs-state/configuration-data-provider')
const PogoPublisher             = require('../publishers/pogo-publisher');

class CloudApiManager{

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
        let pubkey = await pogopubl.keygen();

        var postData = JSON.stringify({
          connect_code : connect_code,
          pubkey: ""+pubkey
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
}

module.exports = new CloudApiManager;
