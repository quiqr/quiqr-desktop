require('dotenv').config();
const { notarize } = require('electron-notarize');

notarize({
    appBundleId: 'com.lingewoud.poppygo',
    appPath: 'dist/mac/PoppyGo.app',
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
});


