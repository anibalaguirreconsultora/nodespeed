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

describe('testing the nodespeed schema api', () => {
    let nodespeed = Nodespeed();
    let apiModel;

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            apiModel = nodespeed.models.Nodespeed;

            sdk.angular2({
                app: nodespeed,
                framework: 'angular2',
                moduleName: 'sdk',
                apiUrl: '/api',
                outputFolder: path.resolve('test/fixtures/simple-integration-app/sdk'),
                isIo: 'disabled',
                driver: 'ng2web',
                wipe: 'enabled',
                defaultValue: 'disabled',
                fireloopOnly: 'disabled',
                quiet: true
            });

            done();
        });

    });

    it('schema api should have 14 models', (done) => {
        let data = apiModel.dataDictionary();

        data.length.should.be.eql(14);
        done();
    });

    it('each model should have a definitions file', (done) => {
        let data = apiModel.dataDictionary();

        data.forEach((model) => {
            should.exist(model.options.definitionsFile,`model ${model.name} is missing a definitionsFile key`);
        });

        done();
    });

    it('schema api should have a patient model', (done) => {
        let patient = nodespeed.dictionary().model['patient'];
        should.exists(patient);
        done();
    });

    it('all models should have a primaryKey', (done) => {
        nodespeed.dictionary().models.forEach((model) => {
            should.exist(model.options.nodespeed.primaryKey,`primaryKey missing for model ${model.name}`);
            should.exist(model.options.nodespeed.primaryKeyId,`primaryKeyId missing for model ${model.name}`);
        });

        done();
    });

    it('the patient model should have a primaryKey of "id"', (done) => {
        nodespeed.dictionary().model['patient'].options.nodespeed.primaryKey.should.be.eql('id');
        done();
    });

});
