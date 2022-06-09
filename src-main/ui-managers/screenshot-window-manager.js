const electron                  = require('electron');
const BrowserWindow             = electron.BrowserWindow;
const path                      = require('path')
const fs                        = require('fs-extra')
const request = require('request')

let screenshotWindow;

function capture(targetPath){
  screenshotWindow.webContents.capturePage().then(image => {

    if (!fs.existsSync(path.join(targetPath, 'screenshots'))) fs.mkdirSync(path.join(targetPath,'screenshots'), {recursive: true});

    fs.writeFile(path.join(targetPath, 'screenshots', 'quiqr-generated-screenshot.jpg'), image.toJPEG(75), (err) => {
      if (err){
        console.log("Screenshot ERR:")
        console.log(err)
        screenshotWindow.close();
      }
      console.log('Image Saved:'+targetPath)
      screenshotWindow.close();
    })
  })
}

function createScreenshotAndFavicon(host, port, targetPath) {
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

    if(screenshotWindow){
      screenshotWindow.webContents.executeJavaScript("document.body.style.overflow = 'hidden'");

      setTimeout(()=>{
        capture(path.join(targetPath));
      }, 2000);

      screenshotWindow.webContents.once('page-favicon-updated', async (event, urls) => {
        console.log("FAVICON")
        if(urls.length > 0){
          console.log(urls)
          if (!fs.existsSync(path.join(targetPath, 'favicon'))) fs.mkdirSync(path.join(targetPath, 'favicon'), {recursive: true});
          urls.forEach((favUrl)=>{
            const faviconFile = favUrl.split('/').pop();

            //TODO TEST22
            request.head(favUrl, () => {
              const req = request.get(favUrl)
                .on('response', function (res) {
                  if (res.statusCode === 200) {
                    req.pipe(fs.createWriteStream(path.join(targetPath,'favicon', faviconFile )))
                  }
                })
                .on('close',()=>{ console.log("favicon downloaded")});
            })

          })
        }
      });
    }

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
  createScreenshotAndFavicon: (host, port, targetPath)=>{
    createScreenshotAndFavicon(host, port, targetPath)
  }
}
