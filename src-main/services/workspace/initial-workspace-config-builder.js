const path                   = require('path');
const glob                   = require('glob');
const fs                     = require('fs-extra');
const formatProviderResolver = require('./../../utils/format-provider-resolver');

class InitialWorkspaceConfigBuilder{

  constructor(workspacePath){
    this.workspacePath = workspacePath;
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
          "key": "content",
          "title": "Content",
          "menuItems": [
            {"key":"frontpage"},
            {"key":"pages"},
          ]
        },
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
          "key": "frontpage",
          "title": "Front Page",
          "file": "content/_index.md",
          "_mergePartial": "page"
        },
        {
          "key": "mainConfig",
          "title": "Site Configuration",
          "file": `config.${opts.ext}`,
          "fields":[
            { "key": getBestKey("title"), "title":"Site Title", "type":"string", "tip":"Your page title." },
            { "key": getBestKey("baseURL"), "title":"Base URL", "type":"string", "tip":"Your site URL." },
            { "key": getBestKey("theme"), "title":"Theme", "type":"readonly", "tip":"The current theme." },
            { "key": getBestKey("languageCode"), "title":"Language Code", "type":"readonly" },
            { "key": getBestKey("googleAnalytics"), "title":"Google Analytics", "type":"string", "tip":"Provide a Google Analitics Tracking Code to enable analytics." },
            { "key": getBestKey("enableRobotsTXT"), "title":"Enable Robots", "type":"boolean", "default":true, "tip":"If you want you page to be indexed, keep this enabled." }
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

  buildBase(){
    let hugoConfigExp = path.join(this.workspacePath,'config.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
    let hugoConfigPath = glob.sync(hugoConfigExp)[0];
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
      hugover: '0.88.1',
      hugoConfigData }
    );

    return {formatProvider, dataBase};
  }

  buildHomeReadme(){

  }
}

module.exports = InitialWorkspaceConfigBuilder;
