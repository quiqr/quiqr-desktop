'use strict';

// Checks if we are in renderer process
module.exports.isRenderer = process.type === 'renderer';

// Checks if we are under Windows OS
module.exports.isWindows = process.platform === 'win32';
