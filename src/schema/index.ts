// Copyright whogloo, inc. 2017. All Rights Reserved.
// Node module: @whogloo/nodespeed
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Dictionary } from './dictionary';
/**
 * Import Resource for nodespeed
 *
 * @constructor Import
 * @property {any} model the model to import into nodespeed
 */

export class Schema implements ISchema {
    dictionary:IDictionary
    app:any;

    constructor(app?:any) {
        this.dictionary = new Dictionary(app);
        this.app = app;
    }

}
