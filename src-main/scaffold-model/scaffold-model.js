const electron                 = require('electron')
const dialog                   = electron.dialog;
const fs                       = require('fs-extra');
const pathHelper               = require('../utils/path-helper');
const path                     = require('path');
const mkdirp                   = require('mkdirp');
const glob                          = require('glob');

const WorkspaceService         = require('../services/workspace/workspace-service')
const formatProviderResolver   = require('../utils/format-provider-resolver');

const singleExtensions    = [
  'toml',
  'yaml',
  'yml',
  'json',
  'md'
]

const mainWindow           = global.mainWindow;

class ScaffoldModel {

  checkCurrentSiteKey(){

    if(global.currentSiteKey){
      return true;
    }
    else {
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        buttons: ["Close"],
        title: "Warning",
        message: "First, you need to select a site.",
      });
      return;
    }

  }

  checkScaffoldPathInCurrentSitePath(scaffoldPath){
    if(scaffoldPath.includes(global.currentSitePath)){
      return true;

    }
    else {
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        buttons: ["Close"],
        title: "Warning",
        message: "A scaffold source file should be located inside the site path",
      });
      return;
    }
  }

  async scaffoldSingle(filePath=null) {

    if(!this.checkCurrentSiteKey()) {return;}

    if(!filePath){
      let files = dialog.showOpenDialogSync(mainWindow, {
        defaultPath: global.currentSitePath,
        filters: [
          { name: "Data files", extensions: singleExtensions }
        ],
        properties: ['openFile'] })

      if (!files || files.length != 1) {
        return;
      }
      filePath = files[0];
    }
    else {
      let filename = filePath.split('/').pop();
      let options  = {
        buttons: ["Yes","Cancel"],
        message: "You're about to scaffold the file "+filename+". Do you like to continue?"
      }
      let response = dialog.showMessageBox(options)
      if(response === 1) return;
    }

    if(!this.checkScaffoldPathInCurrentSitePath(filePath)) {return;}

    let workspaceService = new WorkspaceService(global.currentSitePath, 'source', global.currentSiteKey);
    let data = fs.readFileSync(filePath,'utf8');
    let extension = path.extname(filePath).replace('.','');
    let fileObject = await workspaceService._smartParse(filePath, [extension], data);
    await this.createSingleFromObject(fileObject, filePath, this.fileType(extension));

    const singleOutFilePath = path.join(global.currentSitePath,"quiqr","model","includes","singles",this.singleConfObject.key+'.yaml');
    let stringData = await workspaceService._smartDump(singleOutFilePath, ['yaml'], this.singleConfObject);

    mkdirp.sync(path.dirname(singleOutFilePath));
    fs.writeFileSync(singleOutFilePath, stringData);

    this.addNewDataKeyToMenu(this.singleConfObject.key);

    dialog.showMessageBox(mainWindow, {
      type: 'info',
      buttons: ["Close"],
      title: "Finished task",
      message: "File has been scaffold.",
    });

  }

  async addNewDataKeyToMenu(key){
    let siteMenuIncludePath = path.join(global.currentSitePath,'quiqr','model','includes','menu.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    let files = glob.sync(siteMenuIncludePath);
    let workspaceService = new WorkspaceService(global.currentSitePath, 'source', global.currentSiteKey);

    let lastFileName = '';
    let mergeData = [];
    files.forEach(async (filename)=>{
      lastFileName = filename;
      let strData = fs.readFileSync(filename,'utf8');
      let formatProvider = formatProviderResolver.resolveForFilePath(files[0]);
      if(formatProvider==null){
        formatProvider = formatProviderResolver.getDefaultFormat();
      }
      mergeData = formatProvider.parse(strData);
    });
    mergeData.push({
      key: key,
      title: "scaffolded item",
      menuItems: [{key: key}]
    });

    let extension = path.extname(lastFileName).replace('.','');
    let stringData = await workspaceService._smartDump(lastFileName, [extension], mergeData);
    fs.writeFileSync(lastFileName, stringData);

  }

  fileType(extension){
    if(extension.toLowerCase() === 'md'){
      return 'md';
    }
    else if(extension.toLowerCase() === 'yml' || extension.toLowerCase() === 'yaml'){
      return 'yml';
    }
    else if(extension.toLowerCase() === 'toml'){
      return 'toml';
    }
    else if(extension.toLowerCase() === 'json'){
      return 'json';
    }
  }

  async createSingleFromObject(fileObject, filePath, fileType){
    let uniqNormalizedKeyName = path.basename(filePath,path.extname(filePath)) +"_"+pathHelper.randomPathSafeString(4);
    let relativeFilePath = path.relative(currentSitePath, filePath);

    this.singleConfObject = {
      key: uniqNormalizedKeyName,
      title: "single: " + path.basename(filePath),
      description: "scaffolded single file",
      file: relativeFilePath,
      hidePreviewIcon: true,
      fields: []
    };

    if(fileType === "md"){
      let formatProvider = await formatProviderResolver.resolveForMdFilePromise(filePath);
      let dataformat = 'yaml';
      if(typeof formatProvider !== 'undefined'){
        dataformat = formatProvider.defaultExt();
      }
      this.singleConfObject.dataformat = dataformat;
    }

    let obj = {};
    if(Object.prototype.toString.call(fileObject) === '[object Array]') {
      this.singleConfObject.pullOuterRootKey = "root"
      obj.root = fileObject;
    }
    else {
      obj = fileObject;
    }

    let fields = [];
    this.parseKeysToFields(obj, fields, 0);
    this.singleConfObject.fields = fields;
  }

  isScalar(value){
    const valueType = Object.prototype.toString.call(value);
    if(valueType === '[object String]'){
      return true;
    }
    else if(valueType === '[object Number]'){
      return true;
    }
    else if(valueType === '[object String]'){
      return true;
    }
    else if(valueType === '[object Boolean]'){
      return true;
    }
    return false;
  }

  isArray(value){
    const valueType = Object.prototype.toString.call(value);
    if(valueType === '[object Array]'){
      return true;
    }
  }

  isObject(value){
    const valueType = Object.prototype.toString.call(value);
    if(valueType === '[object Object]'){
      return true;
    }
  }

  scalarConf(key, value){
    const valueType = Object.prototype.toString.call(value);
    let conf = {
      key: key
    }

    if(key === "mainContent" && valueType === '[object String]'){
      conf.title = "Main Content",
      conf.type = "markdown";
    }
    else if(valueType === '[object Number]'){
      conf.type = "number";
    }
    else if(valueType === '[object Boolean]'){
      conf.type = "boolean";
    }
    else if(valueType === '[object String]'){
      conf.type = "string";
    }
    return conf;
  }

  pushOrSet(fields, key, value){
    if(this.isArray(fields)){
      fields.push(value);
    }
    else if(this.isObject(fields)){
      fields[key] = value;
    }
  }

  parseKeysToFields(obj, fields, level){
    Object.keys(obj).forEach((key)=>{

      if(this.isScalar(obj[key])){
        this.pushOrSet(fields, key, this.scalarConf(key, obj[key]))
      }
      else if(this.isArray(obj[key])){
        if(obj[key].length > 0){
          let sub = {};
          if(this.isScalar(obj[key][0])){
            sub = {
              key: key,
              type: "leaf-array",
              field: this.scalarConf('item',obj[key][0])
            };
          }
          else if(this.isObject(obj[key][0])){
            sub = {
              key: key,
              type: "accordion",
              fields: []
            };
            this.parseKeysToFields(obj[key][0], sub.fields, (level+1) );
            sub.fields[0].arrayTitle = true;
          }
          this.pushOrSet(fields, key, sub)
        }
      }
      else if(this.isObject(obj[key])){
        let sub = {
          key: key,
          type: "nest",
          groupdata: true,
          fields: []
        }
        this.parseKeysToFields(obj[key], sub.fields, (level+1) );
        this.pushOrSet(fields, key, sub)
      }
    });
  }
}

module.exports = new ScaffoldModel();
