class FolderSiteSource {

  constructor(config){
    this.config = config;
  }

  listWorkspaces(){
    return Promise.resolve([{ 'key': 'source', 'path': this.config.path, 'state':'mounted' }]);
  }

  mountWorkspace(){
    return Promise.resolve(undefined);
  }

  update(){
    return Promise.resolve();
  }
}

module.exports = FolderSiteSource;
