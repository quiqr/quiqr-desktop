const electron                  = require('electron');
const BrowserWindow             = electron.BrowserWindow;
const url                       = require('url')
const path                      = require('path')
const fs                        = require('fs-extra')
const configurationDataProvider = require('../app-prefs-state/configuration-data-provider')

let screenshotWindow;

function capture(targetPath){
  console.log('capture')
  screenshotWindow.webContents.capturePage().then(image => {

    if (!fs.existsSync(path.dirname(targetPath))) fs.mkdirSync(path.dirname(targetPath), {recursive: true});

    fs.writeFile(targetPath, image.toJPEG(75), (err) => {
      if (err){
        console.log(err)
        screenshotWindow.close();
      }
      console.log('Image Saved:'+targetPath)
      screenshotWindow.close();
    })
  })

}

function createScreenshot (host, port, targetPath) {
  screenshotWindow = new BrowserWindow({
    show: false,
    frame: true,
    backgroundColor:"#ffffff",
    width: 1024,
    height: 768,
  });

  screenshotWindow.setMenuBarVisibility(false);

  let url = `http://${host}:${port}`;

  const net = require('net');
  const client = new net.Socket();

  const tryConnection = () => client.connect({port: port}, () => {
    client.end();

    if(screenshotWindow) screenshotWindow.loadURL(url);

    screenshotWindow.webContents.executeJavaScript("document.body.style.overflow = 'hidden'");

    setTimeout(()=>{
      capture(targetPath);
    }, 2000);

  });
  client.on('error', (error) => {
    console.log(error)
  });

  setTimeout(()=>{
    tryConnection();
  }, 2000);

  screenshotWindow.on('closed', function () {
    screenshotWindow = undefined; //clear reference
  })
}

module.exports = {
  createScreenshot: (host, port, targetPath)=>{
    createScreenshot(host, port, targetPath)
  }
}
