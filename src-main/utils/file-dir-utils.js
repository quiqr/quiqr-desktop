const rimraf   = require("rimraf");
const fs       = require('fs-extra');
const fssimple = require('fs');

class FileDirUtils{
  async recurForceRemove(path){

    if(fs.existsSync(path)){
      let lstat = fs.lstatSync(path);
      if(lstat.isDirectory()){
        //await fs.ensureDir(path);
        await rimraf.sync(path);
        console.log("rm'd dir: " + path);
      }
      else if(lstat.isFile()){
        fs.unlinkSync(path)
        console.log("rm'd file: " + path);
      }
    }
  }

  async fileRegexRemove(path, regex){
    fssimple.readdirSync(path)
      .filter(f => regex.test(f))
      .map(f => fs.unlinkSync(path +"/"+ f))
  }

  async ensureEmptyDir(destination_path){
    //outputConsole.appendLine('Creating empty directory at: ' + destination_path);
    await fs.ensureDir(destination_path);
    await fs.emptyDir(destination_path);
    await fs.ensureDir(destination_path);
  }
}

module.exports = new FileDirUtils();
