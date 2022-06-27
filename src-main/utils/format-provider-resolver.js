const fs      = require('fs-extra');
const path    = require('path');

const JsonFormatProvider = require('./format-providers/json-format-provider');
const TomlFormatProvider = require('./format-providers/toml-format-provider');
const YamlFormatProvider = require('./format-providers/yaml-format-provider');

class FormatProviderResolver{

  constructor(){
    let yaml = new YamlFormatProvider();
    this._formats = {
      json: new JsonFormatProvider(),
      toml: new TomlFormatProvider(),
      yaml: yaml,
      yml: yaml
    }

    this._exts = [];
    for(let key in this._formats){
      this._exts.push(key);
    }
  }

  getDefaultFormat(){
    return this._formats[this.getDefaultFormatExt()];
  }

  getDefaultFormatExt(){
    return 'yaml';
  }

  _getFileLinePromise(filename, line_no) {
    return new Promise((resolve, reject) =>{

      var stream = fs.createReadStream(filename, {
        flags: 'r',
        encoding: 'utf8',
        fd: null,
        mode: '0666',
        bufferSize: 64 * 1024
      });

      var fileData = '';
      stream.on('data', function(data){
        fileData += data;
        // The next lines should be improved
        var lines = fileData.split("\n");
        if(lines.length >= +line_no){
          stream.destroy();
          resolve(lines[+line_no]);
        }
      });

      stream.on('error', (e)=>{
        reject(e);
      });

      stream.on('end', function(){
        resolve(undefined);
      });

    });
  }

  resolveForMdFirstLine(line){
    if(line===undefined)
      return undefined;
    for(let i = 0; i < this._exts.length; i++){
      let f = this._formats[this._exts[i]];
      if(f.matchContentFirstLine(line))
        return f;
    }
    return undefined;
  }

  resolveForFilePath(filePath){
    if(filePath===undefined)
      return undefined;
    let ext = path.extname(filePath).replace('.','');
    return this.resolveForExtension(ext);
  }


  resolveForMdFileString(fileContent){
    if(fileContent===undefined)
      return null;
    let firstLine = fileContent.split('\n', 1)[0];
    return this.resolveForMdFirstLine(firstLine);
  }

  resolveForMdFilePromise(filePath){
    return this._getFileLinePromise(filePath,0)
      .then((line)=>{
        if(line!=null)
          return Promise.resolve(this.resolveForMdFirstLine(line));
        return Promise.resolve(null);
      });
  }

  resolveForExtension(ext){
    if(ext===undefined)
      return undefined;

    ext = ext.toLowerCase();

    return this._formats[ext];
  }

  allFormatsExt(){
    return this._exts;
  }
}

module.exports = new FormatProviderResolver();
