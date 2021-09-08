
const electron                    = require('electron')
const Menu                        = electron.Menu
const path                        = require("path");
const { lstatSync, readdirSync }  = require('fs')
const rimraf                      = require("rimraf");
const fssimple                    = require('fs');
const fs                          = require('fs-extra');
const { shell }                   = require('electron')

const prefsWindowManager          = require('./prefs-window-manager');
const logWindowManager            = require('./log-window-manager');
const pogozipper                  = require('./import-export/pogozipper');
const cloudCacheManager           = require('./pogocloud/cloud-cache-manager');
const cloudApiManager             = require('./pogocloud/cloud-api-manager');
const pogoversions                = require('./pogo-site-version-helper');
const SiteService                 = require('./services/site/site-service')
const pathHelper                  = require('./path-helper');
const hugoDownloader              = require('./hugo/hugo-downloader')
const HugoBuilder                 = require('./hugo/hugo-builder');
const { WorkspaceConfigProvider } = require('./services/workspace/workspace-config-provider');
const PogoPublisher               = require('./publishers/pogo-publisher');

const app = electron.app
let menu = null;

const workspaceConfigProvider = new WorkspaceConfigProvider();

class MenuManager {

  openCookbooks() {
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("disableMobilePreview");
    mainWindow.webContents.send("redirectCookbook")
  }
  stopServer() {
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();

    if(global.hugoServer){
      global.hugoServer.stopIfRunning((err, stdout, stderr) => {
        if(err){
          console.log(err)
        }

        else{ resolve(); }
      });

      global.mainWM.reloadMobilePreview();
    }

  }
  startServer() {
    console.log(global.hugoServer);
    if(global.hugoServer){
      global.hugoServer.serve((err, stdout, stderr) => {
        if(err){
          console.log(err)
        }
      });
    }
  }

  async importSiteFromUrl(){
    let pogopubl = new PogoPublisher({});
    await pogopubl.siteFromPogoUrl();
  }

  async requestUserConnectCode(){

    let mainWindow = global.mainWM.getCurrentInstance();

    const prompt = require('electron-prompt');
    let email = await prompt({
      title: 'Enter email address of the user you want to connect',
      label: 'email:',
      value: "",
      inputAttrs: {
        type: 'text',
        required: true
      },
      type: 'input'
    }, mainWindow);

    if(!email || email===""){
      return;
    }
    else{
      const dialog = electron.dialog;

      const options = {
        type: 'info',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        title: 'Email has been sent',
        message: 'Email has been sent',
        detail: 'If the email address exist a mail with a connect link will be sent. Check the instructions in the mail before continuing.',
      };

      dialog.showMessageBox(null, options, async (response) => {
        if(response === 1){
          await cloudApiManager.requestConnectMail(email)
          console.log("mailsent")
        }
        else{
          console.log(response)
          return;
        }
      });
    }
  }

  async enterUserConnectCode(){
    let mainWindow = global.mainWM.getCurrentInstance();

    const prompt = require('electron-prompt');
    let connect_code = await prompt({
      title: 'Enter user connect code',
      label: 'connect code:',
      value: "",
      inputAttrs: {
        type: 'text',
        required: true
      },
      type: 'input'
    }, mainWindow);

    if(!connect_code || connect_code===""){
      //TODO MESSAGE nocode
    }
    else{

      if(await cloudApiManager.connectWithCodeSuccessFul(connect_code)){
        const dialog = electron.dialog;

        const options = {
          type: 'info',
          buttons: [ 'OK'],
          defaultId: 1,
          title: 'Connection was successful',
          message: 'Connection was successful',
          detail: 'Connection was successful',
        };

        dialog.showMessageBox(null, options, async (response) => {
          //select user
          this.setSitesListingView('myremote');
        });

      }
      else{
        const dialog = electron.dialog;

        const options = {
          type: 'info',
          buttons: [ 'OK'],
          defaultId: 1,
          title: 'Connect code was invalid',
          message: 'Connect code was invalid',
          detail: 'Connect code was invalid',
        };

        dialog.showMessageBox(null, options, async (response) => {
          //select user
        });
      }

      this.createMainMenu();
      global.mainWM.closeSiteAndShowSelectSites();

    }
  }



  async createSiteFromThemeGitUrl(){
    let pogopubl = new PogoPublisher({});
    await pogopubl.createSiteFromThemeGitUrl();
  }

  async generateModel() {

    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    const dialog = electron.dialog;
    let config = await workspaceConfigProvider.getConfig(global.currentSitePath, global.currentWorkspaceKey);
    let hugover = 'extended_0.80.0';
    let modelPath = path.join(pathHelper.getTempDir(),"model");
    let modelFile = path.join(modelPath, "sukoh.json");
    let menuFile = path.join(modelPath, "zpogomenu.json");
    let hugoBuilderConfig = {
      config: config.build[0]['config'],
      workspacePath: global.currentSitePath,
      destination: modelPath,
      hugover: hugover
    }

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
      // write .images.md for managing images in static folder
      const staticDir = path.join(global.currentSitePath, "static");
      const imageDir =  path.join(global.currentSitePath, "static", "images");
      const imgDir =  path.join(global.currentSitePath, "static", "img");
      const imageFile = path.join(global.currentSitePath, "static", "images", ".pogo-images.md");
      const imgFile = path.join(global.currentSitePath, "static", "img", ".pogo-images.md");
      const imageFile2 = path.join(global.currentSitePath, "static", ".pogo-images.md");
      const imageFileContent = "---\n\
description: this file is a helper file for the PoppyGo asset manager\n\
resources: []\n\
---\n\
\n";
      if (fs.existsSync (imageDir)){
        fs.writeFileSync(imageFile , imageFileContent , 'utf-8');
      }
      if (fs.existsSync (imgDir)){
        fs.writeFileSync(imgFile , imageFileContent , 'utf-8');
      }
      if (fs.existsSync(staticDir)){
        fs.writeFileSync(imageFile2 , imageFileContent , 'utf-8');
      };

      let hugoBuilder = new HugoBuilder(hugoBuilderConfig);
      await hugoBuilder.buildModel();

      if(!fs.existsSync(modelFile)){
        dialog.showMessageBox(mainWindow, {
          type: 'error',
          buttons: ["Close"],
          title: "Warning",
          message: "Failed to generate sukoh.json.",
        });
      }
      else {
        let options  = {
          title: "Please confirm",
          buttons: ["Yes","Cancel"],
          message: "Copy sukoh.json to "+global.currentSitePath+"? (Previous json will be overwritten)"
        }
        let response = dialog.showMessageBox(options)
        if(response === 1) return;

        fs.copySync(modelFile, path.join(global.currentSitePath, "sukoh.json"));
        if (fs.existsSync(menuFile)){
          fs.copySync(menuFile, path.join(global.currentSitePath, "zpogomenu.json"));
        }
      }
    }
  }

  showVersion(){
    const idPath = path.join(pathHelper.getApplicationResourcesDir(),"all","build-git-id.txt");
    const datePath = path.join(pathHelper.getApplicationResourcesDir(),"all", "build-date.txt");
    let buildGitId = "";
    let buildDate = "";
    console.log(app.getAppPath());
    console.log(datePath);

    if(fs.existsSync(idPath)){
      buildGitId = "\nBuild ID " + fssimple.readFileSync(idPath, {encoding:'utf8', flag:'r'})
    }
    if(fs.existsSync(datePath)){
      buildDate = "\nBuild Date " + fssimple.readFileSync(datePath, {encoding:'utf8', flag:'r'}).replace("\n",'');
    }

    const dialog = electron.dialog;

    let options  = {
      buttons: ["Close"],
      title: "About",
      message: "PoppyGo Desktop\n\nVersion: " + app.getVersion() + buildGitId + buildDate
    }
    dialog.showMessageBox(options)
  }

  async renameSite(){
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();

    if(global.currentSiteKey && global.currentWorkspaceKey){
      let siteKey = global.currentSiteKey;
      let siteService = null;
      let configurationDataProvider = require('./configuration-data-provider')
      configurationDataProvider.get(async (err, configurations)=>{
        if(configurations.empty===true) throw new Error('Configurations is empty.');
        if(err) { reject(err); return; }
        let siteData = configurations.sites.find((x)=>x.key===global.currentSiteKey);

        if(siteData=siteService = new SiteService(siteData)){
          let newConf = siteService._config;
          let currentName = siteService._config.name;

          // REMOVE INVALID KEYS
          this.deleteInvalidConfKeys(newConf);

          const prompt = require('electron-prompt');
          var newName = await prompt({
            title: 'New site name',
            label: 'key:',
            value: currentName,
            inputAttrs: {
              type: 'text',
              required: true
            },
            type: 'input'
          }, mainWindow);

          console.log(newName);
          if(!newName || newName===""){
            return;
          }


          let configFilePath = path.join(pathHelper.getRoot(),'config.'+siteKey+'.json');
          newConf.name = newName;
          await fssimple.writeFileSync(configFilePath, JSON.stringify(newConf), { encoding: "utf8"});

          outputConsole.appendLine('rename site to: '+newName);

          let newScreenURL = `/sites/${decodeURIComponent(global.currentSiteKey)}/workspaces/${decodeURIComponent(global.currentWorkspaceKey)}`;
          mainWindow.webContents.send("redirectToGivenLocation","/");
          mainWindow.webContents.send("redirectToGivenLocation",newScreenURL);
          mainWindow.webContents.send("redirectMountSite",newScreenURL);
        }
      });

    }
  }

  async unlinkSiteDomain(){
    let pogopubl = new PogoPublisher({});
    await pogopubl.UnlinkDomain();
  }

  deleteSukohFolder() {
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("disableMobilePreview");
    let dir;

    const dialog = electron.dialog;

    let options  = {
      title: "Please confirm",
      buttons: ["Yes","Cancel"],
      message: "Do you really want to purge all data?"
    }
    let response = dialog.showMessageBox(options)
    if(response === 1) return;

    var todayDate = new Date().toISOString().replace(':','-').replace(':','-').slice(0,-5);

    fs.renameSync(pathHelper.getRoot(),pathHelper.getRoot().replace(/\/$/, "")+"-bak-"+todayDate );
    this.selectSitesWindow();
  }

  deleteSite() {
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("disableMobilePreview");
    let dir;

    const dialog = electron.dialog;

    if(global.currentSiteKey){
      let options  = {
        title: "Please confirm",
        buttons: ["Yes","Cancel"],
        message: "Do you really want to delete " + global.currentSiteKey
      }
      let response = dialog.showMessageBox(options)
      if(response === 1) return;

      fs.remove(pathHelper.getRoot() + 'config.'+global.currentSiteKey+'.json');

      var rimraf = require("rimraf");
      rimraf(pathHelper.getRoot() + 'sites/'+global.currentSiteKey, ()=>{
        //console.log("rm done");
      });

      this.selectSitesWindow();
    }
    else{
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        buttons: ["Close"],
        title: "Warning",
        message: "First, select a site to delete.",
      });
    }
  }
  createPrefsWindow () {
    let prefsWindow = prefsWindowManager.getCurrentInstanceOrNew();
    if (prefsWindow) {
      prefsWindow.webContents.send("redirectPrefs")
    }

    prefsWindow.once('ready-to-show', () => {
      prefsWindow.webContents.send("redirectPrefs")
    })

    prefsWindow.webContents.on('did-finish-load',() => {
      prefsWindow.webContents.send("redirectPrefs")
    })

    prefsWindow.on('closed', ()=>{
      prefsWindow = null
    })
  }

  createLogWindow () {
    let logWindow = logWindowManager.getCurrentInstanceOrNew();

    if (logWindow) {
      logWindow.webContents.send("redirectConsole")
    }

    logWindow.once('ready-to-show', () => {
      logWindow.webContents.send("redirectConsole")
    })

    logWindow.webContents.on('did-finish-load',() => {
      logWindow.webContents.send("redirectConsole")
    })

    logWindow.on('closed', () => {
      logWindow = null
    })
  }

  openWorkSpaceDir(){
    let wspath = global.currentSitePath;
    try{
      let lstat = fs.lstatSync(wspath);
      if(lstat.isDirectory()){
        shell.openItem(wspath);
      }
      else{
        shell.openItem(dirname(wspath));
      }
    }
    catch(e){
      console.log(e);
    }
  }
  openWorkSpaceConfig(){
    let wspath = pathHelper.getRoot()+'config.'+global.currentSiteKey+'.json';
    try{
      shell.openItem(wspath);
    }
    catch(e){
    }
  }

  async selectSitesWindow () {
    if(global.hugoServer){
      global.hugoServer.stopIfRunning((err, stdout, stderr)=>{
        if(err){
          console.log(err)
        }

        else{ resolve(); }
      });
    }

    global.mainWM.closeSiteAndShowSelectSites();
    return;
  }

  siteSelected(){
    if(global.currentSiteKey){
      return true;
    }
    else{
      return false;
    }
  }

  updateMenu(currentSiteKey){
    return;

    let siteRelatedMenuIds = [
      'export-site',
      'delete-site',
      'export-theme',
      'import-theme',
      'export-content',
      'import-content',
      'start-server',
      'open-site-dir',
      'open-site-conf',
      'auto-create-model',
    ];
    siteRelatedMenuIds.forEach((id)=>{
      let myItem = menu.getMenuItemById(id);
      myItem.enabled = (currentSiteKey?true:false);
    });

  }

  openHome() {
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    if (mainWindow) {
      mainWindow.webContents.send("redirectHome")
    }
  }

  async selectSiteVersion(subdir){
    console.log(subdir);
  }

  async setSitesListingView(view){

    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("selectSiteSetBusy");

    global.pogoconf.setSitesListingView(view)
    global.pogoconf.saveState().then( ()=>{
      this.createMainMenu();
      global.mainWM.closeSiteAndShowSelectSites();
    });
  }

  createViewSitesMenu(){

    let _menuContent = [
      {
        key: "all",
        label: "View all sites",
      },
      {
        key: "unpublished",
        label: "Unpublished sites",
      },
      {
        key: "mylocal",
        label: "My sites",
        enabled: ( this.profileUserName === '' ? false:true ),
      },
      {
        key: "myremote",
        label: "My available",
        enabled: ( this.profileUserName === '' ? false:true ),
      },
    ];

    let viewSitesMenu = [];
    _menuContent.forEach((itemContent)=>{
      viewSitesMenu.push({
        id: `view-sites-${itemContent.key}`,
        label: itemContent.label,
        type: "checkbox",
        enabled: itemContent.enabled,
        checked: (itemContent.key===global.pogoconf.sitesListingView),
        click: async () => {
          this.setSitesListingView(itemContent.key);
        }
      });
    });

    return viewSitesMenu;
  }

  createProfilesMenu(){

    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    const profilesDir = path.join(pathHelper.getRoot(),"profiles")
    let profilesMenu = [];

    profilesMenu.push({
      id: 'rm-pogo-profile',
      label: "Unset profile",
      enabled: ( this.profileUserName === '' ? false:true ),
      click: async ()=>{
        mainWindow.webContents.send("selectSiteSetBusy");
        global.pogoconf.setCurrectUsername(null);
        global.pogoconf.setSitesListingView('all');
        global.pogoconf.saveState().then( ()=>{
          global.mainWM.closeSiteAndShowSelectSites();
          this.createMainMenu();
        });
      }});


    profilesMenu.push({
      id: 'connect-poppygo-user',
      label: "Request PoppyGo User Connect Code",
      click: async ()=>{
        this.requestUserConnectCode();
      }
    });

    profilesMenu.push({
      id: 'enter-connect-code',
      label: "Enter PoppyGo User Connect code",
      click: async ()=>{
        this.enterUserConnectCode();
      }
    });

    profilesMenu.push( { type: 'separator' });

    if(fs.existsSync(profilesDir)){
      var files = fs.readdirSync(profilesDir);

      files.forEach((f)=>{
        let label = "";
        let checked = false;
        if(lstatSync(path.join(profilesDir,f)).isDirectory()){
          label = f;
          if(f == this.profileUserName){
            checked = true;
          }
          profilesMenu.push({
            id: f,
            type: "checkbox",
            label: label,
            checked: checked,
            click: async ()=>{

              mainWindow.webContents.send("selectSiteSetBusy");

              let key = path.join(profilesDir,f,"id_rsa_pogo");
              await fs.copySync(key, path.join(pathHelper.getRoot(),"id_rsa_pogo"));
              await fs.chmodSync(path.join(pathHelper.getRoot(),"/id_rsa_pogo"), '0600');

              global.pogoconf.setCurrectUsername(f);
              global.pogoconf.saveState().then(()=>{
                cloudCacheManager.updateUserRemoteCaches().then(async ()=>{
                  await this.createMainMenu();
                  global.mainWM.closeSiteAndShowSelectSites();
                });
              });
            }
          });
        }
      });
      return profilesMenu;
    }

    return [];
  }

  createVersionsMenu(){
    if(global.currentSiteKey && global.currentWorkspaceKey){
      let siteKey = global.currentSiteKey;
      let siteService = null;
      let configurationDataProvider = require('./configuration-data-provider')
      configurationDataProvider.get((err, configurations)=>{
        if(configurations.empty===true) throw new Error('Configurations is empty.');
        if(err) { reject(err); return; }
        let siteData = configurations.sites.find((x)=>x.key===global.currentSiteKey);

        if(siteData==null) {
          //throw new Error('Could not find site is empty.');
        }
        else{
          siteService = new SiteService(siteData);
        }

      });

      if(siteService == null){
        return;
      }

      let currentPath = siteService._config.source.path;
      let currentVersion = siteService._config.source.path.split("/").pop();


      let versionsMenu = [];

      if(path.resolve(currentPath, '..').split("/").pop()==='sources'){
        let sources = path.resolve(currentPath, '..');
        var files = fs.readdirSync(sources);
        files.forEach( (f) => {
          let label = "";
          let checked = false;
          if(lstatSync(path.join(sources,f)).isDirectory()){
            label = f;
            if(f == currentVersion){
              checked = true;
            }
            versionsMenu.push({
              id: f,
              type: "checkbox",
              label: label,
              checked: checked,
              click: async () => {
                pogoversions.setSiteVersion(f);
              }
            });
          }
        });
      }
      return versionsMenu;
    }
    else {
      return [];
    }
  }

  //TODO move to more general place
  deleteInvalidConfKeys(newConf){
    // REMOVE INVALID KEYS
    delete newConf['configPath']
    delete newConf['owner']
    delete newConf['published']
    delete newConf['publishKey']
  }

  async editProjectPath(){
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();

    if(global.currentSiteKey && global.currentWorkspaceKey){
      let siteKey = global.currentSiteKey;
      let siteService = null;
      let configurationDataProvider = require('./configuration-data-provider')
      configurationDataProvider.get(async (err, configurations) => {
        if(configurations.empty===true) throw new Error('Configurations is empty.');
        if(err) { reject(err); return; }
        let siteData = configurations.sites.find((x)=>x.key===global.currentSiteKey);

        if(siteData=siteService = new SiteService(siteData)){
          let newConf = siteService._config;
          console.log(newConf);

          let currentPath = "";
          if(newConf.hasOwnProperty("publish") && newConf.publish[0].hasOwnProperty("config") &&  newConf.publish[0].config.hasOwnProperty("path")){
            currentPath = newConf.publish[0].config.path
          }

          this.deleteInvalidConfKeys(newConf);

          const prompt = require('electron-prompt');
          var newPath = await prompt({
            title: 'project path',
            label: 'key:',
            value: currentPath,
            inputAttrs: {
              type: 'text',
              required: true
            },
            type: 'input'
          }, mainWindow);

          console.log(newPath);
          if(!newPath || newPath===""){
            return;
          }

          let configFilePath = path.join(pathHelper.getRoot(),'config.'+siteKey+'.json');

          newConf.publish[0].key = "poppygo-cloud"
          newConf.publish[0].config = {}
          newConf.publish[0].config.path = newPath
          newConf.publish[0].config.type = "poppygo"
          newConf.publish[0].config.defaultDomain = newPath.replace('.','-') + ".pogosite.com"

          await fssimple.writeFileSync(configFilePath, JSON.stringify(newConf), { encoding: "utf8"});

          outputConsole.appendLine('rename projectpath to: '+newPath);

          let newScreenURL = `/sites/${decodeURIComponent(global.currentSiteKey)}/workspaces/${decodeURIComponent(global.currentWorkspaceKey)}`;
          mainWindow.webContents.send("redirectToGivenLocation","/");
          mainWindow.webContents.send("redirectToGivenLocation",newScreenURL);
          mainWindow.webContents.send("redirectMountSite",newScreenURL);

        }

      });

    }

  }

  toggleExperimental(){

    if(global.pogoconf.experimentalFeatures){
      global.pogoconf.setExperimentalFeatures(false);
    }
    else{
      global.pogoconf.setExperimentalFeatures(true);
    }

    global.pogoconf.saveState().then(()=>{
      this.createMainMenu();
    });

  }
  createExperimentalMenu(){
    let expMenu = [
      {
        id: 'switch-profile',
        label: 'Switch user',
        submenu: this.createProfilesMenu()
      },
      {
        id: 'switch-select-sites-view',
        label: 'View sites',
        submenu: this.createViewSitesMenu()
      },
      {
        id: 'rename-site',
        label: 'Rename site',
        enabled: this.siteSelected(),
        click: async () => {
          this.renameSite()
        }
      },
      {
        id: 'import-site-from-url',
        label: 'Import site from PogoURL',
        click: async () => {
          this.importSiteFromUrl()
        }
      },
      {
        id: 'create-new-from-hugo-theme-url',
        label: 'Create new from Hugo theme git URL',
        click: async () => {
          this.createSiteFromThemeGitUrl();
        }
      },
      {
        id: 'cacheremotesiteinfo',
        label: 'Sync remote site info',
        click: async () => {
          cloudCacheManager.updateAllRemoteCaches()
        }
      },
      {
        id: 'cacheremoteuserinfo',
        label: 'Sync remote user info',
        click: async () => {
          cloudCacheManager.updateUserRemoteCaches()
        }
      },
      {
        id: 'unlink-site-domain',
        label: 'Unlink site domain',
        enabled: this.siteSelected(),
        click: async () => {
          this.unlinkSiteDomain()
        }
      },
      {
        id: 'add-project-path',
        label: 'Edit project path',
        enabled: this.siteSelected(),
        click: async () => {
          this.editProjectPath()
        }
      },
      {
        label: 'Reset all (dangerous)',
        click: async () => {
          this.deleteSukohFolder()
        }
      },
      { role: 'toggledevtools' },
      {
        label: 'Preferences',
        click: async () => {
          this.createPrefsWindow()
        }
      },
    ];

    return expMenu;
  }

  createDevMenu(){
    let devMenu = [
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      {
        label: 'Stripe Customer Portal',
        click: async () => {

          let configurationDataProvider = require('./configuration-data-provider')
          configurationDataProvider.get(async (err, configurations) => {

            if(this.profileUserName!=""){

              let pogopubl = new PogoPublisher({});
              let fingerprint = await pogopubl.getKeyFingerprint();

              let userVars = {
                username: this.profileUserName,
                fingerprint: fingerprint,
              };

              let requestVars = Buffer.from(JSON.stringify(userVars)).toString('base64');
              let url = configurations.global.pogostripeConn.protocol+"//"+
                configurations.global.pogostripeConn.host+":"+
                configurations.global.pogostripeConn.port+"/myaccount/"+requestVars;
              await shell.openExternal(url);
            }
          });
        }
      },
      {
        label: 'Depreciated',
        submenu: [
          {
            label: 'Front page',
            click: async () => {
              this.openHome()
            }
          },
          {
            id: 'switch-version',
            label: 'Site versions',
            enabled: this.siteSelected(),
            submenu: this.createVersionsMenu()
          },
        ]
      }

    ];

    return devMenu;
  }


  mainMenuArray(){

    const isMac = process.platform === 'darwin'

    const template = [
      ...(isMac ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }] : []),
      {
        label: 'File',
        submenu: [
          {
            label: 'Select site',
            click: async () => {
              this.selectSitesWindow();
            }
          },
          { type: 'separator' },
          {
            label: 'Import site',
            click: async () => {
              pogozipper.importSite()
            }
          },
          {
            id: 'export-site',
            label: 'Export site',
            enabled: this.siteSelected(),
            click: async () => {
              pogozipper.exportSite()
            }
          },
          {
            id: 'delete-site',
            enabled: this.siteSelected(),
            label: 'Delete site',
            click: async () => {
              this.deleteSite()
            }
          },
          { type: 'separator' },
          {
            id: 'import-theme',
            enabled: this.siteSelected(),
            label: 'Import theme',
            click: async () => {
              pogozipper.importTheme()
            }
          },
          {
            id: 'export-theme',
            enabled: this.siteSelected(),
            label: 'Export theme',
            click: async () => {
              pogozipper.exportTheme()
            }
          },
          { type: 'separator' },
          {
            id: 'import-content',
            enabled: this.siteSelected(),
            label: 'Import content',
            click: async () => {
              pogozipper.importContent()
            }
          },
          {
            id: 'export-content',
            enabled: this.siteSelected(),
            label: 'Export content',
            click: async () => {
              pogozipper.exportContent()
            }
          },
          { type: 'separator' },
          isMac ? { role: 'close' } : { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          /*
                    ...(isMac ? [
                        { role: 'pasteAndMatchStyle' },
                        { role: 'delete' },
                        { role: 'selectAll' },
                        { type: 'separator' },
                        {
                            label: 'Speech',
                            submenu: [
                                { role: 'startspeaking' },
                                { role: 'stopspeaking' }
                            ]
                        }
                    ] : [
                        { role: 'delete' },
                        { type: 'separator' },
                        { role: 'selectAll' },

                    {
                        label: 'Preferences',
                        click: async () => {
                            createPrefsWindow()
                        }
                    }

                  ])*/
        ]
      },
      {
        label: 'View',
        submenu: [

          { role: 'reload' },

          { type: 'separator' },

          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(isMac ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ] : [
          ])
        ]
      },
      {
        label: 'Expert',
        submenu: [
          {
            id: 'start-server',
            label: 'Restart preview',
            enabled: this.siteSelected(),
            click: async () => {
              this.startServer()
            }
          },
          {
            label: 'Stop preview',
            click: async () => {
              this.stopServer()
            }
          },
          { type: 'separator' },
          {
            id: 'open-site-dir',
            label: 'Open site directory',
            enabled: this.siteSelected(),
            click: async () => {
              this.openWorkSpaceDir()
            }
          },
          {
            id: 'auto-create-model',
            label: 'Generate PoppyGo config',
            enabled: this.siteSelected(),
            click: async () => {
              await this.generateModel();
              this.generateModel()
            }
          },
          {
            id: 'open-site-conf',
            label: 'Open workspace config',
            enabled: this.siteSelected(),
            click: async () => {
              this.openWorkSpaceConfig()
            }
          },
          { type: 'separator' },
          {
            label: 'Config docs',
            click: async () => {
              this.openCookbooks()
            }
          },
          { type: 'separator' },
          {
            label: 'Show Logs',
            click: async () => {
              this.createLogWindow()
            }
          },
          { type: 'separator' },
          {
            label: 'Enable experimental',
            type: "checkbox",
            checked: global.pogoconf.experimentalFeatures,
            click: async () => {
              this.toggleExperimental()
            }
          },
        ]
      },

      ...(global.pogoconf.experimentalFeatures ? [{
        label: 'Experimental',
        submenu: this.createExperimentalMenu()
      }] : []),

      ...(process.env.REACT_DEV_URL ? [{
        label: 'DevMenu',
        submenu: this.createDevMenu()
      }] : []),

      {
        role: 'help',
        submenu: [
          {
            id: 'welcome',
            label: 'Show welcome screen',
            click: async () => {
              let mainWindow = global.mainWM.getCurrentInstanceOrNew();
              mainWindow.webContents.send("disableMobilePreview");
              mainWindow.webContents.send("redirectToGivenLocation","/welcome");
            }
          },
          {
            label: 'Getting started',
            click: async () => {
              await shell.openExternal("https://router.poppygo.app/getting-started");
            }
          },
          { type: 'separator' },
          {
            label: 'Show PoppyGo version',
            click: async () => {
              this.showVersion();
            }
          },
          {
            label: 'Release notes',
            click: async () => {
              await shell.openExternal("https://router.poppygo.app/release-notes");
            }
          }
        ]
      }
    ]

    return template;

  }

  createMainMenu(){

    /* THIS IS A GREAT EXÅMPLE HOW TO USE PROMISES
     *
     * Before executing the main action get all needed promise data and run from within Promise.all
     *
     * */
    this.profileUserName = "";
    let pogopubl = new PogoPublisher({});
    let readProfileAction = pogopubl.readProfile();
    readProfileAction.then((profile)=>{
      if(profile){
        this.profileUserName = profile.username
      }
    });

    Promise.all([readProfileAction]).then( () => {
      menu = Menu.buildFromTemplate(this.mainMenuArray());
      Menu.setApplicationMenu(menu)
      return true;
    });
  }
}

module.exports = new MenuManager();
