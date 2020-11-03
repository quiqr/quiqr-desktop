const { EnvironmentResolver, ARCHS, PLATFORMS } = require('./../environment-resolver');
const path = require('path');
const rootPath = require('electron-root-path').rootPath;
const electron = require('electron')

const fileDirUtils = require('./../file-dir-utils');

const fs = require('fs-extra');
const pathHelper = require('./../path-helper');
const outputConsole = require('./../output-console');

const ProgressBar = require('electron-progressbar');
const rimraf = require("rimraf");
const spawn = require("child_process").spawn;
const spawnAw = require('await-spawn')

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

        cmd = path.join(pathHelper.getApplicationResourcesDir, "bin", executable);
        /*

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
        */

        return cmd;
    }

    async keygen(){

        let pubkey = '';
        var git_bin = this.getGitBin();
        var sukohdir = pathHelper.getRoot();
        //console.log(git_bin);

        try {
            let gencmd = await spawnAw( git_bin, [ "keygen" ], {cwd: sukohdir});
            outputConsole.appendLine('Keygen success ...');
            pubkey = await fs.readFileSync(sukohdir+"/id_rsa_pogo.pub");
        } catch (e) {
            outputConsole.appendLine('keygen error ...:' + e);
        }

        return pubkey;
    }

    async writeProfile(profile){
        var profilepath = pathHelper.getRoot()+"/poppygo-profile.json";

        let newProfile={
            "username":profile.username
        }

        await fs.writeFileSync(profilepath, JSON.stringify(newProfile), 'utf-8');
        await fs.chmodSync(profilepath, '0600');
        return true;
    }
    async readProfile(){
        var profilepath = pathHelper.getRoot()+"/poppygo-profile.json";
        var profile;
        try {
            const filecont = fs.readFileSync(profilepath, {encoding:'utf8', flag:'r'});
            profile = JSON.parse(filecont);
        } catch (e) {
            profile = false;
        }

        return profile;
    }

    async conf07pogoprofile(){
        let err=false;
        let configJsonPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        let privatekeyPath = pathHelper.getRoot() + 'id_rsa_pogo';
        let publickeyPath = pathHelper.getRoot() + 'id_rsa_pogo.pub';
        let profilepath = pathHelper.getRoot() + "/poppygo-profile.json";

        let conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
        let newConf = JSON.parse(conftxt);
        let path = newConf.publish[0].config.repo
        if(!path) return;
        let publickey = newConf.publish[0].config.publickey
        let privatekey = newConf.publish[0].config.privatekey

        let userTable = {
            "psycholoog-ijsselstein.nl": "jsmole",
            "rusland1.nl": "adekock",
            "hanskoning.com":"hanskoning",
            "stijlcoach.com":"naomi",
            "instappendichterbij.nl":"angie",
            "joliejola.nl": "jolandadekker",
            "pimsnel.com": "mipmip"
        }
        let domainTable = {
            "psycholoog-ijsselstein.nl": "www.psycholoog-ijsselstein.nl",
            "rusland1.nl": "rusland1.nl",
            "hanskoning.com":"hanskoning.com",
            "stijlcoach.com":"stijlcoach.com",
            "instappendichterbij.nl":"instappendichterbij.nl",
            "joliejola.nl": "joliejola.nl",
            "pimsnel.com": "pimsnel.com"
        }

        //----------
        if(userTable.hasOwnProperty(path)){
            let newProfile = {"username":userTable[path]}
            await fs.writeFileSync(profilepath, JSON.stringify(newProfile), 'utf-8');
            await fs.chmodSync(profilepath, '0600');
        }

        if(domainTable.hasOwnProperty(path)){
            newConf.publish[0].config.defaultDomain = domainTable[path];
        }
        else{
            newConf.publish[0].config.defaultDomain = path.replace(/\./g,"-")+".pogosite.com";
        }

        newConf.publish[0].config.path = path
        newConf.lastPublish = 1

        //----------
        if(err){
            console.log("somerror");
            return;
        }
        else{
            await fs.writeFileSync(publickeyPath, publickey, 'utf-8');
            await fs.writeFileSync(privatekeyPath, privatekey, 'utf-8');
            await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});
        }

        let mainWindow = global.mainWM.getCurrentInstance();
        mainWindow.webContents.send("lastPublishedChanged");


    }

    async writePublishStatus(){
        let configJsonPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
        var newConf = JSON.parse(conftxt);
        newConf.lastPublish = Date.now();
        await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});
        console.log(newConf);
        console.log(configJsonPath);
        let mainWindow = global.mainWM.getCurrentInstance();
        mainWindow.webContents.send("lastPublishedChanged");
    }


    async writeDomainInfo(pogoDomain, domain){
        let configJsonPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
        var newConf = JSON.parse(conftxt);
        //newConf.lastPublish = null,
        newConf.publish = [];
        newConf.publish.push({
            key: 'poppygo-cloud',
            config: {
                path: pogoDomain,
                type: 'poppygo',
                defaultDomain: domain
            }
        });
        //console.log(newConf);
        await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});
    }

    async UnlinkDomain(){
        let configJsonPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
        var newConf = JSON.parse(conftxt);
        newConf.lastPublish = 0,
        newConf.publish = [];
        newConf.publish.push({
            key: 'poppygo-nocloud',
            config: {
                type: 'poppygo',
            }
        });
        await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});
        let mainWindow = global.mainWM.getCurrentInstance();
        mainWindow.webContents.send("lastPublishedChanged");
    }

    async publish(context){

        let mainWindow = global.mainWM.getCurrentInstance();
        const dialog = electron.dialog;

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

        progressBar.value += 10;
        progressBar.detail = 'Preparing upload';

        var pogokeypath = pathHelper.getRoot()+'id_rsa_pogo';

        //var profile = await this.readProfile();
        var repository = this._config.path;
        var group = "sites";

        var resolvedDest = pathHelper.getRoot()+'sites/' + context.siteKey + '/gitlabrepo/';
        var full_gh_url = 'git@gitlab.brepi.eu:' + group + '/' + repository +'.git';
        var full_gh_dest = resolvedDest + '' + repository;
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
  - hugo --minify\n\
  - find public -type f -regex '.*\\.\\(htm\\|html\\|txt\\|text\\|js\\|css\\)$' -exec gzip -f -k {} \\;\n\
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
  - echo \"$SSH_PRIVATE_KEY\" > /root/.ssh/id_rsa\n\
  - chmod 700 /root/.ssh\n\
  - chmod 600 /root/.ssh/id_rsa\n\
  - echo 'POPULATE KNOWN HOSTS'\n\
  - ssh-keyscan -H gitlab.lingewoud.net > /root/.ssh/known_hosts\n\
  - ssh-keyscan -H droste.node.lingewoud.net > /root/.ssh/known_hosts\n\
  - scp -r poppygo/forms/* pim@droste.node.lingewoud.net:/home/pim/RnD/pogoform-handler/forms/$POGOFORM_GATEWAY/\n\
  rules:\n\
    - if: '$POGOFORM_GATEWAY'\n\
      when: always\n\
    - when: never\n";

        var git_bin = this.getGitBin();

        outputConsole.appendLine('Creating empty directory at: ' + resolvedDest);

        await fs.ensureDir(resolvedDest);
        await fs.emptyDir(resolvedDest);
        await fs.ensureDir(resolvedDest);

        //outputConsole.appendLine('Writing temporaty key ' + pogokeypath);

        //await fs.writefilesync(pogokeypath, this._config.privatekey, 'utf-8');
        //await fs.chmodsync(pogokeypath, '0600');

        //const sshkeyscan = await spawnAw("ssh-keyscan" , ["-H", "gitlab.brepi.eu");
        //console.log(sshkeyscan.toString());

        progressBar.value += 10;
        progressBar.detail = 'Get remote website files for synchronization';

        outputConsole.appendLine('Start cloning from: ' + full_gh_url);

        let clonecmd = spawn( git_bin, [ "clone", "-s" ,"-i", pogokeypath, full_gh_url , full_gh_dest ]);

        clonecmd.stdout.on("data", (data) => {
        });
        clonecmd.stderr.on("data", (err) => {
            outputConsole.appendLine('Clone error ...:' + err);
        });
        clonecmd.on("exit", async (code) => {
            if(code==0){
                outputConsole.appendLine('Clone succes ...');
                await fileDirUtils.fileRegexRemove(full_gh_dest, /.gitlab-ci.yml/);
                fs.writeFileSync(full_gh_dest + "/.gitlab-ci.yml" , gitlabCi , 'utf-8');
                fs.writeFileSync(full_gh_dest + "/.gitignore" , gitignore , 'utf-8');
                outputConsole.appendLine('copy gitlab ci to: ' + full_gh_dest);
                outputConsole.appendLine('gitlabCi is: ' + gitlabCi);
                outputConsole.appendLine('gitignore is: ' + gitignore);

                progressBar.value += 10;
                progressBar.detail = 'Synchronizing last changes';

                console.log(full_gh_dest + '/.git');
                console.log(full_gh_dest + '/.gitmove');
                await fs.moveSync(full_gh_dest + '/.git', full_gh_dest + '/.gitmove');
                await fileDirUtils.recurForceRemove(full_gh_dest+'/content');
                await fileDirUtils.recurForceRemove(full_gh_dest+'/themes');
                await fs.copySync(context.from, full_gh_dest);
                await fileDirUtils.recurForceRemove(full_gh_dest+'/.git');
                await fs.moveSync(full_gh_dest + '/.gitmove', full_gh_dest + '/.git');
                await fileDirUtils.recurForceRemove(full_gh_dest+'/public');

                outputConsole.appendLine('context.from is: ' + context.from);
                outputConsole.appendLine('copy finished, going to git-add ...');

                progressBar.value += 10;
                progressBar.detail = 'Registering changes with destination';

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
                        progressBar.detail = 'Apply changes';

                        var spawn = require("child_process").spawn;
                        let clonecmd3 = spawn( git_bin, [ "commit", '-a' , '-n','sukoh','-e','sukoh@brepi.eu', '-m', 'publish from sukoh',full_gh_dest]);
                        clonecmd3.stdout.on("data", (data) => {
                        });
                        clonecmd3.stderr.on("data", (err) => {
                        });
                        clonecmd3.on("exit", (code) => {

                            if(code==0){

                                outputConsole.appendLine('git-commit finished, going to git-push ...');

                                var spawn = require("child_process").spawn;
                                let clonecmd4 = spawn( git_bin, [ "push","-s", "-i", pogokeypath, full_gh_dest ]);
                                outputConsole.appendLine(git_bin+" push -i "+ pogokeypath +" "+ full_gh_dest);

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
                                        progressBar._window.hide();
                                        progressBar.close();

                                        this.writePublishStatus();

                                        dialog.showMessageBox(mainWindow, {
                                            type: 'info',
                                            message: "Your updates have been published. \n In a few minutes changes will be visible.",
                                        });

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
            }
            else {
                outputConsole.appendLine('Could not clone destination repository');
                outputConsole.appendLine(`${git_bin} clone -i ${pogokeypath} ${full_gh_url} ${full_gh_dest}`);
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

module.exports = PogoPublisher;
