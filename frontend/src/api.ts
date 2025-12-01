import mainProcessBridge from './utils/main-process-bridge';
import type { ReadConfKeyMap } from '../types';

export class API {

  getConfigurations(options?: {invalidateCache: boolean}) {
    return mainProcessBridge.request('getConfigurations', options);
  }

  listWorkspaces(siteKey: string){
    return mainProcessBridge.request('listWorkspaces', {siteKey});
  }

  getWorkspaceModelParseInfo(siteKey: string, workspaceKey: string) {
    return mainProcessBridge.request('getWorkspaceModelParseInfo', {siteKey, workspaceKey});
  }

  getWorkspaceDetails(siteKey: string, workspaceKey: string) {
    return mainProcessBridge.request('getWorkspaceDetails', {siteKey, workspaceKey});
  }

  getPreviewCheckConfiguration() {
    return mainProcessBridge.request('getPreviewCheckConfiguration', {});
  }

  serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string){
    return mainProcessBridge.request('serveWorkspace', {siteKey, workspaceKey, serveKey});
  }

  stopHugoServer(){
    return mainProcessBridge.request('stopHugoServer', {}, {timeout:100000});
  }

  showLogWindow(){
    return mainProcessBridge.request('showLogWindow', {});
  }

  logToConsole( message, label = ""){
    return mainProcessBridge.request('logToConsole', {message, label}, {timeout: 1000});
  }

  getDynFormFields(searchRootNode: string, searchLevelKeyVal: any){
    return mainProcessBridge.request('getDynFormFields', {searchRootNode, searchLevelKeyVal});
  }

  importSite(){
    return mainProcessBridge.request('importSiteAction', {});
  }

  getFilteredHugoVersions(){
    return mainProcessBridge.request('getFilteredHugoVersions', {});
  }

  importSiteFromPrivateGitRepo(gitOrg: string, gitRepo: string, privKey: string, gitEmail: string, saveSyncTarget: boolean, siteName: string){
    return mainProcessBridge.request('importSiteFromPrivateGitRepo', {gitOrg, gitRepo, privKey, gitEmail, saveSyncTarget,siteName}, {timeout: 1000000});
  }

  importSiteFromPublicGitUrl(siteName: string, url: string){
    return mainProcessBridge.request('importSiteFromPublicGitUrl', {siteName, url}, {timeout: 1000000});
  }

  newSiteFromPublicHugoThemeUrl(siteName: string, url: string, themeInfo: any, hugoVersion){
    return mainProcessBridge.request('newSiteFromPublicHugoThemeUrl', {siteName, url, themeInfo, hugoVersion});
  }

  newSiteFromLocalDirectory(siteName: string, directory: string, generateQuiqrModel: boolean, hugoVersion: string){
    return mainProcessBridge.request('newSiteFromLocalDirectory', {siteName, directory, generateQuiqrModel, hugoVersion});
  }

  deleteSite(siteKey: string){
    return mainProcessBridge.request('deleteSite', {siteKey});
  }
  newSiteFromScratch(siteName: string, hugoVersion, configFormat){
    return mainProcessBridge.request('newSiteFromScratch', {siteName, hugoVersion, configFormat});
  }

  getCurrentBaseUrl(){
    return mainProcessBridge.request('getCurrentBaseUrl', {});
  }

  getCurrentSiteKey(){
    return mainProcessBridge.request('getCurrentSiteKey', {});
  }

  globSync(pattern, options){
    return mainProcessBridge.request('globSync', {pattern, options});
  }

  parseFileToObject(file){
    return mainProcessBridge.request('parseFileToObject', {file});
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

  getSingle(siteKey: string, workspaceKey: string, singleKey: string, fileOverride: string){
    return mainProcessBridge.request('getSingle', {siteKey, workspaceKey, singleKey, fileOverride});
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

  buildCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, buildAction: string){
    return mainProcessBridge.request('buildCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, buildAction});
  }
  buildSingle(siteKey: string, workspaceKey: string, singleKey: string, buildAction: string){
    return mainProcessBridge.request('buildSingle', {siteKey, workspaceKey, singleKey, buildAction});
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

  readConfKey<K extends keyof ReadConfKeyMap>(confkey: K): Promise<ReadConfKeyMap[K]> {
    return mainProcessBridge.request('readConfKey', {confkey}) as Promise<ReadConfKeyMap[K]>;
  }

  readConfPrefKey(confkey: string){
    return mainProcessBridge.request('readConfPrefKey', {confkey});
  }

  checkFreeSiteName(proposedSiteName: string){
    return mainProcessBridge.request('checkFreeSiteName', {proposedSiteName});
  }

  saveConfPrefKey(prefKey: string, prefValue: unknown){
    return mainProcessBridge.request('saveConfPrefKey', {prefKey, prefValue});
  }

  renameCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, collectionItemNewKey: string){
    return mainProcessBridge.request('renameCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey});
  }
  copyCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, collectionItemNewKey: string){
    return mainProcessBridge.request('copyCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey});
  }

  copyCollectionItemToLang(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, collectionItemNewKey: string, destLang: string){
    return mainProcessBridge.request('copyCollectionItemToLang', {siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey, destLang});
  }

  openFileInEditor(filepath: string, create: boolean = false, relativeToRoot: boolean = false){
    mainProcessBridge.requestVoid('openFileInEditor', {filepath, create, relativeToRoot});
  }

  openFileExplorer(filepath: string, relativeToRoot: false){
    mainProcessBridge.requestVoid('openFileExplorer', {filepath, relativeToRoot});
  }

  openFileDialogForSingleAndCollectionItem(
    siteKey: string,
    workspaceKey: string,
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string,
    { title, extensions }:{title: string, extensions: Array<string>},
    forceFileName?: string
  ){

    let properties = ['openFile'];
    if(!forceFileName){
      properties = ['multiSelections', 'openFile'];
    }

    let remote= window.require('@electron/remote');

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
          this.logToConsole(err, 'copyFilesIntoCollectionItemFromDialog error');
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

  hugosite_dir_show(folder: string){
    return mainProcessBridge.request('hugosite_dir_show', {folder}, {timeout: 30000});
  }
  openCustomCommand(command: string){
    return mainProcessBridge.request('openCustomCommand', {command});
  }

  openExternal(url: string) {
    return mainProcessBridge.request('openExternal', { url });
  }

  getThumbnailForPath(siteKey: string, workspaceKey: string, targetPath: string){
    return mainProcessBridge.request('getThumbnailForPath', {siteKey, workspaceKey, targetPath}, {timeout: 400000});
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

  saveSiteConf(siteKey: string, newConf: any){
    return mainProcessBridge.request('saveSiteConf', {siteKey, newConf});
  }

  copySite(siteKey: string, newConf: any){
    return mainProcessBridge.request('copySite', {siteKey, newConf});
  }

  /*
  mergeSiteWithRemote(siteKey: string, publishConf: any){
    return mainProcessBridge.request('mergeSiteWithRemote', {siteKey, publishConf}, {timeout: 130000});
  }

  publishSite(siteKey: string, publishConf: any){
    return mainProcessBridge.request('publishSite', {siteKey, publishConf}, {timeout: 130000});
  }
  */

  getSiteConfig(siteKey: string){
    return mainProcessBridge.request('getSiteConfig', {siteKey});
  }

  getLanguages(siteKey: string, workspaceKey: string){
    return mainProcessBridge.request('getLanguages', {siteKey, workspaceKey});
  }

  publisherDispatchAction(siteKey: string, publishConf: any, action: string, actionParameters: any, timeout: any){
    if(!Number.isInteger(timeout)){
      timeout=130000;
    }
    return mainProcessBridge.request('publisherDispatchAction', {siteKey, publishConf, action, actionParameters}, {timeout: timeout});
  }

  getCreatorMessage(siteKey: string, workspaceKey: string){
    return mainProcessBridge.request('getCreatorMessage', {siteKey, workspaceKey});
  }

  getHugoTemplates(){
    return mainProcessBridge.request('getHugoTemplates', null, {timeout: 30000});
  }

  openSiteLibrary(){
    return mainProcessBridge.request('openSiteLibrary', {}, {timeout: 100000 });
  }
  showMenuBar(){
    return mainProcessBridge.request('showMenuBar', {});
  }
  hideMenuBar(){
    return mainProcessBridge.request('hideMenuBar', {});
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
    return mainProcessBridge.request('redirectTo', {location, forceRefresh}, {timeout: 10000});
  }
  parentMountWorkspace(siteKey: string, workspaceKey: string){
    return mainProcessBridge.request('parentMountWorkspace', {siteKey, workspaceKey});
  }

  reloadThemeStyle(){
    return mainProcessBridge.request('reloadThemeStyle', {});
  }

  createKeyPairGithub(){

    return mainProcessBridge.request('createKeyPairGithub',{}, {timeout:90000});
  }

  invalidateCache(){
    return mainProcessBridge.request('invalidateCache', {});
  }

  updateCommunityTemplates() {
    return mainProcessBridge.request('updateCommunityTemplates', {});
  }

  showOpenFolderDialog() {
    return mainProcessBridge.request('showOpenFolderDialog', {});
  }

}

export const instance = new API();
