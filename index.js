/*!
 * resolve-up <https://github.com/jonschlinkert/resolve-up>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var glob = require('matched');
var isValidGlob = require('is-valid-glob');
var unique = require('array-unique');
var paths = require('global-paths');

/**
 * Return a list of directories that match the given filepath/glob
 * patterns, optionally using a pre-filter function before matching
 * globs against paths.
 *
 * @param  {Array|String} `pattern`
 * @param  {Function} `fn` Optional pre-filter function
 * @return {Array}
 */

module.exports = function resolveUp(patterns, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  if (!isValidGlob(patterns)) {
    throw new Error('resolve-up expects a string or array as the first argument.');
  }

  options = options || {};
  var dirs = paths(process.cwd()).concat(options.paths || []);
  var len = dirs.length, i = -1;
  var res = [];

  while (++i < len) {
    options.cwd = dirs[i];
    if (!options.cwd) continue;
    res.push.apply(res, resolve(glob.sync(patterns, options), options));
  }
  return unique(res);
};

/**
 * Resolve the absolute path to a file using the given cwd.
 */

function resolve(files, opts) {
  var fn = opts.filter || function(fp) {
    return true;
  };

  if (opts.realpath === true) {
    return files.filter(fn);
  }

  var len = files.length;
  var res = [];

  while (len--) {
    var fp = path.join(opts.cwd, files[len]);
    if (!fn(fp) || res.indexOf(fp) > -1) continue;
    res.push(fp);
  }
  return res;
}
