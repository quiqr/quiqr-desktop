const spawnAw                   = require('await-spawn')
const outputConsole             = require('../logger/output-console');

class CliExecuteHelper {

  async try_execute_promise(action, executable, args = []){

    return new Promise( async (resolve, reject)=>{
      try {
        let cmd = await spawnAw( executable, args);
        outputConsole.appendLine(`${action} finished ...`);
        resolve(cmd.toString())
      } catch (e) {
        outputConsole.appendLine(`Executing: ${executable} ${args.join(" ")}`);
        outputConsole.appendLine('ERROR: ' + e.stdout.toString());
        reject(e)
      }
    });

  }

  async try_execute(action, executable, args = []){
    try {
      let cmd = await spawnAw( executable, args);
      outputConsole.appendLine(`Executing: ${executable} ${args.join(" ")}`);
      outputConsole.appendLine(`${action} finished ...`);
      return cmd.toString();
    } catch (e) {
      outputConsole.appendLine(`Executing: ${executable} ${args.join(" ")}`);
      outputConsole.appendLine('ERROR: ' + e.stdout.toString());
      throw e;
    }
  }
}

module.exports = new CliExecuteHelper();
