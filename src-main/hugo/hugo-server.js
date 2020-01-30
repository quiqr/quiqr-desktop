//@flow

const { spawn } = require('child_process');
const pathHelper = require('./../path-helper');
const fs = require('fs-extra');
const outputConsole = require('./../output-console');

global.currentServerProccess = undefined;

class HugoServer{

    constructor(config){
        this.config = config;
    }

    emitLines (stream) {
        var backlog = ''
        stream.on('data', function (data) {
            backlog += data
            var n = backlog.indexOf('\n')
            // got a \n? emit one or more 'line' events
            while (~n) {
            stream.emit('line', backlog.substring(0, n))
            backlog = backlog.substring(n + 1)
            n = backlog.indexOf('\n')
            }
        });
        stream.on('end', function () {
            if (backlog) {
                stream.emit('line', backlog)
            }
        });
    }

    stopIfRunning(callback){
      if(global.currentServerProccess){
        outputConsole.appendLine('Stopping Hugo Server...');
        outputConsole.appendLine('');

            global.currentServerProccess.kill();
            global.currentServerProccess = undefined;
        }
    }

    serve(callback/*: (error: ?Error)=>void*/){

        let {config, workspacePath, hugover} = this.config;

        this.stopIfRunning();

        const exec = pathHelper.getHugoBinForVer(hugover);

        if(!fs.existsSync(exec)){
            callback(new Error('Could not find hugo.exe for version '+ hugover));
            return;
        }

        let hugoArgs = [ 'server' ];
        if(config){
            hugoArgs.push('--config');
            hugoArgs.push(config);
        }

        try{
            global.currentServerProccess = spawn(
                exec,
                hugoArgs,
                {
                    cwd: workspacePath,
                    windowsHide: true,
                    timeout: undefined,
                    env: {}
                }
            );
            let {stdout, stderr} = global.currentServerProccess;
            this.emitLines(stdout);

            global.currentServerProccess.stderr.on('data', (data) => {
                outputConsole.appendLine('Hugo Server Error: '+data);
            });

            global.currentServerProccess.on('close', (code) => {
                outputConsole.appendLine('Hugo Server Closed: '+code);
            });

            stdout.setEncoding('utf8');
            stdout.resume();

            let isFirst = true;
            stdout.on('line', function (line) {
                if(isFirst){
                    isFirst=false;
                    outputConsole.appendLine('Starting Hugo Server...');
                    outputConsole.appendLine('');
                    return;
                }
                outputConsole.appendLine(line);
            });


        }
        catch(e){
            outputConsole.appendLine('Hugo Server failed to start.');
            outputConsole.appendLine(e.message);
            callback(e);
        }
        callback(null);
    }
}

module.exports = HugoServer;
