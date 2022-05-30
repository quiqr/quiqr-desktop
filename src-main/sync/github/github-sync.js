const electron                                  = require('electron')
const path                                      = require('path');
const rootPath                                  = require('electron-root-path').rootPath;
const ProgressBar                               = require('electron-progressbar');
const fs                                        = require('fs-extra');
const spawnAw                                   = require('await-spawn')
const outputConsole                             = require('../../logger/output-console');
const Embgit                                    = require('../../embgit/embgit');
const pathHelper                                = require('../../utils/path-helper');
const fileDirUtils                              = require('../../utils/file-dir-utils');
const { EnvironmentResolver, ARCHS, PLATFORMS } = require('../../utils/environment-resolver');

const gitBin = Embgit.getGitBin();
const environmentResolver = new EnvironmentResolver();
const UQIS = environmentResolver.getUQIS();

class GithubSync {
  constructor(config){
    this._config = config;
  }

  async publish(context){

    console.log(this._config)
    const tmpkeypathPrivate = await this._tempCreatePrivateKey();
    const resolvedDest = await this._ensureSyncRepoDir(context.siteKey);
    const fullGitHubUrl = 'git@github.com:' + this._config.username + '/' + this._config.repository +'.git';
    const fullGitHubDestinationPath = path.join(resolvedDest , this._config.repository);

    outputConsole.appendLine('START GITHUB SYNC');
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('  git binary:          ' + gitBin);
    outputConsole.appendLine('  git url:             ' + fullGitHubUrl);
    outputConsole.appendLine('  private key path:    ' + tmpkeypathPrivate);
    outputConsole.appendLine('  destination path:    ' + fullGitHubDestinationPath);
    outputConsole.appendLine('-----------------');
    outputConsole.appendLine('');

    await this._publish_step1_initial_clone(tmpkeypathPrivate, fullGitHubUrl, fullGitHubDestinationPath);
    await this._publish_step2_preprary_dircontents(context, fullGitHubDestinationPath)
    await this._publish_step3_add_commit_push(tmpkeypathPrivate, fullGitHubDestinationPath)

    return true;
  }

  async _publish_step1_initial_clone(tmpkeypathPrivate, fullGitHubUrl, fullGitHubDestinationPath){
    try {
      outputConsole.appendLine(gitBin+ " clone -s -s -i " + tmpkeypathPrivate + " " + fullGitHubUrl + " " + fullGitHubDestinationPath );
      //-s insecure (ignore hostkey)
      //-i use private file
      let clonecmd = await spawnAw( gitBin, [ "clone", "-s", "-i", tmpkeypathPrivate, fullGitHubUrl , fullGitHubDestinationPath ]);
      outputConsole.appendLine('1st Clone success ...');
    } catch (e) {
      outputConsole.appendLine('1st Clone error ...:' + e);
      //IF FAIL KEY CORRECT?
    }
  }
  async _publish_step2_preprary_dircontents(context, fullGitHubDestinationPath){

    console.log("hallo");
    const gitignore = "/public\n.quiqr-cache\n";
    console.log("hallo2");

    let publDate = Date.now();

    const quiqr_with_me = {
      lastPublish: publDate,
      path: this._config.repository
    }

    await fileDirUtils.recurForceRemove(fullGitHubDestinationPath+'/content');
    await fileDirUtils.recurForceRemove(fullGitHubDestinationPath+'/themes');

    //move .git copy all remove .git, restore .git (no beauty prize)
    await fs.moveSync(fullGitHubDestinationPath + '/.git', fullGitHubDestinationPath + '/.gitmove');
    await fs.copySync(context.from, fullGitHubDestinationPath);
    await fileDirUtils.recurForceRemove(fullGitHubDestinationPath+'/.git');
    await fs.moveSync(fullGitHubDestinationPath + '/.gitmove', fullGitHubDestinationPath + '/.git');

    await fileDirUtils.recurForceRemove(fullGitHubDestinationPath+'/public');

    fs.writeFileSync(fullGitHubDestinationPath + "/.gitignore" , gitignore , 'utf-8');
    outputConsole.appendLine('gitignore is: ' + gitignore);

    await fs.ensureDir(path.join(fullGitHubDestinationPath,"static"))
    fs.writeFileSync(path.join(fullGitHubDestinationPath, "static", ".quiqr_with_me"), JSON.stringify(quiqr_with_me) ,'utf-8');

    outputConsole.appendLine('context.from is: ' + context.from);
    outputConsole.appendLine('copy finished');
  }

  async _publish_step3_add_commit_push(tmpkeypathPrivate, fullGitHubDestinationPath){
    let clonecmd2 = await spawnAw( gitBin, [ "alladd" , fullGitHubDestinationPath]);
    outputConsole.appendLine('git-add finished, going to git-commit ...');
    let clonecmd3 = await spawnAw( gitBin, [ "commit", '-a' , '-n', this._config.username, '-e', this._config.email, '-m', "'publication from " + UQIS +"'", fullGitHubDestinationPath]);
    outputConsole.appendLine(gitBin+" commit -a -n "+ this._config.username + " -e " + this._config.email + " -m 'publication from "+ UQIS +"' " + fullGitHubDestinationPath);
    outputConsole.appendLine('git-commit finished, going to git-push ...');
    let clonecmd4 = await spawnAw( gitBin, [ "push","-s", "-i", tmpkeypathPrivate, fullGitHubDestinationPath ]);
    outputConsole.appendLine(gitBin+" push -i "+ tmpkeypathPrivate +" "+ fullGitHubDestinationPath);

  }

  async _ensureSyncRepoDir(siteKey){

    const resolvedDest = path.join(pathHelper.getRoot(),'sites', siteKey, '/githubSyncRepo/');

    await fs.ensureDir(resolvedDest);
    await fs.emptyDir(resolvedDest);
    await fs.ensureDir(resolvedDest);
    return resolvedDest;
  }

  async _tempCreatePrivateKey(){
    var tmpkeypathPrivate = pathHelper.getTempDir()+'ghkey';
    await fs.writeFileSync(tmpkeypathPrivate, this._config.deployPrivateKey, 'utf-8');
    await fs.chmodSync(tmpkeypathPrivate, '0600');
    return tmpkeypathPrivate;

  }




}

module.exports = GithubSync;
