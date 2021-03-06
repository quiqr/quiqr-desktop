const fs = require('fs');

class FileCacheToken {

    constructor(files){
        this.files = files;
        this.token = null;
        this.isBuilt = false;
    }

    async build(){
        if(this.isBuilt){
            return Promise.resolve(this);
        }
        const signatures = [];
        const promises = (this.files||[]).map((file)=> new Promise((resolve, reject)=>{
            fs.stat(file, (err, stats)=>{
                if(err) return reject(err);
                signatures.push(`${file}>${stats.mtime.getTime()}`);
                resolve();
            })
        }));
        await Promise.all(promises);
        this.token = signatures.sort().join('|');
        this.isBuilt = true;
        this.files = null;
        return this;
    }

    async match(other){
        await Promise.all([this.build(), other.build()]);
        return this.token === other.token;
    }
}

module.exports = { FileCacheToken };
