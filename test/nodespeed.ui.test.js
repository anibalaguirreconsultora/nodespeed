// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT


'use strict';

const should = require('should');
const Nodespeed = require('../');
const path = require('path');
const request = require('supertest');
const bootpath = path.resolve(path.join(__dirname,'./fixtures/simple-integration-app/server'));

describe('Testing the Nodespeed standard grid ui', () => {
    let nodespeed;
    let grid ;

    before(function(done) {
        nodespeed = Nodespeed();
        nodespeed.boot(bootpath, () => {
            grid = nodespeed.schema.dictionary.model.customer.options.nodespeed.layout.grid;
            done();
        });

    });

    it('the customer model should have a grid view', (done) => {
        should.exist(grid);
        done();
    });

    it('the customer model grid view should have a columns property array', (done) => {
        should.exist(grid.columns);
        Array.isArray(grid.columns).should.be.eql(true);
        done();
    });

    it('the customer model grid view should have two valid fields in the columns property array', (done) => {
        grid.columns.length.should.be.eql(2);
        should.exist(nodespeed.schema.dictionary.model.customer.property[grid.columns[0]._id]);
        done();
    });

});

describe('Testing the Nodespeed standard grid ui on nodesports', () => {
    let nodespeed;
    let bootpath = path.resolve(path.join(__dirname,'../nodesports/server'));
    let grid ;

    before(function(done) {
        nodespeed = Nodespeed();
        nodespeed.boot(bootpath, () => {
            grid = nodespeed.schema.dictionary.model.Customer.options.nodespeed.layout.grid;
            done();
        });

    });

    it('the customer model should have a grid view', (done) => {
        should.exist(grid);
        done();
    });

    it('the customer model grid view should have a columns property array', (done) => {
        should.exist(grid.columns);
        Array.isArray(grid.columns).should.be.eql(true);
        done();
    });

    it('the customer model grid view should have two valid fields in the columns property array', (done) => {
        grid.columns.length.should.be.eql(2);
        should.exist(nodespeed.schema.dictionary.model.Customer.property[grid.columns[0]._id]);
        done();
    });

    it('the customer model grid view id field should have a length of 20%', (done) => {
        grid.columns[0].width.should.be.eql('20%');
        done();
    });
});

