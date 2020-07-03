const fs = require('fs-extra');
const pathHelper = require('./../../path-helper');

class FolderSiteSourceBuilder/*:: implements SiteSourceBuilder*/ {

    constructor(){
    }

    async build(config/*: BuildConfig*/)/*:Promise<void>*/{
        let siteConfig/*: RawSiteConfig*/ = {
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

        let configPath = `${pathHelper.getRoot()}config.${config.key}.json`;
        fs.ensureDirSync(pathHelper.getRoot());
        fs.writeFileSync(configPath, JSON.stringify(siteConfig,null,'  '), 'utf8');
    }

}

module.exports = FolderSiteSourceBuilder;
