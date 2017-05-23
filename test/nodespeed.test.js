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

describe(' when instantiating a Nodespeed instance, it', () => {

    it('should start without error', (done) => {

        (() => {
            Nodespeed();
        }).should.not.throwError();

        done();

    });

    it('should have a "defineMiddlewarePhases" method', (done) => {

        let nodespeed = Nodespeed();

        should.exist(nodespeed.defineMiddlewarePhases);

        done();
    });

});

describe(' the Nodespeed instance boot process should', () => {
    let nodespeed;

    beforeEach (() => {
        nodespeed = Nodespeed();
    });

    it('return an error if called with no parameters', (done) => {
        (() => {
            nodespeed.boot();
        }).should.throwError();

        done();

    });

    it('return an error if called with just a callback', (done) => {
        (() => {
            nodespeed.boot(function() {});
        }).should.throwError();

        done();

    });

    it('boot successfully if called with a string parameter', (done) => {
        (() => {
            nodespeed.boot(path.join(__dirname + '../server'));
        }).should.not.throwError();

        done();

    });

    it('boot successfully if called with an app and  string parameter', (done) => {
        (() => {
            nodespeed.boot(function() {},path.join(__dirname + '../server'));
        }).should.not.throwError();

        done();

    });

    it('should call the callback function if supplied', (done) => {
        nodespeed.boot(path.join(__dirname + '../server'),() => {
            done();
        });
    });

    it('should return a promise if no callback function is supplied', () => {
        return nodespeed.boot(path.join(__dirname + '../server')).should.be.fulfilled();
    });

    it('should have loaded the schema', () => {
        return nodespeed.boot(path.join(__dirname + '../server')).should.be.fulfilled();
    });
});

describe(' the Nodespeed instance start process should', () => {
    let nodespeed;

    beforeEach (() => {
        nodespeed = Nodespeed();
    });

    it('return a resolved promise if started ok', (done) => {

        nodespeed.boot(__dirname).then(() => {
             return nodespeed.start().should.be.fulfilled();
        })

        .then((server) => {
          nodespeed.set('port', 0);
          nodespeed.get('/', function(req, res) { res.status(200).send('OK'); });

          server.should.be.an.instanceOf(require('http').Server);

          request(server).get('/').expect(200, done);

        });
    });

});

describe(' the Nodespeed instance api should', () => {
    let nodespeed = Nodespeed();

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            done();
        });

    });

    it('be able to set and get a value', (done) => {
        nodespeed.set("foo","bar");
        let result = nodespeed.get("foo");

        result.should.be.eql("bar");
        done();
    });

    it('have a default model directory', (done) => {
        should.exist(nodespeed.config.defaultModelDirectory);
        nodespeed.config.defaultModelDirectory.replace(process.cwd(),'').should.be.eql('/test/fixtures/simple-integration-app/server/models');
        done();
    });

});

describe(' the nodespeed.info api should', () => {
    let nodespeed;

    before (() => {
        nodespeed = Nodespeed();
    });

    it('return a version number equal to the version specified in the loopback package.json', (done) => {
        let version = require('loopback/package').version;

        nodespeed.info().version.should.be.eql(version);
        done();
    });

    it('the dataSource array should have two entries', (done) => {
        nodespeed.info().dataSources.length.should.be.eql(4);
        done();
    });

    it('the names of the dataSource should be "Nodespeed"', (done) => {
        nodespeed.info().dataSources[0].name.should.be.eql("Nodespeed");
        done();
    });
});

describe(' the nodespeed.info api authentication key', () => {
    let nodespeed;

    before (() => {
        nodespeed = Nodespeed();
    });

    it('should exist', (done) => {
        should.exist(nodespeed.info().authentication);
        done();
    });

    // it('have a domain of "foobar"', (done) => {
    //     nodespeed.info().authentication.domain.should.be.eql('foobar');
    //     done();
    // });

    // it('have a source of "bar"', (done) => {
    //     nodespeed.info().authentication.source.should.be.eql('bar');
    //     done();
    // });

    // it('have an id of "barfoo"', (done) => {
    //     nodespeed.info().authentication.id.should.be.eql('barfoo');
    //     done();
    // });


});

describe(' the nodespeed model', () => {
    let nodespeed = Nodespeed();

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            done();
        });
    });

    it('should exist', (done) => {
        should.exist(nodespeed.models['Nodespeed']);
        done();
    });

    it('should be flagged as a system model', (done) => {
        nodespeed.dictionary().model.Nodespeed.options.isSystemModel.should.be.eql(true);
        done();
    });



});