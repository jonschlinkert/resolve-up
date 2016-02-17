/*!
 * resolve-up <https://github.com/jonschlinkert/resolve-up>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var utils = require('./utils');
var cache = {};

/**
 * Return a list of directories that match the given filepath/glob
 * patterns, optionally using a pre-filter function before matching
 * globs against paths.
 *
 * @param  {Array|String} `pattern`
 * @param  {Function} `fn` Optional pre-filter function
 * @return {Array}
 */

module.exports = function resolveUp(patterns, options) {
  if (!utils.isValidGlob(patterns)) {
    throw new Error('resolve-up expects a string or array as the first argument.');
  }

  var opts = utils.extend({fast: true}, options);
  var dirs = utils.paths(opts).concat(opts.paths || []);
  var len = dirs.length;
  var idx = -1;
  var res = [];

  while (++idx < len) {
    opts.cwd = dirs[idx];
    if (!opts.cwd) continue;
    opts.cwd = path.resolve(opts.cwd);
    var key = opts.cwd + ':' + patterns;
    if (cache[key]) {
      res.push.apply(res, cache[key]);
    } else {
      var files = resolve(utils.glob.sync(patterns, opts), opts);
      cache[key] = files;
      res.push.apply(res, files);
    }
  }
  return utils.unique(res);
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
  var idx = -1;
  var res = [];

  while (++idx < len) {
    var fp = path.resolve(opts.cwd, files[idx]);
    if (!fn(fp) || ~res.indexOf(fp)) continue;
    res.push(fp);
  }
  return res;
}
