require('dotenv').config();
const { notarize } = require('electron-notarize');

var notconf = {
    appBundleId: 'com.lingewoud.poppygo',
    appPath: 'dist/mac/PoppyGo.app',
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
}
console.log(notconf);
notarize(notconf);


