// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const mockFs = require('mock-fs');

const should = require('should');
const path = require('path');
const Dictionary = require('../schema/dictionary').Dictionary;
const Nodespeed = require('../');
const bootpath = path.resolve(path.join(__dirname,'./fixtures/simple-integration-app/server'));
const _ = require('lodash');
const readFile = require('fs-readfile-promise');
const fs = require('fs');

describe('the dictionary model api should', () => {
    let nodespeed = Nodespeed();

    let dictionary;

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            dictionary = new Dictionary(nodespeed);
            done();
        });

    });

    it('fail to register a model if no data is passed', (done) => {

        (() => {
            dictionary.register.model();
        }).should.throwError();

        done();
    });

    it('fail to register a model if name or id are not passed', (done) => {

        (() => {
            dictionary.register.model({});
        }).should.throwError();

        (() => {
            dictionary.register.model({_id: 'foo'});
        }).should.throwError();

        done();
    });

    it('the array of models should be empty', (done) => {
        dictionary.models.length.should.be.eql(0);
        done();
    });

    it('register a model', (done) => {
        dictionary.register.model({name: 'foo', _id: 123});
        done();
    });

    it('a registered model should have array and collection properties', (done) => {
        let model = dictionary.register.model({name: 'foo', _id: 123});

        should.exist(model.properties);
        should.exist(model.property);
        model.properties.should.be.an.Array("invalid property array");
        model.property.should.be.an.Object("invalid property object");

        should.exist(model.indexes);
        should.exist(model.index);
        model.indexes.should.be.an.Array("invalid index array");
        model.index.should.be.an.Object("invalid index object");

        should.exist(model.relations);
        should.exist(model.relation);
        model.relations.should.be.an.Array("invalid relation array");
        model.relation.should.be.an.Object("invalid relation object");

        done();
    });

    it('should fail to register a model with invalid properties', (done) => {
        (() => {
            dictionary.register.model({name: 'bar', _id: 124, properties: {"foo":"bar"}});
        }).should.throwError({message: 'invalid property definition for foo'});

        done();
    });

    it('get a model', (done) => {
        dictionary.register.model({name: 'foo', _id: 123});
        should.exist(dictionary.model['foo']);
        done();
    });

    it('get an array of models', (done) => {
        dictionary.register.model({name: 'foo', _id: 123});
        dictionary.models.length.should.be.eql(1);
        done();
    });

    it('fail to remove a model if id is not passed', (done) => {

        (() => {
            dictionary.remove.model();
        }).should.throwError({message: 'invalid model id'});

        done();
    });

    it('fail to remove a model with an invalid id', (done) => {

        (() => {
            dictionary.remove.model('qq');
        }).should.throwError();

        done();
    });

    it('should remove a model', (done) => {
        dictionary.register.model({name: 'foo', _id: 123});
        dictionary.remove.model('foo');
        dictionary.models.length.should.be.eql(0);
        should.not.exist(dictionary.model['foo']);
        done();
    });

    it('should register a nodespeed-formatted model', (done) => {
        let model = JSON.parse(JSON.stringify(dictionary.register.model({name: 'foo', _id: 123, 'properties': {"name": {"type": "string"}}})));
        dictionary.remove.model('foo');

        let model2 = dictionary.register.model(model);

        model.should.be.eql(model2);
        done();
    });

});

describe('the dictionary property api should', () => {
    let nodespeed = Nodespeed();
    let dictionary;

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            dictionary = new Dictionary(nodespeed);
            done();
        });

    });

    it('fail to register a model property if an invalid model is passed', (done) => {

        (() => {
            dictionary.register.property();
        }).should.throwError();

        done();
    });

    it('fail to register a model property if name or id are not passed', (done) => {

        let model = dictionary.register.model({name: 'foo', _id: 123});

        (() => {
            dictionary.register.property(model._id,{});
        }).should.throwError(`invalid property`);

        (() => {
            dictionary.register.property(model._id,{ _id: 'foo'});
        }).should.throwError();

        done();
    });

    it('should register a model property', (done) => {

        let model = dictionary.register.model({name: 'foo', _id: 123});

        let property = dictionary.register.property(model._id,{ name: 'foo', _id: 124});

        model.properties.length.should.be.eql(1);
        should.exist(dictionary.property[124]);
        should.exist(model.property[124]);
        property._id.should.eql(124);
        done();

    });

    it('should remove a model property', (done) => {

        let model = dictionary.register.model({name: 'foo', _id: 123});

        dictionary.register.property(model._id,{ name: 'foo', _id: 124});

        (() => {
            dictionary.remove.property();
        }).should.throwError(`invalid model id`);

        (() => {
            dictionary.remove.property(model._id);
        }).should.throwError(`invalid property id`);

        (() => {
            dictionary.remove.property(model._id,999);
        }).should.throwError(`invalid property id`);

        dictionary.remove.property(model._id,124);
        should.not.exist(model.property[124]);
        done();

    });

});

describe('when removing a model', () => {
    let dictionary;
    let property;
    let model;

    let nodespeed = Nodespeed();

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            dictionary = new Dictionary(nodespeed);
            done();
        });

    });

    beforeEach (() => {
        model = dictionary.register.model({name: 'foo', _id: "a-b-c"});
        property = dictionary.register.property(model._id,{ name: 'foo', _id: "d-e-f"});
    });


    it('the model should not exist in the dictionary', (done) => {
        dictionary.remove.model(model._id);
        should.not.exist(dictionary.model[model._id]);
        done();
    });

    it('the property should not exist in the dictionary', (done) => {
        dictionary.remove.model(model._id);
        should.not.exist(dictionary.property["d-e-f"]);
        done();
    });
});

describe('ensure properties have nodespeed additions', () => {
    let dictionary;
    let property;
    let model;

    let nodespeed = Nodespeed();

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            dictionary = new Dictionary(nodespeed);
            done();
        });

    });

    beforeEach (() => {
        model = dictionary.register.model({name: 'foo', _id: "a-b-c"});
        property = dictionary.register.property(model._id,{ name: 'foo', _id: "d-e-f"});
    });

    it('the property should be valid', (done) => {
        should.exist(property);
        property.name.should.eql('foo');
        property._id.should.eql('d-e-f');
        done();
    });

    it('the property should have a nodespeed key', (done) => {
        should.exist(property.nodespeed);
        done();
    });

    it('there should be a layout key', (done) => {
        should.exist(property.nodespeed.layout);
        done();
    });

    it('there should be a default layout key', (done) => {
        should.exist(property.nodespeed.layout.default);
        property.nodespeed.layout.default.viewAs.should.eql('input');
        done();
    });

    it('a boolean property should have a viewAs of "checkbox"', (done) => {
        let property2 = dictionary.register.property(model._id,{ name: 'foo', _id: "d-e-f", type:"boolean"});

        property2.nodespeed.layout.default.viewAs.should.eql('checkbox');

        done();
    });

});

describe('check a nodespeed model has a description field', () => {
    let property;
    let model;

    let nodespeed = Nodespeed();
    let dictionary;

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            dictionary = new Dictionary(nodespeed);
            done();
        });

    });

    beforeEach (() => {
        model = dictionary.register.model({name: 'foo', _id: "a-b-c"});
        dictionary.register.property(model._id,{ name: 'foo'});
        dictionary.register.property(model._id,{ name: 'test'});
        property = dictionary.register.property(model._id,{ name: 'name'});
    });

    it('the model should have a description field', (done) => {
        model.options.nodespeed.descriptionFieldId.should.eql(property._id);
        done();
    });

});

describe('the dictionary register dataDictionary api should', () => {
    let nodespeed = Nodespeed();
    let dictionary;

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            dictionary = new Dictionary(nodespeed);
            done();
        });

    });

    it('fail to register if no data is passed', (done) => {

        (() => {
            dictionary.register.dataDictionary();
        }).should.throwError();

        done();
    });

    it('fail to register if an array is not passed', (done) => {

        (() => {
            dictionary.register.dataDictionary({});
        }).should.throwError('invalid model data');

        done();
    });

    it('register an existing model', (done) => {
        let newModel = dictionary.register.model({name: 'foo', _id: "a-b-c"});
        dictionary.register.property(newModel._id,{ name: 'name'});

        let model = JSON.parse(JSON.stringify(newModel));

        dictionary.remove.model(model._id);

        should.not.exist(dictionary.model[model._id]);
        should.not.exist(dictionary.property[model.property['name']._id]);

        dictionary.register.dataDictionary([model]);
        should.exist(dictionary.model[model._id]);

        should.exist(dictionary.property[model.property['name']._id]);
        done();
    });
});

describe('when performing read / write operations on a file', () => {
    let dictionary;
    let apiModel;

    let nodespeed = Nodespeed();

    before(function(done) {

        nodespeed.boot(bootpath, () => {
            dictionary = new Dictionary(nodespeed);
            apiModel = nodespeed.models.Nodespeed;

            let options = {};
            options[nodespeed.config.defaultModelDirectory] = {};
            options[path.join(nodespeed.config.options.appRootDir,'../common/models')] = {};
            mockFs(options);
            done();
        });

    });

    it('a model definition file should not exist', (done) => {
        let found = fs.existsSync('test/foo.json');
        found.should.be.eql(false);
        done();
    });

    it('the model definitionsFile property should exist', (done) => {
        let newModel = dictionary.register.model({name: 'foo', _id: "a-b-c"});
        should.exist(newModel.options.definitionsFile);
        done();
    });

    it('after saving the model definitions, a file should exist', (done) => {
        let newModel = dictionary.register.model({name: 'TestModel', _id: "a-b-c"});
        dictionary.register.property(newModel._id,{ name: 'name'});

        let fileName = `${nodespeed.config.defaultModelDirectory}/test-model.json`;

        dictionary.save.model(newModel).then((result) => {
            fs.existsSync(fileName).should.be.eql(true);

            let contents = fs.readFileSync(fileName).toString();
            newModel = JSON.parse(contents);
            done();
        })

        .catch((e) => {
            done(e);
        });
    });

    it('be able to save an existing model', (done) => {
        let existingModel = nodespeed.dictionary().model['customer'];

        let fileName = `${path.join(nodespeed.config.options.appRootDir,'../common/models')}/customer.json`;

        dictionary.save.model(existingModel).then(() => {
            fs.existsSync(fileName).should.be.eql(true);

            let result = JSON.parse(fs.readFileSync(fileName).toString());

            ['index','relation'].forEach((key) => {
                should.not.exist(result[key]);
            });

            ['definitionsFile','isSystemModel'].forEach((key) => {
                should.not.exist(result.options[key]);
            });

            done();
        })

        .catch((e) => {
            done(e);
        });
    });

    it('be able to save changes to an existing model', (done) => {
        let existingModel = nodespeed.dictionary().model['customer'];

        let fileName = `${path.join(nodespeed.config.options.appRootDir,'../common/models')}/customer.json`;

        should.exist(existingModel.options.nodespeed.layout);

        existingModel.options.nodespeed.layout.position = { x: 42, y: 42 };

        dictionary.save.model(existingModel).then(() => {
            let result = JSON.parse(fs.readFileSync(fileName).toString());
            result.options.nodespeed.layout.position.x.should.be.eql(42);
            result.options.nodespeed.layout.position.y.should.be.eql(42);
            done();
        })

        .catch((e) => {
            done(e);
        });
    });

    after(function(done) {
        mockFs.restore();
        done();
    });

});

describe('when testing the nodespeedApi', () => {
    let apiModel;

    let nodespeed = Nodespeed();
    let nodespeed2 = Nodespeed();

    let customer1;

    before(function(done) {

        nodespeed.boot(bootpath, () => {
            apiModel = nodespeed.models.Nodespeed;

            customer1 = nodespeed.dictionary().model['customer'];

            let options = {};
            options[nodespeed.config.defaultModelDirectory] = {};
            options[path.join(nodespeed.config.options.appRootDir,'../common/models')] = {};

            nodespeed2.boot({appRootDir: bootpath, port:4000},() => {
                mockFs(options);
                done();
            });

        });

    });

    it('the api model should exist', (done) => {
        should.exist(apiModel);
        done();
    });

    it('saveDataDictionary() should fail with no data passed', () => {
        return apiModel.saveDataDictionary().should.be.rejected();
    });

    it('saveDataDictionary() should fail with non-array data passed', () => {
        return apiModel.saveDataDictionary({}).should.be.rejected();
    });

    it('saveDataDictionary() should fail with invalid model data', () => {
        return apiModel.saveDataDictionary([{}]).should.be.rejected();
    });

    it('saveDataDictionary() should save an existing model', () => {
        return apiModel.saveDataDictionary([customer1]).should.be.fulfilled();
    });

    it('saveDataDictionary() should update the in-memory instance of the model', (done) => {
        let customer2 = nodespeed2.dictionary().model['customer'];
        let property = nodespeed2.dictionary().register.property(customer2._id,{ name: 'foo', _id: "d-e-f"});

        let saveData = JSON.parse(JSON.stringify(customer1));

        saveData.property[property.name] = property;
        saveData.properties.push(property);

        should.not.exist(customer1.property.foo);
        should.exist(customer2.property.foo);

        apiModel.saveDataDictionary([saveData]).then(() => {
            let customer1 = nodespeed.dictionary().model['customer'];

            should.exist(customer1.property.foo)

            return done();
        })

        .catch((e) => {
            return done(e);
        });

    });

    after(function(done) {
        mockFs.restore();
        done();
    });

});




//  console.log("zzzz",Object.keys(nodespeed.models))




    // it('saveDataDictionary() should fail with invalid model data  passed', () => {
    //     (() => {
    //         apiModel.saveDataDictionary({foo:true});
    //     }).should.throwError("array must be models");
    // });

    // it('the nodespeed api should be able to save changes to an existing model', (done) => {
    //     let existingModel = nodespeed.dictionary().model['customer'];

    //     let fileName = `${path.join(nodespeed.config.options.appRootDir,'../common/models')}/customer.json`;

    //     existingModel.options.nodespeed.layout.position = { x: 42, y: 42 };

    //     (() => {
    //         apiModel.saveDataDictionary()
    //     }).should.throwError();


    //     dictionary.save.model(existingModel).then(() => {
    //         let result = JSON.parse(fs.readFileSync(fileName).toString());
    //         result.options.nodespeed.layout.position.x.should.be.eql(42);
    //         result.options.nodespeed.layout.position.y.should.be.eql(42);
    //         done();
    //     })

    //     .catch((e) => {
    //         done(e);
    //     });
    // });

    // after(function(done) {
    //     mockFs.restore();
    //     done();
    // });

// });

