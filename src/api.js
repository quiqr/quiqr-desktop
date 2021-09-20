import mainProcessBridge from './utils/main-process-bridge';
import type { AbortablePromise } from './utils/main-process-bridge';

export class API {

  getConfigurations(options?: {invalidateCache: bool}): AbortablePromise<Configurations>{
    return mainProcessBridge.request('getConfigurations', options);
  }

  listWorkspaces(siteKey: string){
    return mainProcessBridge.request('listWorkspaces', {siteKey});
  }

  getWorkspaceDetails(siteKey: string, workspaceKey: string): AbortablePromise<WorkspaceConfig>{
    return mainProcessBridge.request('getWorkspaceDetails', {siteKey, workspaceKey});
  }

  serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string){
    return mainProcessBridge.request('serveWorkspace', {siteKey, workspaceKey, serveKey});
  }

  logToConsole( message: string){
    return mainProcessBridge.request('logToConsole', {message});
  }

  getDynFormFields(searchFormObjectFile: string, searchRootNode: string, searchLevelKeyVal: any){
    return mainProcessBridge.request('getDynFormFields', {searchFormObjectFile, searchRootNode, searchLevelKeyVal});
  }

  importSite(){
    return mainProcessBridge.request('importSiteAction');
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

  buildWorkspace(siteKey: string, workspaceKey: string, buildKey: string){
    return mainProcessBridge.request('buildWorkspace', {siteKey, workspaceKey, buildKey});
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

  renameCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, collectionItemNewKey: string){
    return mainProcessBridge.request('renameCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey});
  }

  openFileExplorer(path: string){
    mainProcessBridge.requestVoid('openFileExplorer', {path});
  }

  openFileDialogForCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string,
    targetPath: string, { title, extensions }:{title: string, extensions: Array<string>}){
    let remote= window.require('electron').remote;
    let openDialogOptions = {
      title:title||'Select Files',
      properties:['multiSelections','openFile'],
      filters:[{name:'Allowed Extensions', extensions: extensions }]
    };
    return (new Promise((resolve)=>{
      remote.dialog.showOpenDialog(
        remote.getCurrentWindow(),
        openDialogOptions,
        (files)=> resolve(files)
      );
    })).then((files)=>{
      if(files) return mainProcessBridge.request('copyFilesIntoCollectionItem',
        {siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, files });
    });
  }

  getThumbnailForCollectionItemImage(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, targetPath: string){
    return mainProcessBridge.request('getThumbnailForCollectionItemImage', {siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath}, {timeout: 30000});
  }

  getPogoConfKey(confkey: string){
    return mainProcessBridge.request('getPogoConfKey', {confkey});
  }
  createSite(siteConfig: any){
    return mainProcessBridge.request('createSite', siteConfig);
  }

  publishSite(siteKey: string, publishKey: string){
    return mainProcessBridge.request('publishSite', {siteKey, publishKey});
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

  mountWorkspace(siteKey: string, workspaceKey: string){
    return mainProcessBridge.request('mountWorkspace', {siteKey, workspaceKey});
  }

  parentMountWorkspace(siteKey: string, workspaceKey: string){
    return mainProcessBridge.request('parentMountWorkspace', {siteKey, workspaceKey});
  }

  createKeyPair(){
    return mainProcessBridge.request('createKeyPair',{}, {timeout:90000});
  }

  createPogoProfile(obj: any){
    return mainProcessBridge.request('createPogoProfile',{obj});
  }

  createPogoDomainConf(path: string, domain: string){
    return mainProcessBridge.request('createPogoDomainConf',{path, domain});
  }

  getPoppyGoProfile(){
    return mainProcessBridge.request('getPoppyGoProfile',{});
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
