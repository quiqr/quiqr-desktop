const FolderSiteSourceBuilder = require('./folder-site-source-builder');

class SiteSourceBuilderFactory{
  get(type){
    type = type.toLowerCase();
    if(type==='folder'){
      return new FolderSiteSourceBuilder();
    }
    else{
      throw new Error('Site source builder not implemented.');
    }
  }
}

module.exports = new SiteSourceBuilderFactory();
