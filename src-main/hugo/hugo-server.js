const { spawn } = require('child_process');
const pathHelper = require('./../path-helper');
const fs = require('fs-extra');

global.currentServerProccess = undefined;
let mainWindow;

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
        global.outputConsole.appendLine('Stopping Hugo Server...');
        global.outputConsole.appendLine('');

            global.currentServerProccess.kill();
            global.currentServerProccess = undefined;
        }
    }

    //Start Hugo Server
    serve(callback){

        let {config, workspacePath, hugover} = this.config;

        try{
            mainWindow = global.mainWM.getCurrentInstance();
            if(mainWindow){
                global.outputConsole.appendLine('Sending serverDown.');
                mainWindow.webContents.send("serverDown")
            }
            else{
                console.log('No mainWindow.2');
            }
        }
        catch(e){

            console.log('No mainWindow.');
            console.log(e.message);

        }

        this.stopIfRunning();

        const exec = pathHelper.getHugoBinForVer(hugover);

        if(!fs.existsSync(exec)){
            callback(new Error('Could not find hugo.exe for version '+ hugover));
            return;
        }

        let hugoArgs = [ 'server', '--port', '13131' ];

        if(config){
            hugoArgs.push('--config');
            hugoArgs.push(config);
        }

        try{
            global.currentServerProccess = spawn(
                exec,
                hugoArgs,
                {
                    cwd: workspacePath
                }
            );
            let {stdout, stderr} = global.currentServerProccess;
            this.emitLines(stdout);

            global.currentServerProccess.stderr.on('data', (data) => {
                global.outputConsole.appendLine('Hugo Server Error: '+data);
            });

            global.currentServerProccess.on('close', (code) => {
                global.outputConsole.appendLine('Hugo Server Closed: '+code);
            });

            stdout.setEncoding('utf8');
            stdout.resume();

            let isFirst = true;
            stdout.on('line', function (line) {
                if(isFirst){
                    isFirst=false;
                    global.outputConsole.appendLine('Starting Hugo Server...');
                    global.outputConsole.appendLine('');
                    mainWindow = global.mainWM.getCurrentInstance();
                    if(mainWindow){
                        global.outputConsole.appendLine('Sending serverLive.');
                        mainWindow.webContents.send("serverLive")
                    }
                    else{
                        global.outputConsole.appendLine('No mainWindow.');
                    }

                    return;
                }
                global.outputConsole.appendLine(line);
            });
        }
        catch(e){
            global.outputConsole.appendLine('Hugo Server failed to start.');
            global.outputConsole.appendLine(e.message);
            if(mainWindow){
                global.outputConsole.appendLine('Sending serverDown.');
                mainWindow.webContents.send("serverDown")
            }
            else{
                global.outputConsole.appendLine('No mainWindow.');
            }
            callback(e);
        }
        callback(null);
    }
}

module.exports = HugoServer;
