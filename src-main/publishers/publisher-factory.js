const outputConsole = require('./../logger/output-console');
const path = require('path')

//Not a real factory, yet!
class PublisherFactory{
  getPublisher(publisherConfig) {
    let type = publisherConfig.type;
    let genericPublisherConfig = (publisherConfig);

    outputConsole.appendLine(' about to start publisher with type: ' + type )

    const typePath = path.join('..', 'sync', type, type+'-sync')
    try{
      let SyncService = require(typePath);
      return new SyncService(genericPublisherConfig);
    }
    catch(e){
      console.log("ERR could not instanciate SyncService:"+ type);
      console.log(typePath)
      console.log(e);
      return;
    }
  }
}

module.exports = new PublisherFactory();
