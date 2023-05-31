const outputConsole = require('../logger/output-console');
const path = require('path')

class SyncFactory{
  getPublisher(publisherConfig, siteKey) {
    let type = publisherConfig.type;
    let genericPublisherConfig = (publisherConfig);

    //outputConsole.appendLine(' about to start publisher with type: ' + type )

    const typePath = path.join('../sync', type, type+'-sync')
    try{
      let SyncService = require(typePath);
      return new SyncService(genericPublisherConfig, siteKey);
    }
    catch(e){
      console.log("ERR could not instanciate SyncService:"+ type);
      console.log(typePath)
      console.log(e);
      return;
    }
  }
}

module.exports = new SyncFactory();
