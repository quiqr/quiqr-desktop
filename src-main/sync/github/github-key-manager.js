const fs                      = require('fs-extra');
const spawnAw                 = require('await-spawn')
const path                    = require('path');
const Embgit                  = require('../../embgit/embgit');
const pathHelper              = require('../../utils/path-helper');
const outputConsole           = require('../../logger/output-console');

class GithubKeyManager {

  async keyPairGen(){

    let pubKey, privKey;
    const gitBin = Embgit.getGitBin();
    const tempDir = pathHelper.getTempDir();

    try {
      let gencmd = await spawnAw( gitBin, [ "keygen_ecdsa" ], {cwd: tempDir});
      outputConsole.appendLine('Keygen success ...');
      privKey = await fs.readFileSync(path.join(tempDir,"/id_ecdsa_quiqr"), {encoding: 'utf8'});
      pubKey = await fs.readFileSync(path.join(tempDir,"/id_ecdsa_quiqr.pub"), {encoding: 'utf8'});
      //console.log(pubKey);
      //console.log(privKey);
    } catch (e) {
      outputConsole.appendLine('keygen error ...:' + e);
    }

    try {
      await fs.unlinkSync(path.join(tempDir,"/id_ecdsa_quiqr"));
      await fs.unlinkSync(path.join(tempDir,"/id_ecdsa_quiqr.pub"));
    } catch (e) {
      outputConsole.appendLine('no key were there ...:' + e);
    }

    return [privKey, pubKey];
  }

}

module.exports = new GithubKeyManager;
