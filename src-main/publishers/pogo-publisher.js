const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./../environment-resolver');
const path = require('path');
const rootPath = require('electron-root-path').rootPath;
const electron = require('electron')

const fs = require('fs-extra');
const pathHelper = require('./../path-helper');
const outputConsole = require('./../output-console');

const ProgressBar = require('electron-progressbar');
const mainWindowManager = require('../main-window-manager');
const rimraf = require("rimraf");
const spawn = require("child_process").spawn;
//const spawnAw = require('await-spawn')

class PogoPublisher {
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

        if(process.env.NODE_ENV === 'production'){
            if(enviromnent.platform == PLATFORMS.macOS){
                cmd = path.join(rootPath, 'Contents','Resources','bin',executable);
            }
            else{
                cmd = path.join(rootPath, 'resources','bin',executable);
            }
        }
        else{
            cmd = path.join(rootPath, 'resources',platform,executable);
        }

        return cmd;
    }

    async publish(context){

        let mainWindow = mainWindowManager.getCurrentInstance();
        const dialog = electron.dialog;

        var progressBar = new ProgressBar({
            indeterminate: false,
            text: 'Publishing website..',
            abortOnError: true,
            detail: 'Preparing upload..'
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
        progressBar.detail = 'Preparing upload';


        var tmpkeypath = pathHelper.getRoot()+'ghkey';
        var resolvedDest = pathHelper.getRoot()+'sites/' + context.siteKey + '/gitlabrepo/';
        var full_gh_url = 'git@gitlab.brepi.eu:' + this._config.user + '/' + this._config.repo +'.git';
        var full_gh_dest = resolvedDest + '' + this._config.repo;
        var gitignore = "/public\n\
.sukoh\n";

        var gitlabCi = "image: registry.gitlab.com/pages/hugo:latest\n\
test:\n\
  script:\n\
  - hugo\n\
  except:\n\
  - master\n\
pages:\n\
  script:\n\
  - hugo\n\
  artifacts:\n\
    paths:\n\
    - public\n\
  only:\n\
  - master\n\
pogoform:\n\
  image: 'node:latest'\n\
  script:\n\
  - echo 'INSTALL SSH AUTH'\n\
  - mkdir /root/.ssh\n\
  - echo '$SSH_PRIVATE_KEY' > /root/.ssh/id_rsa\n\
  - chmod 700 /root/.ssh\n\
  - chmod 600 /root/.ssh/id_rsa\n\
  - echo 'POPULATE KNOWN HOSTS'\n\
  - ssh-keyscan -H gitlab.lingewoud.net > /root/.ssh/known_hosts\n\
  - ssh-keyscan -H droste.node.lingewoud.net > /root/.ssh/known_hosts\n\
  - scp -r poppygo/forms pim@droste.node.lingewoud.net:/home/pim/RnD/pogoform-handler/forms/$POGOFORM_GATEWAY\n\
  rules:\n\
    - if: '$POGOFORM_GATEWAY'\n\
      when: always\n\
    - when: never\n";

        var git_bin = this.getGitBin();

        outputConsole.appendLine('Creating empty directory at: ' + resolvedDest);

        await fs.ensureDir(resolvedDest);
        await fs.emptyDir(resolvedDest);

        await fs.ensureDir(resolvedDest);

        outputConsole.appendLine('Writing temporaty key ' + tmpkeypath);

        await fs.writeFileSync(tmpkeypath, this._config.privatekey, 'utf-8');
        await fs.chmodSync(tmpkeypath, '0600');

        //const sshkeyscan = await spawnAw("ssh-keyscan" , ["-H", "gitlab.brepi.eu");
        //console.log(sshkeyscan.toString());

        progressBar.value += 10;
        progressBar.detail = 'Get remote website for synchronizing (git-clone)';

        outputConsole.appendLine('Start cloning from: ' + full_gh_url);

        let clonecmd = spawn( git_bin, [ "clone", "-s" ,"-i", tmpkeypath, full_gh_url , full_gh_dest ]);

        clonecmd.stdout.on("data", (data) => {
        });
        clonecmd.stderr.on("data", (err) => {
            outputConsole.appendLine('Clone error ...:' + err);
        });
        clonecmd.on("exit", (code) => {
            if(code==0){
                outputConsole.appendLine('Clone succes ...');
                fs.writeFileSync(full_gh_dest + "/.gitlab-ci.yml" , gitlabCi , 'utf-8');
                fs.writeFileSync(full_gh_dest + "/.gitignore" , gitignore , 'utf-8');
                outputConsole.appendLine('copy gitlab ci to: ' + full_gh_dest);
                outputConsole.appendLine('gitlabCi is: ' + gitlabCi);
                outputConsole.appendLine('gitignore is: ' + gitignore);

                progressBar.value += 10;
                progressBar.detail = 'Synchronizing site with last changes (copy)';

                //fs.ensureDir(full_gh_dest);

                console.log(full_gh_dest + '/.git');
                console.log(full_gh_dest + '/.gitmove');
                fs.move(full_gh_dest + '/.git', full_gh_dest + '/.gitmove', err => {
                    if (err) return console.error(err)
                    else console.log('success!move .git')

                    fs.copy(context.from, full_gh_dest, function(err){

                        fs.ensureDir(full_gh_dest+'/.git');
                        rimraf(full_gh_dest+'/.git', function(){

                            fs.move(full_gh_dest + '/.gitmove', full_gh_dest + '/.git', err => {
                                if (err) return console.error(err);
                                else console.log('move success!');

                                rimraf(full_gh_dest+'/public', function(){
                                    outputConsole.appendLine('removing public');
                                    console.log("remove public done");
                                });

                                outputConsole.appendLine('context.from is: ' + context.from);

                                outputConsole.appendLine('copy finished, going to git-add ...');
                                progressBar.value += 10;
                                progressBar.detail = 'Registering changes with destination (git-add)';

                                var spawn = require("child_process").spawn;
                                let clonecmd2 = spawn( git_bin, [ "alladd" , full_gh_dest]);

                                clonecmd2.stdout.on("data", (data) => {
                                });
                                clonecmd2.stderr.on("data", (err) => {
                                });
                                clonecmd2.on("exit", (code) => {
                                    if(code==0){

                                        outputConsole.appendLine('git-add finished, going to git-commit ...');
                                        progressBar.value += 10;
                                        progressBar.detail = 'Commit changes (git-commit)';

                                        var spawn = require("child_process").spawn;
                                        let clonecmd3 = spawn( git_bin, [ "commit" , '-n','sukoh','-e','sukoh@brepi.eu', '-m', 'publish from sukoh',full_gh_dest]);
                                        clonecmd3.stdout.on("data", (data) => {
                                        });
                                        clonecmd3.stderr.on("data", (err) => {
                                        });
                                        clonecmd3.on("exit", (code) => {

                                            if(code==0){

                                                outputConsole.appendLine('git-commit finished, going to git-push ...');

                                                var spawn = require("child_process").spawn;
                                                let clonecmd4 = spawn( git_bin, [ "push","-s", "-i", tmpkeypath, full_gh_dest ]);
                                                //outputConsole.appendLine(git_bin+" push -i "+ tmpkeypath +" "+ full_gh_dest);

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
                                                        dialog.showMessageBox(mainWindow, {
                                                            type: 'info',
                                                            message: "Finished publishing. (git-push)",
                                                        });

                                                    }
                                                    else{
                                                        outputConsole.appendLine('ERROR: Could not git-push ...');

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
                                        progressBar.close();
                                        dialog.showMessageBox(mainWindow, {
                                            type: 'warning',
                                            message: "Publishing failed. (git-add)",
                                        });
                                    }
                                });
                            });
                        });
                    });
                });
            }
            else {
                outputConsole.appendLine('Could not clone destination repository');
                outputConsole.appendLine(`${git_bin} clone -i ${tmpkeypath} ${full_gh_url} ${full_gh_dest}`);
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

module.exports = PogoPublisher;
