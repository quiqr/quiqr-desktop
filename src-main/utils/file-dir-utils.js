const rimraf   = require("rimraf");
const fs       = require('fs-extra');
const fssimple = require('fs');

class FileDirUtils{
  async recurForceRemove(path){

    if(fs.existsSync(path)){
      let lstat = fs.lstatSync(path);
      if(lstat.isDirectory()){
        await rimraf.sync(path);
      }
      else if(lstat.isFile()){
        fs.unlinkSync(path)
      }
    }
  }

  async fileRegexRemove(path, regex){
    fssimple.readdirSync(path)
      .filter(f => regex.test(f))
      .map(f => fs.unlinkSync(path +"/"+ f))
  }

  async ensureEmptyDir(destination_path){
    await fs.ensureDir(destination_path);
    await fs.emptyDir(destination_path);
    await fs.ensureDir(destination_path);
  }
}

module.exports = new FileDirUtils();
