//@flow

const fs = require('fs-extra');
const pathHelper = require('./../path-helper');


class GithubPublisher {
  constructor(config){
    this._config = config;
  }

  async publish(context){

      var tmpkeypath = pathHelper.getRoot()+'ghkey';
      var resolvedDest = pathHelper.getRoot()+'sites/' + context.siteKey + '/githubrepo/';
      var gitsshcommand = 'ssh -o IdentitiesOnly=yes -i ' + tmpkeypath;
      var full_gh_url = 'git@github.com:' + this._config.user + '/' + this._config.repo +'.git';
      var full_gh_dest = resolvedDest + '' + this._config.repo;
      var git_bin = "/usr/bin/git";

      //      let resolvedDest = path || pathHelper.getSiteDefaultPublishDir(context.siteKey, context.publishKey);
      //
      //      sites/amvega-online/build/source/default

      //console.log(this._config)
      //console.log(this._config.privatekey);
      console.log(gitsshcommand);
      console.log(resolvedDest);
      console.log(full_gh_url);
      console.log(full_gh_dest);

      await fs.ensureDir(resolvedDest);
      await fs.emptyDir(resolvedDest);

      await fs.ensureDir(resolvedDest);
      await fs.writeFileSync(tmpkeypath, this._config.privatekey, 'utf-8');
      await fs.chmodSync(tmpkeypath, '0600');

      var spawn = require("child_process").spawn;
      let clonecmd = spawn( git_bin, [ "clone" , full_gh_url , full_gh_dest ], {env: { GIT_SSH_COMMAND: gitsshcommand }});
      clonecmd.stdout.on("data", (data) => {
      });
      clonecmd.stderr.on("data", (err) => {
      });

      clonecmd.on("exit", (code) => {
          console.log('got exit code');
          console.log(code.toString());
          if(code==0){

              fs.copy(context.from, full_gh_dest,function(err){
                  console.log('copy finished, going to git-add')

                  var spawn = require("child_process").spawn;
                  let clonecmd2 = spawn( git_bin, [ "add" , '.'],{cwd: full_gh_dest});

                  clonecmd2.stdout.on("data", (data) => {
                  });
                  clonecmd2.stderr.on("data", (err) => {
                  });
                  clonecmd2.on("exit", (code) => {

                      console.log('git-add finished, going to git-commit')
                      if(code==0){

                          var spawn = require("child_process").spawn;
                          let clonecmd3 = spawn( git_bin, [ "commit" , '-a', '-m', 'publish from hokus'],{cwd: full_gh_dest});
                          clonecmd3.stdout.on("data", (data) => {
                          });
                          clonecmd3.stderr.on("data", (err) => {
                          });
                          clonecmd3.on("exit", (code) => {
                              console.log('git-commit finished, going to git-push')

                              if(code==0){
                                  var spawn = require("child_process").spawn;
                                  let clonecmd4 = spawn( git_bin, [ "push" ], {cwd: full_gh_dest, env: { GIT_SSH_COMMAND: gitsshcommand }});
                                  clonecmd4.stdout.on("data", (data) => {
                                  });
                                  clonecmd4.stderr.on("data", (err) => {
                                  });
                                  clonecmd4.on("exit", (err) => {

                                      if(code==0){
                                          console.log('git-push finished')
                                      }

                                  });
                              }

                          });
                      }
                  });

              });
          }
      });



      /*
    var ftpDeployConfig = {
      user: this._config.user,
      password: this._config.password,
      host: this._config.host,
      port: 21,
      localRoot: context.from,
      remoteRoot: this._config.path,
      exclude: [],
      deleteRemote: false,
      forcePasv: true
    };

    var ftpDeploy = new FtpDeploy();

    ftpDeploy
      .deploy(ftpDeployConfig)
      .then(res => console.log("finished:", res))
        .catch(err => console.log(err));
    */

    return true;
  }

}

module.exports = GithubPublisher;
