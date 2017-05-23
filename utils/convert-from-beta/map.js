/* global angular */

(function(isNode, isAngular) {
    'use strict';

    var nodespeedSchema = function(uuid,debug,_,changeCase,pluralize) {
        debug("loaded schemaFactory");

        const currentVersion = 5;
        const colors = ["LemonChiffon","PaleTurquoise","Wheat","DarkSalmon","LightSalmon","Coral","AntiqueWhite","PaleGreen","Chartreuse","PowderBlue"];

        let dataSources = [];

        let registerModel = (model) => {
            debug("registering model",model.name);

            let existingModel = schema.model[model.id];

            if (!existingModel) {
                schema.models.push(model);
            } else {

                if (existingModel != model) {
                    removeModel(existingModel);
                    schema.models.push(model);
                }

                mergeModel(model);
            }

            schema.model[model.id] = model;
            schema.model[model.name] = model;

            registerChildren(model,'properties','property',{preRegister: propertyHook});
            registerChildren(model,'indexes','index');
            registerChildren(model,'relations','relation');

        };

        let propertyHook = (model,property) => {
            let name = property.name;                           // fieldName
            let sentenceCase = changeCase.sentenceCase(name);   // Field name

            property.layout = property.layout || {
                grid: {},
                update: {}
            };

            property.layout.default = property.layout.default || {
                pascalName: changeCase.pascalCase(name),             // FieldName
                camelCaseName: changeCase.camelCase(name),           // fieldName,
    			plural: pluralize(changeCase.camelCase(name)),       // fieldNames
    			label: changeCase.titleCase(sentenceCase),           // Field Name
    			friendlyName: changeCase.lowerCase(sentenceCase),    // field name

    			lowerName: changeCase.lowerCase(name),               // fieldname
    			lowerPlural: pluralize(changeCase.lowerCase(name)),  // fieldnames
    			paramCase: changeCase.paramCase(sentenceCase),       // field-name
    			title: changeCase.titleCase(sentenceCase),           // Field Name

    			viewAs: "input",
    			size: "",
    			tab: "",
    			fieldPosition: 1,
    			page:1
    		};

    		switch (property.type) {
    		    case 'boolean': { property.viewAs = 'checkbox'; break }
    		    case 'array': { property.viewAs = 'chips'; break }
    		    case 'object': { property.viewAs = 'custom'; break }
    		}

        };

        let registerChildren = (model,propertyName,mapName,hooks) => {
            let children = model[propertyName];

            schema.model[model.id][mapName] = {};

            children && children.forEach((item) => {
                registerChild(model,propertyName,item,mapName,hooks);
            });
        };

        let registerChild = (model,propertyName,child,mapName,hooks) => {
            if (hooks && hooks.preRegister) {
                hooks.preRegister(model,child);
            }

            schema.model[model.id][mapName] = schema.model[model.id][mapName] || {};

            if (!child.id) {
                child.id = uuid.v4();
            }

            if (!model[propertyName] || model[propertyName].indexOf(child) === -1) {
                model[propertyName] = model[propertyName] || [];

                model[propertyName].push(child);
            }

            model[mapName] = model[mapName] || {};
            model[mapName][child.id] = child;
            model[mapName][child.name] = child;

            schema[mapName][child.id] = child;
            schema.model[model.id][mapName][child.id] = child;
            schema.model[model.id][mapName][child.name] = child;

            if (hooks && hooks.postRegister) {
                hooks.postRegister(model,child);
            }

        };

        let removeModel = ((model) => {
            let modelId = model.id;
            let modelName = model.name;

            removeChildren(model,'properties','property');
            removeChildren(model,'indexes','index');
            removeChildren(model,'relations','relation');

            _.remove(schema.model,{id: modelId});
            _.remove(schema.model,{name: modelName});
            _.remove(schema.models,{id: modelId});
        });

        let removeChildren = (model,propertyName,mapName) => {
            let children = model[propertyName];

            children && children.forEach((item) => {
                removeChild(model,propertyName,item,mapName);
            });

            model[propertyName] = null;
        };

        let removeChild = (model,propertyName,child,mapName) => {
            let childID = child.id;
            let childName = child.name;

            schema.model[model.id][mapName] = schema.model[model.id][mapName] || {};

            _.remove(model[propertyName],{id: childID});
            _.remove(schema.model[model.id][mapName],{id: childID});
            _.remove(schema.model[model.id][mapName],{name: childName});

            _.remove(schema[mapName],{id: childID});


        };

        let setDescriptionField = (model) => {
            let desc = ['desc','title','summary','name','comment','detail'];

            model.properties.forEach((property) => {
                let name = property.name.toLowerCase();
                property.modelId = model.id;

                if (!model.descriptionField) {
                    desc.forEach((field) => {
                        if (name.includes(field))   {
                            model.descriptionField = property.name;
                        }
                    });
                }
            });

            if (!model.descriptionField) {
                model.descriptionField = model.keyField;
            }

        };



        let mergeModel = (model) => {
            mergeProperties(model);
            mergeRelations(model);
        };

        let mergeProperties = (model) => {
            if (model.base === 'Model' || model.base === 'PersistedModel') {
                return;
            }

            if (!schema.model[model.base]) {
                debug("unable to find base model %s",model.base);
                return;
            }

            clearBaseProperties(model);

            let baseProperties = schema.model[model.base].properties;

            baseProperties.forEach((property) => {
                if (!model.property[property.name]) {

                    let newProperty = Object.assign( {  isBaseProperty:true },property);

                    schema.api.register.property(model,newProperty);
                }
            });
        };

        let clearBaseProperties = (model) => {
            model.properties = model.properties.filter((property) => { return !property.isBaseProperty});
        };

        let mergeRelations = (model) => {
            if (model.base === 'Model' || model.base === 'PersistedModel') {
                return;
            }

            if (!schema.model[model.base]) {
                debug("unable to find base model %s",model.base);
                return;
            }

            clearBaseRelations(model);

            schema.model[model.base].relations.forEach((relation) => {
                if (!model.relation[relation.name]) {

                    let newRelation = Object.assign( {  isBaseRelation:true },relation);

                    schema.api.register.relation(model,newRelation);
                }
            });

            schema.model[model.base].indexes.forEach((index) => {
                if (!model.index[index.name]) {

                    let newIndex = Object.assign( {  isBaseIndex:true },index);

                    schema.api.register.index(model,newIndex);
                }
            });
        };

        let clearBaseRelations = (model) => {
            model.relations = model.relations.filter((relation) => { return !relation.isBaseRelation});
            model.indexes = model.indexes.filter((index) => { return !index.isBaseIndex});
        };

        let schema = {

            api: {

                application: {

                },

                model: {
                    setDescriptionField,
                    merge: mergeModel
                },

                dataSources: {
                    get: dataSources,
                    set: (data) => {
                        dataSources = data;
                    }
                },

                availableIndexProperties: ((modelId,keys) => {
                    keys = keys || [];

                    let model = schema.model[modelId];
                    let availProperties = [];

                    if (!model) {
                        return null;
                    }

                    model.properties && model.properties.forEach((property) => {
                        let index = keys.map(((e) => { return e.propertyId; })).indexOf(property.id);

                        if (index === -1) {
                            availProperties.push({
                                name: property.name,
                                propertyId: property.id
                            });
                        }
                    });

                    return availProperties;
                }),

                register: {
                    model: registerModel,

                    property: (model,property) => {
                        registerChild(model,'properties',property,'property');
                    },

                    index: (model,index) => {
                        registerChild(model,'indexes',index,'index');
                    },

                    relation: (model,relation) => {
                        registerChild(model,'relations',relation,'relation');
                    }
                },

                remove: {
                    model: removeModel,

                    property: (model,property) => {
                        removeChild(model,'properties',property,'property');
                    },

                    index: (model,index) => {
                        removeChild(model,'indexes',index,'index');
                    },

                    relation: (model,relation) => {
                        removeChild(model,'relations',relation,'relation');
                    }
                }
            },

            models: [],

            model: {},
            relation: {},
            index: {},
            property: {},

        };

        return schema;
    };

    if (isAngular) {
        /** @ngInject */
        angular.module('nodespeed.schema', ['angular-uuid','change-case','nodespeed.factories'])
        /** @ngInject */
        .factory('nodespeedSchema', [
            'uuid',
            'debug',
            '_',
            'changeCase',
            'pluralize',

            nodespeedSchema]);
    }
    else if (isNode) {
        module.exports = nodespeedSchema(
            require('uuid'),
            require('debug')('nodespeed:schema:mapper'),
            require('lodash'),
            require('change-case'),
            require('pluralize')
        );
    }

})(typeof module !== 'undefined' && module.exports,
    typeof angular !== 'undefined');