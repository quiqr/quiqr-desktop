'use strict';

module.exports.IS_DEV = process.env.NODE_ENV !== 'production';

module.exports.IS_PROD = process.env.NODE_ENV === 'production';
