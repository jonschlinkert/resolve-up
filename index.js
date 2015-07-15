/*!
 * resolve-up <https://github.com/jonschlinkert/resolve-up>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var mm = require('micromatch');
var isGlob = require('is-glob');
var unique = require('array-unique');
var root = require('global-modules');
var win32 = process.platform === 'win32';

/**
 * Return a list of directories that match the given filepath/glob
 * patterns, optionally using a pre-filter function before matching
 * globs against paths.
 *
 * @param  {Array|String} `pattern`
 * @param  {Function} `fn` Optional pre-filter function
 * @return {Array}
 */

module.exports = function matchDirs(pattern, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }

  if (!Array.isArray(pattern) && typeof pattern !== 'string') {
    throw new Error('resolve-up expects a string or array as the first argument.');
  }

  options = options || {};
  var dirs = paths(process.cwd());
  var len = dirs.length, i = 0;
  var res = [];

  var filter = matcher(pattern, fn);
  while (len--) {
    res.push.apply(res, lookup(dirs[i++], options, filter));
  }
  return unique(res);
};

/**
 * Create a filter function to use for filtering files
 * in the `lookup` loop. here are the steps in this function:
 *
 *   - files are filtered out first, keeping only directories
 *   - next, if a filter function is pass as the last arg on
 *     matchDirs, this can be used to further filter before
 *     getting to
 *
 * @param  {String|Array} `pattern`
 * @param  {Function} `fn`
 * @return {Boolean}
 */

function matcher(pattern, fn) {
  var isArray = Array.isArray(pattern);
  var isglob = isGlob(pattern);

  return function filter(name, fp, stat) {
    // no files should be returned, only dirs
    if (!stat || !stat.isDirectory()) {
      return false;
    }

    if (isglob === false) {
      if (pattern.indexOf('/') !== -1) {
        return pattern === name || unixify(fp).indexOf(pattern) !== -1;
      }
      return pattern === name;
    }

    // use the `fn` passed on the args to drill down further
    if (typeof fn === 'function' && fn(name, fp, stat) === false) {
      return false;
    }

    // if a glob or array of globs was passed, use it to filter the rest
    if (isArray || isglob) {
      return mm.any(name, pattern, {matchBase: true});
    }

    // otherwise, we can assume that `fn` already
    // disqualified unwanted files, so return the rest
    return true;
  };
}

/**
 * Returns an array of directories that we'll
 * use as a starting point for our lookups.
 *
 * @param  {String} `cwd` This should be `process.cwd()` for now.
 * @return {Array} Array of directories
 */

function paths(cwd) {
  var res = [npm(cwd)].concat(root);
  var segs = cwd.split(path.sep);

  while (segs.pop()) {
    res.push((win32 ? '/' : '') + npm(segs.join('/')));
  }
  if (process.env.NODE_PATH) {
    var nodePaths = process.env.NODE_PATH.split(path.delimiter);
    res = res.concat(nodePaths.filter(Boolean));
  } else {
    if (win32) {
      res.push(npm(process.env.APPDATA, 'npm'));
    } else {
      res.push(npm('/usr/lib'));
    }
  }
  res.push.apply(res, require.main.paths);
  return res;
}

/**
 * Read directories, starting with the given `dir`.
 *
 * @param  {String} `dir`
 * @param  {Function} `fn`
 * @return {Array}
 */

function lookup(dir, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts;
    opts = {};
  }

  opts = opts || {};
  var arr = tryReaddir(dir);
  var len = arr.length, i = 0;
  var res = [];

  while (len--) {
    var name = arr[i++];
    var fp = path.resolve(dir, name);
    var stat;
    if (opts.symlinks === false || opts.nosymlinks === true) {
      stat = trylstat(fp);
      if (stat.isSymbolicLink()) continue;
    } else {
      stat = tryStat(fp);
    }
    if (fn && !fn(name, fp, stat)) {
      continue;
    }
    res.push(fp);
  }
  return res;
}

/**
 * Utils
 */

function npm(dir) {
  return path.join(dir, 'node_modules');
}

function unixify(fp) {
  return fp.split('\\').join('/');
}

function tryReaddir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch(err) {}
  return [];
}

function tryStat(fp) {
  try {
    return fs.statSync(fp);
  } catch(err) {}
  return false;
}

function trylstat(fp) {
  try {
    return fs.lstatSync(fp);
  } catch(err) {}
  return false;
}
