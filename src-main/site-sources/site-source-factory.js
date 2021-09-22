const FolderSiteSource = require('./folder-site-source');

class SiteSourceFactory{
    get(key, config) {
        let Type = this.getType(config);
        let instance = new Type({...config, key});
        return instance;
    }

    getType(config){
        let type = config.type.toLowerCase();
        if(type==='folder')
            return FolderSiteSource;
        else
            throw new Error(`Site source (${config.type}) not implemented.`);
    }
}

module.exports = new SiteSourceFactory();
