const mainWindowManager = require('./main-window-manager');
const logWindowManager = require('./log-window-manager');

class OutputConsole{
  appendLine(line){

        let logWindow = logWindowManager.getCurrentInstance();
        if(logWindow)
          logWindow.webContents.send('message',{ type:'console', data:{ line }});

        let mainWindow = mainWindowManager.getCurrentInstance();
        if(mainWindow)
            mainWindow.webContents.send('message',{ type:'console', data:{ line }});
    }
}

module.exports = new OutputConsole();
