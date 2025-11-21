const electron                  = require('electron');
const BrowserWindow             = electron.BrowserWindow;
const path                      = require('path')
const fs                        = require('fs-extra')
const fetch                     = require('node-fetch')

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

  let url = `http://${host}:${port}`+global.currentBaseUrl;

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

          for (const favUrl of urls) {
            const faviconFile = favUrl.split('/').pop();

            try {
              // First check if the favicon exists with HEAD request
              const headResponse = await fetch(favUrl, { method: 'HEAD' });

              if (headResponse.ok) {
                // Download the favicon
                const response = await fetch(favUrl);

                if (response.ok) {
                  const dest = path.join(targetPath, 'favicon', faviconFile);
                  const fileStream = fs.createWriteStream(dest);

                  response.body.pipe(fileStream);

                  fileStream.on('finish', () => {
                    console.log("favicon downloaded");
                  });

                  fileStream.on('error', (err) => {
                    console.log("Error writing favicon:", err);
                  });
                }
              }
            } catch (err) {
              console.log("Error fetching favicon:", err);
            }
          }
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
