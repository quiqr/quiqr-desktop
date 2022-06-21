'use strict';

const path = require('path');
const electronEnv = require('./electronEnv');
const IS_PROD = require('./env').IS_PROD;
const isPackaged = require('./electron-is-packaged').isPackaged;

let rootPath = null;

if (isPackaged) {
  // renderer and main process - packaged build
  if (electronEnv.isWindows) {
    // windows platform
    rootPath = path.join(__dirname, '..', '../../../../');
  } else {
    // non windows platform
    rootPath = path.join(__dirname, '..', '../../../../../');
  }
} else if (IS_PROD) {
  // renderer and main process - prod build
  if (electronEnv.isRenderer) {
    // renderer process - prod build
    rootPath = path.join(__dirname, '..', '..', '..');
  } else if (!module.parent) {
    // main process - prod build (case: run "start")
    rootPath = path.join(__dirname, '..', '..', '..');
  } else {
    // main process - prod (case: run "build")
    rootPath = path.join(__dirname, '..', '..', '..');
  }
} else if (electronEnv.isRenderer) {
  // renderer process - dev build
  rootPath = path.join(__dirname, '..', '..', '..');
} else {
  // main process - dev build
  rootPath = path.join(__dirname, '..', '..', '..');
}

module.exports.rootPath = path.resolve(rootPath);
