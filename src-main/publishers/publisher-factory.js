//@flow

/*::

    import type { IPublisher } from './types';
    import type { PublisherConfig } from './../types';

    interface IPublisherConfig {
        +provider: string;
    };
*/

const outputConsole = require('./../output-console');

//Not a real factory, yet!
class PublisherFactory{
    getPublisher(publisherConfig/*: PublisherConfig<*>*/) /*: IPublisher*/{
        let type = publisherConfig.type;
        let genericPublisherConfig = (publisherConfig/*: any*/);

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
        if(type==='gitlab'){
            let GitlabPublisher = require('./gitlab-publisher');
            return new GitlabPublisher(genericPublisherConfig);
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
