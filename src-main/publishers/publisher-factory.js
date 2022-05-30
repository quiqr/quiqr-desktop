const outputConsole = require('./../logger/output-console');
const path = require('path')

//Not a real factory, yet!
class PublisherFactory{
  getPublisher(publisherConfig) {
    let type = publisherConfig.type;
    let genericPublisherConfig = (publisherConfig);

    outputConsole.appendLine(' about to start publisher with type: ' + type )

    if(type==='folder'){
      let FolderPublisher = require('./folder-publisher');
      return new FolderPublisher(genericPublisherConfig);
    }
    if(type==='ftp'){
      let FtpPublisher = require('./ftp-publisher');
      return new FtpPublisher(genericPublisherConfig);
    }

    const typePath = path.join('..', 'sync', type, type+'-sync')
    try{
      //let SyncService = require('../sync/'+type+'/'+type+'-sync');
      let SyncService = require(typePath);
      return new SyncService(genericPublisherConfig);
    }
    catch(e){
      console.log("ERR could not instanciate SyncService:"+ type);
      console.log(typePath)
      console.log(e);
      return;
    }

    if(type==='github'){
      let GithubPublisher = require('./github-publisher');
      console.log(genericPublisherConfig);
      return new GithubPublisher(genericPublisherConfig);
    }

    if(type==='quiqr'){
      let PogoPublisher = require('./pogo-publisher');
      return new PogoPublisher(genericPublisherConfig);
    }

    if(type==='s3'){
      let S3Publisher = require('./s3-publisher');
      return new S3Publisher(genericPublisherConfig);
    }
    if(type==='void'){
      let VoidPublisher = require('./void-publisher');
      return new VoidPublisher();
    }
    throw new Error(`Publisher of type "${type}" not implemented.`);
  }
}

module.exports = new PublisherFactory();
