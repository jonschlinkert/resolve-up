/*!
 * resolve-up <https://github.com/jonschlinkert/resolve-up>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var utils = require('./utils');

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

  if (!utils.isValidGlob(patterns)) {
    throw new Error('resolve-up expects a string or array as the first argument.');
  }

  var opts = utils.extend({fast: true}, opts);
  var dirs = utils.paths(opts).concat(opts.paths || []);
  var len = dirs.length, i = -1;
  var res = [];

  while (++i < len) {
    opts.cwd = dirs[i];
    if (!opts.cwd) continue;
    res.push.apply(res, resolve(utils.glob.sync(patterns, opts), opts));
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
  var res = [];

  while (len--) {
    var fp = path.join(opts.cwd, files[len]);
    if (!fn(fp) || res.indexOf(fp) > -1) continue;
    res.push(fp);
  }
  return res;
}
