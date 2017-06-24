"use strict";
// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const debugInfo = require('debug')("nodespeed.dictionary.info");
const debugErr = require('debug')("nodespeed.dictionary.error");
const changeCase = require('change-case');
const _ = require('lodash');
const path = require("path");
const uuid = require('uuid');
const fs = require('fs');
const util = require('util');
/**
 * Dictionary Resource for nodespeed
 *
 * @constructor Dictionary
 */
class Dictionary {
    constructor(app) {
        this.app = app;
        this.model = {};
        this.property = {};
        this.index = {};
        this.relation = {};
        this.models = [];
        this.setDescriptionField = (model, property) => {
            let desc = ['desc', 'description', 'title', 'summary', 'name', 'comment', 'detail'];
            let custom = model.options.nodespeed;
            if (custom.descriptionFieldId) {
                return;
            }
            let name = property.name.toLowerCase();
            desc.forEach((field) => {
                if (name.includes(field)) {
                    custom.descriptionFieldId = property._id;
                }
            });
        };
        this.propertyHook = (model, property) => {
            if (!model.options.nodespeed.descriptionFieldId) {
                this.setDescriptionField(model, property);
            }
            property.nodespeed.layout = property.nodespeed.layout || {
                default: {
                    viewAs: "input"
                },
                grid: {
                    viewAs: 'input'
                },
                update: {
                    viewAs: 'input'
                }
            };
            let layout = property.nodespeed.layout.default;
            switch (property.type) {
                case 'boolean': {
                    layout.viewAs = 'checkbox';
                    break;
                }
                case 'array': {
                    layout.viewAs = 'chips';
                    break;
                }
                case 'object': {
                    layout.viewAs = 'custom';
                    break;
                }
            }
        };
        this.getItems = (collection) => {
            let items;
            if (!collection) {
                return [];
            }
            if (Array.isArray(collection)) {
                return collection;
            }
            items = Object.keys(collection).map((k) => {
                let obj = {};
                // handle cases where the child item is in the form  {"key": "value"} instead of {"key": { }}
                if (typeof collection[k] === 'string') {
                    obj = { name: k, type: collection[k] };
                }
                else {
                    obj = collection[k];
                    obj.name = k;
                }
                return obj;
            });
            return items;
        };
        this.registerDataDictionary = (data) => {
            debugInfo("registerDataDictionary");
            if (!data || !Array.isArray(data) || data.length === 0) {
                let err = "invalid model data";
                debugErr(err);
                throw new Error(err);
            }
            data.forEach((model) => {
                this.model[model._id] = model;
                this.model[model.name] = model;
                model.properties.forEach((property) => {
                    this.property[property._id] = property;
                });
                model.indexes.forEach((item) => {
                    this.index[item._id] = item;
                });
                model.relations.forEach((item) => {
                    this.relation[item._id] = item;
                });
                debugInfo("registered model", model.name, model._id, model.base);
            });
        };
        this.defineLayout = (model) => {
            let nameList = ['name', 'description', 'title'];
            let grid = model.options.nodespeed.layout.grid;
            grid.columns = [];
            grid.columns[0] = {
                _id: model.options.nodespeed.primaryKeyId,
                width: "20%"
            };
            model.properties.forEach((property) => {
                if (nameList.indexOf(property.name.toLowerCase()) > -1) {
                    grid.columns[1] = { _id: property._id };
                }
            });
            if (typeof grid.columns[0] === 'undefined') {
                grid.columns.shift();
            }
        };
        this.registerModel = (definition) => {
            let model = _.cloneDeep(definition);
            let dataType = ['any', 'array', 'boolean', 'buffer', 'date', 'geopoint', 'null', 'number', 'object', 'string'];
            if (!model.name) {
                let err = "invalid model data";
                debugErr(err);
                throw new Error(err);
            }
            debugInfo("registering", model.name);
            model._id = model._id || uuid.v4();
            let optionsPath = 'options.nodespeed';
            if (!_.get(model, optionsPath)) {
                _.set(model, optionsPath, {});
            }
            model.options.definitionsFile = model.options.definitionsFile || path.join(this.app.get('defaultModelDirectory'), `${changeCase.paramCase(model.name)}.json`);
            model.properties = this.getItems(model.properties);
            model.relations = this.getItems(model.relations);
            model.indexes = Array.isArray(definition.indexes) ? definition.indexes : [];
            if (this.app) {
                this.fixIndicies(model);
            }
            model.properties.forEach((property) => {
                if (!property.type) {
                    property.type = 'string';
                }
                if (typeof property.type === 'function' || typeof property.type === "object") {
                    return;
                }
                if (dataType.indexOf(property.type.toLowerCase()) === -1) {
                    throw new Error(`invalid property definition for ${property.name || "undefined property name"}`);
                }
            });
            try {
                this.registerChildren(model, 'properties', 'property', this.propertyHook);
                this.registerChildren(model, 'indexes', 'index');
                this.registerChildren(model, 'relations', 'relation');
                let existingModel = this.model[model._id];
                if (!existingModel) {
                    this.models.push(model);
                }
                else {
                    if (existingModel != model) {
                        this.removeModel(existingModel._id);
                        this.models.push(model);
                    }
                }
                model.options.nodespeed.primaryKeyId = !model.options.nodespeed.primaryKey ? false : model.property[model.options.nodespeed.primaryKey]._id;
                let layoutPath = 'options.nodespeed.layout.grid.columns';
                if (!_.get(model, layoutPath)) {
                    _.set(model, layoutPath, []);
                }
                if (model.options.nodespeed.layout.grid.columns.length === 0) {
                    this.defineLayout(model);
                }
                model.options.nodespeed.layout.update = model.options.nodespeed.layout.update || {};
                this.model[model._id] = model;
                this.model[model.name] = model;
                debugInfo("registered model", model.name, model._id, model.base);
            }
            catch (e) {
                throw (e);
            }
            return model;
        };
        this.removeModel = (id) => {
            if (!id || !this.model[id]) {
                throw new Error("invalid model id");
            }
            let model = this.model[id];
            let modelId = model._id;
            let modelName = model.name;
            this.removeChildren(modelId, 'properties', 'property');
            this.removeChildren(modelId, 'indexes', 'index');
            this.removeChildren(modelId, 'relations', 'relation');
            _.unset(this.model, modelId);
            _.unset(this.model, modelName);
            _.remove(this.models, { _id: modelId });
        };
        this.removeChild = (modelId, key, childId, mapName) => {
            if (!modelId || !this.model[modelId]) {
                let err = "invalid model id";
                debugErr(err);
                throw new Error(err);
            }
            let child = this[mapName][childId];
            if (!childId || !child) {
                let err = `invalid ${mapName} id`;
                debugErr(err);
                throw new Error(err);
            }
            let model = this.model[modelId];
            // remove model.<child>[id] and model.<child>[name]
            _.unset(model[mapName], childId);
            _.unset(model[mapName], child.name);
            // remove model.<childArrayEntry>[id]
            _.remove(model[key], { _id: childId });
            // remove this<child>[id]
            _.unset(this[mapName], childId);
        };
        this.removeChildren = (modelId, key, mapName) => {
            if (!modelId || !this.model[modelId]) {
                throw new Error("invalid model id");
            }
            let model = this.model[modelId];
            let children = model[key];
            children && children.forEach((item) => {
                this.removeChild(modelId, key, item._id, mapName);
            });
            model[key] = null;
            delete model[key];
        };
        this.registerChild = (model, key, child, mapName, hook) => {
            if (!model) {
                throw new Error("invalid model id");
            }
            if (!child || typeof child !== 'object' || !child.name) {
                throw new Error(`invalid ${mapName}`);
            }
            if (!model) {
                throw new Error("invalid model");
            }
            if (!child.nodespeed) {
                child.nodespeed = {};
                child._id = child._id || uuid.v4();
            }
            child.nodespeed._parentId = model._id;
            hook && hook(model, child);
            model[mapName] = model[mapName] || {};
            if (!model[key] || model[key].indexOf(child) === -1) {
                model[key] = model[key] || [];
                model[key].push(child);
            }
            model[mapName] = model[mapName] || {};
            model[mapName][child._id] = child;
            model[mapName][child.name] = child;
            this[mapName][child._id] = child;
            return child;
        };
        this.registerChildren = (model, key, mapName, hook) => {
            if (!model) {
                throw new Error("invalid model");
            }
            if (!model[key]) {
                throw new Error(`invalid model key ${key}`);
            }
            let children = model[key];
            model[mapName] = {};
            children.forEach((item) => {
                this.registerChild(model, key, item, mapName, hook);
            });
        };
        this.registerLBModel = (item) => {
            let definition = {
                name: item.definition.name,
                options: {
                    isSystemModel: ['AccessToken', 'ACL', 'Application', 'Change', 'ChangeConflict', 'Email', 'KeyValueModel', 'Model', 'PersistedModel', 'Role', 'RoleMapping', 'Scope', 'User'].indexOf(item.definition.name) > -1
                },
                properties: item.definition.properties
            };
            for (const key in item.definition.settings) {
                let keys = ['name', 'description', 'plural', 'base', 'idInjection', 'forceId', 'http.path', 'strict', 'options', 'properties', 'relations', 'acls', 'scopes', 'replaceOnPUT'];
                if (keys.indexOf(key) > -1) {
                    if (key === "base" && typeof item.definition.settings[key] === "function") {
                        definition[key] = item.definition.settings[key].modelName;
                    }
                    else {
                        definition[key] = item.definition.settings[key];
                    }
                }
                else {
                    definition.options[key] = item.definition.settings[key];
                }
            }
            definition.options.plural = definition.options.plural || item.pluralModelName;
            let isDirty = false;
            if (!definition.options.nodespeed) {
                definition.options.nodespeed = {};
                isDirty = true;
            }
            definition.options.nodespeed.primaryKey = item.dataSource ? item.dataSource.idName(definition.name) : false;
            let model = this.registerModel(definition);
            return isDirty;
        };
        this.booted = () => {
            debugInfo("app booted, starting dictionary parsing");
            let modelsToSave = {};
            this.app.models().forEach((item) => {
                this.registerLBModel(item);
            });
            this.models.forEach((model) => {
                if (!this.model[model.base]) {
                    let baseModel = this.app.loopback.findModel(model.base);
                    this.registerLBModel(baseModel);
                }
                if (model.base) {
                    this.mergeModel(model);
                }
            });
            let relationMap = {};
            /** edge case #1 user & User
             * if an app has defined accessToken and user, then the inherited relation needs to be removed
             **/
            if (this.model['accessToken'] && this.model['user']) {
                let model = this.model['accessToken'];
                let relation = model.relation['user'];
                relation.model = 'user';
                relation.nodespeed.modelId = this.model['user']._id;
            }
            Object.keys(this.relation).forEach((key) => {
                let relation = this.relation[key];
                let model = this.model[relation.nodespeed._parentId];
                let idName = this.app.models[model.name].definition.idName();
                if (relation.type.startsWith('has')) {
                    let fkModel = relation.through ? relation.through : relation.model;
                    if (!relation.foreignKey) {
                        relation.foreignKey = `${changeCase.camelCase(model.name)}Id`;
                    }
                    relation.nodespeed.type = 'Primary';
                    let fk = this.model[fkModel].property[relation.foreignKey];
                    if (!fk) {
                        fk = this.register.property(this.model[fkModel]._id, {
                            _id: uuid.v4(),
                            name: relation.foreignKey,
                            type: model.property[idName].type
                        });
                    }
                    relation.nodespeed.foreignKeyId = fk._id;
                    if (relation.through) {
                        return;
                    }
                    relationMap[`${model.name}-${relation.model}-${relation.foreignKey}`] = true;
                }
                if (relation.type.startsWith('belongs')) {
                    relation.nodespeed.type = 'Foreign';
                    if (!relation.foreignKey) {
                        relation.foreignKey = `${changeCase.camelCase(this.model[relation.model].name)}Id`;
                    }
                    let fk = model.property[relation.foreignKey];
                    if (!fk) {
                        fk = this.register.property(model._id, {
                            _id: uuid.v4(),
                            name: relation.foreignKey,
                            type: model.property[idName].type
                        });
                    }
                    relation.nodespeed.foreignKeyId = fk._id;
                    relationMap[`${relation.model}-${model.name}-${relation.foreignKey}`] = true;
                }
            });
            this.models.forEach((model) => {
                this.normalizeRelations(model);
            });
            this.models.forEach((model) => {
                this.normalizeIndicies(model);
            });
        };
        this.mergeModel = (model) => {
            this.mergeProperties(model);
            // this.mergeRelations(model);
        };
        this.mergeProperties = (model) => {
            // if (model.base === 'Model' || model.base === 'PersistedModel') {
            //     return;
            // }
            let baseModel = this.model[model.base];
            if (!baseModel) {
                debugErr("unable to find base model %s", model.base);
                return;
            }
            debugInfo("merging", model.name, model.base, this.model[model.base].base);
            this.clearInheritedProperties(model);
            let InheritedProperties = this.model[model.base].properties;
            InheritedProperties.forEach((property) => {
                if (!model.property[property.name]) {
                    let newProperty = _.cloneDeep(property);
                    newProperty.nodespeed.isInherited = true;
                    this.register.property(model._id, newProperty);
                }
                else {
                    if (!model.property[property.name].hasOwnProperty('isInherited')) {
                        model.property[property.name].nodespeed.isInherited = true;
                    }
                }
            });
        };
        this.clearInheritedProperties = (model) => {
            model.properties = model.properties.filter((property) => { return !property.nodespeed.isInherited; });
        };
        this.saveModel = (model) => {
            if (!model || !model.options || !model.options.definitionsFile) {
                return Promise.reject(new Error("invalid model data"));
            }
            this.registerDataDictionary([model]);
            return this.writeFile(model.options.definitionsFile, this.toJson(model));
        };
        this.toJson = (model) => {
            let json = _.cloneDeep(model);
            delete json.property;
            delete json.index;
            delete json.relation;
            delete json.options.definitionsFile;
            delete json.options.isSystemModel;
            ['properties', 'indexes', 'relations'].forEach((key) => {
                let data = {};
                json[key].forEach((item) => {
                    data[item.name] = item;
                });
                json[key] = data;
            });
            return JSON.stringify(json, null, '\t');
        };
        this.register = {
            model: this.registerModel,
            property: (modelId, property) => {
                return this.registerChild(this.model[modelId], 'properties', property, 'property', this.propertyHook);
            },
            index: (modelId, index) => {
                return this.registerChild(this.model[modelId], 'indexes', index, 'index');
            },
            relation: (modelId, relation) => {
                return this.registerChild(this.model[modelId], 'relations', relation, 'relation');
            },
            dataDictionary: (data) => {
                return this.registerDataDictionary(data);
            }
        };
        this.save = {
            model: (model) => {
                return this.saveModel(model);
            }
        };
        this.remove = {
            model: this.removeModel,
            property: (modelId, key) => {
                this.removeChild(modelId, 'properties', key, 'property');
            },
            relation: (modelId, key) => {
                this.removeChild(modelId, 'relations', key, 'relation');
            },
        };
        let tmpProcess = process;
        this.isNode = (typeof tmpProcess.release !== 'undefined') && (tmpProcess.release.name === 'node');
        if (this.isNode) {
            if (app) {
                this.app.once('booted', this.booted);
            }
            this.writeFile = require('node-fs-writefile-promise');
        }
    }
    fixIndicies(model) {
        if (model.options.isSystemModel) {
            return;
        }
        // if not loaded through loopback, there is no app.model[model.name]
        let indexes = this.app.models[model.name] ? this.app.models[model.name].definition.indexes() : {};
        model.indexes = [];
        for (let key in indexes) {
            let index = indexes[key];
            if (typeof index !== 'object') {
                index = {
                    unique: index
                };
            }
            index.name = key;
            let keyProperty = index.name.split("_")[0];
            if (!index.keys) {
                index.keys = {};
                index.keys[keyProperty] = index[keyProperty] || 1;
                delete index[keyProperty];
            }
            model.indexes.push(index);
        }
    }
    normalizeIndicies(model) {
        debugInfo("normalizing Indicies for %j", model.name);
        if (model.options.isSystemModel) {
            return;
        }
        if (!model.options.nodespeed.primaryKey) {
            return;
        }
        let idProperty = model.property[model.options.nodespeed.primaryKey];
        let hasUnique = false;
        if (!model.options.nodespeed.primaryIndexId) {
            model.indexes.forEach((index) => {
                if (hasUnique) {
                    return;
                }
                for (let keyItem in index.keys) {
                    let key = index.keys[keyItem];
                    if (key._id === idProperty._id) {
                        hasUnique = true;
                    }
                }
                ;
                if (hasUnique) {
                    model.options.nodespeed.primaryIndexId = index._id;
                }
            });
        }
        else {
            hasUnique = !!model.index[model.options.nodespeed.primaryIndexId];
        }
        if (!hasUnique) {
            let newIndex = {
                _id: uuid.v4(),
                name: model.index.id ? `primaryId_${model.name}` : `id_${model.name}`,
                nodespeed: {
                    keys: [model.property[model.options.nodespeed.primaryKey]._id]
                },
                options: {
                    unique: true
                },
                keys: {}
            };
            newIndex.keys[model.options.nodespeed.primaryKey] = 1;
            model.options.nodespeed.primaryIndexId = this.register.index(model._id, newIndex)._id;
        }
        let indexKeys = {};
        indexKeys[model.options.nodespeed.primaryKey] = true;
        model.indexes.forEach((index) => {
            indexKeys[Object.keys(index.keys)[0]] = index._id;
        });
        model.relations.forEach((relation) => {
            let key = relation.nodespeed.type === "Foreign" ? relation.foreignKey : model.options.nodespeed.primaryKey;
            let indexId = indexKeys[key];
            if (!indexId) {
                let newIndex = {
                    _id: uuid.v4(),
                    name: `${relation.name}_index`,
                    nodespeed: {
                        keys: [model.property[key]._id]
                    },
                    keys: {}
                };
                newIndex.keys[key] = 1;
                indexId = this.register.index(model._id, newIndex)._id;
            }
            relation.nodespeed.indexId = indexId;
        });
    }
    normalizeRelations(model) {
        debugInfo("normalizing relations for %j", model.name);
        model.relations.forEach((relation, index) => {
            if (!this.model[relation.model]) {
                debugErr("unable to find relation model %j for %j in relation %j", relation.model, model.name, relation.name);
                return;
            }
            if (!relation.nodespeed.modelId) {
                relation.nodespeed.modelId = this.model[relation.model]._id;
            }
            if (relation.type.startsWith('has')) {
                // do not try to create fk / relations for a through relation
                if (relation.through) {
                    return;
                }
                let idName = this.app.models[model.name].definition.idName();
                let found = false;
                this.model[relation.model].relations.forEach((childRelation) => {
                    if (!childRelation.type.startsWith("belongs")) {
                        return;
                    }
                    if (childRelation.model === model.name && childRelation.foreignKey === changeCase.camelCase(model.name + "-" + idName)) {
                        found = true;
                    }
                });
                if (!found) {
                    let _id = uuid.v4();
                    let newRelation = {
                        _id,
                        name: model.name,
                        model: model.name,
                        type: 'belongsTo',
                        foreignKey: relation.foreignKey,
                        nodespeed: {
                            modelId: model._id,
                            foreignKeyId: relation.nodespeed.foreignKeyId,
                            type: 'Foreign'
                        }
                    };
                    this.register.relation(this.model[relation.model]._id, newRelation);
                }
            }
            ;
            if (relation.type.startsWith('belongsTo')) {
                relation.nodespeed.type = 'Foreign';
                let idName = this.app.models[relation.model].definition.idName();
                let found = false;
                this.model[relation.model].relations.forEach((parentRelation) => {
                    if (!parentRelation.type.startsWith("has")) {
                        return;
                    }
                    if (parentRelation.model === model.name && parentRelation.foreignKey === relation.foreignKey) {
                        found = true;
                    }
                });
                if (!found) {
                    let _id = uuid.v4();
                    let newRelation = {
                        _id,
                        name: model.options.plural,
                        model: model.name,
                        type: 'hasMany',
                        foreignKey: relation.foreignKey,
                        nodespeed: {
                            modelId: this.model[relation.model]._id,
                            foreignKeyId: relation.nodespeed.foreignKeyId,
                            type: 'Primary'
                        }
                    };
                    this.register.relation(this.model[relation.model]._id, newRelation);
                }
            }
        });
    }
}
exports.Dictionary = Dictionary;
