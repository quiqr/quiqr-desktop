const electron                                  = require('electron')
const path                                      = require('path');
const fs                                        = require('fs-extra');
const fssimple                                  = require('fs');
const ProgressBar                               = require('electron-progressbar');
const rimraf                                    = require("rimraf");
const spawn                                     = require("child_process").spawn;
const spawnAw                                   = require('await-spawn')
const toml                                      = require('toml');
const fileDirUtils                              = require('../utils/file-dir-utils');
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('../utils/environment-resolver');
const formatProviderResolver                    = require('../utils/format-provider-resolver');
const pathHelper                                = require('../utils/path-helper');
const outputConsole                             = require('../logger/output-console');
const hugoDownloader                            = require('../hugo/hugo-downloader')
const HugoBuilder                               = require('../hugo/hugo-builder');
const Embgit                                    = require('../embgit/embgit');
const cloudSiteconfigManager                    = require('../pogocloud/cloud-siteconfig-manager');

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
    let configJsonPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
    const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
    var newConf = JSON.parse(conftxt);
    newConf.lastPublish = publDate;
    newConf.publishStatus = 2; // remote pending
    await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});

    global.mainWM.remountSite();
  }

  async writePublishStatus(status){
    let configJsonPath = pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json';
    const conftxt = await fs.readFileSync(configJsonPath, {encoding:'utf8', flag:'r'});
    var newConf = JSON.parse(conftxt);
    newConf.publishStatus = status;
    await fs.writeFileSync(configJsonPath, JSON.stringify(newConf), { encoding: "utf8"});
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

  isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

  async createSiteFromThemeGitUrl(){
    //check hugo
    //create new site with hugo
    //clone theme into new site
    //copy exampleSite
    //run brechts wunder script

    let mainWindow = global.mainWM.getCurrentInstance();
    let hugover = 'extended_0.77.0';
    const exec = pathHelper.getHugoBinForVer(hugover);

    if(!fs.existsSync(exec)){
      const dialog = electron.dialog;
      dialog.showMessageBox(mainWindow, {
        buttons: ["Close"],
        title: "PoppyGo will now download hugo " + hugover,
        message: "Try again when download has finished",
      });

      try{
        hugoDownloader.downloader.download(hugover);
        this.generateModel();
      }
      catch(e){
        // warn about HugoDownloader error?
      }
    }
    else{
      const prompt = require('electron-prompt');
      let full_gh_url = await prompt({
        title: 'Enter theme git url',
        label: 'url:',
        value: "",
        inputAttrs: {
          type: 'text',
          required: true
        },
        type: 'input'
      }, mainWindow);

      if(!full_gh_url || full_gh_url===""){
        return;
      }

      let siteKey = await prompt({
        title: 'Enter new site name',
        label: 'name:',
        value: "",
        inputAttrs: {
          type: 'text',
          required: true
        },
        type: 'input'
      }, mainWindow);

      if(!siteKey || siteKey===""){
        return;
      }

      const dialog = electron.dialog;

      var progressBar = new ProgressBar({
        indeterminate: false,
        text: 'Creating your site..',
        abortOnError: true,
        detail: 'Creating poppygo website',
        browserWindow: {
          frame: false,
          parent: mainWindow,
          webPreferences: {
            nodeIntegration: true
          }
        }
      });

      progressBar.on('completed', function() {
        progressBar.detail = 'Site has been created.';
      })
        .on('aborted', function(value) {
          console.info(`aborted... ${value}`);
        })
        .on('progress', function(value) {
        });

      progressBar.value += 10;
      progressBar.detail = 'Preparing download';

      var pogokeypath = pathHelper.getRoot()+'id_rsa_pogo';

      let themeName = full_gh_url.substring(full_gh_url.lastIndexOf('/') + 1).split('.').slice(0, -1).join('.');
      console.log("guesedKey:"+themeName);

      var temp_gh_dest = pathHelper.getRoot()+'temp/';
      var full_gh_dest = pathHelper.getRoot()+'temp/siteFromTheme/';
      var full_gh_themes_dest = pathHelper.getRoot()+'temp/siteFromTheme/themes/'+themeName;

      await fs.ensureDir(full_gh_dest);
      await fs.emptyDir(full_gh_dest);
      await fs.ensureDir(full_gh_dest);
      await fs.ensureDir(full_gh_dest + '/themes');

      let hugoBuilderConfig = {
        hugover: hugover
      }

      var git_bin = Embgit.getGitBin();

      outputConsole.appendLine('Creating empty directory at: ' + full_gh_dest);

      progressBar.value += 10;
      progressBar.detail = 'Getting live site files for synchronization';

      await outputConsole.appendLine('Cloning from: ' + full_gh_url);

      try {
        let clonecmd = await spawnAw( git_bin, [ "clone", full_gh_url , full_gh_themes_dest ]);
        outputConsole.appendLine('Clone success ...');
      } catch (e) {
        await outputConsole.appendLine(git_bin+ " clone " + full_gh_url + " " + full_gh_themes_dest );
        await outputConsole.appendLine('Clone error ...:' + e);
        return;
      }

      await fs.copySync(full_gh_themes_dest+"/exampleSite", full_gh_dest);

      try{
        let strData = fs.readFileSync(full_gh_dest+"/config.toml", {encoding: 'utf-8'});
        let formatProvider = formatProviderResolver.resolveForFilePath(full_gh_dest+"/config.toml");
        let hconfig = formatProvider.parse(strData);
        hconfig.theme = themeName;
        hconfig.baseURL = "/"
        fs.writeFileSync(
          full_gh_dest+"/config.toml",
          formatProvider.dump(hconfig)
        );
      }
      catch(e){
        console.log("no config.toml in exampleSite");
      }

      progressBar.value = 100;
      progressBar.setCompleted();
      progressBar._window.hide();
      progressBar.close();

      if(fs.existsSync(pathHelper.getKeyPath(siteKey))){
        const options = {
          type: 'question',
          buttons: ['Cancel', 'Overwrite', 'Keep both'],
          defaultId: 2,
          title: 'Site key exist',
          message: 'A site with this key exists.',
          detail: 'Do you want to overwrite this site or keep both?',
        };

        dialog.showMessageBox(null, options, async (response) => {
          if(response === 1){

          }
          else if(response ===2){

            let extraPlus = 0
            while(fs.existsSync(pathHelper.getKeyPath(siteKey))){
              extraPlus = extraPlus++;

              let numLength = 0;
              while(this.isNumber(siteKey.slice(-numLength+1))){
                numLength = numLength++;
              }

              if(numLength>0){
                keyNumpart = Number(siteKey.slice(-numLength));
                keyNumpart = keyNumpart+extraPlus;
                siteKey = siteKey.substring(0, siteKey.length - numLength)+keyNumpart.toString();
              }
              else{
                siteKey = siteKey+".1"
              }
            }

            await this.createNewWithTempDirAndKey(siteKey, full_gh_dest);
          }
          else{
            return;
          }
        });
      }
      else{
        await this.createNewWithTempDirAndKey(siteKey, full_gh_dest);
      }
    }
    return;
  }

  async siteFromPogoUrl(){
    let mainWindow = global.mainWM.getCurrentInstance();

    const prompt = require('electron-prompt');
    let full_gh_url = await prompt({
      title: 'Enter git url',
      label: 'url:',
      value: "",
      inputAttrs: {
        type: 'text',
        required: true
      },
      type: 'input'
    }, mainWindow);

    if(!full_gh_url || full_gh_url===""){
      return;
    }

    const dialog = electron.dialog;

    var progressBar = new ProgressBar({
      indeterminate: false,
      text: 'Importing your site..',
      abortOnError: true,
      detail: 'importing from PoppyGo servers',
      browserWindow: {
        frame: false,
        parent: mainWindow,
        webPreferences: {
          nodeIntegration: true
        }
      }
    });

    progressBar.on('completed', function() {
      progressBar.detail = 'Site has been imported.';
    })
      .on('aborted', function(value) {
        console.info(`aborted... ${value}`);
      })
      .on('progress', function(value) {
      });

    progressBar.value += 10;
    progressBar.detail = 'Preparing download';

    var pogokeypath = pathHelper.getRoot()+'id_rsa_pogo';

    var full_gh_dest = pathHelper.getRoot()+'temp/siteFromUrl/';
    var full_gh_dest = full_gh_dest;

    var git_bin = Embgit.getGitBin();

    outputConsole.appendLine('Creating empty directory at: ' + full_gh_dest);

    await fs.ensureDir(full_gh_dest);
    await fs.emptyDir(full_gh_dest);
    await fs.ensureDir(full_gh_dest);

    progressBar.value += 10;
    progressBar.detail = 'Getting live site files for synchronization';

    await outputConsole.appendLine('Cloning from: ' + full_gh_url);

    try {
      let clonecmd = await spawnAw( git_bin, [ "clone", "-s" ,"-i", pogokeypath, full_gh_url , full_gh_dest ]);
      outputConsole.appendLine('Clone success ...');
    } catch (e) {
      await outputConsole.appendLine(git_bin+ " clone -s -i " + pogokeypath + " " + full_gh_url + " " + full_gh_dest );
      await outputConsole.appendLine('Clone error ...:' + e);
    }

    progressBar.value = 100;
    progressBar.setCompleted();
    progressBar._window.hide();
    progressBar.close();

    let siteKey = full_gh_url.substring(full_gh_url.lastIndexOf('/') + 1).split('.').slice(0, -1).join('.');
    console.log("guesedKey:"+siteKey);

    if(fs.existsSync(pathHelper.getKeyPath(siteKey))){
      const options = {
        type: 'question',
        buttons: ['Cancel', 'Overwrite', 'Keep both'],
        defaultId: 2,
        title: 'Site key exist',
        message: 'A site with this key exists.',
        detail: 'Do you want to overwrite this site or keep both?',
      };

      dialog.showMessageBox(null, options, async (response) => {
        if(response === 1){

        }
        else if(response ===2){

          let extraPlus = 0
          while(fs.existsSync(pathHelper.getKeyPath(siteKey))){
            extraPlus = extraPlus++;

            let numLength = 0;
            while(this.isNumber(siteKey.slice(-numLength+1))){
              numLength = numLength++;
            }

            if(numLength>0){
              keyNumpart = Number(siteKey.slice(-numLength));
              keyNumpart = keyNumpart+extraPlus;
              siteKey = siteKey.substring(0, siteKey.length - numLength)+keyNumpart.toString();
            }
            else{
              siteKey = siteKey+".1"
            }
          }

          await this.createNewWithTempDirAndKey(siteKey, full_gh_dest);
        }
        else{
          return;
        }
      });
    }
    else{
      await this.createNewWithTempDirAndKey(siteKey, full_gh_dest);
    }
  }

  //TODO MOVE TO OTHER FILE
  async createNewWithTempDirAndKey(siteKey, full_gh_dest){
    let newPath = '';
    var todayDate = new Date().toISOString().replace(':','-').replace(':','-').slice(0,-5);
    var pathSite = (pathHelper.getRoot()+"sites/"+siteKey);
    var pathSiteSources = (pathHelper.getRoot()+"sites/"+siteKey+"/sources");
    var pathSource = (pathSiteSources+"/"+siteKey+"-"+todayDate);
    await fs.ensureDir(pathSite);
    await fs.ensureDir(pathSiteSources);
    await fs.moveSync(full_gh_dest, pathSource);
    let newConf = cloudSiteconfigManager.createConfUnmanaged(siteKey,siteKey, pathSource);
    await fssimple.writeFileSync(pathHelper.getKeyPath(siteKey), JSON.stringify(newConf), { encoding: "utf8"});
  }

  async publish(context){

    let mainWindow = global.mainWM.getCurrentInstance();
    const dialog = electron.dialog;

    this.writePublishStatus(2); // publication Pending

    let progressDialogConfObj = {
      title:"Publishing your site...",
      message: 'Uploading to PoppyGo servers',
      visible: true,
      percent: 5,
    };
    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

    //mainWindow.webContents.send("progressBar");

    /*
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
    */

    /*progressBar.on('completed', function() {
      progressBar.detail = 'Your site has been uploaded.';
    })
      .on('aborted', function(value) {
        console.info(`aborted... ${value}`);
      })
      .on('progress', function(value) {
      });
      */

    /*
    progressBar.value += 10;
    progressBar.detail = 'Preparing upload';
    */

    progressDialogConfObj.message = 'Preparing upload';
    progressDialogConfObj.percent = 15;
    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

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

    /*
    progressBar.value += 10;
    progressBar.detail = 'Getting live site files for synchronization';
    */
    progressDialogConfObj.message =  'Getting live site files for synchronization';
    progressDialogConfObj.percent =  25;
    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

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

        //progressBar.value += 10;
        //progressBar.detail = 'Synchronizing your last changes';
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


        //progressBar.value += 10;
        //progressBar.detail = 'Copying your changes to PoppyGo servers';
        progressDialogConfObj.message =  'Copying your changes to PoppyGo servers';
        progressDialogConfObj.percent =  55;
        mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

        var spawn = require("child_process").spawn;
        let clonecmd2 = spawn( git_bin, [ "alladd" , full_gh_dest]);

        clonecmd2.stdout.on("data", (data) => {
        });
        clonecmd2.stderr.on("data", (err) => {
        });
        clonecmd2.on("exit", (code) => {
          if(code==0){

            outputConsole.appendLine('git-add finished, going to git-commit ...');
            //progressBar.value += 10;
            //progressBar.detail = 'Apply changes';
            progressDialogConfObj.message =  'Apply changes';
            progressDialogConfObj.percent =  65;
            mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

            var spawn = require("child_process").spawn;

            const environmentResolver = new EnvironmentResolver();
            const UPIS = environmentResolver.getUPIS();
            let clonecmd3 = spawn( git_bin, [ "commit", '-a' , '-n', global.pogoconf.currentUsername, '-e','sukoh@brepi.eu', '-m', "publication from " + UPIS, full_gh_dest]);

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
                    //progressBar.value = 100;
                    //progressBar.detail = 'Successfully copied your changes';
                    //progressBar.setCompleted();
                    //progressBar._window.hide();
                    //progressBar.close();

                    progressDialogConfObj.message =  'Successfully copied your changes';
                    progressDialogConfObj.percent =  90;
                    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

                    this.writePublishDate(publDate);

                    progressDialogConfObj.message =  'Succesfully published your changes. <br/> They will be visible in a minute or two.';
                    progressDialogConfObj.percent =  100;
                    progressDialogConfObj.visible = false;
                    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

                    //mainWindow.webContents.send("closeProgressDialog");
                    /*
                    dialog.showMessageBox(mainWindow, {
                      title: 'PoppyGo',
                      type: 'info',
                      message: "Succesfully published your changes. \n They will be visible in a minute or two.",
                    });
                    */

                  }
                  else{
                    this.writePublishStatus(7);
                    outputConsole.appendLine('ERROR: Could not git-push ...');

                    //progressBar._window.hide();
                    //progressBar.close();
                    progressDialogConfObj.visible = false;
                    mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);

                    dialog.showMessageBox(mainWindow, {
                      title: 'PoppyGo',
                      type: 'warning',
                      message: "Publishing failed. (git-push)",
                    });
                  }
                });
              }
              else {
                this.writePublishStatus(8);
                outputConsole.appendLine('ERROR: Could not git-commit ...');
                //progressBar._window.hide();
                //progressBar.close();
                progressDialogConfObj.visible = false;
                mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);
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
            //progressBar._window.hide();
            //progressBar.close();
            progressDialogConfObj.visible = false;
            mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);
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
        //progressBar._window.hide();
        //progressBar.close();
        progressDialogConfObj.visible = false;
        mainWindow.webContents.send("setProgressDialogConfHome", progressDialogConfObj);
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
