import mainProcessBridge from './utils/main-process-bridge';
import type { AbortablePromise } from './utils/main-process-bridge';
import service from './services/service'

export class API {

  getConfigurations(options?: {invalidateCache: bool}): AbortablePromise<Configurations>{
    return mainProcessBridge.request('getConfigurations', options);
  }

  listWorkspaces(siteKey: string){
    return mainProcessBridge.request('listWorkspaces', {siteKey});
  }

  getWorkspaceModelParseInfo(siteKey: string, workspaceKey: string): AbortablePromise<WorkspaceConfig>{
    return mainProcessBridge.request('getWorkspaceModelParseInfo', {siteKey, workspaceKey});
  }

  getWorkspaceDetails(siteKey: string, workspaceKey: string): AbortablePromise<WorkspaceConfig>{
    return mainProcessBridge.request('getWorkspaceDetails', {siteKey, workspaceKey});
  }

  serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string){
    return mainProcessBridge.request('serveWorkspace', {siteKey, workspaceKey, serveKey});
  }

  logToConsole( message, label){
    return mainProcessBridge.request('logToConsole', {message, label});
  }

  getDynFormFields(searchRootNode: string, searchLevelKeyVal: any){
    return mainProcessBridge.request('getDynFormFields', {searchRootNode, searchLevelKeyVal});
  }

  importSite(){
    return mainProcessBridge.request('importSiteAction');
  }

  importSiteFromPublicGitUrl(siteName: string, url: string){
    return mainProcessBridge.request('importSiteFromPublicGitUrl', {siteName, url});
  }

  newSiteFromPublicHugoThemeUrl(siteName: string, url: string, themeInfo: any){
    return mainProcessBridge.request('newSiteFromPublicHugoThemeUrl', {siteName, url, themeInfo});
  }

  getCurrentSiteKey(){
    return mainProcessBridge.request('getCurrentSiteKey');
  }

  openMobilePreview(){
    return mainProcessBridge.request('openMobilePreview');
  }

  closeMobilePreview(){
    return mainProcessBridge.request('closeMobilePreview');
  }

  updateMobilePreviewUrl( url: string){
    return mainProcessBridge.request('updateMobilePreviewUrl', {url});
  }

  buildWorkspace(siteKey: string, workspaceKey: string, buildKey: string, extraConfig: any){
    return mainProcessBridge.request('buildWorkspace', {siteKey, workspaceKey, buildKey, extraConfig});
  }

  saveSingle(siteKey: string, workspaceKey: string, singleKey: string, document: string){
    return mainProcessBridge.request('saveSingle', {siteKey, workspaceKey, singleKey, document});
  }

  hasPendingRequests(){
    return mainProcessBridge.pendingCallbacks.length;
  }

  getSingle(siteKey: string, workspaceKey: string, singleKey: string){
    return mainProcessBridge.request('getSingle', {siteKey, workspaceKey, singleKey});
  }

  openSingleInEditor(siteKey: string, workspaceKey: string, singleKey: string){
    return mainProcessBridge.request('openSingleInEditor', {siteKey, workspaceKey, singleKey});
  }
  updateSingle(siteKey: string, workspaceKey: string, singleKey: string, document: any){
    return mainProcessBridge.request('updateSingle', {siteKey, workspaceKey, singleKey, document});
  }

  listCollectionItems(siteKey: string, workspaceKey: string, collectionKey: string){
    return mainProcessBridge.request('listCollectionItems', {siteKey, workspaceKey, collectionKey});
  }

  getCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string){
    return mainProcessBridge.request('getCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
  }

  openCollectionItemInEditor(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string){
    return mainProcessBridge.request('openFileDialogForCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
  }

  updateCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, document: any){
    return mainProcessBridge.request('updateCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, document});
  }

  createCollectionItemKey(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, itemTitle: string){
    return mainProcessBridge.request('createCollectionItemKey', {siteKey, workspaceKey, collectionKey, collectionItemKey, itemTitle});
  }

  deleteCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string){
    return mainProcessBridge.request('deleteCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
  }

  makePageBundleCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string){
    return mainProcessBridge.request('makePageBundleCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
  }

  matchRole(role: string){
    return mainProcessBridge.request('matchRole', {role});
  }

  readConfKey(confkey: string){
    return mainProcessBridge.request('readConfKey', {confkey});
  }

  readConfPrefKey(confkey: string){
    return mainProcessBridge.request('readConfPrefKey', {confkey});
  }

  checkFreeSiteName(proposedSiteName: string){
    return mainProcessBridge.request('checkFreeSiteName', {proposedSiteName});
  }

  saveConfPrefKey(prefKey: string, prefValue: string){
    return mainProcessBridge.request('saveConfPrefKey', {prefKey, prefValue});
  }

  renameCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, collectionItemNewKey: string){
    return mainProcessBridge.request('renameCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey});
  }

  openFileInEditor(path: string){
    mainProcessBridge.requestVoid('openFileInEditor', {path});
  }

  openFileExplorer(path: string){
    mainProcessBridge.requestVoid('openFileExplorer', {path});
  }

  openFileDialogForSingleAndCollectionItem(
    siteKey: string,
    workspaceKey: string,
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string,
    { title, extensions }:{title: string, extensions: Array<string>},
    forceFileName: string
  ){

    let properties = ['openFile'];
    if(!forceFileName){
      properties = ['multiSelections', 'openFile'];
    }

    let remote= window.require('electron').remote;

    let openDialogOptions = {
      title: title || 'Select Files',
      properties: properties,
      filters: [ {name:'Allowed Extensions', extensions: extensions }]
    };

    return (

      new Promise((resolve)=>{

        remote.dialog.showOpenDialog(
          remote.getCurrentWindow(),
          openDialogOptions,
        ).then((result)=>{
          if(result.filePaths){
            let files = result.filePaths;
            resolve(
              mainProcessBridge.request('copyFilesIntoCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, files, forceFileName })
            );
          }
        }).catch(err => {
          service.api.logToConsole(err);
        });

      })

    );
  }
  quiqr_git_repo_show(url: string){
    return mainProcessBridge.request('quiqr_git_repo_show', {url}, {timeout: 30000});
  }

  hugotheme_git_repo_show(url: string){
    return mainProcessBridge.request('hugotheme_git_repo_show', {url}, {timeout: 30000});
  }

  getThumbnailForPath(siteKey: string, workspaceKey: string, targetPath: string){
    return mainProcessBridge.request('getThumbnailForPath', {siteKey, workspaceKey, targetPath}, {timeout: 30000});
  }
  getThumbnailForCollectionOrSingleItemImage(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, targetPath: string){
    return mainProcessBridge.request('getThumbnailForCollectionOrSingleItemImage', {siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath}, {timeout: 30000});
  }

  getFilesInBundle(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, targetPath: string, extensions: any, forceFileName: string){
    return mainProcessBridge.request('getFilesInBundle', {siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, extensions, forceFileName});
  }

  getFilesFromAbsolutePath(path: string){
    return mainProcessBridge.request('getFilesFromAbsolutePath', {path}, {timeout: 30000});
  }

  createSite(siteConfig: any){
    return mainProcessBridge.request('createSite', siteConfig);
  }

  saveSiteConf(siteKey: string, newConf: any){
    return mainProcessBridge.request('saveSiteConf', {siteKey, newConf});
  }

  publishSite(siteKey: string, publishConf: any){
    return mainProcessBridge.request('publishSite', {siteKey, publishConf}, {timeout: 30000});
  }

  setPublishStatus(status){
    return mainProcessBridge.request('setPublishStatus', {status});
  }
  parentCloseMobilePreview(){
    return mainProcessBridge.request('parentCloseMobilePreview', {})
  }
  parentTempHideMobilePreview(){
    return mainProcessBridge.request('parentTempHideMobilePreview', {})
  }
  parentTempUnHideMobilePreview(){
    return mainProcessBridge.request('parentTempUnHideMobilePreview', {})
  }

  getCreatorMessage(siteKey: string, workspaceKey: string){
    return mainProcessBridge.request('getCreatorMessage', {siteKey, workspaceKey});
  }

  getHugoTemplates(){
    return mainProcessBridge.request('getHugoTemplates', null, {timeout: 30000});
  }

  openSiteLibrary(){
    return mainProcessBridge.request('openSiteLibrary');
  }

  mountWorkspace(siteKey: string, workspaceKey: string){
    return mainProcessBridge.request('mountWorkspace', {siteKey, workspaceKey});
  }

  shouldReloadForm(reloadFormPath: string){
    return mainProcessBridge.request('shouldReloadForm', {reloadFormPath});
  }

  setCurrentFormAccordionIndex(index: string){
    return mainProcessBridge.request('setCurrentFormAccordionIndex', {index});
  }

  getCurrentFormAccordionIndex(){
    return mainProcessBridge.request('getCurrentFormAccordionIndex', {});
  }

  setCurrentFormNodePath(path: string){
    return mainProcessBridge.request('setCurrentFormNodePath', {path});
  }

  getCurrentFormNodePath(){
    return mainProcessBridge.request('getCurrentFormNodePath', {});
  }
  reloadCurrentForm(){
    return mainProcessBridge.request('reloadCurrentForm', {});
  }

  redirectTo(location, forceRefresh){
    return mainProcessBridge.request('redirectTo', {location, forceRefresh});
  }
  parentMountWorkspace(siteKey: string, workspaceKey: string){
    return mainProcessBridge.request('parentMountWorkspace', {siteKey, workspaceKey});
  }

  createKeyPairGithub(){

    return mainProcessBridge.request('createKeyPairGithub',{}, {timeout:90000});
  }

  createKeyPairQC(){
    return mainProcessBridge.request('createKeyPairQC',{}, {timeout:90000});
  }

  createPogoProfile(obj: any){
    return mainProcessBridge.request('createPogoProfile',{obj});
  }

  registerPogoUser(postData){
    return mainProcessBridge.request('registerPogoUser',{postData});
  }

  resendConfirmationLinkPogoUser(postData){
    return mainProcessBridge.request('resendConfirmationLinkPogoUser',{postData});
  }

  registerPogoDomain(postData){
    return mainProcessBridge.request('registerPogoDomain',{postData});
  }

  connectPogoDomain(postData){
    return mainProcessBridge.request('connectPogoDomain',{postData});
  }

  deleteSiteFromCloud(postData){
    return mainProcessBridge.request('deleteSiteFromCloud',{postData});
  }

  disconnectPogoDomain(postData){
    return mainProcessBridge.request('disconnectPogoDomain',{postData});
  }

  createPogoDomainConf(path: string, domain: string){
    return mainProcessBridge.request('createPogoDomainConf',{path, domain});
  }

  getQuiqrProfile(){
    return mainProcessBridge.request('getQuiqrProfile');
  }

  cloneRemoteAsManagedSite(cloudPath: string, siteName: string){
    return mainProcessBridge.request('cloneRemoteAsManagedSite',{cloudPath, siteName}, {timeout: 1000000});
  }

  cloneRemoteAsUnmanagedSite(cloudPath: string, siteName: string){
    return mainProcessBridge.request('cloneRemoteAsUnmanagedSite',{cloudPath, siteName}, {timeout: 1000000});
  }

  getUserRemoteSites(username){
    return mainProcessBridge.request('getUserRemoteSites',{username});
  }
  invalidateCache(){
    return mainProcessBridge.request('invalidateCache');
  }

}

export const instance = new API();
