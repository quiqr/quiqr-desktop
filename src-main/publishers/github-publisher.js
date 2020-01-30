const fs = require('fs-extra');
const pathHelper = require('./../path-helper');
const outputConsole = require('./../output-console');


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
        //console.log(gitsshcommand);
        //console.log(resolvedDest);
        //console.log(full_gh_url);
        //console.log(full_gh_dest);


        await fs.ensureDir(resolvedDest);
        await fs.emptyDir(resolvedDest);

        await fs.ensureDir(resolvedDest);
        await fs.writeFileSync(tmpkeypath, this._config.privatekey, 'utf-8');
        await fs.chmodSync(tmpkeypath, '0600');

        outputConsole.appendLine('Cloning GitHub destination...');
        var spawn = require("child_process").spawn;
        let clonecmd = spawn( git_bin, [ "clone" , full_gh_url , full_gh_dest ], {env: { GIT_SSH_COMMAND: gitsshcommand }});
        clonecmd.stdout.on("data", (data) => {
        });
        clonecmd.stderr.on("data", (err) => {
        });

        clonecmd.on("exit", (code) => {
            if(code==0){
                outputConsole.appendLine('Clone succes ...');

                fs.copy(context.from, full_gh_dest,function(err){

                    outputConsole.appendLine('copy finished, going to git-add ...');

                    var spawn = require("child_process").spawn;
                    let clonecmd2 = spawn( git_bin, [ "add" , '.'],{cwd: full_gh_dest});

                    clonecmd2.stdout.on("data", (data) => {
                    });
                    clonecmd2.stderr.on("data", (err) => {
                    });
                    clonecmd2.on("exit", (code) => {
                        if(code==0){

                            outputConsole.appendLine('git-add finished, going to git-commit ...');

                            var spawn = require("child_process").spawn;
                            let clonecmd3 = spawn( git_bin, [ "commit" , '-a', '-m', 'publish from sukoh'],{cwd: full_gh_dest});
                            clonecmd3.stdout.on("data", (data) => {
                            });
                            clonecmd3.stderr.on("data", (err) => {
                            });
                            clonecmd3.on("exit", (code) => {

                                if(code==0){

                                    outputConsole.appendLine('git-commit finished, going to git-push ...');

                                    var spawn = require("child_process").spawn;
                                    let clonecmd4 = spawn( git_bin, [ "push" ], {cwd: full_gh_dest, env: { GIT_SSH_COMMAND: gitsshcommand }});
                                    clonecmd4.stdout.on("data", (data) => {
                                    });
                                    clonecmd4.stderr.on("data", (err) => {
                                    });
                                    clonecmd4.on("exit", (err) => {

                                        if(code==0){
                                            outputConsole.appendLine('git-push finished ... changes are published.');
                                        }
                                        else{
                                            outputConsole.appendLine('ERROR: Could not git-push ...');
                                        }
                                    });
                                }
                                else {
                                    outputConsole.appendLine('ERROR: Could not git-commit ...');
                                }

                            });
                        }
                        else {
                            outputConsole.appendLine('ERROR: Could not git-add ...');
                        }
                    });
                });
            }
            else {
                outputConsole.appendLine('Could not clone destination repository ...');
            }
        });

        return true;
    }

}

module.exports = GithubPublisher;
