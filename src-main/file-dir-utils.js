const rimraf = require("rimraf");
const fs = require('fs-extra');
const fssimple = require('fs');

class FileDirUtils{
    async recurForceRemove(path){
        await fs.ensureDir(path);
        await rimraf.sync(path);
        console.log("created and rm'd dir: " + path);
    }

    async fileRegexRemove(path, regex){
        fssimple.readdirSync(path)
            .filter(f => regex.test(f))
            .map(f => fs.unlinkSync(path +"/"+ f))
    }
}

module.exports = new FileDirUtils();
