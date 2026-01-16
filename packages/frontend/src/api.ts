import { request } from './utils/main-process-bridge';
import type { ReadConfKeyMap } from '../types';


export function getConfigurations(options?: {invalidateCache: boolean}) {
  return request('getConfigurations', options);
}

export function listWorkspaces(siteKey: string){
  return request('listWorkspaces', {siteKey});
}

export function getWorkspaceModelParseInfo(siteKey: string, workspaceKey: string) {
  return request('getWorkspaceModelParseInfo', {siteKey, workspaceKey});
}

export function getWorkspaceDetails(siteKey: string, workspaceKey: string) {
  return request('getWorkspaceDetails', {siteKey, workspaceKey});
}

export function getPromptTemplateConfig(siteKey: string, workspaceKey: string, templateKey: string) {
  return request('getPromptTemplateConfig', {siteKey, workspaceKey, templateKey});
}

export function processAiPrompt(
  siteKey: string,
  workspaceKey: string,
  templateKey: string,
  formValues: Record<string, unknown>,
  context: {
    collectionKey?: string;
    collectionItemKey?: string;
    singleKey?: string;
  }
) {
  return request('processAiPrompt', {
    siteKey,
    workspaceKey,
    templateKey,
    formValues,
    context
  });
}

export function updatePageFromAiResponse(
  siteKey: string,
  workspaceKey: string,
  aiResponse: string,
  context: {
    collectionKey?: string;
    collectionItemKey?: string;
    singleKey?: string;
  }
) {
  return request('updatePageFromAiResponse', {
    siteKey,
    workspaceKey,
    aiResponse,
    context
  });
}

export function getPreviewCheckConfiguration() {
  return request('getPreviewCheckConfiguration', {});
}

export function serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string){
  return request('serveWorkspace', {siteKey, workspaceKey, serveKey});
}

export function stopHugoServer(){
  return request('stopHugoServer', {}, {timeout:100000});
}

export function showLogWindow(){
  return request('showLogWindow', {});
}

export function logToConsole( message, label = ""){
  return request('logToConsole', {message, label}, {timeout: 1000});
}

export function getDynFormFields(searchRootNode: string, searchLevelKeyVal: any){
  return request('getDynFormFields', {searchRootNode, searchLevelKeyVal});
}

export function importSite(){
  return request('importSiteAction', {});
}

/**
   * @deprecated Use getFilteredSSGVersions instead
   */
export function getFilteredHugoVersions(){
  return request('getFilteredHugoVersions', {});
}

/**
   * Get filtered versions for a specific SSG type
   */
export function getFilteredSSGVersions(ssgType: string) {
  return request('getFilteredSSGVersions', { ssgType });
}

/**
   * @deprecated Use checkSSGVersion instead
   */
export function checkHugoVersion(version: string) {
  return request('checkHugoVersion', { version });
}

/**
   * Check if an SSG version is installed
   */
export function checkSSGVersion(ssgType: string, version: string) {
  return request('checkSSGVersion', { ssgType, version });
}

export function importSiteFromPrivateGitRepo(
  gitBaseUrl: string,
  gitOrg: string,
  gitRepo: string,
  privKey: string,
  gitEmail: string,
  saveSyncTarget: boolean,
  siteName: string,
  protocol: 'ssh' | 'https' = 'ssh',
  sshPort: number = 22,
  gitProvider: 'github' | 'gitlab' | 'forgejo' | 'generic' = 'generic'
){
  return request('importSiteFromPrivateGitRepo', {gitBaseUrl, gitOrg, gitRepo, privKey, gitEmail, saveSyncTarget, siteName, protocol, sshPort, gitProvider}, {timeout: 1000000});
}

export function importSiteFromPublicGitUrl(siteName: string, url: string){
  return request('importSiteFromPublicGitUrl', {siteName, url}, {timeout: 1000000});
}

export function newSiteFromPublicHugoThemeUrl(siteName: string, url: string, themeInfo: any, hugoVersion){
  return request('newSiteFromPublicHugoThemeUrl', {siteName, url, themeInfo, hugoVersion});
}

export function newSiteFromLocalDirectory(siteName: string, directory: string, generateQuiqrModel: boolean, hugoVersion: string){
  return request('newSiteFromLocalDirectory', {siteName, directory, generateQuiqrModel, hugoVersion});
}

export function deleteSite(siteKey: string){
  return request('deleteSite', {siteKey});
}
export function newSiteFromScratch(siteName: string, hugoVersion, configFormat){
  return request('newSiteFromScratch', {siteName, hugoVersion, configFormat});
}

export function getCurrentBaseUrl(){
  return request('getCurrentBaseUrl', {});
}

export function getCurrentSiteKey(){
  return request('getCurrentSiteKey', {});
}

export function globSync(pattern, options){
  return request('globSync', {pattern, options});
}

export function parseFileToObject(file){
  return request('parseFileToObject', {file});
}

export function buildWorkspace(siteKey: string, workspaceKey: string, buildKey: string, extraConfig: any){
  return request('buildWorkspace', {siteKey, workspaceKey, buildKey, extraConfig});
}

export function saveSingle(siteKey: string, workspaceKey: string, singleKey: string, document: string){
  return request('saveSingle', {siteKey, workspaceKey, singleKey, document});
}

export function getSingle(siteKey: string, workspaceKey: string, singleKey: string, fileOverride: string){
  return request('getSingle', {siteKey, workspaceKey, singleKey, fileOverride});
}

export function openSingleInEditor(siteKey: string, workspaceKey: string, singleKey: string){
  return request('openSingleInEditor', {siteKey, workspaceKey, singleKey});
}
export function updateSingle(siteKey: string, workspaceKey: string, singleKey: string, document: any){
  return request('updateSingle', {siteKey, workspaceKey, singleKey, document});
}

export function listCollectionItems(siteKey: string, workspaceKey: string, collectionKey: string){
  return request('listCollectionItems', {siteKey, workspaceKey, collectionKey});
}

export function getCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string){
  return request('getCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
}

export function openCollectionItemInEditor(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string){
  return request('openFileDialogForCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
}

export function buildCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, buildAction: string){
  return request('buildCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, buildAction});
}
export function buildSingle(siteKey: string, workspaceKey: string, singleKey: string, buildAction: string){
  return request('buildSingle', {siteKey, workspaceKey, singleKey, buildAction});
}

export function updateCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, document: any){
  return request('updateCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, document});
}

export function createCollectionItemKey(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, itemTitle: string){
  return request('createCollectionItemKey', {siteKey, workspaceKey, collectionKey, collectionItemKey, itemTitle});
}

export function deleteCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string){
  return request('deleteCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
}

export function makePageBundleCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string){
  return request('makePageBundleCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey});
}

export function matchRole(role: string){
  return request('matchRole', {role});
}

export function readConfKey<K extends keyof ReadConfKeyMap>(confkey: K): Promise<ReadConfKeyMap[K]> {
  return request('readConfKey', {confkey}) as Promise<ReadConfKeyMap[K]>;
}

export function readConfPrefKey(confkey: string){
  return request('readConfPrefKey', {confkey});
}

export function checkFreeSiteName(proposedSiteName: string){
  return request('checkFreeSiteName', {proposedSiteName});
}

export function saveConfPrefKey(prefKey: string, prefValue: unknown){
  return request('saveConfPrefKey', {prefKey, prefValue});
}

export function renameCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, collectionItemNewKey: string){
  return request('renameCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey});
}
export function copyCollectionItem(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, collectionItemNewKey: string){
  return request('copyCollectionItem', {siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey});
}

export function copyCollectionItemToLang(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, collectionItemNewKey: string, destLang: string){
  return request('copyCollectionItemToLang', {siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey, destLang});
}

export function openFileInEditor(filepath: string, create: boolean = false, relativeToRoot: boolean = false){
  return request('openFileInEditor', {filepath, create, relativeToRoot});
}

export function openFileExplorer(filepath: string, relativeToRoot: boolean = false){
  return request('openFileExplorer', {filepath, relativeToRoot});
}

/**
   * Opens a file dialog and uploads selected files into a collection item.
   *
   * Uses HTML5 file inputs for cross-platform compatibility (works in both Electron and browser mode).
   * Files are read as base64 and uploaded via the uploadFileToBundlePath API.
   */
export function openFileDialogForSingleAndCollectionItem(
  siteKey: string,
  workspaceKey: string,
  collectionKey: string,
  collectionItemKey: string,
  targetPath: string,
  { title: _title, extensions }:{title: string, extensions: Array<string>},
  forceFileName?: string
){
  return new Promise<void>((resolve, reject) => {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = !forceFileName; // Single file if forceFileName is set
    input.accept = extensions.map(ext => `.${ext}`).join(',');

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        resolve();
        return;
      }

      try {
        let newCollectionItemKey: string | undefined;

        // Upload each selected file
        for (const file of Array.from(files)) {
          // Read file as base64
          const base64Content = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data URL prefix (e.g., "data:image/png;base64,")
              res(result.split(',')[1]);
            };
            reader.onerror = rej;
            reader.readAsDataURL(file);
          });

          // Determine filename
          const filename = forceFileName
            ? `${forceFileName}.${file.name.split('.').pop()}`
            : file.name;

          // Upload to backend via base64
          const result = await this.uploadFileToBundlePath(
            siteKey,
            workspaceKey,
            collectionKey,
            collectionItemKey,
            targetPath,
            filename,
            base64Content
          );

          // Track if item was converted to bundle
          if (result.newCollectionItemKey) {
            newCollectionItemKey = result.newCollectionItemKey;
          }
        }

        // If item was converted to bundle, redirect to the new URL
        if (newCollectionItemKey) {
          const newUrl = `/workspace/${siteKey}/${workspaceKey}/collection/${collectionKey}/item/${encodeURIComponent(newCollectionItemKey)}`;
          window.location.href = newUrl;
        }

        resolve();
      } catch (error) {
        console.error('Error uploading files:', error);
        this.logToConsole(error, 'File upload error');
        reject(error);
      } finally {
        // Cleanup
        document.body.removeChild(input);
      }
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      resolve();
    };

    // Add to DOM (required for some browsers) and trigger
    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
  });
}
export function quiqr_git_repo_show(url: string){
  return request('quiqr_git_repo_show', {url}, {timeout: 300000});
}

export function hugotheme_git_repo_show(url: string){
  return request('hugotheme_git_repo_show', {url}, {timeout: 30000});
}

export function hugosite_dir_show(folder: string){
  return request('hugosite_dir_show', {folder}, {timeout: 30000});
}
export function openCustomCommand(command: string){
  return request('openCustomCommand', {command});
}

export function openExternal(url: string) {
  return request('openExternal', { url });
}

export function getThumbnailForPath(siteKey: string, workspaceKey: string, targetPath: string){
  return request('getThumbnailForPath', {siteKey, workspaceKey, targetPath}, {timeout: 400000});
}

export function getThumbnailForCollectionOrSingleItemImage(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, targetPath: string){
  return request('getThumbnailForCollectionOrSingleItemImage', {siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath}, {timeout: 30000});
}

export function getFilesInBundle(siteKey: string, workspaceKey: string, collectionKey: string, collectionItemKey: string, targetPath: string, extensions: any, forceFileName: string){
  return request('getFilesInBundle', {siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, extensions, forceFileName});
}

export function uploadFileToBundlePath(
  siteKey: string,
  workspaceKey: string,
  collectionKey: string,
  collectionItemKey: string,
  targetPath: string,
  filename: string,
  base64Content: string
) {
  return request('uploadFileToBundlePath', {
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    targetPath,
    filename,
    base64Content
  }) as Promise<{ uploadedPath: string; newCollectionItemKey?: string }>;
}

export function deleteFileFromBundle(
  siteKey: string,
  workspaceKey: string,
  collectionKey: string,
  collectionItemKey: string,
  targetPath: string,
  filename: string
) {
  return request('deleteFileFromBundle', {
    siteKey,
    workspaceKey,
    collectionKey,
    collectionItemKey,
    targetPath,
    filename
  });
}

export function getFilesFromAbsolutePath(path: string){
  return request('getFilesFromAbsolutePath', {path}, {timeout: 30000});
}

export function saveSiteConf(siteKey: string, newConf: any){
  return request('saveSiteConf', {siteKey, newConf});
}

export function copySite(siteKey: string, newConf: any){
  return request('copySite', {siteKey, newConf});
}

/*
export function mergeSiteWithRemote(siteKey: string, publishConf: any){
  return request('mergeSiteWithRemote', {siteKey, publishConf}, {timeout: 130000});
}

export function publishSite(siteKey: string, publishConf: any){
  return request('publishSite', {siteKey, publishConf}, {timeout: 130000});
}
*/

export function getSiteConfig(siteKey: string){
  return request('getSiteConfig', {siteKey});
}

export function getLanguages(siteKey: string, workspaceKey: string){
  return request('getLanguages', {siteKey, workspaceKey});
}

export function publisherDispatchAction(siteKey: string, publishConf: any, action: string, actionParameters: any, timeout: any){
  if(!Number.isInteger(timeout)){
    timeout=130000;
  }
  return request('publisherDispatchAction', {siteKey, publishConf, action, actionParameters}, {timeout: timeout});
}

export function getCreatorMessage(siteKey: string, workspaceKey: string){
  return request('getCreatorMessage', {siteKey, workspaceKey});
}

export function getHugoTemplates(){
  return request('getHugoTemplates', null, {timeout: 30000});
}

export function openSiteLibrary(){
  return request('openSiteLibrary', {}, {timeout: 100000 });
}
export function showMenuBar(){
  return request('showMenuBar', {});
}
export function hideMenuBar(){
  return request('hideMenuBar', {});
}

export function mountWorkspace(siteKey: string, workspaceKey: string){
  return request('mountWorkspace', {siteKey, workspaceKey});
}

export function shouldReloadForm(reloadFormPath: string){
  return request('shouldReloadForm', {reloadFormPath});
}

export function setCurrentFormAccordionIndex(index: string){
  return request('setCurrentFormAccordionIndex', {index});
}

export function getCurrentFormAccordionIndex(){
  return request('getCurrentFormAccordionIndex', {});
}

export function setCurrentFormNodePath(path: string){
  return request('setCurrentFormNodePath', {path});
}

export function getCurrentFormNodePath(){
  return request('getCurrentFormNodePath', {});
}
export function reloadCurrentForm(){
  return request('reloadCurrentForm', {});
}

export function redirectTo(location, forceRefresh){
  return request('redirectTo', {location, forceRefresh}, {timeout: 10000});
}
export function parentMountWorkspace(siteKey: string, workspaceKey: string){
  return request('parentMountWorkspace', {siteKey, workspaceKey});
}

export function reloadThemeStyle(){
  return request('reloadThemeStyle', {});
}

export function createKeyPairGithub(){

  return request('createKeyPairGithub',{}, {timeout:90000});
}

export function derivePublicKey(privateKey: string){
  return request('derivePublicKey', { privateKey });
}

export function invalidateCache(){
  return request('invalidateCache', {});
}

export function updateCommunityTemplates() {
  return request('updateCommunityTemplates', {});
}

export function showOpenFolderDialog() {
  return request('showOpenFolderDialog', {});
}

/**
   * Get environment information (platform and packaging status)
   */
export function getEnvironmentInfo() {
  return request('getEnvironmentInfo', {});
}

/**
   * Get current menu state (for web mode)
   */
export function getMenuState() {
  return request('getMenuState', {});
}

/**
   * Execute a menu action (for web mode)
   */
export function executeMenuAction(params: { action: string; data?: unknown }) {
  return request('executeMenuAction', params);
}


// Type interface for all API methods (for type inference in hooks)
export interface API {
  getConfigurations: typeof getConfigurations;
  listWorkspaces: typeof listWorkspaces;
  getWorkspaceModelParseInfo: typeof getWorkspaceModelParseInfo;
  getWorkspaceDetails: typeof getWorkspaceDetails;
  getPromptTemplateConfig: typeof getPromptTemplateConfig;
  processAiPrompt: typeof processAiPrompt;
  updatePageFromAiResponse: typeof updatePageFromAiResponse;
  getPreviewCheckConfiguration: typeof getPreviewCheckConfiguration;
  serveWorkspace: typeof serveWorkspace;
  stopHugoServer: typeof stopHugoServer;
  showLogWindow: typeof showLogWindow;
  logToConsole: typeof logToConsole;
  getDynFormFields: typeof getDynFormFields;
  importSite: typeof importSite;
  getFilteredHugoVersions: typeof getFilteredHugoVersions;
  getFilteredSSGVersions: typeof getFilteredSSGVersions;
  checkHugoVersion: typeof checkHugoVersion;
  checkSSGVersion: typeof checkSSGVersion;
  importSiteFromPrivateGitRepo: typeof importSiteFromPrivateGitRepo;
  importSiteFromPublicGitUrl: typeof importSiteFromPublicGitUrl;
  newSiteFromPublicHugoThemeUrl: typeof newSiteFromPublicHugoThemeUrl;
  newSiteFromLocalDirectory: typeof newSiteFromLocalDirectory;
  deleteSite: typeof deleteSite;
  newSiteFromScratch: typeof newSiteFromScratch;
  getCurrentBaseUrl: typeof getCurrentBaseUrl;
  getCurrentSiteKey: typeof getCurrentSiteKey;
  globSync: typeof globSync;
  parseFileToObject: typeof parseFileToObject;
  buildWorkspace: typeof buildWorkspace;
  saveSingle: typeof saveSingle;
  getSingle: typeof getSingle;
  openSingleInEditor: typeof openSingleInEditor;
  updateSingle: typeof updateSingle;
  listCollectionItems: typeof listCollectionItems;
  getCollectionItem: typeof getCollectionItem;
  openCollectionItemInEditor: typeof openCollectionItemInEditor;
  buildCollectionItem: typeof buildCollectionItem;
  buildSingle: typeof buildSingle;
  updateCollectionItem: typeof updateCollectionItem;
  createCollectionItemKey: typeof createCollectionItemKey;
  deleteCollectionItem: typeof deleteCollectionItem;
  makePageBundleCollectionItem: typeof makePageBundleCollectionItem;
  matchRole: typeof matchRole;
  readConfKey: typeof readConfKey;
  readConfPrefKey: typeof readConfPrefKey;
  checkFreeSiteName: typeof checkFreeSiteName;
  saveConfPrefKey: typeof saveConfPrefKey;
  renameCollectionItem: typeof renameCollectionItem;
  copyCollectionItem: typeof copyCollectionItem;
  copyCollectionItemToLang: typeof copyCollectionItemToLang;
  openFileInEditor: typeof openFileInEditor;
  openFileExplorer: typeof openFileExplorer;
  openFileDialogForSingleAndCollectionItem: typeof openFileDialogForSingleAndCollectionItem;
  quiqr_git_repo_show: typeof quiqr_git_repo_show;
  hugotheme_git_repo_show: typeof hugotheme_git_repo_show;
  hugosite_dir_show: typeof hugosite_dir_show;
  openCustomCommand: typeof openCustomCommand;
  openExternal: typeof openExternal;
  getThumbnailForPath: typeof getThumbnailForPath;
  getThumbnailForCollectionOrSingleItemImage: typeof getThumbnailForCollectionOrSingleItemImage;
  getFilesInBundle: typeof getFilesInBundle;
  uploadFileToBundlePath: typeof uploadFileToBundlePath;
  deleteFileFromBundle: typeof deleteFileFromBundle;
  getFilesFromAbsolutePath: typeof getFilesFromAbsolutePath;
  saveSiteConf: typeof saveSiteConf;
  copySite: typeof copySite;
  getSiteConfig: typeof getSiteConfig;
  getLanguages: typeof getLanguages;
  publisherDispatchAction: typeof publisherDispatchAction;
  getCreatorMessage: typeof getCreatorMessage;
  getHugoTemplates: typeof getHugoTemplates;
  openSiteLibrary: typeof openSiteLibrary;
  showMenuBar: typeof showMenuBar;
  hideMenuBar: typeof hideMenuBar;
  mountWorkspace: typeof mountWorkspace;
  shouldReloadForm: typeof shouldReloadForm;
  setCurrentFormAccordionIndex: typeof setCurrentFormAccordionIndex;
  getCurrentFormAccordionIndex: typeof getCurrentFormAccordionIndex;
  setCurrentFormNodePath: typeof setCurrentFormNodePath;
  getCurrentFormNodePath: typeof getCurrentFormNodePath;
  reloadCurrentForm: typeof reloadCurrentForm;
  redirectTo: typeof redirectTo;
  parentMountWorkspace: typeof parentMountWorkspace;
  reloadThemeStyle: typeof reloadThemeStyle;
  createKeyPairGithub: typeof createKeyPairGithub;
  derivePublicKey: typeof derivePublicKey;
  invalidateCache: typeof invalidateCache;
  updateCommunityTemplates: typeof updateCommunityTemplates;
  showOpenFolderDialog: typeof showOpenFolderDialog;
  getEnvironmentInfo: typeof getEnvironmentInfo;
  getMenuState: typeof getMenuState;
  executeMenuAction: typeof executeMenuAction;
}
