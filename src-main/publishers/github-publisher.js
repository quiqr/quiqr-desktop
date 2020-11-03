
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./../environment-resolver');
const path = require('path');
const rootPath = require('electron-root-path').rootPath;
const electron = require('electron')

const fs = require('fs-extra');
const pathHelper = require('./../path-helper');
const outputConsole = require('./../output-console');

const ProgressBar = require('electron-progressbar');

class GithubPublisher {
    constructor(config){
        this._config = config;
    }

    getGitBin(){
        let enviromnent = new EnvironmentResolver().resolve();
        let platform;
        let executable;
        let cmd;

        switch(enviromnent.platform){
            case PLATFORMS.linux: {
                platform = 'linux';
                executable = 'embgit';
                break;
            }
            case PLATFORMS.windows: {
                platform = 'windows';
                executable = 'embgit.exe';
                break;
            }
            case PLATFORMS.macOS: {
                platform = 'mac';
                executable = 'embgit';
                break;
            }
            default:{ throw new Error('Not implemented.') }
        }

        cmd = path.join(pathHelper.getApplicationResourcesDir(), "bin", executable);

        return cmd;
    }

    async publish(context){

        const dialog = electron.dialog;
        let mainWindow = global.mainWM.getCurrentInstance();

        var tmpkeypath = pathHelper.getRoot()+'ghkey';
        var resolvedDest = pathHelper.getRoot()+'sites/' + context.siteKey + '/githubrepo/';
        var full_gh_url = 'git@github.com:' + this._config.user + '/' + this._config.repo +'.git';
        var full_gh_dest = resolvedDest + '' + this._config.repo;

        var git_bin = this.getGitBin();

        outputConsole.appendLine('Git Bin' + git_bin);

        var progressBar = new ProgressBar({
            indeterminate: false,
            text: 'Publishing website..',
            abortOnError: true,
            detail: 'Preparing upload..',
            browserWindow: {
                frame: false,
                parent: mainWindow,
                webPreferences: {
                    nodeIntegration: true
                }
            }
        });

        progressBar.on('completed', function() {
            progressBar.detail = 'The website has been uploaded.';
        })
            .on('aborted', function(value) {
                console.info(`aborted... ${value}`);
            })
            .on('progress', function(value) {
            });

        progressBar.value += 1;

        await fs.ensureDir(resolvedDest);
        await fs.emptyDir(resolvedDest);

        await fs.ensureDir(resolvedDest);
        await fs.writeFileSync(tmpkeypath, this._config.privatekey, 'utf-8');
        await fs.chmodSync(tmpkeypath, '0600');

        outputConsole.appendLine('Cloning GitHub destination on ' + full_gh_url);
        var spawn = require("child_process").spawn;
        //let clonecmd = spawn( git_bin, [ "clone" , full_gh_url , full_gh_dest ], {env: { GIT_SSH_COMMAND: gitsshcommand }});
        let clonecmd = spawn( git_bin, [ "clone", "-i", tmpkeypath, full_gh_url , full_gh_dest ]);

        outputConsole.appendLine('Using the following tmpkeypath: ' + tmpkeypath + " and full_gh_dest: " + full_gh_dest );


        clonecmd.stdout.on("data", (data) => {
            outputConsole.appendLine('Start cloning with:' + git_bin);
            progressBar.value += 1;
            progressBar.detail = 'Get remote website for synchronizing (git-clone)';
        });

        clonecmd.stderr.on("data", (err) => {
            outputConsole.appendLine('Clone error ...:' + err);
        });
        clonecmd.on("exit", (code) => {
            if(code==0){
                outputConsole.appendLine('Clone succes ...');

                fs.copy(context.from, full_gh_dest,function(err){

                    progressBar.value += 1;
                    progressBar.detail = 'Sync changes with destination (git-add)';
                    outputConsole.appendLine('copy finished, going to git-add ...');

                    var spawn = require("child_process").spawn;
                    let clonecmd2 = spawn( git_bin, [ "alladd" , full_gh_dest]);

                    clonecmd2.stdout.on("data", (data) => {
                    });
                    clonecmd2.stderr.on("data", (err) => {
                    });
                    clonecmd2.on("exit", (code) => {
                        if(code==0){

                            progressBar.value += 1;
                            progressBar.detail = 'Commit changes (git-commit)';
                            outputConsole.appendLine('git-add finished, going to git-commit ...');

                            var spawn = require("child_process").spawn;
                            //let clonecmd3 = spawn( git_bin, [ "commit" , '-a', '-m', 'publish from sukoh'],{cwd: full_gh_dest});
                            let clonecmd3 = spawn( git_bin, [ "commit" , '-n','sukoh','-e','sukoh@brepi.eu', '-m', 'publish from sukoh',full_gh_dest]);
                            clonecmd3.stdout.on("data", (data) => {
                            });
                            clonecmd3.stderr.on("data", (err) => {
                            });
                            clonecmd3.on("exit", (code) => {

                                if(code==0){

                                    progressBar.value += 1;
                                    progressBar.detail = 'Uploading changes (git-push)';
                                    outputConsole.appendLine('git-commit finished, going to git-push ...');

                                    var spawn = require("child_process").spawn;
                                    let clonecmd4 = spawn( git_bin, [ "push", "-i", tmpkeypath, full_gh_dest ]);
                                    outputConsole.appendLine(git_bin+ 'push -i'+ tmpkeypath+ ' '+ full_gh_dest);
                                    clonecmd4.stdout.on("data", (data) => {
                                    });
                                    clonecmd4.stderr.on("data", (err) => {
                                    });
                                    clonecmd4.on("exit", (err) => {
                                        if(code==0){
                                            outputConsole.appendLine('git-push finished ... changes are published.');
                                            progressBar.value = 100;
                                            progressBar.detail = 'Uploading finished';
                                            progressBar.setCompleted();
                                            progressBar.close();
                                        }
                                        else{
                                            outputConsole.appendLine('ERROR: Could not git-push ...');
                                            progressBar._window.hide();
                                            progressBar.close();
                                            dialog.showMessageBox(mainWindow, {
                                                type: 'warning',
                                                message: "Publishing failed. (git-push)",
                                            });
                                        }
                                    });
                                }
                                else {
                                    outputConsole.appendLine('ERROR: Could not git-commit ...');
                                    progressBar._window.hide();
                                    progressBar.close();
                                    dialog.showMessageBox(mainWindow, {
                                        type: 'warning',
                                        message: "Publishing failed. (git-commit)",
                                    });
                                }

                            });
                        }
                        else {
                            outputConsole.appendLine('ERROR: Could not git-add ...');
                            progressBar._window.hide();
                            progressBar.close();
                            dialog.showMessageBox(mainWindow, {
                                type: 'warning',
                                message: "Publishing failed. (git-add)",
                            });

                        }
                    });
                });
            }
            else {
                outputConsole.appendLine('Could not clone destination repository with code: ' + code);
                progressBar._window.hide();
                progressBar.close();
                dialog.showMessageBox(mainWindow, {
                    type: 'warning',
                    message: "Publishing failed. (git-clone)",
                });
            }
        });

        return true;
    }
}

module.exports = GithubPublisher;
