const Embgit                        = require('../embgit/embgit');
const fs                            = require('fs-extra');
const formatProviderResolver        = require('../utils/format-provider-resolver');
const path                          = require('path')
const pathHelper                    = require('../utils/path-helper');
const del                           = require('del');
const libraryService                = require('../services/library/library-service')
const InitialWorkspaceConfigBuilder = require('../services/workspace/initial-workspace-config-builder');

class GitImporter {

  //USED BY IMPORT FROM GIT URL DIALOG
  importSiteFromPublicGitUrl(url, siteName){
    return new Promise( async (resolve, reject)=>{
      try{
        const siteKey = await libraryService.createSiteKeyFromName(siteName);
        const tempCloneDir = path.join(pathHelper.getTempDir(), 'siteFromGit');
        del.sync([tempCloneDir],{force:true});
        await Embgit.cloneFromPublicUrl( url, tempCloneDir);
        await libraryService.createNewSiteWithTempDirAndKey(siteKey, tempCloneDir);
        resolve(siteKey);
      }
      catch(err){
        reject(err);
      }

    });
  }

  //USED BY NEW FROM HUGO THEME DIALOG
  newSiteFromPublicHugoThemeUrl(url, siteName, themeInfo, hugoVersion){
    return new Promise( async (resolve, reject)=>{

      if(!themeInfo.Name) reject("no theme name");

      try{

        const siteKey = await libraryService.createSiteKeyFromName(siteName);
        const tempDir = path.join(pathHelper.getTempDir(), 'siteFromTheme');
        const tempCloneThemeDir = path.join(pathHelper.getTempDir(), 'siteFromTheme', 'themes', themeInfo.Name);

        del.sync([tempDir],{force:true});
        await fs.ensureDir(tempDir);
        await fs.ensureDir(path.join(tempDir, 'themes'));

        await Embgit.cloneFromPublicUrl( url, tempCloneThemeDir);
        if(themeInfo.ExampleSite){
          await fs.copySync(tempCloneThemeDir+"/exampleSite", tempDir);
        }

        let formatProvider, hconfig = null;
        let hugoConfigFilePath = pathHelper.hugoConfigFilePath(tempDir)
        if(hugoConfigFilePath){
          const strData = fs.readFileSync(hugoConfigFilePath, {encoding: 'utf-8'});
          formatProvider = formatProviderResolver.resolveForFilePath(hugoConfigFilePath);
          hconfig = formatProvider.parse(strData);
        }

        //TODO TEST WITHOUT CONFIG (SHOULD FAIL)
        if(!hconfig) hconfig = {};
        hconfig.theme = themeInfo.Name;
        hconfig.baseURL = "/"
        await fs.writeFileSync(
          hugoConfigFilePath,
          formatProvider.dump(hconfig)
        );

        let configBuilder = new InitialWorkspaceConfigBuilder(tempDir);
        configBuilder.buildAll(hugoVersion);

        await libraryService.createNewSiteWithTempDirAndKey(siteKey, tempDir);
        resolve(siteKey);
      }
      catch(err){
        reject(err);
      }

    });
  }

}

module.exports = new GitImporter();

