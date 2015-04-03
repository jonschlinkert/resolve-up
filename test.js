/*!
 * resolve-up <https://github.com/jonschlinkert/resolve-up>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
var assert = require('assert');
var should = require('should');
var resolveUp = require('./');

describe('resolve-up', function () {
  it('should return an array of directories:', function () {
    resolveUp('*').length.should.not.equal(0);
    resolveUp('*').should.should.be.an.array;
  });

  it('should throw an error on bad args:', function () {
    (function () {
      resolveUp();
    }).should.throw('resolve-up expects a string or array as the first argument.');
  });
});
