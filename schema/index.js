// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
"use strict";
const dictionary_1 = require("./dictionary");
/**
 * Import Resource for nodespeed
 *
 * @constructor Import
 * @property {any} model the model to import into nodespeed
 */
class Schema {
    constructor(app) {
        this.dictionary = new dictionary_1.Dictionary(app);
        this.app = app;
    }
}
exports.Schema = Schema;
