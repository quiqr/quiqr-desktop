const fs                        = require('fs-extra');
const fssimple                  = require('fs');
const {dirname}                 = require('path');
const path                      = require('path');
const {shell}                   = require('electron');
const util                      = require('util')
const pathHelper                = require('../utils/path-helper');
const configurationDataProvider = require('../app-prefs-state/configuration-data-provider')
const SiteService               = require('../services/site/site-service')
const libraryService            = require('../services/library/library-service')
const Embgit                    = require('../embgit/embgit')
const WorkspaceService          = require('../services/workspace/workspace-service')
const hugoDownloader            = require('../hugo/hugo-downloader')
const menuManager               = require('../ui-managers/menu-manager');
const pogozipper                = require('../import-export/pogozipper');
const gitImporter               = require('../import/git-importer');
const folderImporter            = require('../import/folder-importer');
const PogoPublisher             = require('../publishers/pogo-publisher');
const cloudCacheManager         = require('../sync/quiqr-cloud/cloud-cache-manager');
const cloudApiManager           = require('../sync/quiqr-cloud/cloud-api-manager');
const cloudGitManager           = require('../sync/quiqr-cloud/cloud-git-manager');
const GithubKeyManager          = require('../sync/github/github-key-manager');
const { EnvironmentResolver }   = require('../utils/environment-resolver');
const chokidar                  = require('chokidar');

let api = {};

function bindResponseToContext(promise, context){
  promise.then((result)=>{
    context.resolve(result);
  }, (error)=>{
    context.reject(error);
  })
}

function getSiteService(siteKey, callback){
  return getSiteServicePromise(siteKey).then((data)=>{
    callback(null, data);
  },(e)=>{
    callback(e, (null));
  })
}

function getSiteServicePromise(siteKey){
  return new Promise((resolve, reject)=>{
    configurationDataProvider.get(function(err, configurations){

      if(configurations.empty===true) throw new Error('Configurations is empty.');

      if(err) { reject(err); return; }

      let siteData = configurations.sites.find((x)=>x.key===siteKey);

      if(siteData==null) throw new Error('Could not find site is empty.');

      let siteService = new SiteService(siteData);
      resolve(siteService);
    });
  });
}

function getWorkspaceService(siteKey,
  workspaceKey,
  callback){
  return getWorkspaceServicePromise(siteKey, workspaceKey).then((data)=>{
    callback(null, data);
  },(e)=>{
    callback(e, (null));
  })
}

async function getWorkspaceServicePromise(siteKey, workspaceKey){
  let siteService = await getSiteServicePromise(siteKey);
  let workspaceHead = await siteService.getWorkspaceHead(workspaceKey);
  if(workspaceHead==null){
    return Promise.reject(new Error('Could not find workspace.'));
  }
  else{
    let workspaceService = new WorkspaceService(workspaceHead.path, workspaceHead.key, siteKey);
    return { siteService, workspaceService };
  }
}

function clearWorkSpaceConfigCache(workspaceService){
  workspaceService.clearConfigurationsDataCache();
}

function setWatcher(workspaceService){
  let watchDir = path.join(global.currentSitePath,"quiqr/model");
  const watchOptions = {
    ignored: /(^|[/\\])\../, // ignore dotfiles
    persistent: true
  };

  global.modelDirWatcher = chokidar.watch(watchDir, watchOptions );
  global.modelDirWatcher
    .on('add', () => clearWorkSpaceConfigCache(workspaceService))
    .on('change', () => clearWorkSpaceConfigCache(workspaceService))
    .on('unlink', () => clearWorkSpaceConfigCache(workspaceService));
}

api.checkFreeSiteName = function({proposedSiteName}, context){

  libraryService.checkDuplicateSiteConfAttrStringValue('name', proposedSiteName)
    .then((duplicate)=>{

      let response = {
        proposedSiteName: proposedSiteName,
        nameFree: false,
      }

      if(duplicate){
        response.nameFree = false;
      }
      else{
        response.nameFree = true;
      }
      context.resolve(response)
    })
    .catch((err)=>{
      context.reject(err);
    })
}

api.checkFreeSiteName = function({proposedSiteName}, context){

  libraryService.checkDuplicateSiteConfAttrStringValue('name', proposedSiteName)
    .then((duplicate)=>{

      let response = {
        proposedSiteName: proposedSiteName,
        nameFree: false,
      }

      if(duplicate){
        response.nameFree = false;
      }
      else{
        response.nameFree = true;
      }
      context.resolve(response)
    })
    .catch((err)=>{
      context.reject(err);
    })
}

api.getConfigurations = function(options, context){
  configurationDataProvider.get(function(err, data){
    if(err)
      context.reject(err);
    else
      context.resolve(data);
  }, options);
}

api.getFilteredHugoVersions = async function(_,context){

  const jsonFile = path.join(pathHelper.getApplicationResourcesDir(),"all","filteredHugoVersions.json");
  let filteredVersions = ["v0.100.2"];

  if(fs.existsSync(jsonFile)){
    const jsonContent = await fssimple.readFileSync(jsonFile, {encoding:'utf8', flag:'r'})
    filteredVersions = JSON.parse(jsonContent);
  }

  context.resolve(filteredVersions)
}


api.openFileExplorer = function({path}, context){
  try{
    let lstat = fs.lstatSync(path);
    if(lstat.isDirectory()){
      shell.openPath(path);
    }
    else{
      shell.openPath(dirname(path));
    }
  }
  catch(e){
    context.reject(e);
    console.log(e);
  }
}

api.openFileInEditor = function({path}, context){
  try{
    shell.openPath(path);
  }
  catch(e){
    context.reject(e)
    console.log(e);
  }
}

api.listWorkspaces = async function({siteKey}, context){
  let service = await getSiteServicePromise(siteKey);
  let workspaces = await service.listWorkspaces();
  context.resolve(workspaces);

}

api.getCreatorMessage = async function({siteKey, workspaceKey}, context){

  const { workspaceService } = await getWorkspaceServicePromise(siteKey, workspaceKey);
  const message = await workspaceService.getCreatorMessage();
  context.resolve(message);
}

api.matchRole = async function({role},context){

  try{
    context.resolve((role === global.pogoconf.prefs["applicationRole"]));
  }
  catch(err){
    context.reject(err);
  }
}
api.readConfKey = async function({confkey},context){
  try{
    context.resolve(global.pogoconf[confkey]);
  }
  catch(err){
    context.reject(err);
  }
}

api.readConfPrefKey = async function({confkey},context){
  try{
    context.resolve(global.pogoconf.prefs[confkey]);
  }
  catch(err){
    context.reject(err);
  }
}

api.saveConfPrefKey = async function({prefKey, prefValue}, context){
  global.pogoconf.setPrefkey(prefKey, prefValue);
  global.pogoconf.saveState();
  context.resolve(true);
}

api.getWorkspaceModelParseInfo =  async function({siteKey, workspaceKey}, context){
  const { workspaceService } = await getWorkspaceServicePromise(siteKey, workspaceKey);
  let modelParseInfo;
  modelParseInfo = await workspaceService.getModelParseInfo();
  context.resolve(modelParseInfo);
}


api.getWorkspaceDetails = async function({siteKey, workspaceKey}, context){
  const { workspaceService } = await getWorkspaceServicePromise(siteKey, workspaceKey);
  let configuration;
  try{
    configuration = await workspaceService.getConfigurationsData();
    global.currentSiteKey = siteKey;
    global.currentWorkspaceKey = workspaceKey;
    global.currentSitePath = configuration.path;

    global.pogoconf.setLastOpenedSite(siteKey, workspaceKey, global.currentSitePath);
    global.pogoconf.saveState();

    if(global.modelDirWatcher && typeof global.modelDirWatcher.close === 'function'){
      global.modelDirWatcher.close().then(()=>{
        setWatcher(workspaceService);
      })
    }
    else{
      setWatcher(workspaceService);
    }


  }
  catch(e){
    context.resolve({error: `Could not load workspace configuration (website: ${siteKey}, workspace: ${workspaceKey}). ${e.message}`});
    return;
  }
  try{
    hugoDownloader.downloader.download(configuration.hugover);
  }
  catch(e){
    // warn about HugoDownloader error?
  }
  context.resolve(configuration);
}


api.createKeyPairGithub = async function(_, context){
  let keyPair = await GithubKeyManager.keyPairGen();
  //0 is the private key
  //1 is the public key
  context.resolve({keyPair});
}

api.createKeyPairQC = async function(_, context){
  let pubkey = await cloudGitManager.keygen();
  let environmentResolver = new EnvironmentResolver();
  let pubkey_title = environmentResolver.getUQIS()
  context.resolve({pubkey, pubkey_title});
}

api.createPogoProfile = async function(profile,context){
  let pogopubl = new PogoPublisher({});
  await pogopubl.writeProfile(profile.obj)
  context.resolve(true);
}

api.getQuiqrProfile = async function(_, context){
  let pogopubl = new PogoPublisher({});
  let profile = await pogopubl.readProfile();

  let fingerprint = await cloudGitManager.getKeyFingerprint();

  if(profile && fingerprint){
    context.resolve({profile,fingerprint});
  }
  else{
    context.resolve(false);
  }
}

api.registerPogoUser = async function({postData},context){
  try{
    let userObj = await cloudApiManager.registerPogoUser(postData);
    context.resolve(userObj);
  }
  catch(err){
    context.reject(err);
  }
}

api.deleteSiteFromCloud = async function({postData},context){
  try{
    let result = await cloudApiManager.deleteSiteFromCloud(postData);
    context.resolve(result);
  }
  catch(err){
    context.reject(err);
  }
}

api.disconnectPogoDomain = async function({postData},context){
  try{
    let result = await cloudApiManager.disconnectPogoDomain(postData);
    context.resolve(result);
  }
  catch(err){
    context.reject(err);
  }
}

api.resendConfirmationLinkPogoUser = async function({postData},context){
  try{
    let result = await cloudApiManager.resendConfirmationLinkPogoUser(postData);
    context.resolve(result);
  }
  catch(err){
    context.reject(err);
  }
}

api.registerPogoDomain = async function({postData},context){
  try{
    let path = await cloudApiManager.registerPogoDomain(postData);
    context.resolve(path);
  }
  catch(err){
    context.reject(err);
  }
}

api.connectPogoDomain = async function({postData},context){
  try{
    let domain = await cloudApiManager.connectPogoDomain(postData);
    context.resolve(domain);
  }
  catch(err){
    context.reject(err);
  }
}


api.getCurrentSiteKey = async function(){
  return await global.currentSiteKey;
}

api.createPogoDomainConf = async function({path,domain},context){
  let pogopubl = new PogoPublisher({});
  await pogopubl.writeDomainInfo(path,domain)
  context.resolve(path);
}
api.getCurrentSiteKey = async function(){
  return await global.currentSiteKey;
}



api.getUserRemoteSites = async function({username},context){
  try{
    context.resolve(cloudCacheManager.getUserRemoteSites(username));
  }
  catch(err){
    context.reject(err);
  }
}

api.openSiteLibrary = async function(){
  global.mainWM.closeSiteAndShowSelectSites();
}

api.mountWorkspace = async function({siteKey, workspaceKey}, context){
  let siteService = await getSiteServicePromise(siteKey);
  bindResponseToContext(
    siteService.mountWorkspace(workspaceKey),
    context
  );

  let siteConfig = siteService.getSiteConfig();
  global.currentSiteKey = siteKey;
  global.currentWorkspaceKey = workspaceKey;

  let mainWindow = global.mainWM.getCurrentInstanceOrNew();
  mainWindow.setTitle(`Quiqr - Site: ${siteConfig.name}`);
  //menuManager.updateMenu(siteKey);
  menuManager.createMainMenu();
}

api.setCurrentFormNodePath = async function({path}, context){
  global.currentFormNodePath = path;
  context.resolve(true);
}

api.getCurrentFormNodePath = async function(_, context){
  context.resolve(global.currentFormNodePath)
}

api.setCurrentFormAccordionIndex = async function({index}, context){
  global.currentFormAccordionIndex = index;
  context.resolve(true);
}

api.getCurrentFormAccordionIndex = async function(_, context){
  context.resolve(global.currentFormAccordionIndex)
}

api.shouldReloadForm = async function({reloadFormPath}, context){
  global.currentFormShouldReload = reloadFormPath;
  context.resolve(true);
}

api.reloadCurrentForm = async function(){
  if(global.currentFormNodePath){
    let currentPath = global.currentFormNodePath.endsWith('/') ? global.currentFormNodePath.slice(0, -1) : global.currentFormNodePath;
    currentPath = currentPath.toLowerCase().replace('/','.');
    if(global.currentFormShouldReload === currentPath){
      let mainWindow = global.mainWM.getCurrentInstanceOrNew();
      let urlpath = "/sites/"+mainWindow.webContents.getURL().split("/refresh-form-").shift();
      urlpath = "/sites/"+urlpath.split("/sites/").pop()+"/refresh-form-"+Math.random();
      mainWindow.webContents.send("redirectToGivenLocation", urlpath);
    }
  }
}

api.redirectTo = async function({location,forceRefresh}){
  let mainWindow = global.mainWM.getCurrentInstanceOrNew();
  if(forceRefresh === true){
    mainWindow.webContents.send("redirectToGivenLocation", '/refresh');
  }
  mainWindow.webContents.send("redirectToGivenLocation",location)
}

api.parentMountWorkspace = async function({siteKey, workspaceKey}){
  let mainWindow = global.mainWM.getCurrentInstanceOrNew();
  mainWindow.webContents.send("redirectToGivenLocation",`/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspaceKey)}`)
}

api.parentCloseMobilePreview = function(){
  let mainWindow = global.mainWM.getCurrentInstanceOrNew();
  mainWindow.webContents.send("disableMobilePreview")
}

api.parentTempHideMobilePreview = function(){
  let mainWindow = global.mainWM.getCurrentInstanceOrNew();
  mainWindow.webContents.send("tempHideMobilePreview")
}

api.parentTempUnHideMobilePreview = function(){
  let mainWindow = global.mainWM.getCurrentInstanceOrNew();
  mainWindow.webContents.send("tempUnHideMobilePreview")
}

api.openMobilePreview = function(){
  global.mainWM.openMobilePreview();
}
api.closeMobilePreview = function(){
  global.mainWM.closeMobilePreview();
}

api.updateMobilePreviewUrl = function({url}){
  global.mainWM.setMobilePreviewUrl(url);
}

api.logToConsole = function({message, label}){

  if(label){
    console.log("\b--- " + label.toUpperCase() + " --> ");
  }
  console.log(util.inspect(message, false, null, true));
}


api.importSiteAction = function(){
  pogozipper.importSite()
}

api.importSiteFromPublicGitUrl = function({siteName, url}, context){
  gitImporter.importSiteFromPublicGitUrl(url, siteName)
    .then((siteKey)=>{
      context.resolve(siteKey);
    })
    .catch((err)=>{
      context.reject(err);
    });
}
api.newSiteFromPublicHugoThemeUrl = function({siteName, url, themeInfo, hugoVersion}, context){
  gitImporter.newSiteFromPublicHugoThemeUrl(url, siteName, themeInfo, hugoVersion)
    .then((siteKey)=>{
      context.resolve(siteKey);
    })
    .catch((err)=>{
      context.reject(err);
    });
}

api.newSiteFromLocalDirectory = function({siteName, directory, generateQuiqrModel, hugoVersion}, context){
  folderImporter.newSiteFromLocalDirectory(directory, siteName, generateQuiqrModel, hugoVersion)
    .then((siteKey)=>{
      context.resolve(siteKey);
    })
    .catch((err)=>{
      context.reject(err);
    });
}

api.deleteSite = function({siteKey}, context){
  libraryService.deleteSite(siteKey)
    .then(()=>{
      context.resolve(true);
    })
    .catch((err)=>{
      context.reject(err);
    });
}

api.newSiteFromScratch = function({siteName, hugoVersion, configFormat}, context){
  libraryService.createNewHugoQuiqrSite(siteName, hugoVersion, configFormat)
    .then((siteKey)=>{
      context.resolve(siteKey);
    })
    .catch((err)=>{
      context.reject(err);
    });
}
api.serveWorkspace = function({siteKey, workspaceKey, serveKey}, context){

  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){

    if(err){ context.reject(err); return; }

    if(!workspaceService){ return; }

    workspaceService.serve(serveKey).then(()=>{

      context.resolve();
    }, ()=>{
      context.reject(err); return
    })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.stopHugoServer = function(){
  if(global.hugoServer){
    global.hugoServer.stopIfRunning();
  }
}



api.buildWorkspace = function({siteKey, workspaceKey, buildKey, extraConfig}, context){
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.build(buildKey, extraConfig).then(()=>{
      context.resolve();
    }, ()=>{
      context.reject(err); return
    })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.getSingle = function({siteKey, workspaceKey, singleKey}, context) {
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.getSingle(singleKey).then(r=>{
      context.resolve(r);
    })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.getDynFormFields = async function({searchRootNode, searchLevelKeyVal }, context){
  const { workspaceService } = await getWorkspaceServicePromise(global.currentSiteKey, global.currentWorkspaceKey);
  let configuration;
  try{
    configuration = await workspaceService.getConfigurationsData();

    if(searchRootNode in configuration){
      let dynConf = configuration[searchRootNode].find(x => x[searchLevelKeyVal['key']] === searchLevelKeyVal['val']);
      context.resolve(dynConf);
    }
  }
  catch(e){
    console.log("could not get configuration for dynformfields")
  }
}

api.openSingleInEditor = function({siteKey, workspaceKey, singleKey}, context) {
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.openSingleInEditor(singleKey).then(r=>{
      context.resolve(r);
    })
      .catch((error)=>{
        console.log(error);
        context.reject(error);
      });
  });
}
api.updateSingle = function({siteKey, workspaceKey, singleKey, document}, context) {
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.updateSingle(singleKey, document).then(r=>{
      context.resolve(r);
    })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.listCollectionItems = function({siteKey, workspaceKey, collectionKey}, context){
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.listCollectionItems(collectionKey)
      .then((result)=>{
        context.resolve(result)
      })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.getCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, context){
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.getCollectionItem(collectionKey, collectionItemKey)
      .then((result)=>{
        context.resolve(result);
      })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.createCollectionItemKey = function({siteKey, workspaceKey, collectionKey, collectionItemKey, itemTitle}, context) {
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.createCollectionItemKey(collectionKey, collectionItemKey, itemTitle)
      .then((result)=>{
        context.resolve(result);
      })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.openFileDialogForCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, context) {
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.openCollectionItemInEditor(collectionKey, collectionItemKey)
      .then((result)=>{
        context.resolve(result);
      })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.updateCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, document}, context) {
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.updateCollectionItem(collectionKey, collectionItemKey, document)
      .then((result)=>{
        context.resolve(result);
      })
      .catch((error)=>{
        context.reject(error);
      });
  });
}
api.copyFilesIntoCollectionItem = function ({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, files, forceFileName }, context){
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.copyFilesIntoCollectionItem(collectionKey, collectionItemKey, targetPath, files, forceFileName)
      .then((result)=>{
        context.resolve(result);
      })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.deleteCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, context) {
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.deleteCollectionItem(collectionKey, collectionItemKey)
      .then((result)=>{
        context.resolve({deleted:result});
      })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.makePageBundleCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, context) {
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.makePageBundleCollectionItem(collectionKey, collectionItemKey)
      .then((result)=>{
        context.resolve({deleted:result});
      })
      .catch((error)=>{
        context.reject(error);
      });
  });
}
api.renameCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey}, context) {
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ context.reject(err); return; }
    workspaceService.renameCollectionItem(collectionKey, collectionItemKey, collectionItemNewKey)
      .then((result)=>{
        context.resolve(result);
      })
      .catch((error)=>{
        context.reject(error);
      });
  });
}

api.getFilesFromAbsolutePath = function({path},promise){

  getWorkspaceService(global.currentSiteKey, global.currentWorkspaceKey, function(err, {workspaceService}){
    if(err){ promise.reject(err); return; }
    workspaceService.getFilesFromAbsolutePath(path)
      .then((result)=>{
        promise.resolve(result);
      })
      .catch((error)=>{
        promise.reject(error);
      });
  });

}


api.quiqr_git_repo_show = function({url}, promise){
  Embgit.repo_show_quiqrsite(url)
    .then((response)=>{
      promise.resolve(response);
    })
    .catch((err)=>{
      promise.reject(err);
    })
}

api.hugotheme_git_repo_show = function({url}, promise){
  Embgit.repo_show_hugotheme(url)
    .then((response)=>{
      promise.resolve(response);
    })
    .catch((err)=>{
      promise.reject(err);
    })
}

api.hugosite_dir_show = function({folder}, promise){

  folderImporter.siteDirectoryInspect(folder)
    .then((response)=>{
      promise.resolve(response);
    })
    .catch((err)=>{
      promise.reject(err);
    })
}

api.getFilesInBundle = function({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, extensions, forceFileName}, promise){
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ promise.reject(err); return; }
    workspaceService.getFilesInBundle(collectionKey, collectionItemKey, targetPath, extensions, forceFileName)
      .then((result)=>{
        promise.resolve(result);
      })
      .catch((error)=>{
        promise.reject(error);
      });
  });
}
api.getThumbnailForPath = function({siteKey, workspaceKey, targetPath}, promise){
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ promise.reject(err); return; }

    workspaceService.getThumbnailForAbsoluteImgPath(path.join(workspaceService.getWorkspacePath(),targetPath), targetPath)
      .then((result)=>{
        promise.resolve(result);
      })
      .catch((error)=>{
        console.log(error)
        //promise.reject(error);
      });
  });
}
api.getThumbnailForCollectionOrSingleItemImage = function({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath}, promise){
  getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
    if(err){ promise.reject(err); return; }
    workspaceService.getThumbnailForCollectionOrSingleItemImage(collectionKey, collectionItemKey, targetPath)
      .then((result)=>{
        promise.resolve(result);
      })
      .catch((error)=>{
        promise.reject(error);
      });
  });
}

api.invalidateCache = function(){
  configurationDataProvider.invalidateCache();
}

api.setPublishStatus = async function({status}, context){
  let pogopubl = new PogoPublisher({});
  await pogopubl.writePublishStatus(status)
  context.resolve(true);
}

api.genereateEtalageImages = async function({siteKey, workspaceKey}, context){
  const { workspaceService } = await getWorkspaceServicePromise(siteKey, workspaceKey);
  workspaceService.genereateEtalageImages();
  context.resolve(true);
}

api.saveSiteConf = function({siteKey, newConf}, context){
  libraryService.writeSiteConf(newConf, siteKey)
    .then(()=>{
      context.resolve();
    })
    .catch((err)=>{
      context.reject(err);
    });
}

api.publishSite = function({siteKey, publishConf}, context){
  getSiteService(siteKey, function(err, siteService){
    if(err){ context.reject(err); return; }

    global.pogoconf.setLastOpenedPublishTargetForSite(siteKey, publishConf.key);
    global.pogoconf.saveState();

    siteService.publish(publishConf).then(()=>{
      context.resolve();
    }, ()=>{
      context.reject(err);
    });
  });
}


api.cloneRemoteAsManagedSite = async function({cloudPath, siteName}, context){
  try{
    let newConf = await cloudGitManager.clonePogoCloudSite(cloudPath, siteName, true);
    cloudCacheManager.updateRemoteSiteCache(newConf, global.pogoconf.currentUsername);
    context.resolve(newConf);
  }
  catch(err){
    context.reject(err);
  }
}

api.cloneRemoteAsUnmanagedSite = async function({cloudPath, siteName}, context){
  try{
    let newConf = await cloudGitManager.clonePogoCloudSite(cloudPath, siteName, false);
    context.resolve(newConf);
  }
  catch(err){
    context.reject(err);
  }
}

module.exports = api;
