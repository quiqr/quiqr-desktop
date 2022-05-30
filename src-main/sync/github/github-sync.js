const electron                                  = require('electron')
const path                                      = require('path');
const rootPath                                  = require('electron-root-path').rootPath;
const ProgressBar                               = require('electron-progressbar');
const fs                                        = require('fs-extra');
const spawnAw                                   = require('await-spawn')
const outputConsole                             = require('../../logger/output-console');
const pathHelper                                = require('../../utils/path-helper');
const Embgit                                    = require('../../embgit/embgit');

class GithubSync {
  constructor(config){
    this._config = config;
  }

  async publish(context){

    console.log(this._config)
    const gitBin = Embgit.getGitBin();
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

    try {
      await outputConsole.appendLine(gitBin+ " clone -s -s -i " + tmpkeypathPrivate + " " + fullGitHubUrl + " " + fullGitHubDestinationPath );
      //-s insecure (ignore hostkey)
      //-i use private file
      let clonecmd = await spawnAw( gitBin, [ "clone", "-s", "-i", tmpkeypathPrivate, fullGitHubUrl , fullGitHubDestinationPath ]);
      outputConsole.appendLine('1st Clone success ...');
    } catch (e) {
      await outputConsole.appendLine('1st Clone error ...:' + e);
      //IF FAIL KEY CORRECT?
    }
    return true;
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
