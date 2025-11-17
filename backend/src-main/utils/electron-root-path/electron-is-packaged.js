'use strict';

let isPackaged = false;

if (
  process.mainModule &&
  process.mainModule.filename.indexOf('app.asar') !== -1
) {
  isPackaged = true;
} else if (process.argv.filter(a => a.indexOf('app.asar') !== -1).length > 0) {
  isPackaged = true;
}

module.exports.isPackaged = isPackaged;
