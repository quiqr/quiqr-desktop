const fs   = require('fs-extra');
const path = require('path');
const formatProviderResolver = require('../utils/format-provider-resolver');

class HugoUtils{

  async createSiteDir(directory, title, configFormat) {
    return new Promise(async (resolve, reject)=>{
      try{

        await fs.ensureDir(directory);

        const hugoConfigFilePath = path.join(directory, "config." + configFormat )
        let formatProvider = formatProviderResolver.resolveForFilePath(hugoConfigFilePath);
        let hconfig = {};
        hconfig.baseURL = "http://example.org";
        hconfig.title = title;

        await fs.writeFileSync(
          hugoConfigFilePath,
          formatProvider.dump(hconfig)
        );

        resolve(true);

      }
      catch(err){
        reject(err);

      }
    });
  }
}

module.exports = new HugoUtils();

