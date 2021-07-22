const outputConsole = require('./../output-console');

//Not a real factory, yet!
class PublisherFactory{
    getPublisher(publisherConfig) {
        let type = publisherConfig.type;
        console.log(publisherConfig);
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
        if(type==='github'){
            let GithubPublisher = require('./github-publisher');
            return new GithubPublisher(genericPublisherConfig);
        }
        if(type==='poppygo'){
            let PogoPublisher = require('./pogo-publisher');
            //console.log(genericPublisherConfig);
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
