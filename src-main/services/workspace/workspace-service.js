const path                            = require('path');
const glob                            = require('glob');
const { shell }                       = require('electron');
const fs                              = require('fs-extra');
const fssimple                        = require('fs');
const fm                              = require('front-matter')
const { promisify }                   = require('util');
const { WorkspaceConfigProvider }     = require('./workspace-config-provider');
const formatProviderResolver          = require('./../../utils/format-provider-resolver');
const contentFormats                  = require('./../../utils/content-formats');
const pathHelper                      = require('./../../utils/path-helper');
const fileDirUtils                    = require('./../../utils/file-dir-utils');
const { createThumbnailJob, globJob } = require('./../../jobs');
const HugoBuilder                     = require('./../../hugo/hugo-builder');
const HugoServer                      = require('./../../hugo/hugo-server');
const HugoConfig                      = require('./../../hugo/hugo-config');
const screenshotWindow                = require('./../../ui-managers/screenshot-window-manager');

const workspaceConfigProvider = new WorkspaceConfigProvider();

class WorkspaceService{
  constructor(workspacePath, workspaceKey, siteKey){
    this.workspacePath = workspacePath;
    this.workspaceKey = workspaceKey;
    this.siteKey = siteKey;
  }

  getWorkspacePath(){
    return this.workspacePath;
  }

  //Get the workspace configurations data to be used by the client
  getConfigurationsData(){
    return workspaceConfigProvider.readOrCreateMinimalModelConfig(this.workspacePath, this.workspaceKey);
  }

  clearConfigurationsDataCache(){
    workspaceConfigProvider.clearCache();
  }

  async getCreatorMessage(){
    let indexPath = this.workspacePath + "/quiqr/home/index.md"
    try {
      if (fs.existsSync(indexPath)) {
        let data = await fs.readFileSync(indexPath,'utf8');
        let obj = await this._smartParse(indexPath, ['md'], data);
        if('mainContent' in obj){
          return obj.mainContent.toString();
        }
        else{
          return data;
        }
      }
    } catch(err) {
      console.error(err);
      console.error('error checking');
    }
    return '';

  }

  async getModelParseInfo(){
    await workspaceConfigProvider.readOrCreateMinimalModelConfig(this.workspacePath, this.workspaceKey);
    return workspaceConfigProvider.getModelParseInfo();
  }

  async _smartResolveFormatProvider(filePath , fallbacks ){
    let formatProvider;
    if(contentFormats.isContentFile(filePath)){
      if(fs.existsSync(filePath)){
        formatProvider = await formatProviderResolver.resolveForMdFilePromise(filePath);
      }
    }
    else
      formatProvider = formatProviderResolver.resolveForFilePath(filePath);

    if(formatProvider)
      return formatProvider;

    if(fallbacks){
      for(let i = 0; i < fallbacks.length; i++){
        if(fallbacks[i]){
          formatProvider = formatProviderResolver.resolveForExtension(fallbacks[i]);
          if(formatProvider)
            return formatProvider;
        }
      }
    }

    return undefined;
  }

  async _smartDump(filePath , formatFallbacks  , obj ){
    let formatProvider = await this._smartResolveFormatProvider(filePath, formatFallbacks);
    if(formatProvider===undefined)
      formatProvider = formatProviderResolver.getDefaultFormat();
    if(contentFormats.isContentFile(filePath)){
      return formatProvider.dumpContent(obj);
    }
    else{
      return formatProvider.dump(obj);
    }
  }

  async _smartParse(filePath , formatFallbacks  , str ){
    if(str===undefined||str===null||str.length===0||!/\S$/gi){
      return {};
    }
    if(contentFormats.isContentFile(filePath)){
      if(formatFallbacks){
        formatFallbacks.push('yaml');
      }

    }
    let formatProvider = await this._smartResolveFormatProvider(filePath, formatFallbacks);
    if(formatProvider===undefined){
      console.log("formatprovider undefined");
      return {};
    }

    if(contentFormats.isContentFile(filePath)){
      return formatProvider.parseFromMdFileString(str);
    }
    else{
      return formatProvider.parse(str);
    }
  }

  async getSingle(singleKey ){
    let config = await this.getConfigurationsData();

    let single = config.singles.find(x => x.key === singleKey);
    if(single==null)throw new Error('Could not find single.');
    let filePath = path.join(this.workspacePath, single.file);

    if(fs.existsSync(filePath)){
      let data = await fs.readFileSync(filePath,'utf8');

      let obj = await this._smartParse(filePath, [path.extname(single.file).replace('.','')], data);
      if(contentFormats.isContentFile(filePath)){
        obj.resources = await this.getResourcesFromContent(filePath, obj.resources);
      }
      return obj;
    }
    else{
      return {};
    }
  }

  async getSingleFolder(singleKey ){
    let config = await this.getConfigurationsData();
    let single = config.singles.find(x => x.key === singleKey);
    if(single==null)throw new Error('Could not find single.');
    let filePath = path.join(this.workspacePath, single.file);

    let directory = path.dirname(filePath);

    if(fs.existsSync(directory)){
      return directory;
    }
    else{
      return '';
    }
  }

  //Update the single
  async openSingleInEditor(singleKey){
    let config = await this.getConfigurationsData();
    let single = config.singles.find(x => x.key === singleKey);
    if(single==null)throw new Error('Could not find single.');
    let filePath = path.join(this.workspacePath, single.file);
    shell.openPath(filePath);
  }
  //Update the single
  async updateSingle(singleKey, document ){
    let config = await this.getConfigurationsData();
    let single = config.singles.find(x => x.key === singleKey);
    if(single==null)throw new Error('Could not find single.');
    let filePath = path.join(this.workspacePath, single.file);

    let directory = path.dirname(filePath);

    if (!fs.existsSync(directory))
      fs.mkdirSync(directory);//ensure directory existence

    let documentClone =  JSON.parse(JSON.stringify(document));
    this._stripNonDocumentData(documentClone);

    let stringData = await this._smartDump(filePath, [path.extname(single.file).replace('.','')], documentClone);
    fs.writeFileSync(filePath, stringData);


    if(document.resources){
      for(let r = 0; r < document.resources.length; r++){
        let resource = document.resources[r];
        if(resource.__deleted){

          let fullSrc = path.join(directory, resource.src);

          if(resource.src.charAt(0)=="/" || resource.src.charAt(0)=="\\"){
            fullSrc = path.join(this.workspacePath, resource.src);
          }

          this.removeThumbnailForItemImage("", singleKey, resource.src);
          await fs.remove(fullSrc);
        }
      }
      document.resources = document.resources.filter(x => x.__deleted!==true);
    }

    return document;
  }

  async getFilesFromAbsolutePath(filePath){

    let directory = path.join(this.workspacePath, filePath);

    let globExp = '*';
    let allFiles = await promisify(glob)(globExp, {nodir:true, absolute:false, root:directory, cwd:directory });

    let expression = `_?index[.](${contentFormats.SUPPORTED_CONTENT_EXTENSIONS.join('|')})$`;
    let pageOrSectionIndexReg = new RegExp(expression);
    allFiles = allFiles.filter(x => !pageOrSectionIndexReg.test(x));

    let merged = allFiles.map(src =>{
      return Object.assign({ src }, [].find(r => r.src===src));
    });
    return merged;
  }

  async getResourcesFromContent(filePath, currentResources = [], targetPath = null){
    filePath = path.normalize(filePath);
    let directory = path.dirname(filePath);

    let globExp = '*';
    if(targetPath){
      globExp = targetPath+'/*';
    }

    let allFiles = await promisify(glob)(globExp, {nodir:true, absolute:false, root:directory, cwd:directory });

    let expression = `_?index[.](${contentFormats.SUPPORTED_CONTENT_EXTENSIONS.join('|')})$`;
    let pageOrSectionIndexReg = new RegExp(expression);
    allFiles = allFiles.filter(x => !pageOrSectionIndexReg.test(x));

    let merged = allFiles.map(src =>{
      return Object.assign({ src }, currentResources.find(r => r.src===src));
    });
    return merged;
  }

  async getCollectionItem(collectionKey , collectionItemKey ){

    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if(collection==null)
      throw new Error('Could not find collection.');
    let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    if(await fs.exists(filePath)){
      let data = await fs.readFile(filePath,{encoding:'utf8'});
      let obj  = await this._smartParse(filePath, [collection.extension], data);
      if(contentFormats.isContentFile(filePath)){
        obj.resources = await this.getResourcesFromContent(filePath, obj.resources);
      }
      return obj;
    }
    else{
      return undefined;
    }
  }

  async createCollectionItemKey(collectionKey,  collectionItemKey, itemTitle){
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if(collection==null)
      throw new Error('Could not find collection.');
    let filePath;
    let returnedKey;
    if(collection.folder.startsWith('content')){
      returnedKey = path.join(collectionItemKey, 'index.'+collection.extension);
      filePath = path.join(this.workspacePath, collection.folder, returnedKey);
    }
    else{
      returnedKey = collectionItemKey + '.' + collection.extension;
      filePath = path.join(this.workspacePath, collection.folder, returnedKey);
    }
    if(fs.existsSync(filePath))
      return { unavailableReason:'already-exists' };

    await fs.ensureDir(path.dirname(filePath));
    let stringData = await this._smartDump(filePath, [collection.dataformat], {title:itemTitle});
    await fs.writeFile(filePath, stringData, {encoding:'utf8'});

    return { key: returnedKey.replace(/\\/g,'/') };
  }

  async listCollectionItems(collectionKey ){
    let collection = (await this.getConfigurationsData())
      .collections.find(x => x.key === collectionKey);


    if(collection==null)
      throw new Error('Could not find collection.');
    let folder = path.join(this.workspacePath, collection.folder).replace(/\\/g,'/');

    // TODO: make it more flexible! This should not be handled with IF ELSE.
    //  But is good enough for now.

    let supportedContentExt = ['md','html','markdown'];
    if(collection.folder.startsWith('content') || supportedContentExt.indexOf(collection.extension)!==-1){


      //WHEN WE WANT TO IGNORE _index.md front pages
      let subDirStars = '**';
      if ('includeSubdirs' in collection && collection.includeSubdirs === false){
        subDirStars = '';
      }

      let globExpression = path.join(folder, `${subDirStars}.{${supportedContentExt.join(',')}}`);

      globExpression = path.join(folder, `${subDirStars}/*.{${supportedContentExt.join(',')}}`);
      //WHEN WE WANT TO IGNORE _index.md front pages
      if ('hideIndex' in collection && collection.hideIndex === true){
        //globExpression = path.join(folder, `${subDirStars}!(_index).{${supportedContentExt.join(',')}}`);
        globExpression = path.join(folder, `${subDirStars}/!(_index).{${supportedContentExt.join(',')}}`);
      }
      /*
      else{
        globExpression = path.join(folder, `${subDirStars}/*.{${supportedContentExt.join(',')}}`);
      }
      */

      let files = await globJob(globExpression, {});
      let retFiles = files.map(function(item){

        let key = item.replace(folder,'').replace(/^\//,'');
        let label = key.replace(/^\/?(.+)\/[^/]+$/,'$1');

        let sortval = null;
        if ('sortkey' in collection){
          let data = fssimple.readFileSync(item, 'utf8')
          let content = fm(data)
          if (collection['sortkey'] in content['attributes']){
            sortval = content['attributes'][collection['sortkey']];
          }
        }
        else{
          sortval = label
        }

        return {key, label, sortval};
      });

      return retFiles
    }
    else{ //data folder and everything else
      let globExpression = path.join(folder, `**/*.{${formatProviderResolver.allFormatsExt().join(',')}}`);
      let files = await globJob(globExpression, {});
      return files.map(function(item){
        let key = item.replace(folder,'');
        return {key, label:key};
      });
    }
  }

  _stripNonDocumentData(document){
    for(var key in document){
      if(key.startsWith('__')){
        delete document[key];
      }
      if(document.resources){
        document.resources = document.resources.filter((x) => x.__deleted==true);
        document.resources.forEach((x)=>delete x.__deleted);

        if(document.resources.length === 0){
          delete document['resources'];
        }
      }
    }
  }

  async renameCollectionItem(collectionKey, collectionItemKey , collectionItemNewKey ){
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if(collection==null)
      throw new Error('Could not find collection.');
    let filePath;
    let newFilePath;
    let newFileKey;

    if(collectionItemKey.includes("."+collection.extension)){
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
      newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey + "." + collection.extension);
      newFileKey = path.join(collectionItemNewKey+'.'+collection.extension);
    }
    else{
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
      newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey);
      newFileKey = path.join(collectionItemNewKey, 'index.'+collection.extension);
    }

    if (!fs.existsSync(filePath)){
      console.log("orig does not exist"+ filePath)
    }
    if (fs.existsSync(newFilePath)){
      console.log("new already  exist"+ newFilePath)
      return { renamed: false };
    }
    fs.renameSync(filePath, newFilePath);
    return { renamed: true, item: { key:newFileKey.replace(/\\/g,'/'), label:collectionItemNewKey }};
  }


  async copyCollectionItem(collectionKey, collectionItemKey , collectionItemNewKey ){
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if(collection==null)
      throw new Error('Could not find collection.');

    let filePath;
    let newFilePath;
    let newFileKey;

    if(collectionItemKey.includes("."+collection.extension)){
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
      newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey + "." + collection.extension);
      newFileKey = path.join(collectionItemNewKey+'.'+collection.extension);
    }
    else{
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
      newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey);
      newFileKey = path.join(collectionItemNewKey, 'index.'+collection.extension);
    }

    if (!fs.existsSync(filePath)){
      console.log("orig does not exist"+ filePath)
      return { coped: false };
    }
    if (fs.existsSync(newFilePath)){
      console.log("new already  exist"+ newFilePath)
      return { copied: false };
    }

    fs.copySync(filePath, newFilePath);
    return { copied: true, item: { key:newFileKey.replace(/\\/g,'/'), label:collectionItemNewKey }};
  }

  async deleteCollectionItem(collectionKey, collectionItemKey){
    //TODO: only work with "label" of a collection item
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if(collection==null)
      throw new Error('Could not find collection.');

    let filePath = ""
    if(collectionItemKey.endsWith("/index.md")){
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey.split("/")[0]);
    }
    else {
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    }

    await fileDirUtils.recurForceRemove(filePath);

    return true;

    /*
    if (fs.existsSync(filePath)){
      //TODO: use async await with a promise to test if deletion succeded
      await rim raf.sync(filePath);
      return true;
    }
    */

    //return false;
  }

  async makePageBundleCollectionItem(collectionKey , collectionItemKey ){
    //TODO: only work with "label" of a collection item
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if(collection==null)
      throw new Error('Could not find collection.');
    let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);

    if (fs.existsSync(filePath)){
      let newdir = path.join(this.workspacePath, collection.folder, collectionItemKey.split('.').slice(0, -1).join('.'));
      fs.mkdirSync(newdir);
      fs.renameSync(filePath, path.join(newdir, "index.md"));

      return true;
    }
    return false;
  }

  async openCollectionItemInEditor(collectionKey , collectionItemKey){
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if(collection==null)
      throw new Error('Could not find collection.');
    let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);

    shell.openPath(filePath);
  }

  // TODO REMOVE CODE SMELL REDUNDANT CODE WITH SINGLE
  async updateCollectionItem(collectionKey , collectionItemKey , document ){
    //TODO: only work with "label" of a collection item
    let config = await this.getConfigurationsData();
    let collection = config.collections.find(x => x.key === collectionKey);
    if(collection==null)
      throw new Error('Could not find collection.');
    let filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    let directory = path.dirname(filePath);

    if (!fs.existsSync(directory))
      fs.mkdirSync(directory);//ensure directory existence

    let documentClone = JSON.parse(JSON.stringify(document));
    this._stripNonDocumentData(documentClone);
    let stringData = await this._smartDump(filePath, [collection.dataformat], documentClone);
    fs.writeFileSync(filePath,stringData);

    //preparing return
    if(document.resources){
      for(let r = 0; r < document.resources.length; r++){
        let resource = document.resources[r];
        if(resource.__deleted){

          let fullSrc = path.join(directory, resource.src);
          this.removeThumbnailForItemImage(collectionKey, collectionItemKey, resource.src);
          await fs.remove(fullSrc);
        }
      }
      document.resources = document.resources.filter(x => x.__deleted!==true);
    }
    return document;
  }

  async copyFilesIntoCollectionItem(collectionKey , collectionItemKey , targetPath , files, forceFileName ){
    let config = await this.getConfigurationsData();

    let filesBasePath = ""
    // When file starts with / uise the root of the site directory
    if(targetPath.charAt(0)=="/" || targetPath.charAt(0)=="\\"){
        filesBasePath = path.join(this.workspacePath, targetPath);
    }
    else{
      if(collectionKey == ""){
        filesBasePath =  path.join(await this.getSingleFolder(collectionItemKey), targetPath);
      }
      else {

        let collection = config.collections.find(x => x.key === collectionKey);
        if(collection==null)
          throw new Error('Could not find collection.');

        let pathFromItemRoot = path.join(collectionItemKey.replace(/\/[^/]+$/,'') , targetPath);
        filesBasePath = path.join(this.workspacePath, collection.folder, pathFromItemRoot);
      }
    }

    for(let i =0; i < files.length; i++){
      let file = files[i]

      let from = file;
      let to = path.join(filesBasePath, path.basename(file));

      if(i==0 && forceFileName){
        to = path.join(filesBasePath, forceFileName);
        files[0]=forceFileName;
      }

      let toExists = fs.existsSync(to);
      if(toExists){
        fs.unlinkSync(to);
      }

      await fs.copy(from, to);
    }

    return files.map(x => {
      return path.join(targetPath, path.basename(x)).replace(/\\/g,'/');
    });
  }

  existsPromise(src ){
    return new Promise((resolve)=>{
      fs.exists(src, (exists)=>{
        resolve(exists);
      });
    });
  }


  async removeThumbnailForItemImage(collectionKey, collectionItemKey, targetPath){
    let folder;
    let itemPath = collectionItemKey.replace(/\/[^/]+$/,'');
    if(collectionKey == ""){
      folder = path.basename(await this.getSingleFolder(collectionItemKey));
    }
    else {

      let config = await this.getConfigurationsData();

      let collection = config.collections.find(x => x.key === collectionKey);
      folder = collection.folder;
    }

    let thumbSrc = path.join(this.workspacePath, '.quiqr-cache/thumbs', folder, itemPath, targetPath);
    if(targetPath.charAt(0)=="/" || targetPath.charAt(0)=="\\"){
      thumbSrc = path.join(this.workspacePath, '.quiqr-cache/thumbs', targetPath);
    }

    let thumbSrcExists = await this.existsPromise(thumbSrc);
    if(thumbSrcExists){
      fs.remove(thumbSrc);
    }
  }

  //TODO FIXME remove unneeded last two arguments
  async getFilesInBundle(collectionKey, collectionItemKey, targetPath, extensions, forceFileName){
    const show = false;
    if(show){
      console.log(forceFileName);
      console.log(extensions);
    }

    let files = [];
    let folder;
    let filePath;

    let config = await this.getConfigurationsData();

    if(collectionKey == ""){
      let single = config.singles.find(x => x.key === collectionItemKey);
      if(single==null)throw new Error('Could not find single.');
      filePath = path.join(this.workspacePath, single.file);
    }
    else {
      let collection = config.collections.find(x => x.key === collectionKey);
      folder = collection.folder;
      filePath = path.join(this.workspacePath, folder, collectionItemKey);
    }

    if(await fs.exists(filePath)){
      if(contentFormats.isContentFile(filePath)){
        files = await this.getResourcesFromContent(filePath, [], targetPath);
      }
      return files;
    }
  }

  //if collectionKey is "" its a SINGLE
  async getThumbnailForCollectionOrSingleItemImage(collectionKey, itemKey, targetPath){
    let itemPath = itemKey.replace(/\/[^/]+$/,'');

    if(targetPath.charAt(0)=="/" || targetPath.charAt(0)=="\\"){
      return this.getThumbnailForAbsoluteImgPath(path.join(this.workspacePath, targetPath), targetPath);
    }

    else if(collectionKey == ""){
      return this.getThumbnailForAbsoluteImgPath(
        path.join(await this.getSingleFolder(itemKey), targetPath), //complete path
        targetPath, // targetPath
        path.basename(await this.getSingleFolder(itemKey)), //folder
        itemPath
      );
    }

    else {
      let config = await this.getConfigurationsData();
      let collection = config.collections.find(x => x.key === collectionKey);
      if(collection==null) throw new Error('Could not find collection.');
      let folder = collection.folder;

      return this.getThumbnailForAbsoluteImgPath(
        path.join(this.workspacePath, collection.folder, itemPath, targetPath), //completePath
        targetPath,
        folder,
        itemPath
      );
    }
  }

  async getThumbnailForAbsoluteImgPath(completePath, targetPath, folder="", itemPath=""){
    let srcExists = await this.existsPromise(completePath);
    if(!srcExists){
      return 'NOT_FOUND';
    }

    let thumbSrc = path.join(this.workspacePath, '.quiqr-cache/thumbs', folder, itemPath, targetPath);
    let thumbSrcExists = await this.existsPromise(thumbSrc);
    let ext = path.extname(thumbSrc).replace('.','').toLowerCase();

    if (ext === "png" ||
      ext === "jpg" ||
      ext === "jpeg" ||
      ext === "svg" ||
      ext === "gif" ){

      if(!thumbSrcExists){
        try{
          await createThumbnailJob(completePath, thumbSrc);
        }
        catch(e){
          return 'NOT_FOUND';
        }
      }

      if (ext === "svg") ext = "svg+xml";

      let mime = `image/${ext}`;
      let buffer = await promisify(fs.readFile)(thumbSrc);
      let base64 = buffer.toString('base64');

      return `data:${mime};base64,${base64}`;
    }
    else{
      return 'NO_IMAGE';
    }

  }


  _findFirstMatchOrDefault(arr, key){
    let result;

    if(key){
      result = (arr||[]).find(x => x.key===key);
      if(result) return result;
    }

    result = (arr||[]).find(x => x.key==='default'|| x.key==='' || x.key==null);
    if(result) return result;

    if(arr!==undefined && arr.length===1)
      return arr[0];

    if(key){
      throw new Error(`Could not find a config for key "${key}" and a default value was not available.`);
    }
    else{
      throw new Error(`Could not find a default config.`);
    }
  }

  setCurrentBaseUrl(hugoServerConfig){

    global.currentBaseUrl = ""; //reset

    let hugoConfService = new HugoConfig(JSON.parse(JSON.stringify(hugoServerConfig)));
    hugoConfService.configLines().then((lines)=>{
      const key = "baseurl";
      const item = lines.find(element => {
        return element.startsWith(key);
      });

      if(item){
        //TOML
        let currentBaseUrl;
        if(item.includes('=')){
          currentBaseUrl = item.split("=")[1].replace(/"/g, '').trim();
        }
        //YAML
        else{
          currentBaseUrl = item.replace('baseurl:','').replace(/"/g, '').trim();
        }
        //TODO JSON
        if(currentBaseUrl && currentBaseUrl !== '/'){
          try{
            let url = new URL(currentBaseUrl)
            global.currentBaseUrl = url.pathname;
          }
          catch(e){
            console.log(e);
          }
        }

      }
    });

  }

  async serve(){
    let workspaceDetails = await this.getConfigurationsData();
    return new Promise((resolve,reject)=>{

      let serveConfig;
      if(workspaceDetails.serve && workspaceDetails.serve.length){
        serveConfig = this._findFirstMatchOrDefault(workspaceDetails.serve, '');
      }
      else serveConfig = {config:''};

      let hugoServerConfig = {
        config: serveConfig.config,
        workspacePath: this.workspacePath,
        hugover: workspaceDetails.hugover,
      }

      this.setCurrentBaseUrl(hugoServerConfig);

      global.hugoServer = new HugoServer(JSON.parse(JSON.stringify(hugoServerConfig)));

      global.hugoServer.serve((err)=>{
        if(err){
          reject(err);
        }
        else{

          //make screenshot it no screenshots are made already
          let screenshotDir = path.join(this.workspacePath, 'quiqr', 'etalage', 'screenshots');
          if (!fs.existsSync(screenshotDir)) {
            console.log("autocreate screenshots");
            this.genereateEtalageImages();
          }

          resolve();
        }
      });
    });
  }

  async build(buildKey, extraConfig={}) {
    let workspaceDetails = await this.getConfigurationsData();
    return new Promise((resolve,reject)=>{

      let buildConfig;
      if(workspaceDetails.build && workspaceDetails.build.length){
        buildConfig = this._findFirstMatchOrDefault(workspaceDetails.build, buildKey);
      }
      else buildConfig = {config:''};

      let destination = path.join(pathHelper.getBuildDir(this.workspacePath) , "public");

      let hugoBuilderConfig = {
        config: buildConfig.config,
        workspacePath: this.workspacePath,
        hugover: workspaceDetails.hugover,
        destination: destination
      }
      if(extraConfig.overrideBaseURLSwitch){
        hugoBuilderConfig.baseUrl = extraConfig.overrideBaseURL;
      }

      let hugoBuilder = new HugoBuilder(hugoBuilderConfig);

      hugoBuilder.build().then(
        ()=>resolve(),
        (err)=>reject(err)
      );
    });
  }

  /*
  async removeThumbCache(relativePath){
    let thumbSrc = path.join(this.workspacePath, '.quiqr-cache/thumbs', relativePath);

    let thumbSrcExists = await this.existsPromise(thumbSrc);
    if(thumbSrcExists){

      let lstat = fs.lstatSync(thumbSrc);
      if(lstat.isDirectory()){
        await rim raf.sync(thumbSrc);
      }
      else{
        fs.remove(thumbSrc);
      }
    }
  }
  */

  async genereateEtalageImages(){

    await fileDirUtils.recurForceRemove( pathHelper.workspaceCacheThumbsPath(this.workspacePath,
      path.join('quiqr', 'etalage', 'screenshots')
    ));
    await fileDirUtils.recurForceRemove( pathHelper.workspaceCacheThumbsPath(this.workspacePath,
      path.join('quiqr', 'etalage', 'favicon')
    ));

    //this.removeThumbCache(path.join('quiqr', 'etalage', 'screenshots'));
    //this.removeThumbCache(path.join('quiqr', 'etalage', 'favicon'));



    let etalageDir = path.join(this.workspacePath, 'quiqr', 'etalage' );
    screenshotWindow.createScreenshotAndFavicon('localhost', 13131, path.join(etalageDir) )

  }
}

module.exports = WorkspaceService;
