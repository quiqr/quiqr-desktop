require('dotenv').config();
const { notarize } = require('electron-notarize');

notarize({
    appBundleId: 'com.lingewoud.sukoh',
    appPath: 'dist/mac/Sukoh.app',
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
});


