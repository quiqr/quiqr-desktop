const fs                            = require('fs-extra');
const formatProviderResolver        = require('../utils/format-provider-resolver');
const del                           = require('del');
const path                          = require('path')
const pathHelper                    = require('../utils/path-helper');
const fileDirUtils                  = require('../utils/file-dir-utils');
const libraryService                = require('../services/library/library-service')
const { WorkspaceConfigProvider }   = require('../services/workspace/workspace-config-provider');
const InitialWorkspaceConfigBuilder = require('../services/workspace/initial-workspace-config-builder');

class FolderImporter {

  siteDirectoryInspect(folder){
    return new Promise( async (resolve, reject)=>{

      try{

        let inventory = {
          dirExist:  fileDirUtils.pathIsDirectory(folder),
          dirName: fileDirUtils.filenameFromPath(folder),
          hugoConfigExists: false,
          hugoConfigParsed: null,
          hugoThemesDirExists: fileDirUtils.pathIsDirectory(path.join(folder, "themes")),
          hugoContentDirExists: fileDirUtils.pathIsDirectory(path.join(folder, "content")),
          hugoDataDirExists: fileDirUtils.pathIsDirectory(path.join(folder, "data")),
          hugoStaticDirExists: fileDirUtils.pathIsDirectory(path.join(folder, "static")),
          quiqrModelDirExists: fileDirUtils.pathIsDirectory(path.join(folder, "quiqr", "model")),
          quiqrFormsDirExists: fileDirUtils.pathIsDirectory(path.join(folder, "quiqr", "forms")),
          quiqrDirExists: fileDirUtils.pathIsDirectory(path.join(folder, "quiqr")),
          quiqrModelConfigParsed: null,
        }

        const workspaceConfigProvider = new WorkspaceConfigProvider();
        if(workspaceConfigProvider.getQuiqrModelBasePath(folder)){
          inventory.quiqrModelParsed = await workspaceConfigProvider.readOrCreateMinimalModelConfig(folder, "source");
        }

        const hugoConfigFilePath = pathHelper.hugoConfigFilePath(folder)
        if(hugoConfigFilePath){
          const strData = fs.readFileSync(hugoConfigFilePath, {encoding: 'utf-8'});
          let formatProvider = formatProviderResolver.resolveForFilePath(hugoConfigFilePath);
          inventory.hugoConfigParsed = formatProvider.parse(strData);
          inventory.hugoConfigExists = true;
        }

        resolve(inventory);
      }
      catch(err){
        reject(err);
      }

    });
  }

  newSiteFromLocalDirectory(directory, siteName, generateQuiqrModel, hugoVersion){
    return new Promise( async (resolve, reject)=>{
      try{
        const siteKey = await libraryService.createSiteKeyFromName(siteName);

        const tempCopyDir = path.join(pathHelper.getTempDir(), 'siteFromDir');
        del.sync([tempCopyDir],{force:true});
        await fs.copySync(directory, tempCopyDir);

        if(generateQuiqrModel && hugoVersion){
          let configBuilder = new InitialWorkspaceConfigBuilder(tempCopyDir);
          configBuilder.buildAll(hugoVersion);
        }

        await libraryService.createNewSiteWithTempDirAndKey(siteKey, tempCopyDir);
        resolve(siteKey);
      }
      catch(err){
        reject(err);
      }

    });

  }

}

module.exports = new FolderImporter();


