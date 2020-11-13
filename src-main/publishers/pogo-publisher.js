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

        if(process.env.NODE_ENV === 'production'){
            cmd = path.join(pathHelper.getApplicationResourcesDir(), "bin", executable);
        }
        else{
            cmd = path.join(rootPath, 'resources', platform, executable);
        }

        return cmd;
    }

    async keygen(){

        let pubkey = '';
        var git_bin = this.getGitBin();
        var sukohdir = pathHelper.getRoot();

        try {
            let gencmd = await spawnAw( git_bin, [ "keygen" ], {cwd: sukohdir});
            outputConsole.appendLine('Keygen success ...');
            pubkey = await fs.readFileSync(path.join(sukohdir,"/id_rsa_pogo.pub"));


        } catch (e) {
            outputConsole.appendLine('keygen error ...:' + e);
        }

        return pubkey;
    }

    async writeProfile(profile){
        var sukohdir = pathHelper.getRoot();
        var profilepath = path.join(pathHelper.getRoot(), "poppygo-profile.json");
        var profilepathDir = path.join(pathHelper.getRoot(),"profiles", profile.username);
        var profilepath2 = path.join(profilepathDir, "poppygo-profile.json");

        await fs.ensureDir(path.join(pathHelper.getRoot(),"profiles"))
        await fs.ensureDir(profilepathDir)

        let newProfile={
            "username":profile.username
        }

        await fs.writeFileSync(profilepath, JSON.stringify(newProfile), 'utf-8');
        await fs.chmodSync(profilepath, '0600');
        await fs.writeFileSync(profilepath2, JSON.stringify(newProfile), 'utf-8');
        await fs.chmodSync(profilepath2, '0600');

        await fs.copySync(path.join(sukohdir,"/id_rsa_pogo"), path.join(profilepathDir,"/id_rsa_pogo"));
        await fs.copySync(path.join(sukohdir,"/id_rsa_pogo.pub"), path.join(profilepathDir,"/id_rsa_pogo.pub"));
        await fs.chmodSync(path.join(profilepathDir,"/id_rsa_pogo"), '0600');

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

     readProfile2(){
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

        global.mainWM.remountSite();
    }

    async writePublishStatus(){
        let configJsonPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
        var newConf = JSON.parse(conftxt);
        newConf.lastPublish = Date.now();
        await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});

        global.mainWM.remountSite();
    }


    async writeDomainInfo(pogoDomain, domain){
        let configJsonPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
        const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
        var newConf = JSON.parse(conftxt);
        newConf.publish = [];
        newConf.publish.push({
            key: 'poppygo-cloud',
            config: {
                path: pogoDomain,
                type: 'poppygo',
                defaultDomain: domain
            }
        });
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
        global.mainWM.remountSite();
    }

    async publish(context){

        let mainWindow = global.mainWM.getCurrentInstance();
        const dialog = electron.dialog;

        var progressBar = new ProgressBar({
            indeterminate: false,
            text: 'Publishing your site..',
            abortOnError: true,
            detail: 'Uploading to PoppyGo servers',
            browserWindow: {
                frame: false,
                parent: mainWindow,
                webPreferences: {
                    nodeIntegration: true
                }
            }
        });

        progressBar.on('completed', function() {
            progressBar.detail = 'Your site has been uploaded.';
        })
            .on('aborted', function(value) {
                console.info(`aborted... ${value}`);
            })
            .on('progress', function(value) {
            });

        progressBar.value += 10;
        progressBar.detail = 'Preparing upload';

        var pogokeypath = pathHelper.getRoot()+'id_rsa_pogo';

        var repository = this._config.path;
        var group = (this._config.group?this._config.group:"sites");

        var resolvedDest = pathHelper.getRoot()+'sites/' + context.siteKey + '/gitlabrepo/';
        var full_gh_url = 'git@gitlab.brepi.eu:' + group + '/' + repository +'.git';
        var full_gh_dest = resolvedDest + '' + repository;
        var gitignore = "/public\n\
.sukoh\n";

        var gitlabCi = "include:\n\
  - project: 'platform/pogo-include'\n\
    ref: master\n\
    file: '/main.yml'\n";

        var git_bin = this.getGitBin();

        outputConsole.appendLine('Creating empty directory at: ' + resolvedDest);

        await fs.ensureDir(resolvedDest);
        await fs.emptyDir(resolvedDest);
        await fs.ensureDir(resolvedDest);

        progressBar.value += 10;
        progressBar.detail = 'Getting live site files for synchronization';

        outputConsole.appendLine('Cloning from: ' + full_gh_url);

        let clonecmd = spawn( git_bin, [ "clone", "-s" ,"-i", pogokeypath, full_gh_url , full_gh_dest ]);

        clonecmd.stdout.on("data", (data) => {
        });
        clonecmd.stderr.on("data", (err) => {
            outputConsole.appendLine('Clone error ...:' + err);
        });
        clonecmd.on("exit", async (code) => {
            if(code==0){
                outputConsole.appendLine('Clone succes ...');

                progressBar.value += 10;
                progressBar.detail = 'Synchronizing your last changes';

                //console.log(full_gh_dest + '/.git');
                //console.log(full_gh_dest + '/.gitmove');
                await fs.moveSync(full_gh_dest + '/.git', full_gh_dest + '/.gitmove');
                await fileDirUtils.recurForceRemove(full_gh_dest+'/content');
                await fileDirUtils.recurForceRemove(full_gh_dest+'/themes');
                await fs.copySync(context.from, full_gh_dest);

                await fileDirUtils.recurForceRemove(full_gh_dest+'/.git');
                await fs.moveSync(full_gh_dest + '/.gitmove', full_gh_dest + '/.git');
                await fileDirUtils.recurForceRemove(full_gh_dest+'/public');

                await fileDirUtils.fileRegexRemove(full_gh_dest, /.gitlab-ci.yml/);
                fs.writeFileSync(full_gh_dest + "/.gitlab-ci.yml" , gitlabCi , 'utf-8');
                fs.writeFileSync(full_gh_dest + "/.gitignore" , gitignore , 'utf-8');
                outputConsole.appendLine('copy gitlab ci to: ' + full_gh_dest);
                outputConsole.appendLine('gitlabCi is: ' + gitlabCi);
                outputConsole.appendLine('gitignore is: ' + gitignore);

                outputConsole.appendLine('context.from is: ' + context.from);
                outputConsole.appendLine('copy finished, going to git-add ...');

                progressBar.value += 10;
                progressBar.detail = 'Copying your changes to PoppyGo servers';

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
                                        progressBar.detail = 'Successfully copied your changes';
                                        progressBar.setCompleted();
                                        progressBar._window.hide();
                                        progressBar.close();

                                        this.writePublishStatus();

                                        dialog.showMessageBox(mainWindow, {
											title: 'PoppyGo',
                                            type: 'info',
                                            message: "Succesfully published your changes. \n They will be visible in a minute or two.",
                                        });

                                    }
                                    else{
                                        outputConsole.appendLine('ERROR: Could not git-push ...');

                                        progressBar._window.hide();
                                        progressBar.close();
                                        dialog.showMessageBox(mainWindow, {
											title: 'PoppyGo',
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
									title: 'PoppyGo',
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
							title: 'PoppyGo',
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
					title: 'PoppyGo',
                    type: 'warning',
                    message: "Publishing failed. (git-clone)",
                });
            }
        });

        return true;
    }

}

module.exports = PogoPublisher;
