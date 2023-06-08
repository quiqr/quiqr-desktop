const path                      = require('path');
const fs                        = require('fs-extra');
const outputConsole             = require('../../logger/output-console');
const configurationDataProvider = require('../../app-prefs-state/configuration-data-provider')
const Embgit                    = require('../../embgit/embgit');
const pathHelper                = require('../../utils/path-helper');
const cliExecuteHelper          = require('../../utils/cli-execute-helper');
const fileDirUtils              = require('../../utils/file-dir-utils');
const { EnvironmentResolver }   = require('../../utils/environment-resolver');

const gitBin = Embgit.getGitBin();
const environmentResolver = new EnvironmentResolver();
const UQIS = environmentResolver.getUQIS();

let mainWindow = global.mainWM.getCurrentInstance();

class GithubSync {

  constructor(config, siteKey){
    this._config = config;
    this.siteKey = siteKey;
    this.from = pathHelper.getLastBuildDir();
  }

  async actionDispatcher(action, parameters){

    switch(action){
      case 'readRemote': {
        let historyRemote;
        if(historyRemote = await this._historyRemoteFromCache()){
          return historyRemote;
        }
        else{
          return await this._historyRemote();
        }
        break;
      }
      case 'refreshRemote': {
        return await this._historyRemote();
        break;
      }

      case 'checkoutRef': {
        return this._checkoutRef(parameters)
        break;
      }
      case 'pullFromRemote': {
        return this.pullFastForwardMerge()
        break;
      }
      case 'hardPush': {
        return this.hardPush()
        break;
      }
      case 'checkoutLatest': {
        return this.checkoutLatest()
        break;
      }
      case 'pushWithSoftMerge': {
        return this.pushWithSoftMerge()
        break;
      }
      default:{ throw new Error('Not implemented.') }
    }
  }


  _readSyncIgnoreFileToArray(){
    const filepath = path.join(pathHelper.getSiteRootMountPath(),'quiqr','sync_ignore.txt')

    if(fs.existsSync(filepath)){
      let strData = fs.readFileSync(filepath, {encoding: 'utf-8'});
      if(strData){
        let arrData = strData.split("\n");
        arrData = [...new Set(arrData)];
        arrData = arrData.filter((item)=>{
          if(item === '') return false;
          if(item.trim().startsWith('#')) return false;
          return true
        });

        console.log('read');
        console.log(arrData);
      }
    }

    return [];
  }

  checkoutLatest(){
    console.log('checkoutLatest');
  }

  async hardPush(){
    console.log('hardPush');

    const tmpDir = pathHelper.getTempDir();
    await this._ensureSyncDirEmpty(tmpDir);

    const tmpCloneDir = path.join(pathHelper.getTempDir(), 'tmpclone');
    fs.mkdirSync(tmpCloneDir);


    const tmpkeypathPrivate = await this._tempCreatePrivateKey();

    const parentPath = path.join(pathHelper.getRoot(),'sites', this.siteKey, 'githubSyncRepo');
    await this._ensureSyncDirEmpty(parentPath);

    outputConsole.appendLine('START GITHUB CHECKOUT');
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('  git binary:          ' + gitBin);
    outputConsole.appendLine('  git url:             ' + this._fullGitHubUrl());
    outputConsole.appendLine('  private key path:    ' + tmpkeypathPrivate);
    outputConsole.appendLine('  destination path:    ' + this._fullDestinationPath());
    outputConsole.appendLine('');
    outputConsole.appendLine('  github username:     ' + this._config.username);
    outputConsole.appendLine('  github repository:   ' + this._config.repository);
    outputConsole.appendLine('  github email:        ' + this._config.email);
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('');

    mainWindow.webContents.send("updateProgress", 'Gettting latest remote commit history..', 20);
    await cliExecuteHelper.try_execute("git-clone", gitBin, ["clone", "-s", "-i", tmpkeypathPrivate, this._fullGitHubUrl() , tmpCloneDir ]);

    mainWindow.webContents.send("updateProgress", 'Copying to commit history to destination directory', 30);
    fs.copySync(path.join(tmpCloneDir, '.git'), path.join(this._fullDestinationPath(), '.git'));

    let ignoreList = this._readSyncIgnoreFileToArray();
    ignoreList.push('.git')
    ignoreList.push('quiqr-cache')
    if(this._config.publishScope === "source"){
      ignoreList.push('public')
    }

    const filter = file => {
      let rootFile = file.substr(global.currentSitePath.length+1);
      if(rootFile.substr(0,1)==='/'){
        rootFile = rootFile.substr(1)
      }
      if(!ignoreList.includes(rootFile)) {
        return true;
      }
    }

    mainWindow.webContents.send("updateProgress", 'Copying site files to git destination directory', 40);
    fs.copySync(global.currentSitePath, this._fullDestinationPath(), { filter })

    if(this._config.publishScope === "source"){
      if(this._config.setGitHubActions){
        await this._github_action_workflow_source(this._fullDestinationPath());
      }
    }

    await this.publish_step3_add_commit_push(tmpkeypathPrivate, this._fullDestinationPath())

    return true;
  }

  _fullGitHubUrl(){
    return 'git@github.com:' + this._config.username + '/' + this._config.repository +'.git';
  }

  _fullDestinationPath(){
    const resolvedDest = path.join(pathHelper.getRoot(),'sites', this.siteKey, 'githubSyncRepo');
    return path.join(resolvedDest , this._config.repository);
  }

  _remoteHistoryCacheFile(){
    const resolvedDest = path.join(pathHelper.getRoot(),'sites', this.siteKey );
    return path.join(resolvedDest , 'githubSync-'+ this._config.repository + '-cache_remote_history.json');
  }

  async _checkoutRef(parameters){

    const tmpkeypathPrivate = await this._tempCreatePrivateKey();

    const parentPath = path.join(pathHelper.getRoot(),'sites', this.siteKey, 'githubSyncRepo');
    await this._ensureSyncDirEmpty(parentPath);

    outputConsole.appendLine('START GITHUB CHECKOUT');
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('  git binary:          ' + gitBin);
    outputConsole.appendLine('  git url:             ' + this._fullGitHubUrl());
    outputConsole.appendLine('  private key path:    ' + tmpkeypathPrivate);
    outputConsole.appendLine('  destination path:    ' + this._fullDestinationPath());
    outputConsole.appendLine('');
    outputConsole.appendLine('  github username:     ' + this._config.username);
    outputConsole.appendLine('  github repository:   ' + this._config.repository);
    outputConsole.appendLine('  github email:        ' + this._config.email);
    outputConsole.appendLine('');
    outputConsole.appendLine('  git ref:             ' + parameters.ref);
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('');

    mainWindow.webContents.send("updateProgress", 'Making a fresh clone of the repository..', 20);
    await cliExecuteHelper.try_execute("git-clone", gitBin, ["clone", "-s", "-i", tmpkeypathPrivate, this._fullGitHubUrl() , this._fullDestinationPath() ]);

    mainWindow.webContents.send("updateProgress", 'Checking out ref:'+parameters.ref, 70);
    await cliExecuteHelper.try_execute("git-checkout", gitBin, ["checkout", '-r', parameters.ref, this._fullDestinationPath() ]);

    mainWindow.webContents.send("updateProgress", 'Copying to main site directory', 90);
    const filter = file => {
      return file !== '.git'
    }

    await this._ensureSyncDirEmpty(global.currentSitePath);
    fs.copySync(this._fullDestinationPath(), global.currentSitePath, { filter })

    return true;

  }

  async _historyRemote(){

    //historySize=20;

    mainWindow.webContents.send("updateProgress", 'Getting remote commits.', 20);
    const historyRemoteJson = await cliExecuteHelper.try_execute("git-log-remote", gitBin, [ "log_remote", "-s", "-i", await this._tempCreatePrivateKey(), this._fullGitHubUrl() ]);
    const historyRemoteArr = JSON.parse(historyRemoteJson);

    let historyLocalArr = [];
    if(await fs.existsSync(this._fullDestinationPath())){
      mainWindow.webContents.send("updateProgress", 'Comparing with local commit history', 80);
      const historyLocalJson = await cliExecuteHelper.try_execute("git-log-local", gitBin, [ "log_local", this._fullDestinationPath() ]);
      historyLocalArr = JSON.parse(historyLocalJson);
    }

    let historyMergedArr = [];
    historyRemoteArr.forEach((commit)=>{

      if (historyLocalArr.filter(e => e.ref === commit.ref).length > 0) {
        commit.local = true;
      }
      historyMergedArr.push(commit);
    })

    let historyMergedJson = JSON.stringify(historyMergedArr);

    mainWindow.webContents.send("updateProgress", 'Writing commit history cache', 100);
    await fs.writeFileSync(this._remoteHistoryCacheFile(), historyMergedJson,'utf-8');
    let stat = await fs.statSync(this._remoteHistoryCacheFile());

    return {lastRefresh: stat['mtime'], commitList: historyMergedArr};
  }

  async _historyRemoteFromCache(){
    if(await fs.existsSync(this._remoteHistoryCacheFile())){
      const historyRemoteJson = await fs.readFileSync(this._remoteHistoryCacheFile(), {encoding: 'utf8'});
      let stat = await fs.statSync(this._remoteHistoryCacheFile());
      return {lastRefresh: stat['mtime'], commitList: JSON.parse(historyRemoteJson)};
    }
    else{
      return null
    }
  }

  async pullFastForwardMerge(){

    const tmpkeypathPrivate = await this._tempCreatePrivateKey();
    Embgit.setPrivateKeyPath(tmpkeypathPrivate)
    const resolvedDest = path.join(pathHelper.getRoot(),'sites', this.siteKey, 'githubSyncRepo');
    const fullDestinationPath = path.join(resolvedDest , this._config.repository);
    const fullGitHubUrl = 'git@github.com:' + this._config.username + '/' + this._config.repository +'.git';
    let syncSelection = "all";

    return new Promise( async (resolve, reject)=>{
      try {

        if(!fs.existsSync(path.join(fullDestinationPath , '.git'))){
          console.log("start initial clone")
          await this.publish_step1_initial_clone(tmpkeypathPrivate, fullGitHubUrl, fullDestinationPath);
          console.log("finish initial clone")
        }

        Embgit.reset_hard(fullDestinationPath).then(async ()=>{

          Embgit.pull(fullDestinationPath)
            .then(()=>{

              //TODO use global.currentSitePath
              configurationDataProvider.get(async (err, configurations)=>{
                let site = configurations.sites.find((x)=>x.key===global.currentSiteKey);

                if(this._config.syncSelection && this._config.syncSelection !== "" && this._config.syncSelection !== "all"){
                  syncSelection = this._config.syncSelection;
                }

                await this._syncSourceToDestination(fullDestinationPath, site.source.path, syncSelection);
                resolve("reset-and-pulled-from-remote");
              });

            })
            .catch((err)=>{
              if(err.stdout.toString().includes("already up-to-date")) {
                configurationDataProvider.get(async (err, configurations)=>{
                  //TODO use global.currentSitePath
                  let site = configurations.sites.find((x)=>x.key===global.currentSiteKey);

                  if(this._config.syncSelection && this._config.syncSelection !== "" && this._config.syncSelection !== "all"){
                    syncSelection = this._config.syncSelection;
                  }

                  await this._syncSourceToDestination(fullDestinationPath, site.source.path, syncSelection);
                  console.log("not fail")
                  resolve("reset-and-synced-with-remote");
                });
              }

              //reject(err);
            })
        });
      } catch (err) {
        console.log("Pull Error:"+this.siteKey);
        if(err.stdout.toString().includes("already up-to-date")) {
          resolve("no_changes")
        }
        else if(err.stdout.toString().includes("non-fast-forward update")){
          resolve("non_fast_forward");
        }
        else{
          reject(err)
        }
      }
    });


  }

  async pushWithSoftMerge(){

    const tmpkeypathPrivate = await this._tempCreatePrivateKey();
    const resolvedDest = await this._ensureSyncRepoDir(this.siteKey);
    const fullGitHubUrl = 'git@github.com:' + this._config.username + '/' + this._config.repository +'.git';
    const fullDestinationPath = path.join(resolvedDest , this._config.repository);

    outputConsole.appendLine('START GITHUB SYNC');
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('  git binary:          ' + gitBin);
    outputConsole.appendLine('  git url:             ' + fullGitHubUrl);
    outputConsole.appendLine('  private key path:    ' + tmpkeypathPrivate);
    outputConsole.appendLine('  destination path:    ' + fullDestinationPath);
    outputConsole.appendLine('  from is:             ' + this.from);
    outputConsole.appendLine('');
    outputConsole.appendLine('  github username:     ' + this._config.username);
    outputConsole.appendLine('  github repository:   ' + this._config.repository);
    outputConsole.appendLine('  github email:        ' + this._config.email);
    outputConsole.appendLine('  github branch:       ' + this._config.branch);
    outputConsole.appendLine('  github publishScope: ' + this._config.publishScope);
    outputConsole.appendLine('  github set actions:  ' + this._config.setGitHubActions);
    outputConsole.appendLine('  override BaseURL:    ' + this._config.overrideBaseURL);
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('');

    mainWindow.webContents.send("updateProgress", 'Get remote files..', 20);
    await this.publish_step1_initial_clone(tmpkeypathPrivate, fullGitHubUrl, fullDestinationPath);

    mainWindow.webContents.send("updateProgress", 'Prepare files before uploading..', 30);
    if(this._config.publishScope === "build"){
      await this.publish_step2_preprare_dircontents_build(fullDestinationPath)
    }
    else{
      await this.publish_step2_preprare_dircontents_source(fullDestinationPath)
    }
    mainWindow.webContents.send("updateProgress", 'Upload files to remote server..', 70);
    await this.publish_step3_add_commit_push(tmpkeypathPrivate, fullDestinationPath)

    return true;
  }

  async publish_step1_initial_clone(tmpkeypathPrivate, fullGitHubUrl, fullDestinationPath){

    await cliExecuteHelper.try_execute("git-clone", gitBin, ["clone", "-s", "-i", tmpkeypathPrivate, fullGitHubUrl , fullDestinationPath ]);
    //-s insecure (ignore hostkey)
    //-i use private file
    return true;
  }

  async publish_step2_preprare_dircontents_build(fullDestinationPath){

    await this._removeUnwanted(fullDestinationPath);
    await this._syncSourceToDestination(path.join(this.from,'public'), fullDestinationPath, "all");
    outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  async publish_step2_preprare_dircontents_source(fullDestinationPath){

    await this._removeUnwanted(fullDestinationPath);
    await this._syncSourceToDestination(this.from, fullDestinationPath, "all");

    if(this._config.publishScope === "source"){
      await fileDirUtils.recurForceRemove(fullDestinationPath+'/public');
      if(this._config.setGitHubActions){
        await this._github_action_workflow_source(fullDestinationPath);
      }
    }

    if(this._config.CNAMESwitch && this._config.CNAME !== ''){
      await this._github_cname(fullDestinationPath);
    }

    await fs.ensureDir(path.join(fullDestinationPath,"static"))

    outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  async publish_step3_add_commit_push(tmpkeypathPrivate, fullDestinationPath){

    await cliExecuteHelper.try_execute("git-add", gitBin, [ "add_all", fullDestinationPath ]);

    await cliExecuteHelper.try_execute("git-commit", gitBin, [
      "commit", '-a' , '-n', this._config.username,
      '-e', this._config.email,
      '-m', "'push by " + UQIS +"'", fullDestinationPath]);

    await cliExecuteHelper.try_execute("git-push", gitBin, [ "push", "-s", "-i", tmpkeypathPrivate, fullDestinationPath ]);

    return true;
  }

  async _github_cname(fullDestinationPath){
    await fs.writeFileSync(path.join(fullDestinationPath, "CNAME"), this._config.CNAME ,'utf-8');
  }

  async _github_action_workflow_source(fullDestinationPath){

    const hugoVersion = '0.81.0';
    const yaml = `
name: github pages

on:
  push:
    branches:
    - ${this._config.branch}  # Set a branch to deploy

permissions:
    contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true  # Fetch Hugo themes (true OR recursive)
          fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '${hugoVersion}'
          extended: true

      - name: Build
        run: hugo --minify ${(this._config.overrideBaseURLSwitch ? "--baseURL " + this._config.overrideBaseURL : "")}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
`;

    await fs.ensureDir(path.join(fullDestinationPath,".github"))
    await fs.ensureDir(path.join(fullDestinationPath,".github", 'workflows'))
    await fs.writeFileSync(path.join(fullDestinationPath, ".github", "workflows", "hugobuild.yml"), yaml ,'utf-8');
  }

  async _removeUnwanted(fullDestinationPath){
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, 'content'));
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, 'themes'));
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.quiqr-cache'));
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.gitlab-ci.yml'));
    console.log("skip gitignore");
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.sukoh'));
    await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.hugo_build.lock'));
    return true;
  }

  async _syncSourceToDestination(sourcePath, fullDestinationPath, syncSelection){

    if(syncSelection === "themeandquiqr"){
      await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, 'themes'));
      await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, 'quiqr'));
      await fs.copySync(path.join(sourcePath,'themes'), path.join(fullDestinationPath, 'themes'));
      await fs.copySync(path.join(sourcePath,'quiqr'), path.join(fullDestinationPath, 'quiqr'));
      outputConsole.appendLine('synced THEME AND QUIQR sources to destination ...');
    }
    else {

      //TESTING DANGEROUS
      if(global.pogoconf.expNewSyncMethod === true){
        console.log("expNewSyncMethod")

        let gitDirExist = false;
        if(fs.existsSync(path.join(fullDestinationPath , '.git'))){
          outputConsole.appendLine('.git dir exists');
          gitDirExist = true;
        }

        if(gitDirExist){
          await fs.moveSync(path.join(fullDestinationPath , '.git'), fullDestinationPath + '.gitmove');
        }

        await fs.emptyDir(fullDestinationPath);

        await fs.copySync(sourcePath, fullDestinationPath);

        if(gitDirExist){
          await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.git'));
          await fs.moveSync(fullDestinationPath + '.gitmove'), path.join(fullDestinationPath , '.git');
        }

        outputConsole.appendLine('synced ALL source to destination ...');
      }
      else{
        await fs.moveSync(path.join(fullDestinationPath , '.git'), path.join(fullDestinationPath , '.gitmove'));

        await fs.copySync(sourcePath, fullDestinationPath);

        await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.git'));

        await fs.moveSync(path.join(fullDestinationPath , '.gitmove'), path.join(fullDestinationPath , '.git'));
        outputConsole.appendLine('synced ALL source to destination ...');
      }


    }
    return true;
  }
  async _ensureSyncDirEmpty(dir){
    await fs.ensureDir(dir);
    await fs.emptyDir(dir);
    await fs.ensureDir(dir);
    return dir;
  }

  async _ensureSyncRepoDir(siteKey){
    const resolvedDest = path.join(pathHelper.getRoot(),'sites', siteKey, 'githubSyncRepo');
    await fs.ensureDir(resolvedDest);
    await fs.emptyDir(resolvedDest);
    await fs.ensureDir(resolvedDest);
    return resolvedDest;
  }

  async _tempCreatePrivateKey(){
    const tmpkeypathPrivate = path.join(pathHelper.getTempDir(),'ghkey');
    await fs.writeFileSync(tmpkeypathPrivate, this._config.deployPrivateKey, 'utf-8');
    await fs.chmodSync(tmpkeypathPrivate, '0600');
    return tmpkeypathPrivate;
  }
}

module.exports = GithubSync;
