require('dotenv').config();
const { notarize } = require('@electron/notarize');

var notconf = {
    appBundleId: 'com.lingewoud.quiqr',
    appPath: 'dist/mac/Quiqr.app',
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
}
console.log(notconf);
notarize(notconf);


