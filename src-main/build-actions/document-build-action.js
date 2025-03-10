const { EnvironmentResolver, PLATFORMS }    = require('../utils/environment-resolver');
const { spawn } = require('child_process');

class DocumentBuildAction {

  runAction(actionName, execution_dict, docPath, sitePath){
    let enviromnent = new EnvironmentResolver().resolve();

    let def_variables = execution_dict.variables || [];
    let def_vars = [];
    def_variables.forEach((varpair)=>{
      def_vars.push({var_name: varpair.name, var_value: varpair.value});
    });

    if(enviromnent.platform == PLATFORMS.windows){
      return this.runOn(actionName, execution_dict['windows'], docPath, sitePath, execution_dict['stdout_type'], def_vars);
    }
    else{
      return this.runOn(actionName, execution_dict['unix'], docPath, sitePath, execution_dict['stdout_type'], def_vars);
    }
  }

  replace_path_vars(sourcePath, docPath, sitePath, vars){

    vars.push({var_name: 'SITE_PATH', var_value: sitePath});
    vars.push({var_name: 'DOCUMENT_PATH', var_value: docPath});

    let newSourcePath = sourcePath;
    vars.forEach((varItem)=>{
      const searcher = new RegExp('%'+varItem.var_name, 'g')
      newSourcePath = newSourcePath.replace(searcher, varItem.var_value);
    });

    return newSourcePath;
  }

  override(def_variables, pref_variables){
    let vars_dict = {};

    def_variables.forEach((varpair)=> {
      vars_dict[varpair.var_name] = varpair.var_value;
    });

    pref_variables.forEach((varpair)=> {
      vars_dict[varpair.var_name] = varpair.var_value;
    });

    let new_vars = [];

    Object.keys(vars_dict).forEach((name)=>{
      new_vars.push({var_name: name, var_value: vars_dict[name]});
    });

    return new_vars;
  }

  file_path_replace(filePath,replace_arr){

    //let replace_arr = execution_dict.file_path_replace || [];

    let new_filePath = filePath;
    replace_arr.forEach((repl)=>{
      const searcher = new RegExp(repl.search, 'g')
      new_filePath = new_filePath.replace(searcher, repl.replace);
    });

    return new_filePath;
  }

  runOn(actionName, execution_dict, docPath, sitePath, stdout_type, def_variables ){

    let docPath_replaced = this.file_path_replace(docPath, (execution_dict.document_path_replace||[]))
    console.log(docPath_replaced)
    let sitePath_replaced = this.file_path_replace(sitePath, (execution_dict.site_path_replace||[]))

    let pref_variables = global.pogoconf['appVars'].slice();

    let variables = this.override(def_variables, pref_variables)

    let command = this.replace_path_vars(execution_dict.command, docPath_replaced, sitePath_replaced, variables );

    let args = [];
    if (execution_dict.args && execution_dict.args.length > 0){
      args = execution_dict.args.map((arg) => {
        return this.replace_path_vars(arg, docPath_replaced, sitePath_replaced, variables);
      });
    }

    return new Promise( async (resolve, reject)=>{
      try {

        var stdoutChunks = [], stderrChunks = [];
        const child = spawn(command, args);

        child.on('exit', (code) => {
          if(code == 0){

            var stdoutContent = Buffer.concat(stdoutChunks).toString();
            resolve(
              {
                actionName: actionName,
                stdoutType: stdout_type,
                stdoutContent: this.file_path_replace(stdoutContent, (execution_dict.file_path_replace||[])),
                //filePath: docPath
              }
            )
          }
          else{
            const e = new Error(`Process exited with code ${code}`);
            reject(e);
          }
        });

        child.stdout.on('data', (data) => {
          stdoutChunks = stdoutChunks.concat(data);
        });

        child.stdout.on('end', () => {
          var stdoutContent = Buffer.concat(stdoutChunks).toString();
          global.outputConsole.appendLine(stdoutContent);
        });

        child.stderr.on('data', (data) => {
          stderrChunks = stderrChunks.concat(data);
          var stderrContent = Buffer.concat(stderrChunks).toString();
          global.outputConsole.appendLine(stderrContent);
        });

      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = new DocumentBuildAction;
