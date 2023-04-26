const spawnAw                   = require('await-spawn')
const outputConsole             = require('../logger/output-console');

class CliExecuteHelper {

  async try_execute(action, executable, args = []){
    try {
      await spawnAw( executable, args);
      outputConsole.appendLine(`${action} finished ...`);
    } catch (e) {
      outputConsole.appendLine(`Executing: ${executable} ${args.join(" ")}`);
      outputConsole.appendLine('ERROR: ' + e.stdout.toString());
      throw e;
      //new Error('Error at execution.');
    }
  }
}

module.exports = new CliExecuteHelper();
