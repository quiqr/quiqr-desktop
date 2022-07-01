const jsYaml  = require('js-yaml');

class YamlFormatProvider {

  defaultExt(){
    return 'yaml';
  }

  matchContentFirstLine(line){
    return line.startsWith('---');
  }

  parse(str){
    return jsYaml.load(str);
  }

  dump(obj){
    return jsYaml.dump(obj);
  }

  dumpContent(obj){
    let content = '';
    if(obj.mainContent){
      content = obj.mainContent;
      delete obj.mainContent;
    }

    if(obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype){
      return `${content}`;
    }
    else{
      let header = this.dump(obj);
      header = header.split(/\r?\n/).filter(line => line.trim() !== "").join("\n");
      return `---
${header}
---

${content}`;
    }

  }

  parseFromMdFileString(str){
    let data = str;
    let reg = /^[-]{3} *(\r?\n|\r|^)/mg;
    let yamlEnd=-1;
    let hasFrontMatter = true;

    for(let i = 0; i < 2; i++){
      let execResult = reg.exec(data);
      if(execResult===null)
        break;
      if(i===1)
        yamlEnd = execResult.index;
    }

    let yamlStr, md;

    if(yamlEnd===-1){
      yamlStr = '';
      md = data;
    }
    else{
      yamlStr = data.substr(3,yamlEnd-3);
      md = data.substr(yamlEnd+3);
    }

    let parsedData = this.parse(yamlStr);
    if(parsedData===undefined){
      parsedData = {};
      hasFrontMatter = false;
    }

    if (hasFrontMatter && /\S/.test(md)) { //if have non whitespaces
      //remove the two first line breaks
      md = md.replace(/(\r?\n|\r)/,'').replace(/(\r?\n|\r)/,'');
    }
    parsedData.mainContent = md;

    return parsedData;
  }
}

module.exports = YamlFormatProvider;
