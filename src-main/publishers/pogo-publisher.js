const electron                                  = require('electron')
const path                                      = require('path');
const fs                                        = require('fs-extra');
const spawn                                     = require("child_process").spawn;
const fileDirUtils                              = require('../utils/file-dir-utils');
const { EnvironmentResolver }                   = require('../utils/environment-resolver');
const pathHelper                                = require('../utils/path-helper');
const outputConsole                             = require('../logger/output-console');
const Embgit                                    = require('../embgit/embgit');

class PogoPublisher {

  constructor(config){
    this._config = config;
  }

  async writeProfile(profile){

    global.pogoconf.setCurrectUsername(profile.username)
    global.pogoconf.saveState().then( async ()=>{
      var sukohdir = pathHelper.getRoot();
      var profilepathDir = path.join(pathHelper.getRoot(),"profiles", profile.username);
      await fs.ensureDir(path.join(pathHelper.getRoot(),"profiles"))
      await fs.ensureDir(profilepathDir)
      await fs.copySync(path.join(sukohdir,"/id_rsa_pogo"), path.join(profilepathDir,"/id_rsa_pogo"));
      await fs.chmodSync(path.join(profilepathDir,"/id_rsa_pogo"), '0600');

      return true;
    });
  }

  async readProfile(){

    let profile = {}
    profile.username = global.pogoconf.currentUsername;
    if(!profile.username){
      profile = false;
    }
    return profile;
  }

  async writePublishDate(publDate){
    let configJsonPath = pathHelper.getSiteMountConfigPath(global.currentSiteKey);
    const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
    var newConf = JSON.parse(conftxt);
    newConf.lastPublish = publDate;
    newConf.publishStatus = 2; // remote pending
    await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});

    global.mainWM.remountSite();
  }

  async writePublishStatus(status){
    let configJsonPath = pathHelper.getSiteMountConfigPath(global.currentSiteKey);
    const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
    var newConf = JSON.parse(conftxt);
    newConf.publishStatus = status;
    await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});
  }


  async writeDomainInfo(pogoDomain, domain){
    let configJsonPath = pathHelper.getSiteMountConfigPath(global.currentSiteKey);
    const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
    var newConf = JSON.parse(conftxt);
    newConf.publish = [];
    newConf.publish.push({
      key: 'quiqr-cloud',
      config: {
        path: pogoDomain,
        type: 'quiqr',
        defaultDomain: domain
      }
    });
    await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});
  }

  async UnlinkCloudPath(){
    let configJsonPath = pathHelper.getSiteMountConfigPath(global.currentSiteKey);
    const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
    var newConf = JSON.parse(conftxt);
    newConf.lastPublish = 0,
      newConf.publish = [];
    newConf.publish.push({
      key: 'quiqr-nocloud',
      config: {
        type: 'quiqr',
      }
    });
    await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});
    global.mainWM.remountSite();
  }

  isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

  async publish(context){

    let mainWindow = global.mainWM.getCurrentInstance();
    const dialog = electron.dialog;

    this.writePublishStatus(2); // publication Pending

    let progressDialogConfObj = {
      title:"Publishing your site...",
      message: 'Uploading to Quiqr servers',
      visible: true,
      percent: 5,
    };
    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

    progressDialogConfObj.message = 'Preparing upload';
    progressDialogConfObj.percent = 15;
    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

    var pogokeypath = path.join(pathHelper.getRoot(),'id_rsa_pogo');

    var repository = this._config.path;
    var group = (this._config.group?this._config.group:"sites");

    var resolvedDest = path.join(pathHelper.getRoot(), 'sites', context.siteKey, 'gitlabrepo');
    var full_gh_url = 'git@gl.quiqr.org:' + group + '/' + repository +'.git';
    var full_gh_dest = resolvedDest + '' + repository;

    var gitignore = "/public\n\
.quiqr-cache\n";

    var gitlabCi = "include:\n\
  - project: 'system/quiqr-build-include'\n\
    ref: main\n\
    file: '/main.yml'\n";

    var git_bin = Embgit.getGitBin();

    let publDate = Date.now();

    let pogoWithMe = {
      lastPublish: publDate,
      path: repository
    }

    outputConsole.appendLine('Creating empty directory at: ' + resolvedDest);

    await fs.ensureDir(resolvedDest);
    await fs.emptyDir(resolvedDest);
    await fs.ensureDir(resolvedDest);

    progressDialogConfObj.message =  'Getting live site files for synchronization';
    progressDialogConfObj.percent =  25;
    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

    outputConsole.appendLine('Cloning from: ' + full_gh_url);

    let clonecmd = spawn( git_bin, [ "clone", "-s" ,"-i", pogokeypath, full_gh_url , full_gh_dest ]);

    clonecmd.stderr.on("data", (err) => {
      outputConsole.appendLine('Clone error ...:' + err);
    });
    clonecmd.on("exit", async (code) => {
      if(code==0){
        outputConsole.appendLine('Clone succes ...');

        progressDialogConfObj.message =  'Synchronizing your last changes';
        progressDialogConfObj.percent =  35;
        mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

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

        await fs.ensureDir(path.join(full_gh_dest,"static"))
        fs.writeFileSync(path.join(full_gh_dest, "static", ".pogo_with_me"), JSON.stringify(pogoWithMe) ,'utf-8');

        outputConsole.appendLine('context.from is: ' + context.from);
        outputConsole.appendLine('copy finished, going to git-add ...');

        progressDialogConfObj.message =  'Copying your changes to Quiqr servers';
        progressDialogConfObj.percent =  55;
        mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

        var spawn = require("child_process").spawn;
        let clonecmd2 = spawn( git_bin, [ "add_all" , full_gh_dest]);

        clonecmd2.on("exit", (code) => {
          if(code==0){

            outputConsole.appendLine('git-add finished, going to git-commit ...');
            progressDialogConfObj.message =  'Apply changes';
            progressDialogConfObj.percent =  65;
            mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

            var spawn = require("child_process").spawn;

            const environmentResolver = new EnvironmentResolver();
            const UQIS = environmentResolver.getUQIS();
            let clonecmd3 = spawn( git_bin, [ "commit", '-a' , '-n', global.pogoconf.currentUsername, '-e',global.pogoconf.currentUsername+'@quiqr.cloud', '-m', "publication from " + UQIS, full_gh_dest]);

            clonecmd3.on("exit", (code) => {

              if(code==0){

                outputConsole.appendLine('git-commit finished, going to git-push ...');

                var spawn = require("child_process").spawn;
                let clonecmd4 = spawn( git_bin, [ "push","-s", "-i", pogokeypath, full_gh_dest ]);
                outputConsole.appendLine(git_bin+" push -i "+ pogokeypath +" "+ full_gh_dest);

                clonecmd4.on("exit", () => {

                  if(code==0){
                    outputConsole.appendLine('git-push finished ... changes are published.');

                    progressDialogConfObj.message =  'Successfully copied your changes';
                    progressDialogConfObj.percent =  90;
                    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

                    this.writePublishDate(publDate);

                    progressDialogConfObj.message =  'Succesfully published your changes. <br/> They will be visible in a minute or two.';
                    progressDialogConfObj.percent =  100;
                    progressDialogConfObj.visible = false;
                    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

                  }
                  else{
                    this.writePublishStatus(7);
                    outputConsole.appendLine('ERROR: Could not git-push ...');

                    progressDialogConfObj.visible = false;
                    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

                    dialog.showMessageBox(mainWindow, {
                      title: 'Quiqr',
                      type: 'warning',
                      message: "Publishing failed. (git-push)",
                    });
                  }
                });
              }
              else {
                this.writePublishStatus(8);
                outputConsole.appendLine('ERROR: Could not git-commit ...');
                progressDialogConfObj.visible = false;
                mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);
                dialog.showMessageBox(mainWindow, {
                  title: 'Quiqr',
                  type: 'warning',
                  message: "Publishing failed. (git-commit)",
                });
              }

            });
          }
          else {
            outputConsole.appendLine('ERROR: Could not git-add ...');
            progressDialogConfObj.visible = false;
            mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);
            dialog.showMessageBox(mainWindow, {
              title: 'Quiqr',
              type: 'warning',
              message: "Publishing failed. (git-add)",
            });
          }
        });
      }
      else {
        outputConsole.appendLine('Could not clone destination repository');
        outputConsole.appendLine(`${git_bin} clone -i ${pogokeypath} ${full_gh_url} ${full_gh_dest}`);
        progressDialogConfObj.visible = false;
        mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);
        dialog.showMessageBox(mainWindow, {
          title: 'Quiqr',
          type: 'warning',
          message: "Publishing failed. (git-clone)",
        });
      }
    });

    return true;
  }
}

module.exports = PogoPublisher;
