/*!
 * resolve-up <https://github.com/jonschlinkert/resolve-up>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

require('mocha');
var assert = require('assert');
var resolveUp = require('./');

describe('resolve-up', function() {
  describe('glob pattern', function() {
    it('should return an array of directories:', function() {
      assert(resolveUp('*').length > 0);
      assert(Array.isArray(resolveUp('*')));
    });
  });

  describe('errors', function() {
    it('should throw an error when invalid args are passed', function() {
      assert.throws(function() {
        resolveUp();
      });
    });
  });

  describe('path', function() {
    it('should return an array of directories:', function() {
      console.time('mocha');
      assert(resolveUp('mocha').length > 0);
      console.timeEnd('mocha');
    });

    it('should return an array of directories:', function() {
      console.time('nosymlinks');
      assert(Array.isArray(resolveUp('mocha', {fast: true})));
      console.timeEnd('nosymlinks');
    });
  });
});
