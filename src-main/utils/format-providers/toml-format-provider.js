const tomlify = require('tomlify-j0.4');
const toml    = require('toml');

class TomlFormatProvider {

  defaultExt(){
    return 'toml';
  }

  matchContentFirstLine(line){
    return line.startsWith('+++');
  }

  parse(str){
    return toml.parse(str);
  }

  dump(obj){
    return tomlify.toToml(obj, {space: 2});
  }

  dumpContent(obj){
    let content = '';
    if(obj.mainContent){
      content = obj.mainContent;
      delete obj.mainContent;
    }
    let header = this.dump(obj);
    return `+++
${header}
+++

${content}`;
  }

  parseFromMdFileString(str){
    let data = str;
    let reg = /^[+]{3} *(\r?\n|\r|^)/mg;
    let tomlEnd=-1;
    for(let i = 0; i < 2; i++){
      let execResult = reg.exec(data);
      if(execResult===null)
        break;
      if(i===1)
        tomlEnd = execResult.index;
    }

    let tomlStr, md;

    if(tomlEnd===-1){
      tomlStr = '';
      md = data;
    }
    else{
      tomlStr = data.substr(3,tomlEnd-3);
      md = data.substr(tomlEnd+3);
    }

    let parsedData = this.parse(tomlStr);
    if(parsedData===undefined){
      return {};
    }

    if (/\S/.test(md)) { //if have non thitespaces
      //remove the two first line breaks
      md = md.replace(/(\r?\n|\r)/,'').replace(/(\r?\n|\r)/,'');
      parsedData.mainContent = md;
    }

    return parsedData;
  }
}

module.exports = TomlFormatProvider;
