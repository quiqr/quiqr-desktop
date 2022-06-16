const electron                    = require('electron');
const Menu                        = electron.Menu;
const path                        = require("path");
const { lstatSync }               = require('fs')
const fssimple                    = require('fs');
const fs                          = require('fs-extra');
const { shell }                   = require('electron')
const logWindowManager            = require('./log-window-manager');
const pogozipper                  = require('../import-export/pogozipper');
const cloudCacheManager           = require('../sync/quiqr-cloud/cloud-cache-manager');
const cloudApiManager             = require('../sync/quiqr-cloud/cloud-api-manager');
const cloudGitManager             = require('../sync/quiqr-cloud/cloud-git-manager');
const PogoPublisher               = require('../publishers/pogo-publisher');
const pathHelper                  = require('../utils/path-helper');
//const SiteService                 = require('../services/site/site-service')
//const libraryService              = require('../services/library/library-service')
const configurationDataProvider   = require('../app-prefs-state/configuration-data-provider')
const { EnvironmentResolver }     = require('../utils/environment-resolver');

const app = electron.app
let menuObject = null;

let context = {};
context.reject = function(error){
  console.log(error);
}

context.resolve = function(response){
  console.log(response);
}

class MenuManager {

  openCookbooks() {
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("disableMobilePreview");
    mainWindow.webContents.send("redirectToGivenLocation", "/forms-cookbook");
  }
  stopServer() {
    if(global.hugoServer){
      global.hugoServer.stopIfRunning();

      global.mainWM.reloadMobilePreview();
    }

  }
  startServer() {
    if(global.hugoServer){
      global.hugoServer.serve((err) => {
        if(err){
          console.log(err)
        }
      });
    }
  }

  async inviteUserForSite(){

    let mainWindow = global.mainWM.getCurrentInstance();

    const prompt = require('electron-prompt');
    let email = await prompt({
      title: 'Enter email address of the user you want to invite',
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
        detail: 'If the email address exist a mail with a invitation link will be sent.',
      };

      dialog.showMessageBox(null, options, async (response) => {
        if(response === 1){
          await cloudApiManager.sendInvitationMail(email,global.currentSiteKey)
          console.log("mailsent")
        }
        else{
          console.log(response)
          return;
        }
      });
    }
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

      await cloudApiManager.requestConnectMail(email)

      const dialog = electron.dialog;

      const options = {
        type: 'info',
        buttons: ['OK'],
        defaultId: 1,
        title: 'Email has been sent',
        message: 'Email has been sent',
        detail: 'If the email address exist a mail with a connect link will be sent. Check the instructions in the mail before continuing.',
      };

      dialog.showMessageBox(null, options, async (response) => {
        if(response === 1){
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

        cloudCacheManager.updateUserRemoteCaches().then(async ()=>{

          const dialog = electron.dialog;

          const options = {
            type: 'info',
            buttons: [ 'OK'],
            defaultId: 1,
            title: 'Connection was successful',
            message: 'Connection was successful',
            detail: 'Connection was successful',
          };

          dialog.showMessageBox(null, options, () => {});

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

        dialog.showMessageBox(null, options, () => {});
      }

      this.createMainMenu();
      global.mainWM.closeSiteAndShowSelectSites();

    }
  }

  showVersion(){
    const idPath = path.join(pathHelper.getApplicationResourcesDir(),"all","build-git-id.txt");
    const datePath = path.join(pathHelper.getApplicationResourcesDir(),"all", "build-date.txt");
    let buildGitId = "";
    let buildDate = "";

    let environmentResolver = new EnvironmentResolver();
    const upis = `\n\nUQIS: ${environmentResolver.getUQIS()}\n`;

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
      message: "Quiqr Desktop\n\nVersion: " + app.getVersion() + buildGitId + buildDate + upis
    }
    dialog.showMessageBox(options)
  }

  async unlinkSiteDomain(){
    let pogopubl = new PogoPublisher({});
    await pogopubl.UnlinkCloudPath();
  }

  appPrefs(){
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("disableMobilePreview");
    mainWindow.webContents.send("redirectToGivenLocation","/prefs");
  }

  deleteSite() {
    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("disableMobilePreview");

    const dialog = electron.dialog;

    if(global.currentSiteKey){
      let options  = {
        title: "Please confirm",
        buttons: ["Yes","Cancel"],
        message: "Do you really want to delete " + global.currentSiteKey
      }
      let response = dialog.showMessageBox(options)
      if(response === 1) return;

      fs.remove(pathHelper.getSiteMountConfigPath(global.currentSiteKey));

      var rimraf = require("rimraf");
      rimraf(pathHelper.getRoot() + 'sites/'+global.currentSiteKey, ()=>{
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

  createLogWindow () {
    let logWindow = logWindowManager.getCurrentInstanceOrNew();

    if (logWindow) {
      logWindow.webContents.send("redirectToGivenLocation", "/console")
    }

    logWindow.once('ready-to-show', () => {
      logWindow.webContents.send("redirectToGivenLocation", "/console")
    })

    logWindow.webContents.on('did-finish-load',() => {
      logWindow.webContents.send("redirectToGivenLocation", "/console")
    })

    logWindow.on('closed', () => {
      logWindow = null
    })
  }

  openWorkSpaceQuiqrDir(){
    let wspath = path.join(global.currentSitePath, "quiqr");

    try{
      let lstat = fs.lstatSync(wspath);
      if(lstat.isDirectory()){
        shell.openPath(wspath);
      }
      else{
        shell.openPath(path.dirname(wspath));
      }
    }
    catch(e){
      console.log(e);
    }
  }
  openWorkSpaceDir(){
    let wspath = global.currentSitePath;

    try{
      let lstat = fs.lstatSync(wspath);
      if(lstat.isDirectory()){
        shell.openPath(wspath);
      }
      else{
        shell.openPath(path.dirname(wspath));
      }
    }
    catch(e){
      console.log(e);
    }
  }
  openWorkSpaceConfig(){
    let wspath = pathHelper.getSiteMountConfigPath(global.currentSiteKey);
    try{
      shell.openPath(wspath);
    }
    catch(e){
      console.log(e);
    }
  }

  async selectSitesWindow () {
    if(global.hugoServer){
      global.hugoServer.stopIfRunning();
    }

    global.mainWM.closeSiteAndShowSelectSites();
    return;
  }

  siteSelected(){
    if(global.currentSiteKey && global.currentSiteKey !== ""){
      return true;
    }
    else{
      return false;
    }
  }

  /*
  userIsOwner(siteKey, user){
    return true;
  }
  */

  siteIsPogoCloudManaged(){

    if(global.currentSiteKey && global.currentSiteKey !== ""){

      //TODO ??
      return true;

      /*
      configurationDataProvider.get((err, configurations)=>{
        let siteData = configurations.sites.find((x)=>x.key===global.currentSiteKey);
        if('publish' in siteData && 'config' in siteData.publish[0] && 'path' in siteData.publish[0].config){
          if(this.userIsOwner(global.currentSiteKey, this.profileUserName)){
            return true;
          }
        }
        else{
          return false;
        }
      });
      */
    }
    return false;
  }

  async selectSiteVersion(subdir){
    console.log(subdir);
  }

  async setRole(role){

    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("frontEndBusy");

    global.pogoconf.setPrefkey("applicationRole", role);

    global.pogoconf.saveState().then( ()=>{
      this.createMainMenu();
      console.log("Role changed, should restart?")
    });
  }

  createRolesSelectionMenu(){

    let _menuContent = [
      {
        key: "contentEditor",
        label: "Content Editor",
      },
      {
        key: "siteDeveloper",
        label: "Site Developer",
      },
    ];

    let rolesMenu = [];
    _menuContent.forEach((itemContent)=>{
      rolesMenu.push({
        id: `roles-${itemContent.key}`,
        label: itemContent.label,
        type: "checkbox",
        enabled: itemContent.enabled,
        checked: (itemContent.key===global.pogoconf.prefs["applicationRole"]),
        click: async () => {
          this.setRole(itemContent.key);
          let mainWindow = global.mainWM.getCurrentInstanceOrNew();
          mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
        }
      });
    });

    return rolesMenu;
  }


  createProfilesMenu(){

    let mainWindow = global.mainWM.getCurrentInstanceOrNew();
    const profilesDir = path.join(pathHelper.getRoot(),"profiles")
    let profilesMenu = [];

    profilesMenu.push({
      id: 'rm-pogo-profile',
      label: "Unset Profile",
      enabled: ( this.profileUserName === '' ? false:true ),
      click: async ()=>{
        mainWindow.webContents.send("frontEndBusy");
        global.pogoconf.setCurrectUsername(null);

        global.pogoconf.saveState().then( ()=>{
          app.relaunch()
          app.exit()
        });
      }});

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

              mainWindow.webContents.send("frontEndBusy");

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

  connectProfilesMenu(){

    let profilesMenu = [];

    profilesMenu.push({
      id: 'connect-quiqr-user',
      label: "Request Quiqr User Connect Code",
      click: async ()=>{
        this.requestUserConnectCode();
      }
    });

    profilesMenu.push({
      id: 'enter-connect-code',
      label: "Enter Quiqr User Connect code",
      click: async ()=>{
        this.enterUserConnectCode();
      }
    });

    return profilesMenu;
  }

  inviteMenu(){

    let profilesMenu = [];

    profilesMenu.push({
      id: 'invite-quiqr-user',
      label: "Invite Quiqr User as Site Member",
      enabled: this.siteIsPogoCloudManaged(),
      click: async ()=>{
        this.inviteUserForSite();
      }
    });

    return profilesMenu;
  }


  togglePreviewWindow(){

    if(global.pogoconf.expPreviewWindow){
      global.pogoconf.setExpPreviewWindow(false);
    }
    else{
      global.pogoconf.setExpPreviewWindow(true);
    }

    global.pogoconf.saveState().then(()=>{
      this.createMainMenu();
    });
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

  toggleDisablePartialCache(){

    if(global.pogoconf.disablePartialCache){
      global.pogoconf.setDisablePartialCache(false);
    }
    else{
      global.pogoconf.setDisablePartialCache(true);
    }

    global.pogoconf.saveState().then(()=>{
      this.createMainMenu();
    });
  }

  toggleLocalApiServers(){

    if(global.pogoconf.devLocalApi){
      global.pogoconf.setDevLocalApi(false);
    }
    else{
      global.pogoconf.setDevLocalApi(true);
    }

    global.pogoconf.saveState().then(()=>{
      let mainWindow = global.mainWM.getCurrentInstanceOrNew();
      mainWindow.webContents.send("updateBadges");

      const dialog = electron.dialog;

      const options = {
        type: 'info',
        buttons: ['OK'],
        defaultId: 1,
        title: 'Restart to use new settings',
        message: 'Restart to use new settings',
        detail: 'You should restart Quiqr to make changes effective.',
      };

      dialog.showMessageBox(null, options, () => {});

      this.createMainMenu();
    });
  }

  toggleDevShowCurrentUser(){

    if(global.pogoconf.devShowCurrentUser){
      global.pogoconf.setDevShowCurrentUser(false);
    }
    else{
      global.pogoconf.setDevShowCurrentUser(true);
    }

    global.pogoconf.saveState().then(()=>{
      let mainWindow = global.mainWM.getCurrentInstanceOrNew();
      mainWindow.webContents.send("updateBadges");
      this.createMainMenu();
    });
  }


  toggleDevDisableAutoHugoServe(){

    if(global.pogoconf.devDisableAutoHugoServe){
      global.pogoconf.setDevDisableAutoHugoServe(false);
    }
    else{
      global.pogoconf.setDevDisableAutoHugoServe(true);
    }

    global.pogoconf.saveState().then(()=>{
      let mainWindow = global.mainWM.getCurrentInstanceOrNew();
      mainWindow.webContents.send("updateBadges");
      this.createMainMenu();
    });
  }




  createExperimentalMenu(){
    let expMenu = [
      {
        id: 'pulllastgitchanges',
        label: 'Merge Last Changes From Cloud',
        enabled: this.siteIsPogoCloudManaged(),
        click: async () => {

          configurationDataProvider.get(async (err, configurations)=>{
            let siteData = configurations.sites.find((x)=>x.key===global.currentSiteKey);
            cloudGitManager.pullFastForwardMerge(siteData)
              .then((status)=>{
                if(status === "non_fast_forward"){
                  const dialog = electron.dialog;
                  const options = {
                    type: 'warning',
                    buttons: [ 'CLOSE'],
                    defaultId: 1,
                    title: 'Merge failed',
                    message: 'Could not merge remote code.',
                    detail: 'Nothing changed locally. When you publish, remote changes will be overwritten.',
                  };

                  dialog.showMessageBox(null, options)
                }

              })
              .catch((err)=>{
                console.log("ERR pullFastForwardMerge")
                console.log(err)
              });
          });

        }
      },
      {
        label: "Role",
        submenu: this.createRolesSelectionMenu()
      },
      {
        id: 'cacheremoteuserinfo',
        enabled: ( this.profileUserName === '' ? false:true ),
        label: 'Sync Remote User Data',
        click: async () => {
          cloudCacheManager.updateUserRemoteCaches()
        }
      },
      {
        label: 'Enable Preview Window',
        type: "checkbox",
        checked: global.pogoconf.expPreviewWindow,
        click: async () => {
          this.togglePreviewWindow()
        }
      },
      { type: 'separator' },
      {
        label: 'Import',
        submenu: [
          {
            label: 'Import Site',
            click: async () => {
              pogozipper.importSite()
            }
          },
          {
            id: 'import-theme',
            enabled: this.siteSelected(),
            label: 'Import Theme',
            click: async () => {
              pogozipper.importTheme()
            }
          },
          {
            id: 'import-content',
            enabled: this.siteSelected(),
            label: 'Import Content',
            click: async () => {
              pogozipper.importContent()
            }
          },
        ]
      },
      {
        label: 'Export',
        submenu: [
          {
            id: 'export-site',
            label: 'Export Site',
            enabled: this.siteSelected(),
            click: async () => {
              pogozipper.exportSite()
            }
          },
          {
            id: 'export-theme',
            enabled: this.siteSelected(),
            label: 'Export Theme',
            click: async () => {
              pogozipper.exportTheme()
            }
          },
          {
            id: 'export-content',
            enabled: this.siteSelected(),
            label: 'Export Content',
            click: async () => {
              pogozipper.exportContent()
            }
          },
        ]
      },
      { type: 'separator' },
      {
        id: 'connect-user',
        label: 'Connect User',
        submenu: this.connectProfilesMenu()
      },
      {
        id: 'invite',
        label: 'Invite',
        submenu: this.inviteMenu()
      },
      {
        id: 'switch-profile',
        label: 'Switch User',
        submenu: this.createProfilesMenu()
      },


    ];

    return expMenu;
  }

  createDevMenu(){
    let devMenu = [
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      {
        label: 'Show Current User',
        type: "checkbox",
        checked: global.pogoconf.devShowCurrentUser,
        click: async () => {
          this.toggleDevShowCurrentUser()
        }
      },
      {
        id: 'open-site-conf',
        label: 'Open Site Config',
        enabled: this.siteSelected(),
        click: async () => {
          this.openWorkSpaceConfig()
        }
      },
      {
        label: 'Use Local API Servers',
        type: "checkbox",
        checked: global.pogoconf.devLocalApi,
        click: async () => {
          this.toggleLocalApiServers()
        }
      },
      {
        label: 'Disable Auto Hugo Serve',
        type: "checkbox",
        checked: global.pogoconf.devDisableAutoHugoServe,
        click: async () => {
          this.toggleDevDisableAutoHugoServe()
        }
      },

      {
        label: 'Stripe Customer Portal',
        click: async () => {

          configurationDataProvider.get(async (err, configurations) => {

            if(this.profileUserName!=""){

              let fingerprint = await cloudGitManager.getKeyFingerprint();

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
            id: 'unlink-site-domain',
            label: 'Unlink Site Domain',
            enabled: this.siteSelected(),
            click: async () => {
              this.unlinkSiteDomain()
            }
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
          {
            label: 'Preferences',
            click: async () => {

              this.appPrefs();

            }
          },
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
            id: 'switch-select-sites-view',
            label: 'Site Library',
            click: async () => {
              //TODO this seems smarter. Implement at other places
              global.mainWM.closeSiteAndShowSelectSites();
            }

          },
          { type: 'separator' },
          {
            label: 'New Quiqr Site',
            id: 'new-site',
            click: async () => {
              let mainWindow = global.mainWM.getCurrentInstanceOrNew();
              mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
              var newURL='/sites/new-site/x-'+Math.random();
              mainWindow.webContents.send("redirectToGivenLocation", newURL);
            }
          },
          {
            label: 'Import Quiqr Site',
            id: 'import-site',
            click: async () => {
              let mainWindow = global.mainWM.getCurrentInstanceOrNew();
              mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
              var newURL='/sites/import-site/x-'+Math.random();
              mainWindow.webContents.send("redirectToGivenLocation", newURL);
            }
          },
          { type: 'separator' },
          {
            id: 'close-site',
            label: 'Close Site',
            enabled: this.siteSelected(),
            click: async () => {
              this.selectSitesWindow();
            }
          },
          {
            id: 'delete-site',
            enabled: this.siteSelected(),
            label: 'Delete Site',
            click: async () => {
              this.deleteSite()
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
          {
            label: 'Preferences',
            click: async () => {
              this.appPrefs();
            }
          },
        ]
      },
      {
        label: 'View',
        submenu: [
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
        label: 'Develop',
        submenu: [
          {
            id: 'start-server',
            label: 'Restart Hugo',
            enabled: this.siteSelected(),
            click: async () => {
              this.startServer()
            }
          },
          {
            label: 'Stop Hugo',
            click: async () => {
              this.stopServer()
            }
          },
          {
            label: 'Hugo Server Logs',
            click: async () => {
              this.createLogWindow()
            }
          },
          {
            id: 'open-site-dir',
            label: 'Open Hugo Site Directory',
            enabled: this.siteSelected(),
            click: async () => {
              this.openWorkSpaceDir()
            }
          },
          { type: 'separator' },
          {
            id: 'open-quiqr-dir',
            label: 'Open Quiqr Site Directory',
            enabled: this.siteSelected(),
            click: async () => {
              this.openWorkSpaceQuiqrDir()
            }
          },
          {
            id: 'populate-etale-visuals',
            label: 'Create Etalage Preview',
            enabled: this.siteSelected(),
            click: async () => {
              global.apiMain.genereateEtalageImages({siteKey:global.currentSiteKey, workspaceKey: global.currentWorkspaceKey},context);
            }
          },
          {
            label: 'Disable Partial Cache',
            type: "checkbox",
            checked: global.pogoconf.disablePartialCache,
            click: async () => {
              this.toggleDisablePartialCache()
            }
          },
          {
            label: 'Model Configuration Examples',
            click: async () => {
              this.openCookbooks()
            }
          },
          { type: 'separator' },
          {
            label: 'Enable Experimental',
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
            label: 'Show Welcome Screen',
            click: async () => {
              let mainWindow = global.mainWM.getCurrentInstanceOrNew();
              mainWindow.webContents.send("disableMobilePreview");
              mainWindow.webContents.send("redirectToGivenLocation","/welcome");
            }
          },
          {
            label: 'Getting Started',
            click: async () => {
              await shell.openExternal("https://book.quiqr.org/docs/01-getting-started/");
            }
          },
          { type: 'separator' },
          {
            label: 'Show Quiqr Version',
            click: async () => {
              this.showVersion();
            }
          },
          {
            label: 'Release Notes',
            click: async () => {
              await shell.openExternal("https://book.quiqr.org/docs/10-release-notes/01-quiqr-desktop/");
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
      menuObject = Menu.buildFromTemplate(this.mainMenuArray());
      Menu.setApplicationMenu(menuObject)
      return true;
    });
  }
}

module.exports = new MenuManager();
