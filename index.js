/*!
 * resolve-up <https://github.com/jonschlinkert/resolve-up>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var isGlob = require('is-glob');
var unique = require('array-unique');
var root = require('global-modules');
var mm = require('micromatch');


/**
 * Return a list of directories that match the given filepath/glob
 * patterns, optionally using a pre-filter function before matching
 * globs against paths.
 *
 * @param  {Array|String} `pattern`
 * @param  {Function} `fn` Optional pre-filter function
 * @return {Array}
 */

module.exports = function matchDirs(pattern, fn) {
  var dirs = paths(process.cwd());
  var len = dirs.length, i = 0;
  var res = [];

  var filter = matcher(pattern, fn);
  while (len--) {
    res.push.apply(res, lookup(dirs[i++], filter));
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
  return function filter(segment, fp, stat) {
    // no files should be returned, only dirs
    if (!stat || !stat.isDirectory()) {
      return false;
    }
    // use the `fn` passed on the args to drill down further
    if (fn && !fn(segment, fp, stat)) {
      return false;
    }
    // if a glob or array of globs was passed, use it to filter the rest
    if (Array.isArray(pattern) || isGlob(pattern)) {
      return mm.any(segment, pattern, {matchBase: true});
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
    res.push(npm(segs.join('/')));
  }

  if (process.env.NODE_PATH) {
    res = res.concat(process.env.NODE_PATH.split(path.sep));
  } else {
    if (process.platform === 'win32') {
      res.push(npm(process.env.APPDATA, 'npm'));
    } else {
      res.push(npm('/usr/lib'));
    }
  }

  res.push.apply(res, require.main.paths);
  return res;
}

/**
 * Recursively read directories, starting with the given `dir`.
 *
 * @param  {String} `dir`
 * @param  {Function} `fn`
 * @return {Array}
 */

function lookup(dir, fn) {
  var arr = tryReaddir(dir);
  var len = arr.length, i = 0;
  var res = [];

  while (len--) {
    var curr = arr[i++];
    // don't recurse into nested node_modules dirs
    if (curr.indexOf('node_modules') !== -1) {
      continue;
    }
    var fp = path.resolve(dir, curr);
    // if (isSymlink(fp)) continue;

    var stat = tryStat(fp);
    if (fn && !fn(curr, fp, stat)) {
      continue;
    }
    // recurse into directories
    if (stat.isDirectory() || isSymlink(fp)) {
      res.push.apply(res, lookup(fp, fn));
    }
    // push remaining dirs and files
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

function tryReaddir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch(err) {}
  return [];
}

function tryLstat(fp) {
  return tryCatch(fs.lstatSync, fp);
}

function tryStat(fp) {
  return tryCatch(fs.statSync, fp);
}

function isSymlink(fp) {
  return tryLstat(fp).isSymbolicLink();
}

function tryCatch(fn, fp) {
  try {
    return fn(fp);
  } catch(err) {}
  return false;
}
