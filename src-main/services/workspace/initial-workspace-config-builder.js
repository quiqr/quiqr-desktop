const path                   = require('path');
const glob                   = require('glob');
const fs                     = require('fs-extra');
const formatProviderResolver = require('./../../utils/format-provider-resolver');
const pathHelper             = require('./../../utils/path-helper');

class InitialWorkspaceConfigBuilder{

  constructor(workspacePath){
    this.workspacePath = workspacePath;
  }

  buildAll(hugoVersion="0.88.1"){

    this.buildHomeReadme();

    let {dataBase, formatProvider} = this.buildBase(hugoVersion);

    /*
    let dataInclude = this.buildInclude();
    let dataPartial = this.buildPartials();
    */

    fs.ensureDirSync(path.join(this.workspacePath,'quiqr','model'));
    fs.ensureDirSync(path.join(this.workspacePath,'quiqr','model','includes'));
    fs.ensureDirSync(path.join(this.workspacePath,'quiqr','model','partials'));

    /*
    let filePathInclude = path.join(this.workspacePath,'quiqr','model','includes','collections.'+formatProvider.defaultExt());
    let filePathPartial = path.join(this.workspacePath,'quiqr','model','partials', 'page.'+formatProvider.defaultExt());
    */
    let filePathBase    = path.join(this.workspacePath,'quiqr','model','base.'+formatProvider.defaultExt());


    fs.writeFileSync(
      filePathBase,
      formatProvider.dump(dataBase)
    );
    /*
    fs.writeFileSync(
      filePathInclude,
      formatProvider.dump(dataInclude)
    );
    fs.writeFileSync(
      filePathPartial,
      formatProvider.dump(dataPartial)
    );
    */

    return filePathBase;
  }

  getConfig(opts){

    let rootKeysLower = {};
    Object.keys(opts.hugoConfigData).forEach(key => rootKeysLower[key.toLowerCase()] = key);

    const getBestKey = (key) => {
      return rootKeysLower[key.toLowerCase()] || key;
    }

    return {
      "hugover": opts.hugover||'',
      "serve":[
        {"key": "default", "config": opts.configFile }
      ],
      "build":[
        {"key": "default", "config": opts.configFile }
      ],
      "menu":[
        {
          "key": "settings",
          "title": "Settings",
          "menuItems": [
            {"key":"mainConfig"},
          ]
        },
      ],
      "singles":[
        {
          "key": "mainConfig",
          "title": "Site Configuration",
          "file": `${opts.configFile}`,
          "fields":[
            { "key": getBestKey("title"), "title":"Site Title", "type":"string", "tip":"Your page title." },
            { "key": getBestKey("baseURL"), "title":"Base URL", "type":"string", "tip":"Your site URL." },
          ]
        }
      ]
    }
  }

  buildPartials(){
    let data = {
      "dataformat": "yaml",
      "fields":[
        { "key":"info", "type":"info", "content":"# Info\nYou can write custom instructions here." },
        { "key":"title", "title":"Title", "type":"string" },
        { "key":"mainContent", "title":"Content", "type":"markdown" },
        { "key":"pubdate", "title":"Pub Date", "type":"date", "default":"now" },
        { "key":"draft", "title":"Draft", "type":"boolean" },
        { "key":"bundle-manager", "type":"bundle-manager", "path":"imgs", "extensions":["png","jpg","gif"], "fields":[
          { "key":"title", "title":"Title", "type":"string" },
          { "key":"description", "title":"Description", "type":"string", "multiLine":true }
        ]}
      ]

    }

    return data;
  }

  buildInclude(){
    let data = [
      {
        "key": "pages",
        "title": "Other Pages",
        "folder": "content/page/",
        "extension": "md",
        "itemtitle": "Page",
        "_mergePartial": "page"
      }
    ];

    return data;
  }

  buildBase(hugoVersion){

    //let hugoConfigExp = path.join(this.workspacePath,'config.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    //let hugoConfigPath = glob.sync(hugoConfigExp)[0];

    let hugoConfigPath = pathHelper.hugoConfigFilePath(this.workspacePath)
    let formatProvider;

    if(hugoConfigPath==null){
      hugoConfigPath = path.join(this.workspacePath, 'config.'+formatProviderResolver.getDefaultFormatExt());
      formatProvider = formatProviderResolver.getDefaultFormat();
      let minimalConfigStr = formatProvider.dump({title:'New Site Title', baseURL: 'http://newsite.com'});
      fs.writeFileSync(hugoConfigPath, minimalConfigStr, 'utf-8');
    }
    else{
      formatProvider = formatProviderResolver.resolveForFilePath(hugoConfigPath);
    }

    if(formatProvider==null){
      throw new Error('Could not resolve a FormatProvider.');
    }

    let hugoConfigData = formatProvider.parse(fs.readFileSync(hugoConfigPath, 'utf-8'));
    let relHugoConfigPath = path.relative(this.workspacePath, hugoConfigPath);

    let dataBase = this.getConfig({
      configFile: relHugoConfigPath,
      ext: formatProvider.defaultExt(),
      hugover: hugoVersion,
      hugoConfigData }
    );

    return {formatProvider, dataBase};
  }

  buildHomeReadme(){
    //THIS SEEMS NEW. CHECK IF README EXIST OR CREATE
    let readmePath = path.join(this.workspacePath,'quiqr','home','index.md');
    if( !fs.existsSync(readmePath) ){
      fs.ensureDirSync(path.join(this.workspacePath,'quiqr','home'));
      fs.writeFileSync(
        readmePath,
        `
# README FOR NEW SITE

If you're a website developer you can read the [Quiqr Site Developer
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
}

module.exports = InitialWorkspaceConfigBuilder;
