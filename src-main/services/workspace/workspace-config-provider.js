const fs                            = require('fs-extra');
const path                          = require('path');
const glob                          = require('glob');
const { FileCacheToken }            = require('./file-cache-token');
const WorkspaceConfigValidator      = require('./workspace-config-validator');
const InitialWorkspaceConfigBuilder = require('./initial-workspace-config-builder');
const pathHelper                    = require('./../../utils/path-helper');
const formatProviderResolver        = require('./../../utils/format-provider-resolver');
const deepmerge                     = require('deepmerge');

class WorkspaceConfigProvider{

  constructor(){
    this.cache = {};
  }

  clearCache(){
    this.cache = {};
  }

  async getConfig(workspacePath, workspaceKey){

    let filePath = this._getFilePath(workspacePath);
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

    config = this._loadConfigurationsData(filePath, workspaceKey, workspacePath);
    config.path = workspacePath;
    config.key = workspaceKey;

    this.cache[filePath] = { token, config }
    return config;

  }

  //CREATE quiqr/base.yaml
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

  _loadConfigurationsData(filePath, workspaceKey, workspacePath){

    let strData = fs.readFileSync(filePath,'utf8');
    let formatProvider = formatProviderResolver.resolveForFilePath(filePath);
    if(formatProvider==null){
      formatProvider = formatProviderResolver.getDefaultFormat();
    }

    let dataPhase1Parse = formatProvider.parse(strData);
    let dataPhase2Merged = this._postProcessConfigObject(dataPhase1Parse , workspacePath);

    let validator = new WorkspaceConfigValidator();
    let result = validator.validate(dataPhase2Merged);
    if(result)
      throw new Error(result);

    return dataPhase2Merged;
  }

  _postProcessConfigObject(configOrg, workspacePath){

    if(configOrg){
      if(!configOrg.menu) configOrg.menu = [];
      if(!configOrg.collections) configOrg.collections = [];
      if(!configOrg.singles) configOrg.singles = [];
    }

    // MERGE INCLUDES
    configOrg = this._loadIncludes(configOrg, workspacePath);

    // MERGE PARTIALS
    configOrg.collections = configOrg.collections.map(x => this._mergePartials(x, workspacePath));
    configOrg.singles = configOrg.singles.map(x => this._mergePartials(x, workspacePath));

    // CLEANUP
    if(configOrg.menu.length < 1) delete configOrg['menu'];
    if(configOrg.collections.length < 1) delete configOrg['collections'];
    if(configOrg.singles.length < 1) delete configOrg['singles'];

    return configOrg;
  }

  _loadIncludes(configObject, workspacePath){
    let fileIncludes = path.join(workspacePath,'quiqr','model','includes','*.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    let files = glob.sync(fileIncludes);

    let newObject = {}
    files.forEach((filename)=>{

      let strData = fs.readFileSync(filename,'utf8');
      let formatProvider = formatProviderResolver.resolveForFilePath(files[0]);
      if(formatProvider==null){
        formatProvider = formatProviderResolver.getDefaultFormat();
      }
      let mergeData = formatProvider.parse(strData);

      newObject[path.parse(filename).name] = deepmerge(mergeData, configObject[path.parse(filename).name]);

    });;

    return {...configObject, ...newObject}
  }

  _mergePartials(mergeKey, workspacePath){
    if( "_mergeFromPartial" in mergeKey){
      let filePartial = path.join(workspacePath,'quiqr','model','partials',mergeKey._mergeFromPartial+'.{'+formatProviderResolver.allFormatsExt().join(',')+'}');

      let files = glob.sync(filePartial);
      if( files.length > 0 && fs.existsSync(files[0]) ){

        let strData = fs.readFileSync(files[0],'utf8');
        let formatProvider = formatProviderResolver.resolveForFilePath(files[0]);
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
        delete mergeKey['_mergeFromPartial'];
      }
    }
    return mergeKey;
  }
}

module.exports = {
  WorkspaceConfigProvider
}
