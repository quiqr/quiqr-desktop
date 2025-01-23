//const path                                  = require('path');
//const fs                                    = require('fs-extra');
//const rootPath                              = require('../utils/electron-root-path').rootPath;
//const spawnAw                               = require('await-spawn')
const cliExecuteHelper                      = require('../utils/cli-execute-helper');
//const pathHelper                            = require('../utils/path-helper');
const { EnvironmentResolver, PLATFORMS }    = require('../utils/environment-resolver');
const { spawn, exec } = require('child_process');

class DocumentBuildAction{

  runAction(actionName, execution_dict, filePath, sitePath){
    let enviromnent = new EnvironmentResolver().resolve();

    if(enviromnent.platform == PLATFORMS.windows){
      return this.runOnWindows(actionName, execution_dict['windows'], filePath, sitePath);
    }
    else{
      return this.runOnUnix(actionName, execution_dict['unix'], filePath, sitePath);
    }
  }

  replace_path_vars(sourcePath, filePath, sitePath){
    return sourcePath
      .replace('%site_path', sitePath)
      .replace('%document_path', filePath)
  }

  runOnUnix(actionName, execution_dict, filePath, sitePath){

    let command = this.replace_path_vars(execution_dict.command, filePath, sitePath);
    let args = execution_dict.args.map((arg) => {
      return this.replace_path_vars(arg, filePath, sitePath);
    });

    return new Promise( async (resolve, reject)=>{
      try {

        var stdoutChunks = [], stderrChunks = [];
        const child = spawn(command, args);

        child.on('exit', (code) => {
          if(code == 0){

            var stdoutContent = Buffer.concat(stdoutChunks).toString();
            resolve(
              {
                stdout: stdoutContent,
                filePath: filePath,
              }
            )
          }
          else{
            console.log('Process exited with code', code)
          }
        });

        child.stdout.on('data', (data) => {
          stdoutChunks = stdoutChunks.concat(data);
        });

        child.stdout.on('end', () => {
          var stdoutContent = Buffer.concat(stdoutChunks).toString();
          //console.log('stdout chars:', stdoutContent.length);
          //console.log(stdoutContent);
        });

        child.stderr.on('data', (data) => {
          stderrChunks = stderrChunks.concat(data);
          var stderrContent = Buffer.concat(stderrChunks).toString();
          global.outputConsole.appendLine(stderrContent);
          //console.log(stderrContent);
        });

        child.stderr.on('end', () => {
          var stderrContent = Buffer.concat(stderrChunks).toString();
          //console.log('stderr chars:', stderrContent.length);
          //console.log(stderrContent);
        });

      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = new DocumentBuildAction;
