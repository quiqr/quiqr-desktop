const spawnAw                   = require('await-spawn')
const outputConsole             = require('../logger/output-console');

class CliExecuteHelper {

  async try_execute_promise(action_name, executable, args = [], cwd = null){

    return new Promise( async (resolve, reject)=>{
      try {
        outputConsole.appendLine(`Executing: ${executable} ${args.join(" ")}`);
        let cmd = await spawnAw( executable, args);
        outputConsole.appendLine(`${action_name} finished ...`);
        resolve(cmd.toString())
      } catch (e) {
        outputConsole.appendLine(`Executing: ${executable} ${args.join(" ")}`);
        outputConsole.appendLine('ERROR: ' + e.stdout.toString());
        reject(e)
      }
    });

  }

  async try_execute(action_name, executable, args = [], cwd = null){
      console.log(cwd)
      console.log(args)
    try {
      outputConsole.appendLine(`Executing: ${executable} ${args.join(" ")}`);
      let cmd = await spawnAw( executable, args);


      outputConsole.appendLine(`${action_name} finished ...`);
      console.log(cmd.toString())

      return cmd.toString();
    } catch (e) {
      console.log(e)
      //outputConsole.appendLine(`Executing: ${executable} ${args.join(" ")}`);
      //outputConsole.appendLine('ERROR: ' + e.stdout.toString());
      throw e;
    }
  }
}

module.exports = new CliExecuteHelper();
