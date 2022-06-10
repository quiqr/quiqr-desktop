const electron = require('electron')
const os       = require('os');
const app      = electron.app

const PLATFORMS = {
    linux:'linux',
    windows:'windows',
    macOS:'macOS'
}

const ARCHS = {
    x64:'x64',
    x32:'x32'
}

class EnvironmentResolver{
    resolve(){
        let platform = global.process.platform;
        if(platform.startsWith("win")){
            platform=PLATFORMS.windows;
        }
        else if(platform.startsWith("linux")){
            platform=PLATFORMS.linux;
        }
        else if(platform.startsWith("darwin")){
            platform=PLATFORMS.macOS;
        }
        else{
            throw new Error('Could not resolve environment. Platform not supported.');
        }

        let arch = ARCHS[global.process.arch];
        if(arch===undefined)
            throw new Error('Could not resolve environment. Arch not supported.');

        return {platform, arch};
    }

    getUQIS(){
      let computerName = os.hostname()
      if(computerName.includes('.')) computerName = computerName.split('.')[0];
      const computerPlatform = os.platform()
      const computerRelease = os.release()
      const username = os.userInfo().username;
      const appVersion = app.getVersion();
      return `${username}@${computerName}+${computerPlatform}+${computerRelease}+quiqr-desktop-app-${appVersion}`;
    }
}

module.exports = {
    PLATFORMS,
    ARCHS,
    EnvironmentResolver
}
