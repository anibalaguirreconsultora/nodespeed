// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const should = require('should');
const path = require('path');

const bootpath = path.resolve(path.join(__dirname,'./fixtures/simple-integration-app/server'));
const Nodespeed = require('../');

const sdk = require('@mean-expert/loopback-sdk-builder');

describe('testing nodespeed indexes', () => {
    let nodespeed = Nodespeed();
    let modelDef;
    let models;
    let indexModels;

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            modelDef = nodespeed.dictionary().model;
            models = nodespeed.dictionary().models.filter((item) => { return !item.options.isSystemModel});
            indexModels = models.filter((item) => { return item.options.nodespeed.primaryKey});
            done();
        });

    });

    it('the appointment model should have some indexes', (done) => {
        should.exist(modelDef.appointment.indexes);
        modelDef.appointment.indexes.length.should.be.above(0);
        done();
    });

    it('the customer model should have 4 indexes', (done) => {
        modelDef.customer.indexes.length.should.be.eql(4);
        done();
    });

    it('each model should have a primaryIndexId', (done) => {
        models.forEach((model) => {
            should.exist(model.options.nodespeed.primaryIndexId,`${model.name} is missing a primaryIndexId`);
        });

        done();
    });

    it('each model index should have a "keys" key', (done) => {
        indexModels.forEach((model) => {

            model.indexes.forEach((index) => {
                should.exist(index.keys,`${model.name}.${index.name} is missing the "keys" key`);
            });
        });

        done();
    });

    it('each model relation should have an associated index', (done) => {

        indexModels.forEach((model) => {
            let keys = {};

            keys[model.options.nodespeed.primaryKey] = false;

            model.relations.forEach((relation) => {
                let key = relation.nodespeed.type === "Foreign" ? relation.foreignKey : model.options.nodespeed.primaryKey;
                keys[key] = false;
            });

            model.indexes.forEach((index) => {
                keys[Object.keys(index.keys)[0]] = true;
            });

            Object.keys(keys).forEach((key) => {
              keys[key].should.be.eql(true,`${model.name}.${key} does not have an associated index`);
            });

        });


        done();
    });

});
