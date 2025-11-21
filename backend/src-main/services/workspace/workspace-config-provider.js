const fs                            = require('fs-extra');
const path                          = require('path');
const glob                          = require('glob');
const { FileCacheToken }            = require('./file-cache-token');
const WorkspaceConfigValidator      = require('./workspace-config-validator');
const InitialWorkspaceConfigBuilder = require('./initial-workspace-config-builder');
const formatProviderResolver        = require('./../../utils/format-provider-resolver');
const pathHelper                    = require('./../../utils/path-helper');
const deepmerge                     = require('deepmerge');
const fetch                         = require('node-fetch');

class WorkspaceConfigProvider{

  constructor(){
    this.clearCache();
  }

  clearCache(){
    this.cache = {};
    this.parseInfo = {};
    this.parseInfo.baseFile = '';
    this.parseInfo.includeFiles = [];
    this.parseInfo.includeFilesSub = [];
    this.parseInfo.partialFiles = [];
  }

  async readOrCreateMinimalModelConfig(workspacePath, workspaceKey){

    let filePath = this.getQuiqrModelBasePath(workspacePath);

    this.parseInfo.baseFile = filePath;

    let config;
    let token;

    if(filePath!=null){
      const cached = this.cache[filePath];
      token = await new FileCacheToken([filePath]).build();

      if(cached!=null){
        if(await cached.token.match(token)){ //can be reused
          return cached.config;
        }
      }
    }
    else{
      // File is missing > need to build default config and update cache
      // CREATE quiqr/model/base.yaml and some other default files
      let configBuilder = new InitialWorkspaceConfigBuilder(workspacePath);
      filePath = configBuilder.buildAll();

      token = await (new FileCacheToken([filePath])).build();
    }

    config = await this._loadConfigurationsData(filePath, workspaceKey, workspacePath);
    config.path = workspacePath;
    config.key = workspaceKey;

    this.cache[filePath] = { token, config }
    return config;
  }

  //get path of quiqr/base.yml|yaml|toml|json
  getQuiqrModelBasePath(workspacePath){

    let fileExpPrimary = path.join(workspacePath,'quiqr','model','base.{'+formatProviderResolver.allFormatsExt().join(',')+'}');

    if( glob.sync(fileExpPrimary).length > 0 ){
      return glob.sync(fileExpPrimary)[0];
    }

    let fileExpFallback = path.join(workspacePath,'sukoh.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    return glob.sync(fileExpFallback)[0];
  }

  async _loadConfigurationsData(filePath, workspaceKey, workspacePath){

    let strData = fs.readFileSync(filePath,'utf8');
    let formatProvider = formatProviderResolver.resolveForFilePath(filePath);
    if(formatProvider==null){
      formatProvider = formatProviderResolver.getDefaultFormat();
    }

    let dataPhase1Parse = formatProvider.parse(strData);
    let dataPhase2Merged = await this._postProcessConfigObject(dataPhase1Parse , workspacePath);

    let validator = new WorkspaceConfigValidator();
    let result = validator.validate(dataPhase2Merged);
    if(result)
      throw new Error(result);

    return dataPhase2Merged;
  }

  configObjectSkeleton(configOrg){
    if(configOrg){
      if(!configOrg.menu) configOrg.menu = [];
      if(!configOrg.collections) configOrg.collections = [];
      if(!configOrg.singles) configOrg.singles = [];
      if(!configOrg.dynamics) configOrg.dynamics = [];
    }

    return configOrg
  }

  async _postProcessConfigObject(configOrg, workspacePath){

    configOrg = this.configObjectSkeleton(configOrg)

    // LOAD AND MERGE INCLUDES
    let siteModelIncludes = path.join(workspacePath,'quiqr','model','includes','*.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    configOrg = this._loadIncludes(configOrg, siteModelIncludes, true);

    let siteModelIncludesSingles = path.join(workspacePath,'quiqr','model','includes','singles','*.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    configOrg = this._loadIncludesSub('singles', configOrg, siteModelIncludesSingles, true);

    let siteModelIncludesCollections = path.join(workspacePath,'quiqr','model','includes','collections','*.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    configOrg = this._loadIncludesSub('collections', configOrg, siteModelIncludesCollections, true);

    let siteModelIncludesMenus = path.join(workspacePath,'quiqr','model','includes','menus','*.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    configOrg = this._loadIncludesSub('menu', configOrg, siteModelIncludesMenus, true);

    let dogFoodIncludes = path.join(pathHelper.getApplicationResourcesDir(),"all","dog_food_model/includes",'*.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    configOrg = this._loadIncludes(configOrg, dogFoodIncludes, false);

    // MERGE PARTIALS
    let mergedDataCollections = [];
    await Promise.all(
      configOrg.collections.map(async (x) => {
        let mp =  await this.getMergePartialResult(x,workspacePath)
        mergedDataCollections.push(mp);
      })
    );
    configOrg.collections = mergedDataCollections;

    let mergedDataSingles = [];
    await Promise.all(
      configOrg.singles.map(async (x) => {
        let mp =  await this.getMergePartialResult(x,workspacePath)
        mergedDataSingles.push(mp);
      }),
    );
    configOrg.singles = mergedDataSingles;

    let mergedDataDynamics = [];
    await Promise.all(
      configOrg.dynamics.map(async (x) => {
        let mp =  await this.getMergePartialResult(x,workspacePath)
        mergedDataDynamics.push(mp);
      }),
    );
    configOrg.dynamics = mergedDataDynamics;

    // CLEANUP
    if(configOrg.menu.length < 1) delete configOrg['menu'];
    if(configOrg.collections.length < 1) delete configOrg['collections'];
    if(configOrg.singles.length < 1) delete configOrg['singles'];
    if(configOrg.dynamics.length < 1) delete configOrg['dynamics'];

    return configOrg;
  }

  async getMergePartialResult(mergeKey, workspacePath){
    let result = await this._mergePartials(mergeKey, workspacePath);
    return result
  }

  partialRemoteCacheDir(workspacePath){
    let newPath = path.join(workspacePath,'quiqr','model','partialsRemoteCache');
    return newPath;
  }

  createPartialsRemoteCacheDir(workspacePath){
    const filePartialDir = this.partialRemoteCacheDir(workspacePath)
    fs.ensureDirSync(filePartialDir);
    return filePartialDir;
  }

  _loadIncludes(configObject, fileIncludes, showInParseInfo){
    let files = glob.sync(fileIncludes);

    let newObject = {};

    files.forEach((filename)=>{

      let strData = fs.readFileSync(filename,'utf8');
      let formatProvider = formatProviderResolver.resolveForFilePath(files[0]);
      if(formatProvider==null){
        formatProvider = formatProviderResolver.getDefaultFormat();
      }
      let mergeData = formatProvider.parse(strData);

      if(showInParseInfo) this.parseInfo.includeFiles.push({key:path.parse(filename).name,filename: filename});

      newObject[path.parse(filename).name] = deepmerge(mergeData, configObject[path.parse(filename).name]);
      if(path.parse(filename).name == 'dynamics' ){
        //console.log(configObject);
        //console.log(newObject)
      }
    });

    return {...configObject, ...newObject}
  }

  _loadIncludesSub(modelType, configObject, fileIncludes, showInParseInfo){
    let files = glob.sync(fileIncludes);

    let newObject = {...configObject, ...{}};

    files.forEach((filename)=>{

      let strData = fs.readFileSync(filename,'utf8');
      let formatProvider = formatProviderResolver.resolveForFilePath(files[0]);
      if(formatProvider==null){
        formatProvider = formatProviderResolver.getDefaultFormat();
      }

      let mergeDataSub = formatProvider.parse(strData);

      if(showInParseInfo) this.parseInfo.includeFilesSub.push({key: modelType,filename: filename});

      newObject[modelType].push(mergeDataSub);//deepmerge(mergeData, configObject[modelType]);
    });

    return newObject
  }



  getEncodedDestinationPath(filePartialDir, mergeKey){
    let encodeFilename = encodeURIComponent(mergeKey._mergePartial);
    return path.join(filePartialDir,encodeFilename);
  }

  _mergePartials(mergeKey, workspacePath){

    return new Promise(async (resolve)=>{

      if( "_mergePartial" in mergeKey){

        let filePartial = "";

        if(mergeKey._mergePartial.startsWith("file://")) {

          filePartial = this.getEncodedDestinationPath( this.createPartialsRemoteCacheDir(workspacePath), mergeKey );

          if(global.pogoconf.disablePartialCache || !fs.existsSync(filePartial) ){
            //console.log("copy file://");
            await fs.copySync(mergeKey._mergePartial.substring(7), filePartial);
          }
        }
        else if(mergeKey._mergePartial.startsWith("http://") || mergeKey._mergePartial.startsWith("https://") ){

          filePartial = this.getEncodedDestinationPath( this.createPartialsRemoteCacheDir(workspacePath), mergeKey );

          if(global.pogoconf.disablePartialCache || !fs.existsSync(filePartial) ){
            //console.log("copy https://");
            await this._getRemotePartial(mergeKey._mergePartial, filePartial);
          }

        }
        else if(mergeKey._mergePartial.startsWith("dogfood_site://")){
          let filePartialPattern = path.join(pathHelper.getApplicationResourcesDir(),"all","dog_food_model","partials",mergeKey._mergePartial.slice(15)+'.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
          let files = glob.sync(filePartialPattern);
          if( files.length > 0 ){
            filePartial = files[0];
          }
        }

        else{
          let filePartialPattern = path.join(workspacePath,'quiqr','model','partials',mergeKey._mergePartial+'.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
          let files = glob.sync(filePartialPattern);
          if( files.length > 0 ){
            filePartial = files[0];
          }
        }

        if(filePartial && fs.existsSync(filePartial) ){

          if(!mergeKey._mergePartial.startsWith("dogfood_site://")) this.parseInfo.partialFiles.push({key:mergeKey.key, filename: filePartial});

          let strData = await fs.readFileSync(filePartial,'utf8');
          let formatProvider = formatProviderResolver.resolveForFilePath(filePartial);
          if(formatProvider==null){
            formatProvider = formatProviderResolver.getDefaultFormat();
          }
          let mergeData = formatProvider.parse(strData);
          let newData = deepmerge(mergeData, mergeKey);

          //REMOVE DUPLICATES PREFER FIELDS FROM BASE.JSON OVER PARTIALS FIELDS
          if(newData.fields){

            newData.fields = newData.fields.reverse().filter((field, index, self) =>
              index === self.findIndex((t) => (
                t.key === field.key
              ))
            )
            //RESTORE ORDER AGAIN
            newData.fields = newData.fields.reverse();
          }

          mergeKey = newData;

          //ONLY WHEN MERGE WAS SUCCESFULL DELETE THE KEY TO PREVENT ERROR.
          delete mergeKey['_mergePartial'];
        }
      }

      resolve(mergeKey);

    });
  }

  async _getRemotePartial(url, destination){

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch remote partial: ${response.status} ${response.statusText}`);
      }

      const data = await response.text();
      fs.writeFileSync(destination, data);
      return destination;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }


  getModelParseInfo(){
    return this.parseInfo;
  }
}

module.exports = {
  WorkspaceConfigProvider
}
