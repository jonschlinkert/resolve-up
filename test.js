/*!
 * resolve-up <https://github.com/jonschlinkert/resolve-up>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

require('mocha');
var assert = require('assert');
var resolveUp = require('./');

describe('glob pattern', function () {
  it('should return an array of directories:', function () {
    assert(resolveUp('*').length > 0);
    assert(Array.isArray(resolveUp('*')));
  });
});

describe('path', function () {
  it('should return an array of directories:', function () {
    console.time('mocha');
    assert(resolveUp('mocha').length > 0);
    console.timeEnd('mocha');
  });

  it('should return an array of directories:', function () {
    console.time('nosymlinks');
    assert(Array.isArray(resolveUp('mocha', {nosymlinks: true})));
    console.timeEnd('nosymlinks');
  });
});

describe('errors', function () {
  it('should throw an error on bad args:', function (cb) {
    try {
      resolveUp();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'resolve-up expects a string or array as the first argument.');
      cb();
    }
  });
});
