const fs         = require('fs-extra');
const FtpDeploy  = require("ftp-deploy");
const pathHelper = require('./../utils/path-helper');

class FtpPublisher{
  constructor(config){
    this._config = config;
  }

  async publish(context){

    var ftpDeployConfig = {
      user: this._config.user,
      // Password optional, prompted if none given
      password: this._config.password,
      host: this._config.host,
      port: 21,
      localRoot: context.from,
      remoteRoot: this._config.path,
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
