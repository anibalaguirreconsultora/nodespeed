// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT


'use strict';

const should = require('should');
const Nodespeed = require('../');
const path = require('path');
const request = require('supertest');
const Import = require('../import').Import;
const apiDefinition = require('../server/models/nodespeed.json');

describe('the nodespeed.api', () => {
    let app;
    let apiModel;

    before((done) => {
        app = Nodespeed();

        app.boot(path.join(__dirname + '/../server')).then(() => {
            apiModel = app.models.Nodespeed;
            done();
        });

    });

    describe('model ', () => {

        it('should exist', (done) => {
            should.exist(apiModel);
            done();
        });

        it('model definition should have an "info" method key', (done) => {
            should.exist(apiModel.settings.methods.info);
            done();
        });

        it('info api should return data', (done) => {
            let data = apiModel.info();
            should.exist(data.version);
            done();
        });

        it('info http api should return successfully', (done) => {
            app.use(Nodespeed.rest());
            request(app).get('/nodespeed/info').expect(200,done);
        });

        it('info http api should return valid keys', (done) => {
            app.use(Nodespeed.rest());
            request(app).get('/nodespeed/info').end((err,res) => {
                res.body.version.should.be.a.String;
                res.body.dataSources.should.be.an.Array;
                res.body.authentication.should.be.an.Object;
                done(err);
            });
        });

        it('info http api should return valid dataSources', (done) => {
            app.use(Nodespeed.rest());
            request(app).get('/nodespeed/info').end((err,res) => {
                res.body.dataSources.length.should.be.eql(4);

                res.body.dataSources.forEach((dataSource) => {
                    dataSource.should.be.an.Object;
                    should.exist(dataSource.name);
                });
                done(err);
            });
        });

        it('schema api should return data', (done) => {
            let data = apiModel.dataDictionary();
            should.exist(data);
            done();
        });

        it('dataDictionary() call should return no models', (done) => {
            let data = apiModel.dataDictionary();
            data.length.should.be.eql(0);
            done();
        });
    });


});
