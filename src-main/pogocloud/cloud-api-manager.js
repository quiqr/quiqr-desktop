/* Copyright PoppyGo 2021
 *
 * pim@poppygo.io
 *
 */

const { app, shell } = require('electron')
const request        = require('request');

const configurationDataProvider = require('../configuration-data-provider')
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
        console.log(`STATUS: ${response.statusCode}`);
        if(response.statusCode === 200){
          response.on('data',(chunk) => {

            console.log(`SUCCES:}`);
          });
        }
      });
    }.bind(this));
  }

  connectWithCodeSuccessFul(connect_code){

    configurationDataProvider.get( async function(err, configurations){

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
      req.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode}`);
        if(response.statusCode === 200){
          response.on('data',async (chunk) => {
            let obj = JSON.parse(chunk);
            await pogopubl.writeProfile(obj)
            console.log(obj);
            console.log(`SUCCES:}`);
          });
        }
      });
      req.write(postData)
      req.end()
    }.bind(this));

  }
}

module.exports = new CloudApiManager;
