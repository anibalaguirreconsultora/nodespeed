// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const should = require('should');
const Nodespeed = require('../');
const path = require('path');

describe('the config system', () => {

    it('should be attached to a new nodespeed instance', (done) => {

        let nodespeed = Nodespeed();

        should.exist(nodespeed.config);

        done();

    });

    it('should have a root directory eq to the package.json directory ', (done) => {

        let nodespeed = Nodespeed();

        should.exist(nodespeed.config.directory.root);
        nodespeed.config.directory.root.should.be.eql(path.join(__dirname,'..'));

        done();

    });

    it('the config.xxx key should be read from the environment', (done) => {

        process.env.XXX_test_host = "test";
        process.env.XXX_test_foo = "foo";

        let nodespeed = Nodespeed({env: {pattern: 'XXX'}});

        should.exist(nodespeed.config.test);

        nodespeed.config.test.host.should.be.eql('test');
        nodespeed.config.test.foo.should.be.eql('foo');

        delete nodespeed.config.test.foo;

        should.not.exist(nodespeed.config.test.foo);

        done();

    });

    it('return a version number equal to the version specified in package.json', (done) => {
        let version = require('../package.json').version;
        let nodespeed = Nodespeed();

        nodespeed.config.version.should.be.eql(version);
        done();
    });

    it('should have a root directory eq to the package.json directory ', (done) => {

        let nodespeed = Nodespeed();

        should.exist(nodespeed.config.directory.root);
        nodespeed.config.directory.root.should.be.eql(path.join(__dirname,'..'));

        done();

    });

    it('it should have a valid directory structure based on the package.json directory if no options are supplied', (done) => {
        let nodespeed = Nodespeed();
        let basePath = path.join(__dirname,'..');

        [
            { name: 'dist'},
            { name: 'server'},
            { name: 'models', folder: 'server/models'},
            { name: "mixins", folder: 'server/mixins'},
            { name: "forms", folder: 'server/forms'},
            { name: 'src'}
        ].forEach((item) => {
            let folder = item.folder || item.name;
            nodespeed.config.directory[item.name].should.be.eql(path.join(basePath,folder),`folder ${item.name} is not valid in the config`);
        });

        done();
    });

});

