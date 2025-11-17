class JsonFormatProvider {

  defaultExt(){
    return 'json';
  }

  matchContentFirstLine(line){
    return line.startsWith('{');
  }

  parse(str){
    return JSON.parse(str);
  }

  dump(obj){
    return JSON.stringify(obj, null, '  ');
  }

  dumpContent(obj){
    let content = '';
    if(obj.mainContent){
      content = obj.mainContent;
      delete obj.mainContent;
    }
    let header = this.dump(obj);
    return `${header}

${content}`;
  }

  parseFromMdFileString(str){
    let data = str;
    let jsonExecResult = /^} *(\r?\n|\r|^)/m.exec(data);
    let jsonEnd = -1;
    let hasFrontMatter = true;

    if(jsonExecResult!=null){
      jsonEnd = jsonExecResult.index;
    }
    // TODO: test
    // what if the file only has a json?
    // and what if it only has a markdown?

    let json, md;

    if(jsonEnd===-1){
      json = '{}';
      md = data;
    }
    else{
      json = data.substr(0,jsonEnd+1);
      md = data.substr(jsonEnd+1);
    }

    let parsedData = this.parse(json);
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

module.exports = JsonFormatProvider;
