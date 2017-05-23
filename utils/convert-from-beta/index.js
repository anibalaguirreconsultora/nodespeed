const path = require('path');
const fs = require('fs-extra');
const changeCase = require('change-case');

let map = require('./map');

let modelConfigMap = {};

module.exports = () =>  {

    return new Promise((resolve,reject) => {
        convertModels().then(() => {
            return createConfigFiles();
        }).then(() => {
            return resolve();
        });
    });

};

let createConfigFiles = () => {
    let base = path.join(process.cwd(),'src/server');
    let pkgPath = path.join(process.cwd(),'package.json');
    let pkg = require(pkgPath);

    pkg.main = 'server/server';

    fs.writeFileSync(pkgPath, JSON.stringify(pkg,null,'\t'));

    return new Promise((resolve,reject) => {
        fs.copySync(path.resolve(path.join(__dirname,'./templates')),base,{filter: s => /.json/.test(s)});

        fs.ensureDirSync(path.join(base,'_nodespeed'));

        try { fs.renameSync(path.join(base,'server.js'),path.join(base,'_nodespeed/server.js')); } catch(e) {}
        try { fs.renameSync(path.join(base,'index.js'),path.join(base,'_nodespeed/index.js')); } catch(e) {}
        try { fs.renameSync(path.join(base,'config.js'),path.join(base,'_nodespeed/config.js')); } catch(e) {}

        fs.copySync(path.resolve(path.join(__dirname,'./templates/server.js')),path.join(base,'server.js'));

        fs.renameSync(path.resolve(base),path.resolve(path.join(base,'../../server')));

        base = path.join(base,'../..');

        fs.ensureDirSync(path.join(base,'_nodespeed'));

        try { fs.renameSync(path.join(base,'index.js'),path.join(base,'_nodespeed/index.js')); } catch(e) {}
        try { fs.renameSync(path.join(base,'brunch-server.js'),path.join(base,'_nodespeed/brunch-server.js')); } catch(e) {}

        fs.copySync(path.resolve(path.join(__dirname,'./templates/brunch-server.js')),path.join(base,'brunch-server.js'));

        let configFile = path.join(base,'server/model-config.json');
        let modelConfig = require(configFile);

        Object.keys(modelConfigMap).forEach((key) => {
            modelConfig[key] = modelConfigMap[key];
        });

        fs.writeFileSync(configFile, JSON.stringify(modelConfig,null,'\t'));

        return resolve();

    });
};

let convertModels = () =>  {

    let folder = process.cwd();

    let nsFolder = path.join(folder,'src/server/models/_nodespeed');

    let models = require('require-all')({dirname:nsFolder});

    let promises = [];

    Object.keys(models).forEach((key) => {
        let model = models[key];
        map.api.register.model(model);
    });

    Object.keys(models).forEach((key) => {
        console.log("converting %s",key);

        let model = models[key];

        model.options = model.options || {};
        model.options.nodespeed = model.options.nodespeed || {};

        modelConfigMap[model.name]  = model.connection;

        let definition = {

            name: model.name,
            _id: model.id,
            description: model.description,
            plural: model.plural,
            base: model.base,
            idInjection: model.idInjection,
            strict: model.strict,
            validateUpsert: model.validateUpsert,
            options: model.options,
            mixins: model.mixins,
            properties: {},
            indexes: {},
            relations: {},
            acls: model.acls,
            scopes: {}
        };

        model.properties =  model.properties || [];
        model.relations =  model.relations || [];
        model.indexes =  model.indexes || [];
        model.scopes =  model.scopes || [];

        model.properties.forEach((property) => {

            let propDef = {
                name: property.name,
                type: property.type,
                _id: property.id,

                nodespeed: {
                    modelId: definition._id
                }

            };

            if (property._id) {
                propDef.id = property._id;
            }

            definition.properties[property.name] = propDef;

        });

        model.relations.forEach((relation) => {
            let fkModel = map.model[relation.modelId];
            let fkProperty = map.property[relation.foreignKeyId];

            if (!fkModel) {
                return;
            }

            if (!fkProperty) {
                return;
            }

            let relationDef = {
                type: relation.type,
                model: relation.model,
                foreignKey: relation.foreignKey,
                name: relation.name,
                _id: relation.id,

                nodespeed: {
                    modelId: definition._id,
                    foreignModelId: relation.modelId,
                    foreignKeyId: relation.foreignKeyId
                }
            };

            relation.model = fkModel ? fkModel.name : relation.model;
            relation.foreignKey = fkProperty.name;

            definition.relations[relation.name] = relationDef;

        });

        model.indexes.forEach((index) => {

            let indexDef = {
                name: index.name,
                _id:  index.id,
                type: index.type,
                model: index.model,

                keys: {},

                nodespeed: {
                    modelId: index.modelId,
                    keys: []
                }
            };

            index.keys.forEach((key,element) => {
                let name = map.property[key.propertyId].name;

                indexDef.keys[name] = key.ascending ? 1 : -1;
                indexDef.nodespeed.keys.push({name, propertyId: key.propertyId});
                definition.properties[name].id = (index.keys.length === 1) ? true : element;
            });

            definition.indexes[index.name] = indexDef;

        });

        model.scopes.forEach((scope) => {
            definition.scopes[scope.name] = scope;
        });

        let lbFile = path.join(folder,`src/server/models/${changeCase.paramCase(model.name)}.json`);

        promises.push(new Promise((resolve,reject) => {
            fs.writeFile(lbFile, JSON.stringify(definition,null,'\t'), (e) => {
                if (e) {
                    console.log("writeFileData error",e);
                    return reject(e);
                }

                resolve();
            });
        }));
    });

    return Promise.all(promises);
};

