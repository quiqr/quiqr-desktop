const Embgit                        = require('../embgit/embgit');
const fs                            = require('fs-extra');
const formatProviderResolver        = require('../utils/format-provider-resolver');
const path                          = require('path')
const pathHelper                    = require('../utils/path-helper');
const del                           = require('del');
const libraryService                = require('../services/library/library-service')
const InitialWorkspaceConfigBuilder = require('../services/workspace/initial-workspace-config-builder');

class GitImporter {

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

  newSiteFromPublicHugoThemeUrl(url, siteName, themeInfo, hugoVersion){
    console.log(hugoVersion);
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

        const configBase = path.join(tempDir, "config");
        let configExt;
        if(fs.existsSync(configBase+".toml")){
          configExt = '.toml';
        }
        else if(fs.existsSync(configBase+".json")){
          configExt = '.json';
        }
        else if(fs.existsSync(configBase+".yaml")){
          configExt = '.yaml';
        }
        else if(fs.existsSync(configBase+".yml")){
          configExt = '.yml';
        }

        const strData = fs.readFileSync(configBase + configExt, {encoding: 'utf-8'});
        let formatProvider = formatProviderResolver.resolveForFilePath(configBase + configExt);
        let hconfig = formatProvider.parse(strData);
        if(!hconfig) hconfig = {};
        hconfig.theme = themeInfo.Name;
        hconfig.baseURL = "/"
        await fs.writeFileSync(
          configBase + configExt,
          formatProvider.dump(hconfig)
        );


        let configBuilder = new InitialWorkspaceConfigBuilder(tempDir);
        let filePath = configBuilder.buildAll(hugoVersion);
        console.log(filePath)


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

