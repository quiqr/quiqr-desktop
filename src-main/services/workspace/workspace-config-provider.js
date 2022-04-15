const fs                            = require('fs-extra');
const path                          = require('path');
const glob                          = require('glob');
const { FileCacheToken }            = require('./file-cache-token');
const WorkspaceConfigValidator      = require('./workspace-config-validator');
const InitialWorkspaceConfigBuilder = require('./initial-workspace-config-builder');
const pathHelper                    = require('./../../utils/path-helper');
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

  async getConfig(workspacePath, workspaceKey){

    let filePath = this._getFilePath(workspacePath);

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
      filePath = this._buildDefaultConfig(workspacePath);
      token = await (new FileCacheToken([filePath])).build();

      //THIS SEEMS NEW CHECK IF README EXIST OR CREATE
      let readmePath = path.join(workspacePath,'quiqr','home','index.md');
      if( !fs.existsSync(readmePath) ){
        fs.ensureDirSync(path.join(workspacePath,'quiqr','home'));
        fs.writeFileSync(
          readmePath,
          `
# README FOR NEW SITE

If you're a developer you can read the [Quiqr Site Developer
Docs](https://book.quiqr.org/)
how to customize your Site Admin.

Quiqr is a Desktop App made for [Hugo](https://gohugo.io). Read all about
[creating Hugo websites](https://gohugo.io/getting-started/quick-start/).

To change this about text, edit this file: *${readmePath}*.

Happy Creating.

❤️ Quiqr
        `.trim()
        );
      }
    }

    config = await this._loadConfigurationsData(filePath, workspaceKey, workspacePath);
    config.path = workspacePath;
    config.key = workspaceKey;

    console.log("getGonfig")
    console.log(config)

    this.cache[filePath] = { token, config }
    return config;
  }

  //get path of quiqr/base.yml|yaml|toml|json
  _getFilePath(workspacePath){

    let fileExpPrimary = path.join(workspacePath,'quiqr','model','base.{'+formatProviderResolver.allFormatsExt().join(',')+'}');

    if( glob.sync(fileExpPrimary).length > 0 ){
      return glob.sync(fileExpPrimary)[0];
    }

    let fileExpFallback = path.join(workspacePath,'sukoh.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    return glob.sync(fileExpFallback)[0];
  }

  //CREATE quiqr/base.yaml
  _buildDefaultConfig(workspacePath){
    let configBuilder = new InitialWorkspaceConfigBuilder(workspacePath);
    let {dataBase, formatProvider} = configBuilder.buildBase();
    let dataInclude = configBuilder.buildInclude();
    let dataPartial = configBuilder.buildPartials();

    fs.ensureDirSync(path.join(workspacePath,'quiqr','model'));
    fs.ensureDirSync(path.join(workspacePath,'quiqr','model','includes'));
    fs.ensureDirSync(path.join(workspacePath,'quiqr','model','partials'));

    let filePathInclude = path.join(workspacePath,'quiqr','model','includes','collections.'+formatProvider.defaultExt());
    let filePathPartial = path.join(workspacePath,'quiqr','model','partials', 'page.'+formatProvider.defaultExt());
    let filePathBase    = path.join(workspacePath,'quiqr','model','base.'+formatProvider.defaultExt());

    fs.writeFileSync(
      filePathBase,
      formatProvider.dump(dataBase)
    );
    fs.writeFileSync(
      filePathInclude,
      formatProvider.dump(dataInclude)
    );
    fs.writeFileSync(
      filePathPartial,
      formatProvider.dump(dataPartial)
    );
    return filePathBase;
  }

  async _loadConfigurationsData(filePath, workspaceKey, workspacePath){

    let strData = fs.readFileSync(filePath,'utf8');
    let formatProvider = formatProviderResolver.resolveForFilePath(filePath);
    if(formatProvider==null){
      formatProvider = formatProviderResolver.getDefaultFormat();
    }

    let dataPhase1Parse = formatProvider.parse(strData);
    let dataPhase2Merged = await this._postProcessConfigObject(dataPhase1Parse , workspacePath);
    //console.log(JSON.stringify(dataPhase2Merged));
    //console.log(JSON.stringify(dataPhase2Merged));

    let validator = new WorkspaceConfigValidator();
    let result = validator.validate(dataPhase2Merged);
    if(result)
      throw new Error(result);

    console.log("dataPhase2Merged");
    return dataPhase2Merged;
  }

  async _postProcessConfigObject(configOrg, workspacePath){

    if(configOrg){
      if(!configOrg.menu) configOrg.menu = [];
      if(!configOrg.collections) configOrg.collections = [];
      if(!configOrg.singles) configOrg.singles = [];
    }

    // MERGE INCLUDES
    configOrg = this._loadIncludes(configOrg, workspacePath);
    //console.log(configOrg.hugover)

    let newSingles = [];
    await Promise.all(configOrg.singles.map(async (x) => {
      let mp =  await this.getMergePartialResult(x,workspacePath)
      //console.log(mp)
      newSingles.push(mp);
    }));


    configOrg.singles = newSingles;
    configOrg.collections = [];
    //configOrg.singles = [];

    // CLEANUP
    if(configOrg.menu.length < 1) delete configOrg['menu'];
    if(configOrg.collections.length < 1) delete configOrg['collections'];
    if(configOrg.singles.length < 1) delete configOrg['singles'];


    console.log("_postProcessConfigObject")
    console.log(configOrg)

    return configOrg;
    //console.log(configOrg.singles)
    //console.log(configOrg.singles)
    //
    //


    //})();

    //configOrg.singles = singlesNew;


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

    });;

    return {...configObject, ...newObject}
  }

  async getMergePartialResult(mergeKey, workspacePath){
    let result = await this._mergePartials(mergeKey, workspacePath);
    //await Promise.all(result);
    return result
  }
  /*
  getMergePartialResult(mergeKey, workspacePath) {
    this._mergePartials(mergeKey, workspacePath)
      .then(function(response) {
        return response;
      })
  }
  */

  _mergePartials(mergeKey, workspacePath){

    return new Promise(async (resolve, reject)=>{

      if( "_mergePartial" in mergeKey){

        let filePartial = "";

        if(mergeKey._mergePartial.startsWith("file://")) {
          filePartial = mergeKey._mergePartial.substring(7);
          //TODO implement relative path
        }
        else if(mergeKey._mergePartial.startsWith("http://") || mergeKey._mergePartial.startsWith("https://") ){

          const filePartialDir = path.join(workspacePath,'.quiqr-cache','model','partials');
          await fs.ensureDirSync(filePartialDir);

          let encodeFilename = encodeURIComponent(mergeKey._mergePartial);
          let destination = path.join(filePartialDir,encodeFilename);
          filePartial = await this._getRemotePartial(mergeKey._mergePartial, destination);

        }
        else{
          let filePartialPattern = path.join(workspacePath,'quiqr','model','partials',mergeKey._mergePartial+'.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
          let files = glob.sync(filePartialPattern);
          if( files.length > 0 ){
            filePartial = files[0];
          }
        }

        //console.log(files[0]);

        //console.log("NEXT")
        //console.log(filePartial);
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
          newData.fields = newData.fields.reverse().filter((field, index, self) =>
            index === self.findIndex((t) => (
              t.key === field.key
            ))
          )
          //RESTORE ORDER AGAIN
          newData.fields = newData.fields.reverse();

          mergeKey = newData;

          //ONLY WHEN MERGE WAS SUCCESFULL DELETE THE KEY TO PREVENT ERROR.
          delete mergeKey['_mergePartial'];
        }
      }

      //console.log(mergeKey)
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
        service.api.logToConsole(err);
      });

      req.on('response', (response) => {
        response.on('error', (error) => {
          service.api.logToConsole(error);
          reject(err);
        })

        response.on('end', async () => {
          try{
            fs.writeFileSync( destination, data);
            //console.log(destination)
            resolve(destination);
          }
          catch(e){
            console.log(e);
          }

        });
        response.on("close", () => {
          //console.log("close")
        });
        response.on("data", chunk => {
          //console.log("thefile");
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
