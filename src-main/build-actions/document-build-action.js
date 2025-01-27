const { EnvironmentResolver, PLATFORMS }    = require('../utils/environment-resolver');
const { spawn } = require('child_process');

class DocumentBuildAction{

  runAction(actionName, execution_dict, filePath, sitePath){
    let enviromnent = new EnvironmentResolver().resolve();

    if(enviromnent.platform == PLATFORMS.windows){
      return this.runOn(actionName, execution_dict['windows'], filePath, sitePath, execution_dict['stdout_type']);
    }
    else{
      return this.runOn(actionName, execution_dict['unix'], filePath, sitePath, execution_dict['stdout_type']);
    }
  }

  replace_path_vars(sourcePath, filePath, sitePath){
    return sourcePath
      .replace('%site_path', sitePath)
      .replace('%document_path', filePath)
  }

  runOn(actionName, execution_dict, filePath, sitePath, stdout_type ){

    let command = this.replace_path_vars(execution_dict.command, filePath, sitePath);
    let args = [];
    if (execution_dict.args && execution_dict.args.length > 0){
      args = execution_dict.args.map((arg) => {
        return this.replace_path_vars(arg, filePath, sitePath);
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
                stdoutContent: stdoutContent,
                filePath: filePath,
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
