const rimraf   = require("rimraf");
const fs       = require('fs-extra');
const fssimple = require('fs');

class FileDirUtils{

  //TODO use everywhere in code
  filenameFromPath(fullPath){
    return fullPath.replace(/^.*[\\/]/, '');
  }

  async recurForceRemove(dirPath){

    if(fs.existsSync(dirPath)){
      let lstat = fs.lstatSync(dirPath);
      if(lstat.isDirectory()){
        await rimraf.sync(dirPath);
      }
      else if(lstat.isFile()){
        fs.unlinkSync(dirPath)
      }
    }
  }

  async fileRegexRemove(dirPath, regex){
    fssimple.readdirSync(dirPath)
      .filter(f => regex.test(f))
      .map(f => fs.unlinkSync(dirPath +"/"+ f))
  }

  async ensureEmptyDir(destination_dirPath){
    await fs.ensureDir(destination_dirPath);
    await fs.emptyDir(destination_dirPath);
    await fs.ensureDir(destination_dirPath);
  }

  pathIsDirectory(dirPath){

    if(fs.existsSync(dirPath)){
      const lstat = fs.lstatSync(dirPath);
      if(lstat.isDirectory()){
        return true;
      }
      else{
        return false;
      }
    }
  }
}

module.exports = new FileDirUtils();
