const Embgit                                    = require('../embgit/embgit');
const pathHelper                                = require('../utils/path-helper');

class GitImporter {

  async importSiteFromPublicGitUrl(url, siteName){
    const tempCloneDir = path.join(pathHelper.getTempDir(), 'siteFromGit');
    await del.sync([tempCloneDir],{force:true});
    await Embgit.cloneFromPublicUrl( url, tempCloneDir);
    await siteKey = libraryService.createSiteKeyFromName(siteName);
    await libraryService.createNewSiteWithTempDirAndKey(siteKey, tempCloneDir);
    return true;
  }




}

