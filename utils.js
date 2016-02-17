'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('extend-shallow', 'extend');
require('array-unique', 'unique');
require('npm-paths', 'paths');
require('matched', 'glob');
require('is-valid-glob');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
