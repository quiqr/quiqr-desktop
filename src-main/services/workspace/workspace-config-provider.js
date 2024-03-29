const fs                            = require('fs-extra');
const path                          = require('path');
const glob                          = require('glob');
const { FileCacheToken }            = require('./file-cache-token');
const WorkspaceConfigValidator      = require('./workspace-config-validator');
const InitialWorkspaceConfigBuilder = require('./initial-workspace-config-builder');
const formatProviderResolver        = require('./../../utils/format-provider-resolver');
const deepmerge                     = require('deepmerge');
const request                       = require('request');


class WorkspaceConfigProvider{

  constructor(){
    this.clearCache();
  }

  clearCache(){
    this.cache = {};
    this.parseInfo = {};
    this.parseInfo.baseFile = '';
    this.parseInfo.includeFiles = [];
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
      // need to build default config and update cache
      //CREATE quiqr/base.yaml and some other default files
      let configBuilder = new InitialWorkspaceConfigBuilder(workspacePath);
      filePath = configBuilder.buildAll();

      //filePath = this._buildDefaultConfig(workspacePath);
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
    configOrg = this._loadIncludes(configOrg, workspacePath);

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

  _loadIncludes(configObject, workspacePath){
    let fileIncludes = path.join(workspacePath,'quiqr','model','includes','*.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    let files = glob.sync(fileIncludes);

    let newObject = {};

    files.forEach((filename)=>{

      let strData = fs.readFileSync(filename,'utf8');
      let formatProvider = formatProviderResolver.resolveForFilePath(files[0]);
      if(formatProvider==null){
        formatProvider = formatProviderResolver.getDefaultFormat();
      }
      let mergeData = formatProvider.parse(strData);

      this.parseInfo.includeFiles.push({key:path.parse(filename).name,filename: filename});

      newObject[path.parse(filename).name] = deepmerge(mergeData, configObject[path.parse(filename).name]);
      if(path.parse(filename).name == 'dynamics' ){
        //console.log(configObject);
        //console.log(newObject)
      }


    });

    return {...configObject, ...newObject}
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
        else{
          let filePartialPattern = path.join(workspacePath,'quiqr','model','partials',mergeKey._mergePartial+'.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
          let files = glob.sync(filePartialPattern);
          if( files.length > 0 ){
            filePartial = files[0];
          }
        }

        if(filePartial && fs.existsSync(filePartial) ){

          this.parseInfo.partialFiles.push({key:mergeKey.key, filename: filePartial});

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

  _getRemotePartial(url, destination){

    let data='';

    return new Promise((resolve, reject)=>{

      const req = request({
        url: url
      });

      req.on('error', (err) => {
        console.log(err)
      });

      req.on('response', (response) => {
        response.on('error', (error) => {
          reject(error);
        })

        response.on('end', async () => {
          try{
            fs.writeFileSync( destination, data);
            resolve(destination);
          }
          catch(e){
            console.log(e);
          }

        });
        response.on("close", () => {
        });
        response.on("data", chunk => {
          data += chunk;
        });
      })
      req.end()

    });
  }


  getModelParseInfo(){
    return this.parseInfo;
  }
}

module.exports = {
  WorkspaceConfigProvider
}
