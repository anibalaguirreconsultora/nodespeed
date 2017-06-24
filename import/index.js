"use strict";
// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require('debug')("nodespeed.import");
const changeCase = require('change-case');
const _ = require('lodash');
const path = require("path");
const uuid = require('uuid');
const fs = require('fs');
const nodespeed = require('../');
const schema_1 = require("../schema");
/**
 * Import Resource for nodespeed
 *
 * @constructor Import
 * @property {any} model the model to import into nodespeed
 */
class Import {
    constructor() {
        this.directory = (options) => {
            if (!options) {
                throw new Error('invalid options');
            }
            if (typeof options === 'object' && !options.directory) {
                throw new Error('invalid directory');
            }
            if (typeof options !== 'object' && typeof options !== 'string') {
                throw new Error('invalid options');
            }
            if (typeof options === 'string') {
                options = { directory: options };
            }
            let dirname = path.resolve(options.directory);
            if (!fs.existsSync(dirname)) {
                throw new Error('invalid directory');
            }
            let models = require('require-all')({ dirname });
            Object.keys(models).forEach((key) => {
                let model = nodespeed.modelBuilder.define(key, models[key]);
                this.schema.dictionary.register.model(model);
            });
            return this.schema.dictionary.models;
        };
        this.application = (models) => {
            if (!models) {
                return [];
            }
            Object.keys(models).forEach((key) => {
                let model = models[key];
                if (model.__system) {
                    console.log("ignoring", key);
                    return;
                }
                this.schema.dictionary.register.model(model);
            });
            // if (!definition || typeof definition !== 'object' || !definition.name) {
            //     throw new Error('invalid definition');
            // }
            // let model = nodespeed.modelBuilder.define(definition.name,definition);
            // return this.schema.dictionary.register.model(model);
            return this.schema.dictionary.models;
        };
        this.model = (definition) => {
            if (!definition || typeof definition !== 'object' || !definition.name) {
                throw new Error('invalid definition');
            }
            let model = nodespeed.modelBuilder.define(definition.name, definition);
            return this.schema.dictionary.register.model(model);
        };
        this.schema = new schema_1.Schema();
    }
}
exports.Import = Import;
