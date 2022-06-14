const fs         = require('fs-extra');
const pathHelper = require('./../../utils/path-helper');

class FolderSiteSourceBuilder {

  constructor(){
  }

  async build(config){
    let siteConfig = {
      key: config.key,
      name: config.key,
      source: { type: 'folder', path: config.folderPath },
      publish: [
        {
          key: 'default',
          config: {
            type: 'folder', //will publish to a folder
            path: null //will use the default generated path
          }
        }
      ]
    };

    let configPath = pathHelper.getSiteMountConfigPath(config.key);
    fs.ensureDirSync(pathHelper.getRoot());
    fs.writeFileSync(configPath, JSON.stringify(siteConfig, null, '  '), 'utf8');
  }

}

module.exports = FolderSiteSourceBuilder;
