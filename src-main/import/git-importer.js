const Embgit                                    = require('../embgit/embgit');
const path = require('path')
const pathHelper                                = require('../utils/path-helper');
const del                     = require('del');
const libraryService            = require('../services/library/library-service')

class GitImporter {

  importSiteFromPublicGitUrl(url, siteName){
    return new Promise( async (resolve, reject)=>{
      try{
        const tempCloneDir = path.join(pathHelper.getTempDir(), 'siteFromGit');
        console.log(tempCloneDir)
        del.sync([tempCloneDir],{force:true});
        await Embgit.cloneFromPublicUrl( url, tempCloneDir);
        let siteKey = await libraryService.createSiteKeyFromName(siteName);
        await libraryService.createNewSiteWithTempDirAndKey(siteKey, tempCloneDir);
        resolve(siteKey);
      }
      catch(err){
        reject(err);
      }

    });

  }

}

module.exports = new GitImporter();

