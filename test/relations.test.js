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

describe('testing nodespeed relations', () => {
    let nodespeed = Nodespeed();
    let Appointment;

    before(function(done) {
        nodespeed.boot(bootpath, () => {
            Appointment = nodespeed.models.appointment;
            done();
        });

    });

    it('the appointment model should exist in the application', (done) => {
        should.exist(Appointment);
        done();
    });

    it('the appointment model should exist in the data dictionary', (done) => {
        should.exist(nodespeed.dictionary().model.appointment);
        done();
    });

    it('the appointment model should have four properties', (done) => {
        nodespeed.dictionary().model.appointment.properties.length.should.be.eql(4);
        done();
    });

    it('the appointment model should have two relations', (done) => {
        nodespeed.dictionary().model.appointment.relations.length.should.be.eql(2);
        done();
    });

    it('the appointment model should have a relation to the physician model', (done) => {
        should.exist(nodespeed.dictionary().model.appointment.relation['physician']);
        done();
    });

    it('the appointment model should have a relation to the patient model', (done) => {
        should.exist(nodespeed.dictionary().model.appointment.relation['patient']);
        done();
    });

    it('the patient model should not have a relation to the physician model', (done) => {
        should.not.exist(nodespeed.dictionary().model.patient.relation['physician']);
        done();
    });

    it('each relation of the appointment model should have nodespeed key', (done) => {
        nodespeed.dictionary().model.appointment.relations.forEach((relation) => {
            should.exist(relation.nodespeed);
        });
        done();
    });

    it('each relation of the appointment model should be a "Foreign" type', (done) => {
        nodespeed.dictionary().model.appointment.relations.forEach((relation) => {
            relation.nodespeed.type.should.eql('Foreign');
        });

        done();
    });

    it('the patient model should have an "appointments" relation', (done) => {
        should.exist(nodespeed.dictionary().model.patient.relation.appointments);
        done();
    });

    it('each relation should have a name, model, type, foreignKey nodespeed and _id key', (done) => {
        nodespeed.dictionary().models.filter((item) => { return !item.options.isSystemModel}).forEach((model) => {
            model.relations.forEach((relation,index) => {
                should.exist(relation.name,`"name" missing from relation ${index} in ${model.name}`);
                should.exist(relation.model,`"model" missing from relation ${relation.name} in ${model.name}`);
                should.exist(relation.type,`"type" missing from relation ${relation.name} in ${model.name}`);
                should.exist(relation.foreignKey,`"foreignKey" missing from relation ${relation.name} in ${model.name}`);
                should.exist(relation._id,`"_id" missing from relation ${relation.name} in ${model.name}`);
                should.exist(relation.nodespeed,`"nodespeed" missing from relation ${relation.name} in ${model.name}`);
            });
        });

        done();
    });

    it('each relation nodespeed key should have modelId, foreignKeyId, type and indexId keys', (done) => {
        nodespeed.dictionary().models.filter((item) => { return !item.options.isSystemModel}).forEach((model) => {
            model.relations.forEach((relation,index) => {
                should.exist(relation.nodespeed.modelId,`"modelId" missing from nodespeed key relation ${relation.name} in ${model.name}`);
                should.exist(relation.nodespeed.foreignKeyId,`"foreignKeyId" missing from nodespeed key relation ${relation.name} in ${model.name}`);
                should.exist(relation.nodespeed.type,`"type" missing from nodespeed key relation ${relation.name} in ${model.name}`);
                should.exist(relation.nodespeed.indexId,`"indexId" missing from nodespeed key relation ${relation.name} in ${model.name}`);
            });
        });

        done();
    });

    it('for every hasXXX relation, there should be an equivalent belongsTo relation on the foreign model', (done) => {
        let dd = nodespeed.dictionary();

        dd.models.filter((item) => { return !item.options.isSystemModel}).forEach((model) => {
            model.relations.forEach((relation,index) => {
                if (!relation.type.startsWith("has") || relation.through) {
                    return;
                }

                let childModel = dd.model[relation.model];
                let found = false;

                childModel.relations.forEach((childRelation) => {
                    if (!childRelation.type.startsWith("belongs")) {
                        return;
                    }

                    if (childRelation.model === model.name && childRelation.foreignKey === relation.foreignKey) {
                        found = true;
                    }

                });

                found.should.be.eql(true,`model ${childModel.name} does not have a corresponding "belongsTo" relation for ${model.name}`);

            });
        });

        done();
    });

    it('for every belongsXXX relation, there should be an equivalent hasXX relation on the target model', (done) => {
        let dd = nodespeed.dictionary();

        dd.models.filter((item) => { return !item.options.isSystemModel}).forEach((model) => {
            model.relations.forEach((relation,index) => {
                if (!relation.type.startsWith("belongs")) {
                    return;
                }

                let parentModel = dd.model[relation.model];
                let found = false;

                parentModel.relations.forEach((parentRelation) => {
                    if (!parentRelation.type.startsWith("has")) {
                        return;
                    }

                    if (parentRelation.model === model.name && parentRelation.foreignKey === relation.foreignKey) {
                        found = true;
                    }

                });

                found.should.be.eql(true,`model ${parentModel.name} does not have a corresponding "hasXXX" relation for ${model.name}`);

            });
        });

        done();
    });

});
