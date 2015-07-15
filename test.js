/*!
 * resolve-up <https://github.com/jonschlinkert/resolve-up>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var resolveUp = require('./');

describe('glob pattern', function () {
  it('should return an array of directories:', function () {
    resolveUp('*').length.should.not.equal(0);
    resolveUp('*').should.should.be.an.array;
  });
});

describe('path', function () {
  it('should return an array of directories:', function () {
    console.time('mocha');
    resolveUp('mocha').should.should.be.an.array;
    console.timeEnd('mocha');
  });

  it('should return an array of directories:', function () {
    console.time('nosymlinks');
    resolveUp('mocha', {nosymlinks: true}).should.should.be.an.array;
    console.timeEnd('nosymlinks');
  });
});

describe('errors', function () {
  it('should throw an error on bad args:', function () {
    (function () {
      resolveUp();
    }).should.throw('resolve-up expects a string or array as the first argument.');
  });
});
