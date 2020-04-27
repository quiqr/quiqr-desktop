//@flow

const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const url = require('url')
const path = require('path')
const fs = require('fs-extra')

let selectsiteWindow/*: any*/;

function showNotFound(selectsiteWindow/*: any*/, lookups/*: Array<string>*/){
    let lookupsHtml = lookups.map((x)=> `<li>${x}</li>`).join('');
    selectsiteWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
    <h1>Oops...</h1>
    <p>The file <b>index.html</b> was not found!</p>
    <p>We tried the following paths:</p>
    <ul>${lookupsHtml}</ul>
</body>
</html>`));
}

function showTesting(selectsiteWindow/*: any*/){
    selectsiteWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Testing</h1>
<p>Testing...</p>
</body>
</html>`));
}

function showLookingForServer(selectsiteWindow/*: any*/, port/*: string*/){
    selectsiteWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Waiting for Development Server</h1>
<p>Waiting for React development server in port ${port}...</p>
<p>Have you started it?</p>
</body>
</html>`));
}

function showInvalidDevelopmentUrl(selectsiteWindow/*: any*/, url/*: ?string*/){
    selectsiteWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html>
<body style="font-family: sans-serif; padding: 2em">
<h1>Invalid Development Server URL</h1>
<p>The provided URL (${url||'EMPTY'}) does not match the required pattern.</p>
<p>Please, fix this and try again.</p>
</body>
</html>`));
}

function createWindow () {
    const configurationDataProvider = require('./configuration-data-provider')

    let icon;
    if(process.env.REACT_DEV_URL)
        icon = path.normalize(__dirname + "/../public/icon.png");


    configurationDataProvider.get(function(err, configurations){
      if(configurations.empty===true) throw new Error('Configurations is empty.');

      let showFrame=false;
      configurations.global.hideWindowFrame ? showFrame = false : showFrame = true;

      // Create the browser window.
      selectsiteWindow = new BrowserWindow({
        show: false,
        frame: showFrame,
        backgroundColor:"#ffffff",
          //minWidth:1024,
        width: 500,
        height: 400,
        //webPreferences:{webSecurity:false },
        icon
      });

      if(configurations.global.maximizeAtStart){
          //selectsiteWindow.maximize();
      }

      selectsiteWindow.setMenuBarVisibility(false);


      selectsiteWindow.show();
    });

    if(process.env.REACT_DEV_URL){

      //DEVELOPMENT SERVER

      //let url = process.env.REACT_DEV_URL+'/console';
      let url = process.env.REACT_DEV_URL;
      const urlWithPortMatch = url.match(/:([0-9]{4})/);
        if(urlWithPortMatch==null){
            showInvalidDevelopmentUrl(url);
        }
        else{
            let port = urlWithPortMatch[1];
            showLookingForServer(selectsiteWindow, port);

            const net = require('net');
            const client = new net.Socket();
            const tryConnection = () => client.connect({port: port}, () => {
                    client.end();
                    if(selectsiteWindow)
                        selectsiteWindow.loadURL(url);
                }
            );
            client.on('error', (error) => {
                setTimeout(tryConnection, 1000);
            });
            tryConnection();
        }
    }
    else{

        //LOOKING FOR INDEX.HTML

        let lookups = [
            path.normalize(path.join(__dirname, '/../index.html')), //works in production
            path.normalize(path.join(__dirname, '../build/index.html')) //works in development after react_build
        ];

        let indexFile = null;
        for(let i=0; i < lookups.length; i++){
            let lookup = lookups[i];
            if(fs.existsSync(lookup)){
                indexFile = lookup;
                break;
            }
        }
        if(indexFile){
            selectsiteWindow.loadURL(
              url.format({ pathname: indexFile, protocol: 'file:', slashes: true })
            );
        }
        else{
            showNotFound(selectsiteWindow, lookups);
        }
    }

    selectsiteWindow.on('closed', function () {
        selectsiteWindow = undefined; //clear reference
    })

    var handleRedirect = (e, url) => {
        if(!/\/\/localhost/.test(url)) {
            e.preventDefault()
            require('electron').shell.openExternal(url)
        }
    }

    selectsiteWindow.webContents.on('will-navigate', handleRedirect);
    selectsiteWindow.webContents.on('new-window', handleRedirect);

    //selectsiteWindow.webContents.openDevTools();
}

module.exports = {
    getCurrentInstance: function(){
        return selectsiteWindow;
    },
    getCurrentInstanceOrNew: function(){
        let instance = this.getCurrentInstance();

        if(instance){
            return instance;
        }

        createWindow();
        return selectsiteWindow;
    }
}
