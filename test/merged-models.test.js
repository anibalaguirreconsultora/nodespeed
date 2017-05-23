// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const should = require('should');
const path = require('path');

const bootpath = path.resolve(path.join(__dirname,'./fixtures/simple-integration-app/server'));
const Nodespeed = require('../');

describe('when running an app using nodespeed,', () => {
    let app;

    before((done) => {
        app = Nodespeed();

        app.boot(bootpath).then(() => {
            done();
        })

        .catch((e) => {
            done(e);
        });

    });

    it('there should be a patients model', (done) => {
        should.exist(app.models.patient);
        done();
    });

    it('there should be a user model', (done) => {
        should.exist(app.models.user);
        done();
    });

    it('there should be a nodespeed model', (done) => {
        should.exist(app.models.Nodespeed);
        done();
    });

    describe('the user model dictionary entry', (done) => {
        it('should have 7 properties', (done) => {
            app.schema.dictionary.model.user.properties.length.should.eql(7);
            done();
        });

    });

    describe('when testing the merged models', (done) => {
        it('the accessToken model should have a single relation', (done) => {
            app.schema.dictionary.model.accessToken.relations.length.should.be.eql(1);
            done();
        });

        it('the store model should have a 3 relations', (done) => {
            app.schema.dictionary.model.store.relations.length.should.be.eql(3);
            done();
        });

        it('the widget.storeId property should not have an isInherited flag ', (done) => {
            should.not.exist(app.schema.dictionary.model.widget.property['storeId'].nodespeed.isInherited);
            done();
        });

        it('the widgetA.storeId property should have an isInherited flag set to true', (done) => {
            app.schema.dictionary.model.widgetA.property['storeId'].nodespeed.isInherited.should.be.eql(true);
            done();
        });

        it('the widgetB model dictionary entry should have 7 properties', (done) => {
            app.schema.dictionary.model.widgetB.properties.length.should.eql(7);
            done();
        });

        it('the widgetB.storeId property should have an isInherited flag set to true', (done) => {
            app.schema.dictionary.model.widgetB.property['storeId'].nodespeed.isInherited.should.be.eql(true);
            done();
        });

    });


});

