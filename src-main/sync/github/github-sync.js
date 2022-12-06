const path                      = require('path');
const fs                        = require('fs-extra');
const spawnAw                   = require('await-spawn')
const outputConsole             = require('../../logger/output-console');
const configurationDataProvider = require('../../app-prefs-state/configuration-data-provider')
const Embgit                    = require('../../embgit/embgit');
const pathHelper                = require('../../utils/path-helper');
const fileDirUtils              = require('../../utils/file-dir-utils');
const { EnvironmentResolver }   = require('../../utils/environment-resolver');

const gitBin = Embgit.getGitBin();
const environmentResolver = new EnvironmentResolver();
const UQIS = environmentResolver.getUQIS();

class GithubSync {
  constructor(config){
    this._config = config;
  }

  async pullFastForwardMerge(context){

    const tmpkeypathPrivate = await this._tempCreatePrivateKey();
    Embgit.setPrivateKeyPath(tmpkeypathPrivate)
    const resolvedDest = path.join(pathHelper.getRoot(),'sites', context.siteKey, 'githubSyncRepo');
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
        console.log("Pull Error:"+context.siteKey);
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

  async publish(context){

    const tmpkeypathPrivate = await this._tempCreatePrivateKey();
    const resolvedDest = await this._ensureSyncRepoDir(context.siteKey);
    const fullGitHubUrl = 'git@github.com:' + this._config.username + '/' + this._config.repository +'.git';
    const fullDestinationPath = path.join(resolvedDest , this._config.repository);
    let mainWindow = global.mainWM.getCurrentInstance();

    outputConsole.appendLine('START GITHUB SYNC');
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('  git binary:          ' + gitBin);
    outputConsole.appendLine('  git url:             ' + fullGitHubUrl);
    outputConsole.appendLine('  private key path:    ' + tmpkeypathPrivate);
    outputConsole.appendLine('  destination path:    ' + fullDestinationPath);
    outputConsole.appendLine('  context.from is:     ' + context.from);
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
      await this.publish_step2_preprare_dircontents_build(context, fullDestinationPath)
    }
    else{
      await this.publish_step2_preprare_dircontents_source(context, fullDestinationPath)
    }
    mainWindow.webContents.send("updateProgress", 'Upload files to remote server..', 70);
    await this.publish_step3_add_commit_push(tmpkeypathPrivate, fullDestinationPath)

    return true;
  }

  async publish_step1_initial_clone(tmpkeypathPrivate, fullGitHubUrl, fullDestinationPath){
    try {
      outputConsole.appendLine(gitBin+ " clone -s -i " + tmpkeypathPrivate + " " + fullGitHubUrl + " " + fullDestinationPath );
      //-s insecure (ignore hostkey)
      //-i use private file
      await spawnAw( gitBin, [ "clone", "-s", "-i", tmpkeypathPrivate, fullGitHubUrl , fullDestinationPath ]);
      outputConsole.appendLine('1st Clone success ...');
    } catch (e) {
      outputConsole.appendLine('1st Clone error ...:' + e);
      //IF FAIL KEY CORRECT?
    }
    return true;
  }

  async publish_step2_preprare_dircontents_build(context, fullDestinationPath){

    await this._removeUnwanted(fullDestinationPath);
    await this._syncSourceToDestination(path.join(context.from,'public'), fullDestinationPath, "all");
    await fs.writeFileSync(path.join(fullDestinationPath, ".quiqr_with_me"), JSON.stringify(this._quiqr_with_me_json()) ,'utf-8');
    outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  async publish_step2_preprare_dircontents_source(context, fullDestinationPath){

    await this._removeUnwanted(fullDestinationPath);
    await this._syncSourceToDestination(context.from, fullDestinationPath, "all");

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
    await fs.writeFileSync(path.join(fullDestinationPath, "static", ".quiqr_with_me"), JSON.stringify(this._quiqr_with_me_json()) ,'utf-8');

    outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  async publish_step3_add_commit_push(tmpkeypathPrivate, fullDestinationPath){


    await spawnAw( gitBin, [ "add_all" , fullDestinationPath]);
    outputConsole.appendLine('git-add finished ...');

    await spawnAw( gitBin, [ "commit", '-a' , '-n', this._config.username, '-e', this._config.email, '-m', "'publication from " + UQIS +"'", fullDestinationPath]);
    outputConsole.appendLine(gitBin+" commit -a -n "+ this._config.username + " -e " + this._config.email + " -m 'publication from "+ UQIS +"' " + fullDestinationPath);
    outputConsole.appendLine('git-commit finished ...');

    await spawnAw( gitBin, [ "push","-s", "-i", tmpkeypathPrivate, fullDestinationPath ]);
    outputConsole.appendLine(gitBin+" push -i "+ tmpkeypathPrivate +" "+ fullDestinationPath);
    outputConsole.appendLine('git-commit push finished ...');

    return true;
  }

  _quiqr_with_me_json(){
    let publDate = Date.now();
    return {
      lastPublish: publDate,
      path: this._config.repository
    }
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
    //await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.gitignore'));
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
      //move .git, copy all, remove .git, restore .git (no beauty prize)
      //if(fs.existsSync(path.join(fullDestinationPath , '.git'))){
      await fs.moveSync(path.join(fullDestinationPath , '.git'), path.join(fullDestinationPath , '.gitmove'));
      await fs.copySync(sourcePath, fullDestinationPath);
      await fileDirUtils.recurForceRemove(path.join(fullDestinationPath, '.git'));
      await fs.moveSync(path.join(fullDestinationPath , '.gitmove'), path.join(fullDestinationPath , '.git'));
      outputConsole.appendLine('synced ALL source to destination ...');
    }
    return true;
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
