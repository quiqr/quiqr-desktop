const logWindowManager = require('../ui-managers/log-window-manager');

class OutputConsole{

  constructor() {
    console.log('console init');
  }

  appendLine(line){

    console.log(line);

    let logWindow = logWindowManager.getCurrentInstance();
    console.log(logWindowManager);
    if(logWindow)
      logWindow.webContents.send('message',{ type:'console', data:{ line }});

    let mainWindow = global.mainWM.getCurrentInstance();
    if(mainWindow)
      mainWindow.webContents.send('message',{ type:'console', data:{ line }});

  }
}

module.exports = new OutputConsole();
