//@flow

const fs = require('fs-extra');
const pathHelper = require('./../path-helper');

var JSFtp = require("jsftp");
var FtpDeploy = require("ftp-deploy");

class FtpPublisher/*:: implements IPublisher*/{
  constructor(config/*: FolderPublisherConfig */){
    this._config = config;
  }

  async publish(context/*: PublishContext*/)/*: Promise<void>*/{

    var ftpDeployConfig = {
      user: this._config.user,
      // Password optional, prompted if none given
      password: this._config.password,
      host: this._config.host,
      port: 21,
      localRoot: context.from,
      remoteRoot: this._config.path,
      //include: ["*.php", "dist/*", ".*"],
      include: ["*", "**/*"],      // this would upload everything except dot files
      exclude: [],
      // delete ALL existing files at destination before uploading, if true
      deleteRemote: false,
      // Passive mode is forced (EPSV command is not sent)
      forcePasv: true
    };

    var ftpDeploy = new FtpDeploy();

    ftpDeploy
      .deploy(ftpDeployConfig)
      .then(res => console.log("finished:", res))
      .catch(err => console.log(err));

    return true;
  }

}

module.exports = FtpPublisher;
