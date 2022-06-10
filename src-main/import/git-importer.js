const Embgit         = require('../embgit/embgit');
const fs                                        = require('fs-extra');
const formatProviderResolver                    = require('../utils/format-provider-resolver');
const path           = require('path')
const pathHelper     = require('../utils/path-helper');
const del            = require('del');
const libraryService = require('../services/library/library-service')

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

  newSiteFromPublicHugoThemeUrl(url, siteName, themeInfo){
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
        console.log(hconfig)
        await libraryService.createNewSiteWithTempDirAndKey(siteKey, tempDir);
        resolve(siteKey);
      }
      catch(err){
        reject(err);
      }

    });
  }

  /*

  async createSiteFromThemeGitUrl(){

    let themeName = full_gh_url.substring(full_gh_url.lastIndexOf('/') + 1).split('.').slice(0, -1).join('.');

    var full_gh_dest = pathHelper.getRoot()+'temp/siteFromTheme/';
    var full_gh_themes_dest = pathHelper.getRoot()+'temp/siteFromTheme/themes/'+themeName;

    await fs.ensureDir(full_gh_dest);
    await fs.emptyDir(full_gh_dest);
    await fs.ensureDir(full_gh_dest);
    await fs.ensureDir(full_gh_dest + '/themes');

    var git_bin = Embgit.getGitBin();


    try {
      await spawnAw( git_bin, [ "clone", full_gh_url , full_gh_themes_dest ]);
      outputConsole.appendLine('Clone success ...');
    } catch (e) {
      await outputConsole.appendLine(git_bin+ " clone " + full_gh_url + " " + full_gh_themes_dest );
      await outputConsole.appendLine('Clone error ...:' + e);
      return;
    }

    await fs.copySync(full_gh_themes_dest+"/exampleSite", full_gh_dest);

    try{
      let strData = fs.readFileSync(full_gh_dest+"/config.toml", {encoding: 'utf-8'});
      let formatProvider = formatProviderResolver.resolveForFilePath(full_gh_dest+"/config.toml");
      let hconfig = formatProvider.parse(strData);
      hconfig.theme = themeName;
      hconfig.baseURL = "/"
      fs.writeFileSync(
        full_gh_dest+"/config.toml",
        formatProvider.dump(hconfig)
      );
    }
    catch(e){
      console.log("no config.toml in exampleSite");
    }

    await this.createNewWithTempDirAndKey(siteKey, full_gh_dest);
  }

*/



}

module.exports = new GitImporter();

