// Copyright whogloo, inc. 2017. All Rights Reserved.
// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
var assert = require('assert');
var nodespeed = require('../');

describe('Memory Connector', function() {
  it('Create a model using the memory connector', function(done) {
    // use the built in memory function
    // to create a memory data source
    var memory = nodespeed.memory();

    // or create it using the standard
    // data source creation api
    memory = nodespeed.createDataSource({
      connector: nodespeed.Memory,
    });

    // create a model using the
    // memory data source
    var properties = {
      name: String,
      price: Number,
    };

    var Product = memory.createModel('product', properties);

    Product.create([
      {name: 'apple', price: 0.79},
      {name: 'pear', price: 1.29},
      {name: 'orange', price: 0.59},
    ], count);

    function count() {
      Product.count(function(err, count) {
        assert.equal(count, 3);

        done();
      });
    }
  });
});