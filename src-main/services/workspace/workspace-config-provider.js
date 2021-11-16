const InitialWorkspaceConfigBuilder = require('./initial-workspace-config-builder');
const pathHelper                    = require('./../../utils/path-helper');
const formatProviderResolver        = require('./../../utils/format-provider-resolver');
const deepmerge                     = require('deepmerge');

class WorkspaceConfigProvider{

  constructor(){
    this.cache = {};
  }

  clearCache(){
    //this.cache = {};
  }

  async getConfig(workspacePath, workspaceKey){

    let filePath = this._getFilePath(workspacePath);
    let config;

    //console.log(Object.keys( this.cache ));

    if(filePath!=null){
      const cached = this.cache[filePath];
      const token = await new FileCacheToken([filePath]).build();

      if(cached!=null){
        if(await cached.token.match(token)){ //can be reused
          return cached.config;
        }
      }

      let config = this._loadConfigurationsData(filePath, workspaceKey, workspacePath);
      config.path = workspacePath;
      config.key = workspaceKey;

      this.cache[filePath] = { token, config }
      return config;

    }
    else{
      // need to build default config and update cache
      const newConfig = this._buildDefaultConfig(workspacePath);
      config = newConfig.config;
      filePath = newConfig.path;
      const token = await (new FileCacheToken([filePath])).build();
      config.path = workspacePath;
      config.key = workspaceKey;
      this.cache[filePath] = { token, config }
      return config;
    }
  }

  //CREATE poppygo/base.yaml
  _getFilePath(workspacePath){

    let fileExpPrimary = path.join(workspacePath,'poppygo','model','base.{'+formatProviderResolver.allFormatsExt().join(',')+'}');

    if( glob.sync(fileExpPrimary).length > 0 ){
      return glob.sync(fileExpPrimary)[0];
    }

    let fileExpFallback = path.join(workspacePath,'sukoh.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    return glob.sync(fileExpFallback)[0];
  }

  //CREATE poppygo/base.yaml
  _buildDefaultConfig(workspacePath){
    let configBuilder = new InitialWorkspaceConfigBuilder(workspacePath);
    let {data, formatProvider} = configBuilder.build();

    fs.ensureDirSync(path.join(workspacePath,'poppygo','model'));

    let filePath = path.join(workspacePath,'poppygo','model','base.'+formatProvider.defaultExt());
    fs.writeFileSync(
      filePath,
      formatProvider.dump(data)
    );
    return { config: data, path: filePath };
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
      if(!configOrg.collections) configOrg.collections = [];
      if(!configOrg.singles) configOrg.singles = [];
    }

    configOrg = this._loadIncludes(configOrg, workspacePath);

    // MERGE PARTIALS
    configOrg.collections = configOrg.collections.map(x => this._mergePartials(x, workspacePath));
    configOrg.singles = configOrg.singles.map(x => this._mergePartials(x, workspacePath));
    return configOrg;
  }

  _loadIncludes(configObject, workspacePath){
    let fileIncludes = path.join(workspacePath,'poppygo','model','includes','*.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
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
      let filePartial = path.join(workspacePath,'poppygo','model','partials',mergeKey._mergeFromPartial+'.{'+formatProviderResolver.allFormatsExt().join(',')+'}');

      let files = glob.sync(filePartial);
      if( files.length > 0 && fs.existsSync(files[0]) ){

        let strData = fs.readFileSync(files[0],'utf8');
        let formatProvider = formatProviderResolver.resolveForFilePath(files[0]);
        if(formatProvider==null){
          formatProvider = formatProviderResolver.getDefaultFormat();
        }
        let mergeData = formatProvider.parse(strData);
        let newData = deepmerge(mergeData, mergeKey);

        newData.fields = newData.fields.reverse().filter((field, index, self) =>
          index === self.findIndex((t) => (
            t.key === field.key
          ))
        )

        mergeKey = newData;
        //only when merge was succesfull delete the key to prevent error.
        delete mergeKey['_mergeFromPartial'];
      }
    }
    return mergeKey;
  }
}

module.exports = {
  WorkspaceConfigProvider
}
